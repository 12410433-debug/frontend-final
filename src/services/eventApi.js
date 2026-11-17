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
    await jsonServerApi.delete(`/events/${id}`);
  },
};

export default eventApi;
