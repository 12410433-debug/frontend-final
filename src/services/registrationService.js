import { api, jsonServerApi } from './api.js';

function todayInWita() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

async function verifyStudent(studentId) {
  if (!studentId) throw new Error('Profil mahasiswa tidak ditemukan. Isi data diri pada formulir pendaftaran event.');
  const { data: student } = await jsonServerApi.get(`/users/${studentId}`);
  if (String(student.id) !== String(studentId) || student.role !== 'student' || student.status !== 'active') {
    throw new Error('Profil mahasiswa tidak valid atau tidak aktif.');
  }
  return student;
}

async function createOrUpdateStudentProfile(profile) {
  const name = String(profile?.name || '').trim();
  const email = String(profile?.email || '').trim().toLowerCase();
  const nim = String(profile?.nim || '').trim();
  const major = String(profile?.major || '').trim();
  const phone = String(profile?.phone || '').trim();
  if (!name || !email || !nim || !major) throw new Error('Nama, email, NIM, dan program studi wajib diisi.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Alamat email tidak valid.');

  const { data: users } = await jsonServerApi.get('/users');
  const emailOwner = users.find((user) => user.email?.toLowerCase() === email);
  const nimOwner = users.find((user) => user.role === 'student' && String(user.nim || '').trim() === nim);
  if (emailOwner && emailOwner.role !== 'student') throw new Error('Email ini digunakan akun pengelola. Masukkan email mahasiswa.');
  if (emailOwner && nimOwner && String(emailOwner.id) !== String(nimOwner.id)) {
    throw new Error('Email dan NIM terhubung ke profil mahasiswa yang berbeda. Periksa kembali data diri.');
  }

  const existing = emailOwner || nimOwner;
  const profileData = { name, email, nim, major, phone: phone || null, role: 'student', status: 'active' };
  if (existing) {
    if (existing.status !== 'active') throw new Error('Profil mahasiswa ini tidak aktif. Hubungi Admin FILKOM.');
    if (emailOwner && String(emailOwner.nim || '').trim() && String(emailOwner.nim).trim() !== nim) {
      throw new Error('Email ini sudah tercatat dengan NIM berbeda. Periksa kembali data diri.');
    }
    const { data: updated } = await jsonServerApi.patch(`/users/${existing.id}`, profileData);
    return updated;
  }

  const id = `student-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
  const { data: student } = await jsonServerApi.post('/users', { id, ...profileData });
  return student;
}

export const registrationService = {
  async getForStudent(studentId) {
    await verifyStudent(studentId);
    const [{ data: registrations }, { data: events }] = await Promise.all([
      jsonServerApi.get('/registrations', { params: { studentId } }),
      jsonServerApi.get('/events'),
    ]);
    const eventById = new Map(events.map((event) => [String(event.id), event]));
    const rows = registrations
      .filter((registration) => String(registration.studentId) === String(studentId))
      .map((registration) => ({
        ...registration,
        event: eventById.get(String(registration.eventId)) || null,
      }))
      .sort((a, b) => String(b.registrationDate).localeCompare(String(a.registrationDate)));

    return Promise.all(rows.map(async (registration) => {
      if (registration.paymentStatus === 'paid' && registration.receiptNumber) {
        try {
          const { data: paymentNotification } = await api.post('/notifications/payments/approved', {
            registrationId: registration.id,
            actorId: studentId,
          });
          return { ...registration, paymentNotification };
        } catch (error) {
          return {
            ...registration,
            paymentNotification: {
              success: false,
              error: error.response?.data?.error || 'Notifikasi pembayaran gagal dikirim.',
            },
          };
        }
      }
      return registration;
    }));
  },

  async verifyPayment(registrationId, verifier) {
    if (!['admin', 'bem'].includes(verifier?.role)) throw new Error('Hanya Admin atau BEM yang dapat memverifikasi pembayaran.');
    if (!registrationId) throw new Error('Pendaftaran yang dipilih tidak valid.');
    const { data: registration } = await jsonServerApi.get('/registrations/' + registrationId);
    if (!(Number(registration.registrationFee) > 0)) throw new Error('Pendaftaran ini tidak memiliki biaya.');
    if (registration.paymentStatus === 'paid' && registration.receiptNumber) throw new Error('Pembayaran sudah diverifikasi. Kwitansi ' + registration.receiptNumber + ' telah diterbitkan.');
    if (registration.paymentStatus !== 'pending') throw new Error('Pembayaran ini tidak sedang menunggu verifikasi.');
    if (!['cash', 'transfer'].includes(registration.paymentMethod)) throw new Error('Metode pembayaran tidak valid.');
    if (registration.paymentMethod === 'transfer' && !registration.paymentProof) throw new Error('Bukti transfer belum tersedia.');
    const randomPart = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 10).toUpperCase()
      || (Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase());
    const payload = {
      paymentStatus: 'paid',
      receiptNumber: 'FILKOM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + randomPart,
      paymentVerifiedAt: new Date().toISOString(),
      paymentVerifiedBy: String(verifier.id),
    };
    const { data: updatedRegistration } = await jsonServerApi.patch('/registrations/' + registration.id, payload);
    let emailNotification;
    try {
      emailNotification = await api.post('/notifications/payments/approved', {
        registrationId: updatedRegistration.id,
        actorId: verifier.id,
      }).then((response) => response.data);
    } catch (error) {
      emailNotification = {
        success: false,
        error: error.response?.data?.error || 'Pembayaran tersimpan, tetapi email pemberitahuan gagal dikirim.',
      };
    }
    return { ...updatedRegistration, emailNotification };
  },

  async register(studentProfile, eventId, choices = {}) {
    if (!eventId) throw new Error('Event yang dipilih tidak valid.');
    const [{ data: event }, { data: eventRegistrations }] = await Promise.all([
      jsonServerApi.get(`/events/${eventId}`),
      jsonServerApi.get('/registrations', { params: { eventId } }),
    ]);

    if (String(event.id) !== String(eventId)) throw new Error('Event tidak ditemukan.');
    if (!['published', 'ongoing'].includes(event.status)) {
      throw new Error('Pendaftaran hanya dibuka untuk event Published atau Ongoing.');
    }
    if (event.date < todayInWita()) throw new Error('Pendaftaran ditutup karena tanggal event sudah lewat.');
    const activeRegistrations = eventRegistrations.filter((registration) => (
      String(registration.eventId) === String(event.id)
        && ['pending', 'confirmed'].includes(registration.status)
    )).length;
    const registeredCount = Math.max(Number(event.registeredCount) || 0, activeRegistrations);
    const quota = Number(event.quota);
    if (!Number.isFinite(quota) || quota <= 0 || registeredCount >= quota) {
      throw new Error('Pendaftaran ditutup karena kuota event sudah penuh.');
    }
    const mealOptions = Array.isArray(event.mealOptions) ? event.mealOptions : [];
    const shirtSizes = Array.isArray(event.shirtSizes) ? event.shirtSizes : [];
    if (mealOptions.length > 0 && !mealOptions.includes(choices.mealChoice)) {
      throw new Error('Pilih salah satu menu makanan yang tersedia.');
    }
    if (shirtSizes.length > 0 && !shirtSizes.includes(choices.shirtSize)) {
      throw new Error('Pilih salah satu ukuran baju yang tersedia.');
    }

    const registrationFee = Number(event.registrationFee) > 0 ? Number(event.registrationFee) : 0;
    const paymentMethod = String(choices.paymentMethod || '');
    if (registrationFee > 0 && !['cash', 'transfer'].includes(paymentMethod)) throw new Error('Pilih metode pembayaran cash atau transfer.');
    if (registrationFee > 0 && paymentMethod === 'transfer') {
      if (!String(event.paymentBankName || '').trim() || !String(event.paymentAccountNumber || '').replace(/\D/g, '') || !String(event.paymentAccountName || '').trim()) {
        throw new Error('Rekening tujuan transfer event belum diatur oleh Admin/BEM. Pilih cash atau hubungi pengelola event.');
      }
      const proof = String(choices.paymentProof || '');
      if (!/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/i.test(proof)) throw new Error('Unggah bukti transfer berupa gambar JPG, PNG, WEBP, atau PDF.');
      if (proof.length > 2_800_000) throw new Error('Ukuran bukti transfer terlalu besar. Maksimal 1,5 MB.');
      if (!String(choices.paymentProofName || '').trim()) throw new Error('Nama file bukti transfer tidak tersedia.');
    }

    const student = await createOrUpdateStudentProfile(studentProfile);
    const studentRegistrations = eventRegistrations.filter((registration) => (
      String(registration.studentId) === String(student.id)
        && String(registration.eventId) === String(event.id)
    ));
    if (studentRegistrations.length > 0) {
      throw new Error('NIM ini sudah terdaftar pada event tersebut. Satu mahasiswa hanya dapat mendaftar sekali.');
    }

    const registrationToken = globalThis.crypto?.randomUUID?.()
      || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const registrationPayload = {
      eventId: String(event.id),
      studentId: String(student.id),
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      registrationFee,
      paymentStatus: registrationFee > 0 ? 'pending' : 'not_required',
      ...(registrationFee > 0 ? { paymentMethod } : {}),
      ...(registrationFee > 0 && paymentMethod === 'transfer' ? {
        paymentBankName: event.paymentBankName,
        paymentAccountNumber: String(event.paymentAccountNumber).replace(/\D/g, ''),
        paymentAccountName: event.paymentAccountName,
        paymentProof: choices.paymentProof,
        paymentProofName: String(choices.paymentProofName).trim(),
        paymentProofUploadedAt: new Date().toISOString(),
      } : {}),
      ...(mealOptions.length > 0 ? { mealChoice: choices.mealChoice } : {}),
      ...(shirtSizes.length > 0 ? { shirtSize: choices.shirtSize } : {}),
      qrCode: `FILKOM-REG-${registrationToken}`,
    };
    const { data: registration } = await jsonServerApi.post('/registrations', registrationPayload);
    try {
      const { data: updatedEvent } = await jsonServerApi.patch(`/events/${event.id}`, {
        registeredCount: registeredCount + 1,
      });
      let notification;
      try {
        const { data } = await api.post('/notifications/registrations', { registrationId: registration.id, actorId: student.id });
        notification = data;
      } catch (notificationError) {
        notification = {
          success: false,
          error: notificationError.response?.data?.error || 'Konfirmasi email tidak terkirim.',
        };
      }
      return { registration, event: updatedEvent, notification, student };
    } catch (error) {
      try {
        await jsonServerApi.delete(`/registrations/${registration.id}`);
      } catch (rollbackError) {
        throw new Error('Pendaftaran tersimpan, tetapi pembaruan kuota dan pembatalan otomatis gagal. Hubungi administrator.', { cause: rollbackError });
      }
      throw new Error('Pendaftaran dibatalkan karena jumlah pendaftar event gagal diperbarui. Silakan coba lagi.', { cause: error });
    }
  },
};

export default registrationService;
