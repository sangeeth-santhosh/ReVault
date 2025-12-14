import { Router } from 'express';
import {
  sendRequest,
  getMyRequests,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
} from '../controllers/requestController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/send', sendRequest);
router.get('/my', getMyRequests);
router.get('/incoming', getIncomingRequests);
router.put('/accept/:id', acceptRequest);
router.put('/reject/:id', rejectRequest);
router.put('/complete/:id', completeRequest);

export default router;
