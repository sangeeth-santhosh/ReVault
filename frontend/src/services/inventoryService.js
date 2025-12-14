import apiClient from './apiClient.js';

const inventoryService = {
  getAll: () => apiClient.get('/inventory/all'),
  getMine: () => apiClient.get('/inventory/my'),
  getById: (id) => apiClient.get(`/inventory/${id}`),
  add: (payload) => apiClient.post('/inventory/add', payload),
  update: (id, payload) => apiClient.put(`/inventory/update/${id}`, payload),
  remove: (id) => apiClient.delete(`/inventory/delete/${id}`),
};

export default inventoryService;
