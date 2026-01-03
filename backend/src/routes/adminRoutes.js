import { Router } from 'express';
import {
	getApprovedBusinesses,
	getPendingBusinesses,
	getPendingUsers,
	approveUser,
	rejectUser,
	deactivateUser,
} from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(adminMiddleware);
router.get('/users/pending', getPendingUsers);
router.get('/businesses/pending', getPendingBusinesses);
router.get('/businesses/approved', getApprovedBusinesses);
router.put('/users/approve/:id', approveUser);
router.put('/users/reject/:id', rejectUser);
router.put('/users/deactivate/:id', deactivateUser);

export default router;
