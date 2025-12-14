import { Router } from 'express';
import { sendMessage, getChatByRequest } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/send', sendMessage);
router.get('/:requestId', getChatByRequest);

export default router;
