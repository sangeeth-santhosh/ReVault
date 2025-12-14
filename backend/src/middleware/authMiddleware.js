import { verifyToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export default authMiddleware;
