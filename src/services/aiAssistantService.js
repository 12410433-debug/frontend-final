import { api } from './api';

export const aiAssistantService = {
  async recommend(interests) {
    const { data } = await api.post('/ai/recommendations', { interests });
    return data;
  },

  async chat(message, history) {
    const { data } = await api.post('/ai/chat', { message, history });
    return data;
  },
};

export default aiAssistantService;
