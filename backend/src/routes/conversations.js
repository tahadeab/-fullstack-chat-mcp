import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new conversation (1-on-1 or group)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type = 'direct', participantIds = [] } = req.body;

    if (type === 'direct' && participantIds.length !== 1) {
      return res.status(400).json({ error: 'Direct chat requires exactly one other participant' });
    }

    // Check if direct conversation already exists
    if (type === 'direct') {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              userId: { in: [req.user.userId, participantIds[0]] },
            },
          },
        },
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: type === 'group' ? name : null,
        type,
        participants: {
          create: [
            { userId: req.user.userId },
            ...participantIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === req.user.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to group conversation
router.post('/:id/participants', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation || conversation.type !== 'group') {
      return res.status(400).json({ error: 'Can only add participants to group conversations' });
    }

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId: req.params.id,
        userId,
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
