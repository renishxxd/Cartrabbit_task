import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, avatar } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if email exists

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

export { registerUser, loginUser };
