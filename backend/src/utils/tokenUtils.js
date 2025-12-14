import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const secret = config.jwtSecret || 'changeme';

export const createToken = (payload, options = {}) => {
	return jwt.sign(payload, secret, { expiresIn: config.jwtExpiresIn || '7d', ...options });
};

export const verifyToken = (token) => {
	return jwt.verify(token, secret);
};

export default { createToken, verifyToken };
