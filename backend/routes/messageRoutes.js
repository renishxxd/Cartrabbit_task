import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, getConversations, clearChat, deleteChat, toggleDisappearingMessages, uploadMediaFile, markConversationsAsRead, editMessage, deleteMessageForEveryone } from '../controllers/messageController.js';
import { uploadMedia } from '../utils/cloudinary.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:id', protect, getMessages);
router.post('/send/:id', protect, sendMessage);
router.post('/upload', protect, uploadMedia.single('media'), uploadMediaFile);
router.put('/mark-read/:id', protect, markConversationsAsRead);
router.put('/edit/:id', protect, editMessage);
router.delete('/delete-for-everyone/:id', protect, deleteMessageForEveryone);
router.delete('/clear/:id', protect, clearChat);
router.delete('/delete/:id', protect, deleteChat);
router.put('/disappearing/:id', protect, toggleDisappearingMessages);

export default router;
