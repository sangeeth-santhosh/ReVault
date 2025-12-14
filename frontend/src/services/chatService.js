import apiClient from './apiClient.js';

const chatService = {
  sendMessage: (payload) => apiClient.post('/chat/send', payload),
  getByRequest: (requestId) => apiClient.get(`/chat/${requestId}`),
};

export default chatService;
