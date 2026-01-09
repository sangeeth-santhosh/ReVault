const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (RAW_BASE_URL && String(RAW_BASE_URL).trim())
	? String(RAW_BASE_URL).trim().replace(/\/+$/, '')
	: (import.meta.env.DEV ? 'http://localhost:5000' : '');
const AUTH_STORAGE_KEY = 'revault_auth';

const getToken = () => {
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed?.token || null;
	} catch (err) {
		console.warn('Unable to read auth token', err);
		return null;
	}
};

const request = async (path, { method = 'GET', body, headers = {} } = {}) => {
 if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set');
 }
 const token = getToken();
 const isFormData = body instanceof FormData;

 const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path}`;

 const res = await fetch(`${BASE_URL}${normalizedPath}`, {
  method,
  headers: {
   ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
   ...headers,
  },
  body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
 });

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		const err = new Error(data?.message || 'Request failed');
		err.status = res.status;
		err.data = data;
		throw err;
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
