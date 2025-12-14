import apiClient from './apiClient.js';

export const register = (payload) => apiClient.post('/auth/register', payload);
export const login = (payload) => apiClient.post('/auth/login', payload);
export const fetchMe = () => apiClient.get('/auth/me');

export default { register, login, fetchMe };
