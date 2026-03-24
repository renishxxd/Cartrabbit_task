import asyncHandler from '../middleware/asyncHandler.js';
import Status from '../models/Status.js';

// @desc    Add a new status
// @route   POST /api/status
// @access  Private
export const addStatus = asyncHandler(async (req, res) => {
  const { content, type, backgroundColor } = req.body;
  const userId = req.user._id;

  if (!content) {
    res.status(400);
    throw new Error('Status content is required');
  }

  const status = await Status.create({
    user: userId,
    content,
    type: type || 'text',
    backgroundColor: backgroundColor || '#000000'
  });

  res.status(201).json({ success: true, data: status });
});

// @desc    Get all statuses
// @route   GET /api/status
// @access  Private
export const getStatuses = asyncHandler(async (req, res) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const statuses = await Status.find({ createdAt: { $gt: twentyFourHoursAgo } })
    .populate('user', 'username avatar')
    .sort({ createdAt: -1 });

  // Group by user
  const groupedStatus = {};

  statuses.forEach(status => {
    if (!status.user) return;
    const userId = status.user._id.toString();
    if (!groupedStatus[userId]) {
      groupedStatus[userId] = {
        user: status.user,
        statuses: []
      };
    }
    groupedStatus[userId].statuses.push(status);
  });

  // Sort groups by the most recent status
  const sortedValues = Object.values(groupedStatus).sort((a, b) => {
    const timeA = new Date(a.statuses[0].createdAt).getTime();
    const timeB = new Date(b.statuses[0].createdAt).getTime();
    return timeB - timeA;
  });

  res.status(200).json({ success: true, data: sortedValues });
});
