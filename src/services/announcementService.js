import announcementApi from './announcementApi';

export const announcementService = {
  /**
   * Mengambil semua pengumuman
   */
  async getAllAnnouncements() {
    return announcementApi.list();
  },

  async getPublishedAnnouncements() {
    return announcementApi.listPublished();
  },

  /**
   * Menambahkan pengumuman baru
   */
  async createAnnouncement(data) {
    return announcementApi.create(data);
  },

  async updateAnnouncement(id, data) {
    return announcementApi.update(id, data);
  },

  async togglePin(id, isPinned) {
    return announcementApi.updatePinned(id, isPinned);
  },

  async deleteAnnouncement(id) {
    return announcementApi.remove(id);
  },
};

export default announcementService;
