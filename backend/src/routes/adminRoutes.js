import { Router } from 'express';
import { getPendingUsers, approveUser } from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(adminMiddleware);
router.get('/users/pending', getPendingUsers);
router.put('/users/approve/:id', approveUser);

export default router;
