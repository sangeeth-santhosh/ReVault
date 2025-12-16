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

export const downloadCsv = async () => {
  const res = await fetch(`${BASE_URL}/reports/transactions/csv`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Could not download CSV');
  }
  return res.blob();
};

export const downloadPdf = async () => {
  const res = await fetch(`${BASE_URL}/reports/transactions/pdf`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Could not download PDF');
  }
  return res.blob();
};

export default { getSummary, downloadCsv, downloadPdf };
