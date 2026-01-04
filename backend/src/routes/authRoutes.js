import { Router } from 'express';
import { register, login, getMe, getRegistrationStatus } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/registration-status', getRegistrationStatus);

export default router;
