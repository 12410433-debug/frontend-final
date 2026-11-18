import { jsonServerApi } from './api';

export const eventApi = {
  async list() {
    const { data } = await jsonServerApi.get('/events');
    return data;
  },
  async listPublished() {
    const { data } = await jsonServerApi.get('/events', { params: { status: 'published' } });
    return data.filter((event) => event.status === 'published');
  },
  async create(event) {
    const { data } = await jsonServerApi.post('/events', event);
    return data;
  },
  async update(id, event) {
    const { data } = await jsonServerApi.patch(`/events/${id}`, event);
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await jsonServerApi.patch(`/events/${id}`, { status });
    return data;
  },
  async remove(id) {
    const eventId = String(id);
    await jsonServerApi.delete(`/events/${id}`);

    // Hapus juga seluruh data terkait event ini (pendaftaran, absensi, sertifikat, dan template)
    try {
      const [
        { data: registrations },
        { data: attendance },
        { data: certificates },
        { data: templates },
      ] = await Promise.all([
        jsonServerApi.get('/registrations').catch(() => ({ data: [] })),
        jsonServerApi.get('/attendance').catch(() => ({ data: [] })),
        jsonServerApi.get('/certificates').catch(() => ({ data: [] })),
        jsonServerApi.get('/certificateTemplates').catch(() => ({ data: [] })),
      ]);

      const regToDelete = registrations.filter((r) => String(r.eventId) === eventId);
      const attToDelete = attendance.filter((a) => String(a.eventId) === eventId);
      const certToDelete = certificates.filter((c) => String(c.eventId) === eventId);
      const tmplToDelete = templates.filter((t) => String(t.eventId) === eventId);

      await Promise.all([
        ...regToDelete.map((r) => jsonServerApi.delete(`/registrations/${r.id}`).catch(() => {})),
        ...attToDelete.map((a) => jsonServerApi.delete(`/attendance/${a.id}`).catch(() => {})),
        ...certToDelete.map((c) => jsonServerApi.delete(`/certificates/${c.id}`).catch(() => {})),
        ...tmplToDelete.map((t) => jsonServerApi.delete(`/certificateTemplates/${t.id}`).catch(() => {})),
      ]);
    } catch {
      // Best-effort cleanup
    }
  },
};

export default eventApi;
