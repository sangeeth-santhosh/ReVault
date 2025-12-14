import { Router } from 'express';
import { getMyTransactions, getSellerTransactions } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/my', getMyTransactions);
router.get('/seller', getSellerTransactions);

export default router;
