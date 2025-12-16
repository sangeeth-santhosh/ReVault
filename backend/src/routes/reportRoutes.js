import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getTransactionSummary,
  getInventoryPostedReport,
  getCompletedTransactionsReport,
  getQuantityTransferredReport,
  downloadInventoryPostedCsv,
  downloadInventoryPostedPdf,
  downloadCompletedTransactionsCsv,
  downloadCompletedTransactionsPdf,
  downloadQuantityTransferredCsv,
  downloadQuantityTransferredPdf,
} from '../controllers/reportController.js';

const router = Router();

router.use(authMiddleware);
router.get('/summary', getTransactionSummary);
router.get('/inventory', getInventoryPostedReport);
router.get('/inventory/csv', downloadInventoryPostedCsv);
router.get('/inventory/pdf', downloadInventoryPostedPdf);

router.get('/completed-transactions', getCompletedTransactionsReport);
router.get('/completed-transactions/csv', downloadCompletedTransactionsCsv);
router.get('/completed-transactions/pdf', downloadCompletedTransactionsPdf);

router.get('/quantity-transferred', getQuantityTransferredReport);
router.get('/quantity-transferred/csv', downloadQuantityTransferredCsv);
router.get('/quantity-transferred/pdf', downloadQuantityTransferredPdf);

export default router;
