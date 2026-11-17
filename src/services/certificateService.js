import { api, jsonServerApi } from './api.js';

async function sendCertificateNotification(certificateId, actorId) {
  if (!actorId) return { success: false, error: 'Sesi pengelola tidak tersedia untuk mengirim notifikasi.' };
  try {
    const { data } = await api.post('/notifications/certificates/issued', { certificateId, actorId });
    return data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Email sertifikat gagal dikirim.' };
  }
}

async function getActiveStudent(studentId) {
  if (!studentId) throw new Error('Profil mahasiswa tidak ditemukan pada browser ini.');
  const { data: student } = await jsonServerApi.get(`/users/${studentId}`);
  if (String(student.id) !== String(studentId) || student.role !== 'student' || student.status !== 'active') {
    throw new Error('Profil mahasiswa tidak valid atau tidak aktif.');
  }
  return student;
}

function hasAttended(attendanceRows, registration) {
  return attendanceRows.some((item) => (
    String(item.registrationId) === String(registration.id)
      && String(item.eventId) === String(registration.eventId)
      && String(item.studentId) === String(registration.studentId)
      && item.status === 'hadir'
  ));
}

function templateForEvent(templates, eventId) {
  return templates.find((item) => String(item.eventId || '') === String(eventId))
    || templates.find((item) => !item.eventId)
    || null;
}

function certificateDetails(certificate, registration, event, student, templates = []) {
  return { ...certificate, registration, event, student, template: templateForEvent(templates, event.id) };
}

