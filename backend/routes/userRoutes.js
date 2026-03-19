import express from 'express';
import { getUsers, searchUsers, toggleBlockUser, toggleMuteUser, toggleFavouriteUser, reportUser, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateProfile);
router.get('/', protect, getUsers);
router.post('/block/:id', protect, toggleBlockUser);
router.post('/mute/:id', protect, toggleMuteUser);
router.post('/favourite/:id', protect, toggleFavouriteUser);
router.post('/report/:id', protect, reportUser);

export default router;
