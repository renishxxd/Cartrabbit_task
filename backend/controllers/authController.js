import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    res.status(400);
    throw new Error('Please provide username and email');
  }

  // Check if email exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  // Check if username exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username is already taken');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to DB
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp });

  // Send Email
  const message = `Your verification code for PingChat is: ${otp}\n\nThis code will expire in 5 minutes.`;

  try {
    await sendEmail({
      email,
      subject: 'PingChat - Email Verification Code',
      message,
    });
    
    res.status(200).json({ success: true, message: 'OTP sent successfully to email' });
  } catch (err) {
    console.error('Email sending failed:', err);
    
    // Emergency fallback for Live Demos when Gmail blocks Render IP
    if (process.env.NODE_ENV === 'production') {
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp: '123456' });
      return res.status(200).json({ 
        success: true, 
        message: 'Server email blocked by Google security. Demo Bypass Active! Use OTP: 123456 to continue.' 
      });
    }

    await Otp.deleteMany({ email });
    res.status(500);
    throw new Error('Email could not be sent. Please check server configuration.');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, avatar, otp } = req.body;

  if (!username || !email || !password || !otp) {
    res.status(400);
    throw new Error('Please provide all required fields including OTP');
  }

  // Verify OTP
  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Check if email exists (re-check just in case)
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  // Check if username exists (re-check just in case)
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username is already taken');
  }

  const user = await User.create({
    username,
    email,
    password,
    avatar,
  });

  if (user) {
    // Delete OTP after successful registration
    await Otp.deleteMany({ email });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser, sendOtp };
