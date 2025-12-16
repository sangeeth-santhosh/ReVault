import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getTransactionSummary,
  downloadTransactionsCsv,
  downloadTransactionsPdf,
} from '../controllers/reportController.js';

const router = Router();

router.use(authMiddleware);
router.get('/summary', getTransactionSummary);
router.get('/transactions/csv', downloadTransactionsCsv);
router.get('/transactions/pdf', downloadTransactionsPdf);

export default router;
