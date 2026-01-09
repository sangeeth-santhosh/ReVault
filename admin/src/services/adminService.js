import apiClient, { AUTH_STORAGE_KEY } from './apiClient.js';

export const adminLogin = async (payload) => {
  const data = await apiClient.post('/auth/login', payload);

  const user = data?.user || null;
  const token = data?.token || null;

  if (!user || !token) {
    throw new Error('Unexpected response from server');
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
  return data;
};

export const adminLogout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAdminSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed?.user || null, token: parsed?.token || null };
  } catch {
    return { user: null, token: null };
  }
};

export const fetchPendingBusinesses = () => apiClient.get('/admin/businesses/pending');
export const fetchApprovedBusinesses = () => apiClient.get('/admin/businesses/approved');

export const approveBusiness = (id) => apiClient.put(`/admin/users/approve/${id}`);
export const rejectBusiness = (id) => apiClient.put(`/admin/users/reject/${id}`);
export const deactivateBusiness = (id) => apiClient.put(`/admin/users/deactivate/${id}`);

export const fetchAdminDashboard = (range) => {
  const q = range ? `?range=${encodeURIComponent(range)}` : '';
  return apiClient.get(`/admin/dashboard${q}`);
};

export default {
  adminLogin,
  adminLogout,
  getAdminSession,
  fetchPendingBusinesses,
  fetchApprovedBusinesses,
  fetchAdminDashboard,
  approveBusiness,
  rejectBusiness,
  deactivateBusiness,
};
