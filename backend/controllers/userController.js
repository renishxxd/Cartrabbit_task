import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';

// @desc    Get all users (Basic placeholder for Module 2)
// @route   GET /api/users
// @access  Private
export const getUsers = asyncHandler(async (req, res) => {
  // Return users without password field
  const users = await User.find({}).select('-password');
  
  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { username } = req.query;
  const currentUserId = req.user._id;

  if (!username) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Regex for partial match, case insensitive
  const users = await User.find({
    _id: { $ne: currentUserId },
    username: { $regex: username, $options: 'i' }
  }).select('_id username avatar');

  res.status(200).json({
    success: true,
    data: users.map(u => ({
      id: u._id,
      username: u.username,
      avatar: u.avatar,
      about: u.about
    }))
  });
});

import Report from '../models/Report.js';

// @desc    Toggle block status of a user
// @route   POST /api/users/block/:id
// @access  Private
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const isBlocked = user.blockedUsers.includes(targetUserId);
  
  if (isBlocked) {
    user.blockedUsers.pull(targetUserId);
  } else {
    user.blockedUsers.push(targetUserId);
  }
  
  await user.save();
  res.status(200).json({ success: true, isBlocked: !isBlocked });
});

// @desc    Toggle mute status of a user
// @route   POST /api/users/mute/:id
// @access  Private
export const toggleMuteUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId);
  const isMuted = user.mutedChats.includes(targetUserId);
  
  if (isMuted) {
    user.mutedChats.pull(targetUserId);
  } else {
    user.mutedChats.push(targetUserId);
  }
  
  await user.save();
  res.status(200).json({ success: true, isMuted: !isMuted });
});

// @desc    Toggle favourite status of a user
// @route   POST /api/users/favourite/:id
// @access  Private
export const toggleFavouriteUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId);
  const isFavourite = user.favouriteChats.includes(targetUserId);
  
  if (isFavourite) {
    user.favouriteChats.pull(targetUserId);
  } else {
    user.favouriteChats.push(targetUserId);
  }
  
  await user.save();
  res.status(200).json({ success: true, isFavourite: !isFavourite });
});

// @desc    Report a user
// @route   POST /api/users/report/:id
// @access  Private
export const reportUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;
  const { reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error('Reason is required to report a user');
  }

  await Report.create({
    reporterId: currentUserId,
    reportedUserId: targetUserId,
    reason
  });

  res.status(201).json({ success: true, message: 'Report submitted successfully' });
});

// @desc    Update user profile (avatar, username, about)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.username && req.body.username !== user.username) {
    const existing = await User.findOne({ username: req.body.username });
    if (existing) {
      res.status(400);
      throw new Error('Username is already taken');
    }
    user.username = req.body.username;
  }

  if (req.body.about !== undefined) user.about = req.body.about;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

  const updated = await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      avatar: updated.avatar,
      about: updated.about,
    }
  });
});
