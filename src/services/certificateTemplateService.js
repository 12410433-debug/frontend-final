import { jsonServerApi } from './api.js';

export const certificateTemplateService = {
  async list() {
    const { data } = await jsonServerApi.get('/certificateTemplates');
    return Array.isArray(data) ? data : [];
  },

  async save(payload) {
    const templates = await this.list();
    const existing = templates.find((item) => String(item.eventId || 'default') === String(payload.eventId || 'default'));
    if (existing) {
      const { data } = await jsonServerApi.patch(`/certificateTemplates/${existing.id}`, payload);
      return data;
    }
    const { data } = await jsonServerApi.post('/certificateTemplates', payload);
    return data;
  },

  async remove(id) {
    await jsonServerApi.delete(`/certificateTemplates/${id}`);
  },
};

export default certificateTemplateService;
