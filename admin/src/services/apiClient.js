const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (RAW_BASE_URL && String(RAW_BASE_URL).trim())
  ? String(RAW_BASE_URL).trim().replace(/\/+$/, '')
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');
const AUTH_STORAGE_KEY = 'revault_admin_auth';

const getToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const request = async (path, { method = 'GET', body } = {}) => {
  if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
  }
  const token = getToken();
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path}`;
  const res = await fetch(`${BASE_URL}${normalizedPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined' && window.location?.pathname !== '/admin/login') {
        window.location.assign('/admin/login');
      }
    }
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default apiClient;
export { AUTH_STORAGE_KEY };
