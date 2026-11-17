import { api } from './api';

const notificationApi = {
  async getSmtpStatus() {
    const { data } = await api.get('/notifications/health');
    return data;
  },
  async verifySmtp(actorId) {
    const { data } = await api.post('/notifications/verify', { actorId });
    return data;
  },
  async sendAnnouncement(announcementId, actorId) {
    const { data } = await api.post('/notifications/announcements', { announcementId, actorId });
    return data;
  },
  async sendRegistration(registrationId, actorId) {
    const { data } = await api.post('/notifications/registrations', { registrationId, actorId });
    return data;
  },
  async sendPaymentApproved(registrationId, actorId) {
    const { data } = await api.post('/notifications/payments/approved', { registrationId, actorId });
    return data;
  },
  async sendCertificateIssued(certificateId, actorId) {
    const { data } = await api.post('/notifications/certificates/issued', { certificateId, actorId });
    return data;
  },
  async sendPublishedEvent(eventId, actorId) {
    const { data } = await api.post('/notifications/events/published', { eventId, actorId });
    return data;
  },
};

export default notificationApi;