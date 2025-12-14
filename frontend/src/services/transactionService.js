import apiClient from './apiClient.js';

const transactionService = {
  getMy: () => apiClient.get('/transactions/my'),
  getSeller: () => apiClient.get('/transactions/seller'),
};

export default transactionService;
