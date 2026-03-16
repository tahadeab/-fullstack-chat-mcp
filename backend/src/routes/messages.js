import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a conversation
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        userId: req.user.userId,
        conversationId,
      },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let messages;
    if (cursor) {
      messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: 1,
        cursor: { id: cursor },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    }

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { conversationId, content, type = 'text' } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({ error: 'Content and conversationId required' });
    }

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        userId: req.user.userId,
        conversationId,
      },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        type,
        senderId: req.user.userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Emit via socket
    const io = req.app.get('io');
    io.to(conversationId).emit('message:new', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.userId) {
      return res.status(403).json({ error: 'Cannot delete other users messages' });
    }

    await prisma.message.delete({
      where: { id: req.params.id },
    });

    // Emit via socket
    const io = req.app.get('io');
    io.to(message.conversationId).emit('message:deleted', { id: req.params.id });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
