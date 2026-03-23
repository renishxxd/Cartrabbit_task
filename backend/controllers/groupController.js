import asyncHandler from '../middleware/asyncHandler.js';
import Conversation from '../models/Conversation.js';

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await Conversation.findOne({ _id: id, isGroup: true })
    .populate('participants', 'username avatar email')
    .populate('groupAdmin', 'username avatar');
  
  if (!conversation) {
    res.status(404);
    throw new Error('Group not found');
  }

  res.status(200).json({ success: true, data: conversation });
});

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;
  
  if (!name || !participants || participants.length === 0) {
    res.status(400);
    throw new Error('Group name and participants are required');
  }

  let parsedParticipants = typeof participants === 'string' ? JSON.parse(participants) : participants;
  
  const allParticipants = [...parsedParticipants, req.user._id];

  const conversation = await Conversation.create({
    isGroup: true,
    groupName: name,
    groupAdmin: req.user._id,
    participants: allParticipants,
  });

  res.status(201).json({ success: true, data: conversation });
});

// @desc    Rename group
// @route   PUT /api/groups/:id/rename
// @access  Private
export const renameGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const conversation = await Conversation.findOne({ _id: id, isGroup: true });

  if (!conversation) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only admin can rename the group');
  }

  conversation.groupName = name;
  await conversation.save();

  res.status(200).json({ success: true, data: conversation });
});

// @desc    Add member to group
// @route   PUT /api/groups/:id/add
// @access  Private
export const addToGroup = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const conversation = await Conversation.findOne({ _id: id, isGroup: true });

  if (!conversation) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only admin can add members');
  }

  if (conversation.participants.includes(userId)) {
    res.status(400);
    throw new Error('User already in group');
  }

  conversation.participants.push(userId);
  await conversation.save();

  res.status(200).json({ success: true, data: conversation });
});

// @desc    Remove member from group (or leave)
// @route   PUT /api/groups/:id/remove
// @access  Private
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const conversation = await Conversation.findOne({ _id: id, isGroup: true });

  if (!conversation) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Admin can remove anyone, or user can remove themselves
  if (conversation.groupAdmin.toString() !== req.user._id.toString() && req.user._id.toString() !== userId) {
    res.status(403);
    throw new Error('Not authorized to remove this user');
  }

  conversation.participants = conversation.participants.filter(p => p.toString() !== userId);
  await conversation.save();

  res.status(200).json({ success: true, data: conversation });
});
