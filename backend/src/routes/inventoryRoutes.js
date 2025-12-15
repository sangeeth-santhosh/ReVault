import { Router } from 'express';
import {
  addInventory,
  getAllInventory,
  getInventoryById,
  getMyInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/all', getAllInventory);
router.post('/add', authMiddleware, upload.array('images', 4), addInventory);
router.get('/my', authMiddleware, getMyInventory);
router.put('/update/:id', authMiddleware, upload.array('images', 4), updateInventory);
router.delete('/delete/:id', authMiddleware, deleteInventory);
// Public item detail, placed after specific routes to avoid collisions
router.get('/:id', getInventoryById);

export default router;
