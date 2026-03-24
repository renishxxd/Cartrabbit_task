import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCallLog, getCallLogs } from '../controllers/callController.js';

const router = express.Router();

router.post('/', protect, createCallLog);
router.get('/', protect, getCallLogs);

export default router;
