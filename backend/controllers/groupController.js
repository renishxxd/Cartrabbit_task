import asyncHandler from '../middleware/asyncHandler.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { io, getReceiverSocketId } from '../socket/socket.js';

const emitGroupUpdate = (participants) => {
  participants.forEach(p => {
    const socketId = getReceiverSocketId(p.toString());
    if (socketId) {
      io.to(socketId).emit('group_updated');
    }
  });
};

const sendSystemMessage = async (conversationId, senderId, text, participants) => {
  const msg = await Message.create({
    conversationId,
    senderId,
    text,
    isSystemMessage: true
  });
  
  await Conversation.findByIdAndUpdate(conversationId, { lastMessage: msg._id });

  const messageObj = {
    id: msg._id,
    conversationId: msg.conversationId.toString(),
    text: msg.text,
    senderId: msg.senderId.toString(),
    isSystemMessage: true,
    status: 'sent',
    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: msg.createdAt
  };

  participants.forEach(pId => {
    const socketId = getReceiverSocketId(pId.toString());
    if (socketId) {
      io.to(socketId).emit("newMessage", messageObj);
    }
  });
};

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

  await sendSystemMessage(conversation._id, req.user._id, `${req.user.username} created group "${name}"`, allParticipants);
  emitGroupUpdate(allParticipants);

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

  const oldName = conversation.groupName;
  conversation.groupName = name;
  await conversation.save();

  await sendSystemMessage(conversation._id, req.user._id, `${req.user.username} changed the group name from "${oldName}" to "${name}"`, conversation.participants);
  emitGroupUpdate(conversation.participants);

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

  const addedUser = await User.findById(userId);
  const addedUserName = addedUser ? addedUser.username : 'A user';

  await sendSystemMessage(conversation._id, req.user._id, `${req.user.username} added ${addedUserName} to the group`, conversation.participants);
  emitGroupUpdate(conversation.participants);

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

  const previousParticipants = [...conversation.participants];
  conversation.participants = conversation.participants.filter(p => p.toString() !== userId);
  
  if (conversation.participants.length === 0) {
    await Conversation.findByIdAndDelete(id);
  } else {
    // If admin leaves, assign the first available remaining participant as the new admin
    if (conversation.groupAdmin.toString() === userId) {
       conversation.groupAdmin = conversation.participants[0];
    }
    await conversation.save();
  }

  // Notify everyone including the person who just left so their sidebar clears
  emitGroupUpdate(previousParticipants);

  const removedUser = await User.findById(userId);
  const removedUserName = removedUser ? removedUser.username : 'A user';
  
  if (conversation.participants.length > 0) {
    if (req.user._id.toString() === userId) {
      await sendSystemMessage(id, req.user._id, `${removedUserName} left the group`, conversation.participants);
    } else {
      await sendSystemMessage(id, req.user._id, `${req.user.username} removed ${removedUserName} from the group`, conversation.participants);
    }
  }

  res.status(200).json({ success: true, data: conversation });
});
