import { authMiddleware } from './authMiddleware.js';

export const adminMiddleware = async (req, res, next) => {
  await authMiddleware(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    return next();
  });
};

export default adminMiddleware;
