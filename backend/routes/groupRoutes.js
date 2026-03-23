import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createGroup, renameGroup, addToGroup, removeFromGroup, getGroup } from '../controllers/groupController.js';

const router = express.Router();

router.get('/:id', protect, getGroup);
router.post('/', protect, createGroup);
router.put('/:id/rename', protect, renameGroup);
router.put('/:id/add', protect, addToGroup);
router.put('/:id/remove', protect, removeFromGroup);

export default router;
