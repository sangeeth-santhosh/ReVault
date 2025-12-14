import apiClient from './apiClient.js';

const requestService = {
  send: (payload) => apiClient.post('/request/send', payload),
  getMine: () => apiClient.get('/request/my'),
  getIncoming: () => apiClient.get('/request/incoming'),
  accept: (id) => apiClient.put(`/request/accept/${id}`),
  reject: (id) => apiClient.put(`/request/reject/${id}`),
  complete: (id, payload) => apiClient.put(`/request/complete/${id}`, payload),
};

export default requestService;
