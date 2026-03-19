import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, getConversations, clearChat, deleteChat, toggleDisappearingMessages } from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:id', protect, getMessages);
router.post('/send/:id', protect, sendMessage);
router.delete('/clear/:id', protect, clearChat);
router.delete('/delete/:id', protect, deleteChat);
router.put('/disappearing/:id', protect, toggleDisappearingMessages);

export default router;
