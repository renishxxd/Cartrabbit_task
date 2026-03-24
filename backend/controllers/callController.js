import asyncHandler from '../middleware/asyncHandler.js';
import Call from '../models/Call.js';

// @desc    Create a new call log
// @route   POST /api/calls
// @access  Private
export const createCallLog = asyncHandler(async (req, res) => {
  const { receiverId, callType, status, duration, startedAt, endedAt } = req.body;
  const callerId = req.user._id;

  if (!receiverId || !callType || !status) {
    res.status(400);
    throw new Error('Please provide receiverId, callType, and status');
  }

  const call = await Call.create({
    callerId,
    receiverId,
    callType,
    status,
    duration: duration || 0,
    startedAt,
    endedAt: endedAt || new Date()
  });

  res.status(201).json({ success: true, data: call });
});

// @desc    Get user's call history
// @route   GET /api/calls
// @access  Private
export const getCallLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const calls = await Call.find({
    $or: [{ callerId: userId }, { receiverId: userId }]
  })
    .populate('callerId', 'username avatar')
    .populate('receiverId', 'username avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: calls });
});
