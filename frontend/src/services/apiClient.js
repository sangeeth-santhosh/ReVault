const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (RAW_BASE_URL && String(RAW_BASE_URL).trim())
	? String(RAW_BASE_URL).trim().replace(/\/+$/, '')
	: (import.meta.env.DEV ? 'http://localhost:5000' : '');
const AUTH_STORAGE_KEY = 'revault_auth';
const MISSING_BASE_URL_MESSAGE = 'VITE_API_BASE_URL is not set';

let inFlightCount = 0;

const emitLoading = () => {
	try {
		window.dispatchEvent(
			new CustomEvent('revault:loading', {
				detail: { active: inFlightCount > 0, count: inFlightCount },
			})
		);
	} catch {
		// ignore
	}
};

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
  throw new Error(MISSING_BASE_URL_MESSAGE);
 }
 const token = getToken();
 const isFormData = body instanceof FormData;

 const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path}`;

	inFlightCount += 1;
	emitLoading();

	let res;
	try {
		res = await fetch(`${BASE_URL}${normalizedPath}`, {
			method,
			headers: {
				...(isFormData ? {} : { 'Content-Type': 'application/json' }),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...headers,
			},
			body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
		});
	} finally {
		inFlightCount = Math.max(0, inFlightCount - 1);
		emitLoading();
	}

	const contentType = (res.headers.get('content-type') || '').toLowerCase();
	const isJson = contentType.includes('application/json');
	let data = {};

	if (isJson) {
		data = await res.json().catch(() => ({}));
	} else {
		const text = await res.text().catch(() => '');
		// Treat HTML responses as a misrouted API call (common on Vercel with SPA rewrites).
		if (text && text.toLowerCase().includes('<!doctype html')) {
			const err = new Error('Request failed');
			err.status = 0;
			err.data = { message: err.message };
			throw err;
		}
		data = text ? { message: text } : {};
	}
	if (!res.ok) {
		const err = new Error(data?.message || 'Request failed');
		err.status = res.status;
		err.data = data;
		throw err;
	}
	return data;
};

const requestBlob = async (path, { method = 'GET', headers = {} } = {}) => {
	if (!BASE_URL) {
		throw new Error(MISSING_BASE_URL_MESSAGE);
	}
	const token = getToken();
	const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path}`;

	inFlightCount += 1;
	emitLoading();

	let res;
	try {
		res = await fetch(`${BASE_URL}${normalizedPath}`, {
			method,
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...headers,
			},
		});
	} finally {
		inFlightCount = Math.max(0, inFlightCount - 1);
		emitLoading();
	}

	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		const err = new Error(data?.message || 'Request failed');
		err.status = res.status;
		err.data = data;
		throw err;
	}

	return res.blob();
};

const apiClient = {
	get: (path) => request(path, { method: 'GET' }),
	post: (path, body) => request(path, { method: 'POST', body }),
	put: (path, body) => request(path, { method: 'PUT', body }),
	delete: (path) => request(path, { method: 'DELETE' }),
	getBlob: (path) => requestBlob(path, { method: 'GET' }),
};

export default apiClient;
