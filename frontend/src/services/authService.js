import apiClient from './apiClient.js';

export const register = (payload) => apiClient.post('/auth/register', payload);
export const login = (payload) => apiClient.post('/auth/login', payload);
export const fetchMe = () => apiClient.get('/auth/me');
export const getRegistrationStatus = (email) =>
	apiClient.get(`/auth/registration-status?email=${encodeURIComponent((email || '').toString().trim())}`);

export default { register, login, fetchMe, getRegistrationStatus };
