import asyncHandler from '../middleware/asyncHandler.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

// @desc    Send a new message
// @route   POST /api/messages/send/:id
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text, mediaUrl, mediaType, mediaMetadata } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!text && !mediaUrl) {
    res.status(400);
    throw new Error('Message text or media is required');
  }

  // Check if id is a group conversation
  let conversation = null;
  
  if (receiverId.length === 24) { // Valid ObjectId
      conversation = await Conversation.findOne({ _id: receiverId, isGroup: true });
  }

  if (!conversation) {
    // 1-on-1 chat logic
    const receiverData = await User.findById(receiverId);
    if (receiverData && receiverData.blockedUsers && receiverData.blockedUsers.includes(senderId)) {
      res.status(403);
      throw new Error('You have been blocked by this user');
    }

    const senderData = await User.findById(senderId);
    if (senderData && senderData.blockedUsers && senderData.blockedUsers.includes(receiverId)) {
      res.status(403);
      throw new Error('You have blocked this user. Unblock to send a message');
    }

    conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroup: false
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isGroup: false
      });
    }
  }

  const newMessage = new Message({
    senderId,
    conversationId: conversation._id,
    text,
    mediaUrl,
    mediaType,
    mediaMetadata,
  });

  if (newMessage) {
    conversation.lastMessage = newMessage._id;
    await Promise.all([conversation.save(), newMessage.save()]);

    const messageObj = {
      id: newMessage._id,
      text: newMessage.text,
      mediaUrl: newMessage.mediaUrl,
      mediaType: newMessage.mediaType,
      mediaMetadata: newMessage.mediaMetadata,
      senderId: newMessage.senderId,
      status: newMessage.status,
      isEdited: newMessage.isEdited || false,
      isDeleted: newMessage.isDeleted || false,
      time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: newMessage.createdAt
    };

    // Emit to all participants
    conversation.participants.forEach((participantId) => {
      // Don't emit back to sender, they add it locally
      if (participantId.toString() !== senderId.toString()) {
        const receiverSocketId = getReceiverSocketId(participantId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", messageObj);
        }
      }
    });

    res.status(201).json({ success: true, data: messageObj });
  } else {
    res.status(400);
    throw new Error('Invalid message data');
  }
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/:id (id of the user chatting with)
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user._id;

  let conversation = null;
  if (userToChatId.length === 24) {
    conversation = await Conversation.findOne({ _id: userToChatId, isGroup: true });
  }

  if (!conversation) {
    conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
      isGroup: false
    });
  }

  if (!conversation) {
    return res.status(200).json({ success: true, data: [] });
  }

  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

  const formattedMessages = messages.map(msg => ({
    id: msg._id,
    text: msg.text,
    mediaUrl: msg.mediaUrl,
    mediaType: msg.mediaType,
    mediaMetadata: msg.mediaMetadata,
    senderId: msg.senderId,
    status: msg.status,
    isEdited: msg.isEdited || false,
    isDeleted: msg.isDeleted || false,
    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: msg.createdAt
  }));

  res.status(200).json({ success: true, data: formattedMessages });
});

