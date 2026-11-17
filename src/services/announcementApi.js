import { jsonServerApi } from './api.js';

const CATEGORIES = ['Akademik', 'Event', 'Organisasi', 'Informasi Fakultas', 'Lainnya'];

const announcementApi = {
  async list() {
    const { data } = await jsonServerApi.get('/announcements');
    return data;
  },
  async listPublished() {
    const { data } = await jsonServerApi.get('/announcements', { params: { status: 'published' } });
    return data.filter((item) => item.status === 'published');
  },
  async create(item) {
    if (!CATEGORIES.includes(item.category)) throw new Error('Kategori pengumuman tidak valid.');
    const { data } = await jsonServerApi.post('/announcements', item);
    return data;
  },
  async update(id, item) {
    if (!CATEGORIES.includes(item.category)) throw new Error('Kategori pengumuman tidak valid.');
    const { data } = await jsonServerApi.patch(`/announcements/${id}`, item);
    return data;
  },
  async updatePinned(id, isPinned) {
    const { data } = await jsonServerApi.patch(`/announcements/${id}`, { isPinned });
    return data;
  },
  async remove(id) {
    await jsonServerApi.delete(`/announcements/${id}`);
  },
};

export default announcementApi;