export const certificateService = {
  async getForStudent(studentId) {
    await getActiveStudent(studentId);
    const [{ data: registrations }, { data: attendance }, { data: events }, { data: certificates }, { data: templates }] = await Promise.all([
      jsonServerApi.get('/registrations', { params: { studentId } }),
      jsonServerApi.get('/attendance', { params: { studentId } }),
      jsonServerApi.get('/events'),
      jsonServerApi.get('/certificates', { params: { studentId } }),
      jsonServerApi.get('/certificateTemplates'),
    ]);
    const eventById = new Map(events.map((event) => [String(event.id), event]));
    const certificateByRegistration = new Map(certificates
      .filter((certificate) => String(certificate.studentId) === String(studentId))
      .map((certificate) => [String(certificate.registrationId), certificate]));
    const rows = registrations
      .filter((registration) => String(registration.studentId) === String(studentId)
        && registration.status !== 'cancelled'
        && hasAttended(attendance, registration))
      .map((registration) => {
        const event = eventById.get(String(registration.eventId));
        return {
          certificate: certificateByRegistration.get(String(registration.id)) || null,
          registration,
          event: event || null,
          template: templateForEvent(templates, event?.id),
        };
      })
      .filter((item) => item.event)
      .sort((a, b) => String(b.event.date).localeCompare(String(a.event.date)));

    return Promise.all(rows.map(async (item) => {
      if (!item.certificate) return item;
      const emailNotification = await sendCertificateNotification(item.certificate.id, studentId);
      return { ...item, emailNotification };
    }));
  },

  async getAllIssued() {
    const [{ data: certificates }, { data: registrations }, { data: attendance }, { data: events }, { data: users }] = await Promise.all([
      jsonServerApi.get('/certificates'),
      jsonServerApi.get('/registrations'),
      jsonServerApi.get('/attendance'),
      jsonServerApi.get('/events'),
      jsonServerApi.get('/users'),
    ]);
    const registrationById = new Map(registrations.map((registration) => [String(registration.id), registration]));
    const eventById = new Map(events.map((event) => [String(event.id), event]));
    const userById = new Map(users.map((user) => [String(user.id), user]));
    return certificates
      .map((certificate) => {
        const registration = registrationById.get(String(certificate.registrationId));
        const event = eventById.get(String(certificate.eventId || registration?.eventId));
        const student = userById.get(String(certificate.studentId || registration?.studentId));
        return { certificate, registration, event, student };
      })
      .filter(({ certificate, registration, event, student }) => (
        registration && event && student
          && student.role === 'student' && student.status === 'active'
          && String(certificate.studentId || registration.studentId) === String(registration.studentId)
          && String(certificate.eventId || registration.eventId) === String(registration.eventId)
          && registration.status !== 'cancelled'
          && hasAttended(attendance, registration)
      ))
      .sort((a, b) => String(b.certificate.issuedAt).localeCompare(String(a.certificate.issuedAt)));
  },

  async issueForEligible(eventId = 'default', actorId) {
    const [{ data: registrations }, { data: attendance }, { data: events }, { data: users }, { data: certificates }, { data: templates }] = await Promise.all([
      jsonServerApi.get('/registrations'),
      jsonServerApi.get('/attendance'),
      jsonServerApi.get('/events'),
      jsonServerApi.get('/users'),
      jsonServerApi.get('/certificates'),
      jsonServerApi.get('/certificateTemplates'),
    ]);
    const eventById = new Map(events.map((event) => [String(event.id), event]));
    const userById = new Map(users.map((user) => [String(user.id), user]));
    const issuedRegistrationIds = new Set(certificates.map((item) => String(item.registrationId)));
    let issued = 0;
    const newlyIssued = [];

    for (const registration of registrations) {
      if (registration.status === 'cancelled' || issuedRegistrationIds.has(String(registration.id))) continue;
      const event = eventById.get(String(registration.eventId));
      const student = userById.get(String(registration.studentId));
      if (!event || student?.role !== 'student' || student.status !== 'active') continue;
      const eventTemplate = templates.find((item) => String(item.eventId || '') === String(event.id));
      const defaultTemplate = templates.find((item) => !item.eventId);
      const template = eventTemplate || defaultTemplate;
      if (!template || (eventId === 'default' ? Boolean(eventTemplate) : String(event.id) !== String(eventId))) continue;
      if (!hasAttended(attendance, registration)) continue;

      const existingNumbers = new Set(certificates.map((item) => item.certificateNumber));
      let certificateNumber;
      do {
        const token = globalThis.crypto?.randomUUID?.()
          || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
        const year = String(event.date || new Date().getFullYear()).slice(0, 4);
        certificateNumber = `FILKOM-${year}-${token.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
      } while (existingNumbers.has(certificateNumber));

      const payload = {
        id: `cert-auto-${registration.id}`,
        registrationId: String(registration.id),
        eventId: String(event.id),
        studentId: String(student.id),
        certificateNumber,
        issuedAt: new Date().toISOString(),
      };
      const { data: created } = await jsonServerApi.post('/certificates', payload);
      certificates.push(created);
      newlyIssued.push(created);
      issuedRegistrationIds.add(String(registration.id));
      issued += 1;
    }

    let emailSent = 0;
    let emailFailed = 0;
    for (const certificate of newlyIssued) {
      const notification = await sendCertificateNotification(certificate.id, actorId);
      emailSent += Number(notification.sent) || 0;
      emailFailed += Number(notification.failed) || 0;
      if (!notification.success) emailFailed += 1;
    }
    return { issued, emailSent, emailFailed };
  },

  async issueForStudent(studentId, registrationId) {
    const student = await getActiveStudent(studentId);
    const [{ data: registration }, { data: attendanceRows }, { data: events }, { data: certificates }, { data: templates }] = await Promise.all([
      jsonServerApi.get(`/registrations/${registrationId}`),
      jsonServerApi.get('/attendance', { params: { registrationId } }),
      jsonServerApi.get('/events'),
      jsonServerApi.get('/certificates', { params: { registrationId } }),
      jsonServerApi.get('/certificateTemplates'),
    ]);
    if (String(registration.studentId) !== String(student.id)) {
      throw new Error('Sertifikat ini bukan milik akun mahasiswa yang sedang login.');
    }
    if (registration.status === 'cancelled') {
      throw new Error('Pendaftaran telah dibatalkan; sertifikat tidak dapat diterbitkan.');
    }
    if (!hasAttended(attendanceRows, registration)) {
      throw new Error('Sertifikat hanya dapat diterbitkan setelah status absensi tercatat Hadir.');
    }
    const event = events.find((item) => String(item.id) === String(registration.eventId));
    if (!event) throw new Error('Data event untuk pendaftaran ini tidak ditemukan.');
    const existing = certificates.find((item) => String(item.registrationId) === String(registration.id));
    if (existing) {
      const emailNotification = await sendCertificateNotification(existing.id, student.id);
      return { ...certificateDetails(existing, registration, event, student, templates), emailNotification };
    }

    const existingNumbers = new Set((await jsonServerApi.get('/certificates')).data.map((item) => item.certificateNumber));
    let certificateNumber;
    do {
      const token = globalThis.crypto?.randomUUID?.()
        || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      certificateNumber = `FILKOM-${String(event.date).slice(0, 4)}-${token.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    } while (existingNumbers.has(certificateNumber));

    const payload = {
      id: `cert-${registration.id}`,
      registrationId: String(registration.id),
      eventId: String(event.id),
      studentId: String(student.id),
      certificateNumber,
      issuedAt: new Date().toISOString(),
    };
    try {
      const { data: certificate } = await jsonServerApi.post('/certificates', payload);
      const emailNotification = await sendCertificateNotification(certificate.id, student.id);
      return { ...certificateDetails(certificate, registration, event, student, templates), emailNotification };
    } catch (error) {
      const { data: latest } = await jsonServerApi.get('/certificates', { params: { registrationId } });
      const duplicate = latest.find((item) => String(item.registrationId) === String(registration.id));
      if (duplicate) {
        const emailNotification = await sendCertificateNotification(duplicate.id, student.id);
        return { ...certificateDetails(duplicate, registration, event, student, templates), emailNotification };
      }
      throw new Error(error.response?.data?.message || 'Sertifikat gagal disimpan ke JSON Server.', { cause: error });
    }
  },
};

export default certificateService;
