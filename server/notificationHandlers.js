import { sendEmail, getSmtpStatus, verifySmtpConnection } from './emailNotifier.js';

const JSON_SERVER_URL = () => (process.env.JSON_SERVER_URL || 'http://localhost:3001').replace(/\/+$/, '');

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}


function requireActor(users, actorId, role) {
  if (!actorId) throw httpError(401, 'Sesi pengguna tidak ditemukan. Silakan masuk kembali.');
  const actor = users.find((user) => String(user.id) === String(actorId));
  if (!actor || actor.status !== 'active') throw httpError(401, 'Sesi pengguna tidak valid atau tidak aktif.');
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(actor.role)) throw httpError(403, 'Akses tidak diizinkan untuk tindakan notifikasi ini.');
  return actor;
}
function safeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function readCollection(name) {
  try {
    const response = await fetch(JSON_SERVER_URL() + '/' + name, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Respons bukan daftar.');
    return data;
  } catch {
    throw httpError(503, 'JSON Server tidak dapat dihubungi di port 3001.');
  }
}

async function writeNotification(record) {
  try {
    const response = await fetch(JSON_SERVER_URL() + '/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  } catch {
    throw httpError(503, 'Email terkirim, tetapi riwayat notifikasi gagal disimpan ke JSON Server.');
  }
}

function requireSmtp() {
  if (!getSmtpStatus().configured) {
    const error = new Error('SMTP belum siap. Isi SMTP_USER dan SMTP_APP_PASSWORD pada .env untuk mengirim email.');
    error.statusCode = 503;
    throw error;
  }
}

async function deliverToRecipients({ type, sourceId, eventId = null, recipients, subject, makeBody }) {
  requireSmtp();
  const logs = await readCollection('notifications');
  const alreadySent = new Set(logs
    .filter((item) => item.type === type && String(item.sourceId) === String(sourceId) && item.status === 'sent')
    .map((item) => String(item.userId)));

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    if (alreadySent.has(String(recipient.id))) {
      skipped += 1;
      continue;
    }

    const body = makeBody(recipient);
    const attemptedAt = new Date().toISOString();
    try {
      await sendEmail({
        to: recipient.email,
        subject,
        text: body.text,
        html: body.html,
      });
      await writeNotification({
        type,
        sourceId: String(sourceId),
        eventId: eventId == null ? null : String(eventId),
        userId: String(recipient.id),
        status: 'sent',
        attemptedAt,
      });
      sent += 1;
      alreadySent.add(String(recipient.id));
    } catch (error) {
      failed += 1;
      await writeNotification({
        type,
        sourceId: String(sourceId),
        eventId: eventId == null ? null : String(eventId),
        userId: String(recipient.id),
        status: 'failed',
        attemptedAt,
        error: String(error.message || 'Pengiriman email gagal').slice(0, 300),
      }).catch(() => {});
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
    skipped,
  };
}

export function smtpHealth() {
  return getSmtpStatus();
}

export async function verifySmtp(actorId) {
  const users = await readCollection('users');
  requireActor(users, actorId, ['admin', 'bem']);
  requireSmtp();
  await verifySmtpConnection();
  return { success: true, message: 'Koneksi Gmail SMTP berhasil diverifikasi.' };
}

export async function notifyPaymentApproved(registrationId, actorId) {
  if (typeof registrationId !== 'string' && typeof registrationId !== 'number') {
    throw httpError(400, 'ID pendaftaran wajib diisi.');
  }
  const [registrations, events, users] = await Promise.all([
    readCollection('registrations'),
    readCollection('events'),
    readCollection('users'),
  ]);
  const registration = registrations.find((item) => String(item.id) === String(registrationId));
  if (!registration) throw httpError(404, 'Pendaftaran tidak ditemukan.');
  const actor = requireActor(users, actorId, ['admin', 'bem', 'student']);
  if (registration.paymentStatus !== 'paid' || !registration.receiptNumber) {
    throw httpError(409, 'Pembayaran belum disetujui atau nomor kwitansi belum tersedia.');
  }
  if (registration.status === 'cancelled') throw httpError(409, 'Pendaftaran sudah dibatalkan.');

  const event = events.find((item) => String(item.id) === String(registration.eventId));
  const student = users.find((item) => String(item.id) === String(registration.studentId));
  if (!event || !student || student.role !== 'student' || student.status !== 'active' || !student.email?.includes('@')) {
    throw httpError(409, 'Data event atau email mahasiswa tidak tersedia.');
  }
  if (actor.role === 'student' && String(actor.id) !== String(student.id)) {
    throw httpError(403, 'Mahasiswa hanya dapat meminta notifikasi pembayaran miliknya.');
  }
  const amount = 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(registration.registrationFee) || 0);
  const subject = '[FILKOM] Pembayaran disetujui - ' + event.title;
  const result = await deliverToRecipients({
    type: 'payment_approved',
    sourceId: registration.id,
    eventId: event.id,
    recipients: [student],
    subject,
    makeBody: (recipient) => {
      const text = 'Halo ' + (recipient.name || 'Mahasiswa FILKOM') + ',\n\n'
        + 'Pembayaran pendaftaran event Anda telah disetujui.\n'
        + 'Event: ' + event.title + '\nJumlah: ' + amount + '\n'
        + 'Metode: ' + (registration.paymentMethod === 'transfer' ? 'Transfer bank' : 'Cash') + '\n'
        + 'Nomor kwitansi: ' + registration.receiptNumber + '\n\n'
        + 'Kwitansi tersedia pada menu Riwayat Pendaftaran di FILKOM Event Management.';
      const html = '<div style="font-family:Arial,sans-serif;color:#172554;max-width:640px">'
        + '<div style="background:#1d4ed8;color:white;padding:20px;border-radius:12px"><strong>FILKOM Event Management</strong></div>'
        + '<p>Halo ' + safeHtml(recipient.name || 'Mahasiswa FILKOM') + ',</p>'
        + '<p>Pembayaran pendaftaran Anda telah <strong style="color:#15803d">disetujui</strong>.</p>'
        + '<h2>' + safeHtml(event.title) + '</h2>'
        + '<p><strong>Jumlah:</strong> ' + safeHtml(amount) + '</p>'
        + '<p><strong>Metode:</strong> ' + safeHtml(registration.paymentMethod === 'transfer' ? 'Transfer bank' : 'Cash') + '</p>'
        + '<p><strong>Nomor kwitansi:</strong> ' + safeHtml(registration.receiptNumber) + '</p>'
        + '<p>Buka menu Riwayat Pendaftaran untuk melihat atau mengunduh kwitansi PDF.</p>'
        + '<hr><small>FILKOM Universitas Klabat</small></div>';
      return { text, html };
    },
  });
  return { success: true, message: 'Notifikasi persetujuan pembayaran diproses.', ...result };
}

export async function notifyCertificateIssued(certificateId, actorId) {
  if (typeof certificateId !== 'string' && typeof certificateId !== 'number') {
    throw httpError(400, 'ID sertifikat wajib diisi.');
  }
  const [certificates, registrations, attendance, events, users] = await Promise.all([
    readCollection('certificates'),
    readCollection('registrations'),
    readCollection('attendance'),
    readCollection('events'),
    readCollection('users'),
  ]);
  const certificate = certificates.find((item) => String(item.id) === String(certificateId));
  if (!certificate) throw httpError(404, 'Sertifikat tidak ditemukan.');
  const actor = requireActor(users, actorId, ['admin', 'bem', 'student']);
  const registration = registrations.find((item) => String(item.id) === String(certificate.registrationId));
  if (!registration || registration.status === 'cancelled') throw httpError(409, 'Pendaftaran sertifikat tidak valid.');
  if (String(certificate.studentId) !== String(registration.studentId)
    || String(certificate.eventId) !== String(registration.eventId)) {
    throw httpError(409, 'Data sertifikat tidak cocok dengan pendaftaran.');
  }
  if (actor.role === 'student' && String(actor.id) !== String(registration.studentId)) {
    throw httpError(403, 'Mahasiswa hanya dapat meminta notifikasi sertifikat miliknya.');
  }
  const attended = attendance.some((item) => (
    String(item.registrationId) === String(registration.id)
      && String(item.eventId) === String(registration.eventId)
      && String(item.studentId) === String(registration.studentId)
      && item.status === 'hadir'
  ));
  if (!attended) throw httpError(409, 'Sertifikat hanya dapat diberitahukan setelah kehadiran tervalidasi.');
  const event = events.find((item) => String(item.id) === String(registration.eventId));
  const student = users.find((item) => String(item.id) === String(registration.studentId));
  if (!event || !student || student.role !== 'student' || student.status !== 'active' || !student.email?.includes('@')) {
    throw httpError(409, 'Data event atau email mahasiswa tidak tersedia.');
  }
  const subject = '[FILKOM] Sertifikat Anda telah terbit - ' + event.title;
  const result = await deliverToRecipients({
    type: 'certificate_issued',
    sourceId: certificate.id,
    eventId: event.id,
    recipients: [student],
    subject,
    makeBody: (recipient) => {
      const text = 'Halo ' + (recipient.name || 'Mahasiswa FILKOM') + ',\n\n'
        + 'Sertifikat digital Anda telah diterbitkan.\nEvent: ' + event.title + '\n'
        + 'Nomor sertifikat: ' + certificate.certificateNumber + '\n\n'
        + 'Buka menu Sertifikat Saya untuk melihat dan mengunduh PDF sertifikat.';
      const html = '<div style="font-family:Arial,sans-serif;color:#172554;max-width:640px">'
        + '<div style="background:#1d4ed8;color:white;padding:20px;border-radius:12px"><strong>FILKOM Event Management</strong></div>'
        + '<p>Halo ' + safeHtml(recipient.name || 'Mahasiswa FILKOM') + ',</p>'
        + '<p>Sertifikat digital Anda telah diterbitkan.</p><h2>' + safeHtml(event.title) + '</h2>'
        + '<p><strong>Nomor sertifikat:</strong> ' + safeHtml(certificate.certificateNumber) + '</p>'
        + '<p>Buka menu Sertifikat Saya untuk melihat dan mengunduh PDF sertifikat.</p>'
        + '<hr><small>FILKOM Universitas Klabat</small></div>';
      return { text, html };
    },
  });
  return { success: true, message: 'Notifikasi sertifikat diproses.', ...result };
}

export async function notifyPublishedEvent(eventId, actorId) {
  if (typeof eventId !== 'string' && typeof eventId !== 'number') {
    throw httpError(400, 'ID event wajib diisi.');
  }
  const [events, users] = await Promise.all([readCollection('events'), readCollection('users')]);
  const event = events.find((item) => String(item.id) === String(eventId));
  if (!event) throw httpError(404, 'Event tidak ditemukan.');
  requireActor(users, actorId, ['admin', 'bem']);
  if (event.status !== 'published') throw httpError(409, 'Email hanya dikirim untuk event Published.');

  const recipients = users.filter((user) => (
    user.role === 'student' && user.status === 'active'
      && typeof user.email === 'string' && user.email.includes('@')
  ));
  const amount = Number(event.registrationFee) > 0
    ? 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(event.registrationFee))
    : 'Gratis';
  const subject = '[FILKOM] Event baru: ' + event.title;
  const result = await deliverToRecipients({
    type: 'event_published',
    sourceId: event.id,
    eventId: event.id,
    recipients,
    subject,
    makeBody: (recipient) => {
      const text = 'Halo ' + (recipient.name || 'Mahasiswa FILKOM') + ',\n\n'
        + 'Ada event baru yang telah dipublikasikan.\nEvent: ' + event.title
        + '\nTanggal: ' + (event.date || 'Belum tersedia')
        + '\nWaktu: ' + (event.startTime || 'Belum tersedia') + ' - ' + (event.endTime || 'Belum tersedia')
        + '\nLokasi: ' + (event.location || 'Belum tersedia')
        + '\nBiaya pendaftaran: ' + amount
        + '\n\nBuka Jelajahi Event di FILKOM Event Management untuk melihat detail dan mendaftar.';
      const html = '<div style="font-family:Arial,sans-serif;color:#172554;max-width:640px">'
        + '<div style="background:#1d4ed8;color:white;padding:20px;border-radius:12px"><strong>FILKOM Event Management</strong></div>'
        + '<p>Halo ' + safeHtml(recipient.name || 'Mahasiswa FILKOM') + ',</p>'
        + '<p>Ada event baru yang telah dipublikasikan.</p><h2>' + safeHtml(event.title) + '</h2>'
        + '<p><strong>Tanggal:</strong> ' + safeHtml(event.date || 'Belum tersedia') + '</p>'
        + '<p><strong>Waktu:</strong> ' + safeHtml(event.startTime || 'Belum tersedia') + ' - ' + safeHtml(event.endTime || 'Belum tersedia') + '</p>'
        + '<p><strong>Lokasi:</strong> ' + safeHtml(event.location || 'Belum tersedia') + '</p>'
        + '<p><strong>Biaya:</strong> ' + safeHtml(amount) + '</p>'
        + '<p>Buka menu Jelajahi Event di FILKOM Event Management untuk melihat detail.</p>'
        + '<hr><small>FILKOM Universitas Klabat</small></div>';
      return { text, html };
    },
  });
  return { success: true, message: 'Notifikasi event baru diproses.', ...result };
}

