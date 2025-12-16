import apiClient from './apiClient.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'revault_auth';

const getToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch (err) {
    console.warn('Unable to read auth token for reports', err);
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSummary = () => apiClient.get('/reports/summary');

export const getInventoryReport = () => apiClient.get('/reports/inventory');
export const getCompletedTransactionsReport = () => apiClient.get('/reports/completed-transactions');
export const getQuantityTransferredReport = () => apiClient.get('/reports/quantity-transferred');

const fetchBlob = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Could not download report');
  }
  return res.blob();
};

export const downloadInventoryCsv = () => fetchBlob('/reports/inventory/csv');
export const downloadInventoryPdf = () => fetchBlob('/reports/inventory/pdf');

export const downloadCompletedTransactionsCsv = () => fetchBlob('/reports/completed-transactions/csv');
export const downloadCompletedTransactionsPdf = () => fetchBlob('/reports/completed-transactions/pdf');

export const downloadQuantityTransferredCsv = () => fetchBlob('/reports/quantity-transferred/csv');
export const downloadQuantityTransferredPdf = () => fetchBlob('/reports/quantity-transferred/pdf');

export default {
  getSummary,
  getInventoryReport,
  getCompletedTransactionsReport,
  getQuantityTransferredReport,
  downloadInventoryCsv,
  downloadInventoryPdf,
  downloadCompletedTransactionsCsv,
  downloadCompletedTransactionsPdf,
  downloadQuantityTransferredCsv,
  downloadQuantityTransferredPdf,
};
