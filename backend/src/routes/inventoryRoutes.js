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

const router = Router();

router.get('/all', getAllInventory);
router.post('/add', authMiddleware, addInventory);
router.get('/my', authMiddleware, getMyInventory);
router.put('/update/:id', authMiddleware, updateInventory);
router.delete('/delete/:id', authMiddleware, deleteInventory);
// Public item detail, placed after specific routes to avoid collisions
router.get('/:id', getInventoryById);

export default router;