export async function notifyPublishedAnnouncement(announcementId, actorId) {
  if (typeof announcementId !== 'string' && typeof announcementId !== 'number') {
    throw httpError(400, 'ID pengumuman wajib diisi.');
  }
  const [announcements, events, users] = await Promise.all([
    readCollection('announcements'),
    readCollection('events'),
    readCollection('users'),
  ]);
  const announcement = announcements.find((item) => String(item.id) === String(announcementId));
  if (!announcement) throw httpError(404, 'Pengumuman tidak ditemukan.');
  if (announcement.status !== 'published') throw httpError(409, 'Email hanya dikirim untuk pengumuman Published.');

  requireActor(users, actorId, ['admin', 'bem']);
  const eventId = announcement.eventId ? String(announcement.eventId) : null;
  const event = eventId ? events.find((item) => String(item.id) === eventId) : null;
  if (eventId && !event) throw httpError(409, 'Event yang terkait dengan pengumuman tidak ditemukan.');
  if (eventId && event.status === 'draft') throw httpError(409, 'Pengumuman untuk event Draft tidak dikirim kepada mahasiswa.');

  let recipients;
  if (eventId) {
    const registrations = await readCollection('registrations');
    const participantIds = new Set(registrations
      .filter((item) => String(item.eventId) === eventId && item.status !== 'cancelled')
      .map((item) => String(item.studentId)));
    recipients = users.filter((user) => (
      participantIds.has(String(user.id))
      && user.role === 'student'
      && user.status === 'active'
      && typeof user.email === 'string'
      && user.email.includes('@')
    ));
  } else {
    recipients = users.filter((user) => (
      user.role === 'student'
      && user.status === 'active'
      && typeof user.email === 'string'
      && user.email.includes('@')
    ));
  }

  const eventSuffix = event ? ' · ' + event.title : '';
  const subject = '[FILKOM] ' + announcement.title;
  const result = await deliverToRecipients({
    type: 'announcement',
    sourceId: announcement.id,
    eventId,
    recipients,
    subject,
    makeBody: (recipient) => {
      const greeting = 'Halo ' + (recipient.name || 'Mahasiswa FILKOM') + ',';
      const eventLine = event ? 'Event: ' + event.title + '\n' : '';
      const text = greeting + '\n\nAda pengumuman baru di Portal FILKOM.' + eventLine
        + 'Kategori: ' + announcement.category + '\n\n'
        + announcement.title + '\n\n' + announcement.content
        + '\n\nSilakan buka FILKOM Event Management untuk melihat informasi selengkapnya.';
      const html = '<div style="font-family:Arial,sans-serif;color:#172554;max-width:640px">'
        + '<div style="background:#1d4ed8;color:white;padding:20px;border-radius:12px"><strong>FILKOM Event Management</strong></div>'
        + '<p>' + safeHtml(greeting) + '</p><p>Ada pengumuman baru di Portal FILKOM.</p>'
        + (event ? '<p><strong>Event:</strong> ' + safeHtml(event.title) + '</p>' : '')
        + '<p><strong>Kategori:</strong> ' + safeHtml(announcement.category) + '</p>'
        + '<h2>' + safeHtml(announcement.title) + '</h2><p style="white-space:pre-line;line-height:1.6">'
        + safeHtml(announcement.content) + '</p><hr><small>FILKOM Universitas Klabat</small></div>';
      return { text, html };
    },
  });

  return { success: true, message: 'Notifikasi pengumuman diproses' + eventSuffix + '.', ...result };
}

