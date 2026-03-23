import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addStatus, getStatuses } from '../controllers/statusController.js';

const router = express.Router();

router.post('/', protect, addStatus);
router.get('/', protect, getStatuses);

export default router;
