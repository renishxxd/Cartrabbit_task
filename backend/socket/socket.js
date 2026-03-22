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
});

export { app, io, server };