export async function notifyRegistration(registrationId, actorId) {
  if (typeof registrationId !== 'string' && typeof registrationId !== 'number') {
    throw httpError(400, 'ID pendaftaran wajib diisi.');
  }
  const [registrations, events, users] = await Promise.all([
    readCollection('registrations'),
    readCollection('events'),
    readCollection('users'),
  ]);
  const registration = registrations.find((item) => String(item.id) === String(registrationId));
  if (!registration) throw httpError(404, 'Pendaftaran tidak ditemukan.');
  if (registration.status === 'cancelled') throw httpError(409, 'Pendaftaran yang dibatalkan tidak dapat dikirimi konfirmasi.');
  const event = events.find((item) => String(item.id) === String(registration.eventId));
  const student = users.find((item) => String(item.id) === String(registration.studentId));
  if (!event || !student || student.role !== 'student' || !student.email?.includes('@')) {
    throw httpError(409, 'Data event atau alamat email mahasiswa tidak tersedia.');
  }

  requireActor(users, actorId, 'student');
  if (String(student.id) !== String(actorId)) throw httpError(403, 'Mahasiswa hanya dapat mengirim konfirmasi untuk pendaftarannya sendiri.');
  const subject = 'Pendaftaran berhasil: ' + event.title;
  const result = await deliverToRecipients({
    type: 'registration',
    sourceId: registration.id,
    eventId: event.id,
    recipients: [student],
    subject,
    makeBody: (recipient) => {
      const text = 'Halo ' + (recipient.name || 'Mahasiswa FILKOM') + ',\n\n'
        + 'Pendaftaran Anda telah tersimpan.\nEvent: ' + event.title
        + '\nTanggal: ' + (event.date || 'Belum tersedia')
        + '\nWaktu: ' + (event.startTime || 'Belum tersedia') + ' WITA'
        + '\nLokasi: ' + (event.location || 'Belum tersedia')
        + '\n\nTunjukkan QR pendaftaran Anda kepada panitia saat check-in.';
      const html = '<div style="font-family:Arial,sans-serif;color:#172554;max-width:640px">'
        + '<div style="background:#1d4ed8;color:white;padding:20px;border-radius:12px"><strong>FILKOM Event Management</strong></div>'
        + '<p>Halo ' + safeHtml(recipient.name || 'Mahasiswa FILKOM') + ',</p>'
        + '<p>Pendaftaran Anda berhasil disimpan.</p><h2>' + safeHtml(event.title) + '</h2>'
        + '<p><strong>Tanggal:</strong> ' + safeHtml(event.date || 'Belum tersedia') + '</p>'
        + '<p><strong>Waktu:</strong> ' + safeHtml(event.startTime || 'Belum tersedia') + ' WITA</p>'
        + '<p><strong>Lokasi:</strong> ' + safeHtml(event.location || 'Belum tersedia') + '</p>'
        + '<p>Tunjukkan QR pendaftaran Anda kepada panitia saat check-in.</p>'
        + '<hr><small>FILKOM Universitas Klabat</small></div>';
      return { text, html };
    },
  });
  return { success: true, message: 'Konfirmasi pendaftaran diproses.', ...result };
}
