import express from 'express';
import { registerUser, loginUser, sendOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
