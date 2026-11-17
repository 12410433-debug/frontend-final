import { jsonServerApi } from './api.js';

function isAssigned(event, organizerId, assignedOnly) {
  return !assignedOnly || String(event.organizerId) === String(organizerId);
}

export const attendanceService = {
  async getEvents({ organizerId, assignedOnly = false } = {}) {
    const { data } = await jsonServerApi.get('/events');
    return data.filter((event) => isAssigned(event, organizerId, assignedOnly));
  },

  async getRoster(eventId, { organizerId, assignedOnly = false } = {}) {
    const { data: event } = await jsonServerApi.get(`/events/${eventId}`);
    if (!isAssigned(event, organizerId, assignedOnly)) {
      throw new Error('Anda tidak memiliki akses ke absensi event ini.');
    }

    const [{ data: registrations }, { data: attendance }, { data: users }] = await Promise.all([
      jsonServerApi.get('/registrations', { params: { eventId } }),
      jsonServerApi.get('/attendance', { params: { eventId } }),
      jsonServerApi.get('/users'),
    ]);
    const userById = new Map(users.map((user) => [String(user.id), user]));
    const attendanceByRegistration = new Map(
      attendance
        .filter((record) => String(record.eventId) === String(eventId))
        .map((record) => [String(record.registrationId), record])
    );

    const participants = registrations
      .filter((registration) => String(registration.eventId) === String(eventId)
        && registration.status !== 'cancelled')
      .map((registration) => {
        const student = userById.get(String(registration.studentId));
        const attendanceRecord = attendanceByRegistration.get(String(registration.id)) || null;
        return {
          registration,
          attendance: attendanceRecord,
          student: student || null,
          event,
          status: attendanceRecord?.status === 'hadir' || attendanceRecord?.attendanceTime
            ? 'hadir'
            : 'belum_hadir',
          attendanceTime: attendanceRecord?.attendanceTime || null,
        };
      })
      .sort((a, b) => String(a.student?.name || '').localeCompare(String(b.student?.name || '')));

    return { event, participants };
  },

  async removeParticipant(registrationId, { role, organizerId, assignedOnly = false } = {}) {
    if (!['admin', 'bem'].includes(role)) throw new Error('Hanya Admin atau BEM yang dapat menghapus pendaftar.');
    if (!registrationId) throw new Error('Pendaftaran yang dipilih tidak valid.');

    const { data: registration } = await jsonServerApi.get('/registrations/' + registrationId);
    const { data: event } = await jsonServerApi.get('/events/' + registration.eventId);
    if (assignedOnly && String(event.organizerId) !== String(organizerId)) {
      throw new Error('Anda hanya dapat menghapus peserta dari event yang ditugaskan.');
    }

    const [{ data: eventRegistrations }, { data: attendance }, { data: certificates }] = await Promise.all([
      jsonServerApi.get('/registrations', { params: { eventId: registration.eventId } }),
      jsonServerApi.get('/attendance', { params: { registrationId } }),
      jsonServerApi.get('/certificates', { params: { registrationId } }),
    ]);
    const activeCount = eventRegistrations.filter((item) => (
      String(item.id) !== String(registration.id) && ['pending', 'confirmed'].includes(item.status)
    )).length;
    const currentCount = Math.max(Number(event.registeredCount) || 0, activeCount + 1);

    await jsonServerApi.delete('/registrations/' + registration.id);
    const cleanupResults = await Promise.allSettled([
      ...attendance.filter((item) => String(item.registrationId) === String(registration.id))
        .map((item) => jsonServerApi.delete('/attendance/' + item.id)),
      ...certificates.filter((item) => String(item.registrationId) === String(registration.id))
        .map((item) => jsonServerApi.delete('/certificates/' + item.id)),
    ]);
    let updatedEvent;
    try {
      const { data } = await jsonServerApi.patch('/events/' + event.id, {
        registeredCount: Math.max(0, currentCount - 1),
      });
      updatedEvent = data;
    } catch (error) {
      throw new Error('Pendaftar sudah dihapus, tetapi kuota event gagal diperbarui. Muat ulang data event.', { cause: error });
    }
    if (cleanupResults.some((result) => result.status === 'rejected')) {
      throw new Error('Pendaftar sudah dihapus dan kuota diperbarui, tetapi data absensi atau sertifikat terkait gagal dibersihkan.');
    }
    return { registration, event: updatedEvent };
  },

  async checkIn(qrCode, eventId, { organizerId, assignedOnly = false } = {}) {
    const code = String(qrCode || '').trim();
    if (!code) throw new Error('Masukkan atau pindai kode QR terlebih dahulu.');

    const { data: event } = await jsonServerApi.get(`/events/${eventId}`);
    if (!isAssigned(event, organizerId, assignedOnly)) {
      throw new Error('Anda tidak memiliki akses untuk memeriksa absensi event ini.');
    }

    const { data: matchingRegistrations } = await jsonServerApi.get('/registrations', {
      params: { qrCode: code },
    });
    const validMatches = matchingRegistrations.filter((item) => item.qrCode === code);
    if (validMatches.length === 0) throw new Error('Kode QR tidak valid atau pendaftaran tidak ditemukan.');
    if (validMatches.length > 1) throw new Error('Kode QR tidak unik pada data pendaftaran. Minta admin memeriksa data ini.');
    const registration = validMatches[0];
    if (String(registration.eventId) !== String(event.id)) {
      throw new Error('QR Code ini terdaftar untuk event yang berbeda.');
    }
    if (registration.status === 'cancelled') {
      throw new Error('Pendaftaran ini sudah dibatalkan dan tidak dapat digunakan untuk absensi.');
    }

    const [{ data: student }, { data: previousAttendance }] = await Promise.all([
      jsonServerApi.get(`/users/${registration.studentId}`),
      jsonServerApi.get('/attendance', { params: { registrationId: registration.id } }),
    ]);
    if (student.role !== 'student' || student.status !== 'active') {
      throw new Error('Akun mahasiswa pada pendaftaran ini tidak valid atau tidak aktif.');
    }

    const matchingAttendance = previousAttendance.filter((record) => (
      String(record.registrationId) === String(registration.id)
        && String(record.eventId) === String(event.id)
    ));
    if (matchingAttendance.some((record) => record.status === 'hadir' || record.attendanceTime)) {
      throw new Error(`${student.name} sudah tercatat hadir pada event ini.`);
    }
    const existing = matchingAttendance[0];

    const attendanceTime = new Date().toISOString();
    const payload = {
      registrationId: String(registration.id),
      eventId: String(event.id),
      studentId: String(student.id),
      attendanceTime,
      status: 'hadir',
    };
    let attendanceRecord;
    if (existing) {
      const { data } = await jsonServerApi.patch(`/attendance/${existing.id}`, payload);
      attendanceRecord = data;
    } else {
      const { data } = await jsonServerApi.post('/attendance', payload);
      attendanceRecord = data;
    }
    return { attendance: attendanceRecord, registration, student, event };
  },
};

export default attendanceService;