// @desc    Get all conversations for sidebar
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId
  })
  .sort({ updatedAt: -1 })
  .populate('participants', 'username avatar about')
  .populate('lastMessage', 'text createdAt');

  if (!conversations) {
    return res.status(200).json({ success: true, data: [] });
  }

  const formattedConversationsRaw = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        read: false
      });

      if (conv.isGroup) {
        return {
          id: conv._id,
          username: conv.groupName,
          avatar: conv.groupAvatar || 'https://ui-avatars.com/api/?name=Group',
          about: 'Group Chat',
          isGroup: true,
          lastMessage: conv.lastMessage ? conv.lastMessage.text : 'Start chatting',
          lastSeen: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          updatedAt: conv.updatedAt,
          unreadCount: unreadCount,
          isOnline: false
        };
      } else {
        const validParticipants = conv.participants.filter(p => p != null);
        const otherParticipant = validParticipants.find(p => p._id.toString() !== userId.toString());
        
        if (!otherParticipant) return null;

        return {
          id: otherParticipant._id,
          username: otherParticipant.username,
          avatar: otherParticipant.avatar,
          about: otherParticipant.about,
          isGroup: false,
          lastMessage: conv.lastMessage ? conv.lastMessage.text : 'Start chatting',
          lastSeen: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          updatedAt: conv.updatedAt,
          unreadCount: unreadCount,
          isOnline: false
        };
      }
    })
  );

  const formattedConversations = formattedConversationsRaw.filter(Boolean);

  res.status(200).json({ success: true, data: formattedConversations });
});

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/mark-read/:id
// @access  Private
export const markConversationsAsRead = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const userId = req.user._id;

  let conversation = null;
  if (userToChatId.length === 24) {
    conversation = await Conversation.findOne({ _id: userToChatId, isGroup: true });
  }

  if (!conversation) {
    conversation = await Conversation.findOne({
      participants: { $all: [userId, userToChatId] },
      isGroup: false
    });
  }

  if (!conversation) {
    return res.status(200).json({ success: true, message: 'No conversation found' });
  }

  const result = await Message.updateMany(
    { conversationId: conversation._id, senderId: userToChatId, read: false },
    { $set: { read: true, status: 'read' } }
  );

  if (result.modifiedCount > 0) {
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messages_read", { conversationId: conversation._id, readerId: userId });
    }
  }

  res.status(200).json({ success: true, message: 'Messages marked as read' });
});

// @desc    Clear all messages in a chat (but keep the conversation)
// @route   DELETE /api/messages/clear/:id
// @access  Private
export const clearChat = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  await Message.deleteMany({ conversationId: conversation._id });
  
  conversation.lastMessage = null;
  await conversation.save();

  res.status(200).json({ success: true, message: 'Chat cleared successfully' });
});

// @desc    Delete entire conversation
// @route   DELETE /api/messages/delete/:id
// @access  Private
export const deleteChat = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  await Message.deleteMany({ conversationId: conversation._id });
  await Conversation.findByIdAndDelete(conversation._id);

  res.status(200).json({ success: true, message: 'Chat deleted successfully' });
});

// @desc    Toggle disappearing messages timer
// @route   PUT /api/messages/disappearing/:id
// @access  Private
export const toggleDisappearingMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const { timer } = req.body; // 0 = off, otherwise seconds
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  conversation.disappearingMessagesTime = timer;
  await conversation.save();

  res.status(200).json({ success: true, timer: conversation.disappearingMessagesTime });
});

// @desc    Edit a message text
// @route   PUT /api/messages/edit/:id
// @access  Private
export const editMessage = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const { newText } = req.body;
  const senderId = req.user._id;

  if (!newText || newText.trim().length === 0) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.senderId.toString() !== senderId.toString()) {
    res.status(403);
    throw new Error('You can only edit your own messages');
  }

  if (message.isDeleted) {
    res.status(400);
    throw new Error('Cannot edit a deleted message');
  }

  message.text = newText;
  message.isEdited = true;
  await message.save();

  // Find the other participant in the conversation to emit socket event
  const conversation = await Conversation.findById(message.conversationId);
  if (conversation) {
    const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message_edited', {
          messageId: message._id,
          newText,
          isEdited: true
        });
      }
    }
  }

  res.status(200).json({ success: true, messageId: message._id, newText, isEdited: true });
});

// @desc    Delete a message for everyone
// @route   DELETE /api/messages/delete-for-everyone/:id
// @access  Private
export const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const { id: messageId } = req.params;
  const senderId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.senderId.toString() !== senderId.toString()) {
    res.status(403);
    throw new Error('You can only delete your own messages');
  }

  message.text = '🚫 This message was deleted';
  message.mediaUrl = null;
  message.mediaType = null;
  message.mediaMetadata = null;
  message.isDeleted = true;
  await message.save();

  // Find the other participant to emit socket event
  const conversation = await Conversation.findById(message.conversationId);
  if (conversation) {
    const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message_deleted', {
          messageId: message._id,
          isDeleted: true
        });
      }
    }
  }

  res.status(200).json({ success: true, messageId: message._id, isDeleted: true });
});

// @desc    Upload media to Cloudinary
// @route   POST /api/messages/upload
// @access  Private
export const uploadMediaFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Cloudinary returns the stored info in req.file
  const fileData = {
    url: req.file.path,
    filename: req.file.filename,
    size: req.file.size,
    format: req.file.mimetype,
  };

  res.status(200).json({ success: true, data: fileData });
});
