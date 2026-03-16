import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

export function setupSocketHandlers(io) {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.userId}`);

    // Update user status to online
    await prisma.user.update({
      where: { id: socket.user.userId },
      data: { status: 'online' },
    });

    // Join user's conversations rooms
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId: socket.user.userId },
      include: { conversation: true },
    });

    conversations.forEach(({ conversation }) => {
      socket.join(conversation.id);
    });

    // Broadcast user online status
    io.emit('user:status', { userId: socket.user.userId, status: 'online' });

    // Handle joining a conversation room
    socket.on('conversation:join', async ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`User ${socket.user.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`User ${socket.user.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:indicator', {
        userId: socket.user.userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:indicator', {
        userId: socket.user.userId,
        conversationId,
        isTyping: false,
      });
    });

    // Handle message read receipts
    socket.on('message:read', ({ conversationId, messageId }) => {
      socket.to(conversationId).emit('message:read', {
        userId: socket.user.userId,
        messageId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.userId}`);

      await prisma.user.update({
        where: { id: socket.user.userId },
        data: { status: 'offline' },
      });

      io.emit('user:status', { userId: socket.user.userId, status: 'offline' });
    });
  });
}
