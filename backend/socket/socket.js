import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Message from '../models/Message.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  
  const userId = socket.handshake.query.userId;
  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
  }
  
  // Handle message delivery status
  socket.on('message_delivered', async ({ messageId, senderId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { status: 'delivered' },
        { new: true }
      );
      if (updatedMessage) {
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_status_update', {
            messageId,
            status: 'delivered'
          });
        }
      }
    } catch (error) {
      console.error('Error updating message delivery status:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
  });

  // WebRTC Call Signaling
  socket.on('call-user', (data) => {
    // data: { userToCall: userId, signalData: offer, from: callerId, name: callerName, avatar: callerAvatar }
    const receiverSocketId = getReceiverSocketId(data.userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-made', {
        signal: data.signalData,
        from: data.from,
        name: data.name,
        avatar: data.avatar
      });
    }
  });

  socket.on('answer-call', (data) => {
    // data: { to: callerId, signal: answer }
    const callerSocketId = getReceiverSocketId(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-answered', data.signal);
    }
  });

  socket.on('ice-candidate', (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('ice-candidate', data.candidate);
    }
  });

  socket.on('end-call', (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-ended');
    }
  });

  socket.on('reject-call', (data) => {
    const callerSocketId = getReceiverSocketId(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-rejected');
    }
  });

  // Typing Indicator (1-on-1 for now, or group if rooms were used)
  socket.on('typing', (data) => {
    // data: { to: conversationId/userId, isGroup: boolean }
    if (!data.isGroup) {
      const receiverSocketId = getReceiverSocketId(data.to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { from: userId });
      }
    }
  });

  socket.on('stop_typing', (data) => {
    if (!data.isGroup) {
      const receiverSocketId = getReceiverSocketId(data.to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stopped_typing', { from: userId });
      }
    }
  });
});

export { app, io, server };
