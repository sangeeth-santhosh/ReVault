import { Router } from 'express';
import {
	getApprovedBusinesses,
	getPendingBusinesses,
	getPendingUsers,
	approveUser,
	rejectUser,
	deactivateUser,
} from '../controllers/adminController.js';
import { getAllCompletedTransactionsAdmin } from '../controllers/transactionController.js';
import {
	downloadInventoryPostedCsvAdmin,
	downloadInventoryPostedPdfAdmin,
	downloadCompletedTransactionsCsvAdmin,
	downloadCompletedTransactionsPdfAdmin,
	downloadQuantityTransferredCsvAdmin,
	downloadQuantityTransferredPdfAdmin,
} from '../controllers/reportController.js';
import { getAdminNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { getAdminDashboard } from '../controllers/adminDashboardController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(adminMiddleware);
router.get('/users/pending', getPendingUsers);
router.get('/businesses/pending', getPendingBusinesses);
router.get('/businesses/approved', getApprovedBusinesses);
router.put('/users/approve/:id', approveUser);
router.put('/users/reject/:id', rejectUser);
router.put('/users/deactivate/:id', deactivateUser);

// Admin audit (read-only)
router.get('/transactions', getAllCompletedTransactionsAdmin);

// Admin reports (download only)
router.get('/reports/inventory/csv', downloadInventoryPostedCsvAdmin);
router.get('/reports/inventory/pdf', downloadInventoryPostedPdfAdmin);
router.get('/reports/completed-transactions/csv', downloadCompletedTransactionsCsvAdmin);
router.get('/reports/completed-transactions/pdf', downloadCompletedTransactionsPdfAdmin);
router.get('/reports/quantity-transferred/csv', downloadQuantityTransferredCsvAdmin);
router.get('/reports/quantity-transferred/pdf', downloadQuantityTransferredPdfAdmin);

// Admin notifications
router.get('/notifications', getAdminNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Admin dashboard
router.get('/dashboard', getAdminDashboard);

export default router;
