const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
	const token = getToken();
	const res = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
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
