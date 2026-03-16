import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MCP Server Info
const MCP_SERVER_INFO = {
  name: 'chat-app-assistant',
  version: '1.0.0',
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
  },
};

// MCP Tools - Actions the AI can perform
const TOOLS = [
  {
    name: 'get_user_info',
    description: 'Get information about a user by ID',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The user ID to look up' },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_conversation_messages',
    description: 'Get messages from a conversation',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'The conversation ID' },
        limit: { type: 'number', description: 'Number of messages to retrieve', default: 50 },
      },
      required: ['conversationId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to a conversation',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'The conversation ID' },
        content: { type: 'string', description: 'The message content' },
      },
      required: ['conversationId', 'content'],
    },
  },
  {
    name: 'create_conversation',
    description: 'Create a new conversation with users',
    inputSchema: {
      type: 'object',
      properties: {
        participantIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs to include',
        },
        type: { type: 'string', enum: ['direct', 'group'], description: 'Conversation type' },
        name: { type: 'string', description: 'Group conversation name' },
      },
      required: ['participantIds', 'type'],
    },
  },
  {
    name: 'get_all_users',
    description: 'Get list of all users',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// MCP Resources - Data the AI can access
const RESOURCES = [
  {
    uri: 'chat://users',
    name: 'All Users',
    description: 'List of all users in the chat system',
    mimeType: 'application/json',
  },
  {
    uri: 'chat://conversations',
    name: 'All Conversations',
    description: 'List of all conversations',
    mimeType: 'application/json',
  },
];

// MCP Prompts - Pre-defined prompts for the AI
const PROMPTS = [
  {
    name: 'greeting',
    description: 'Generate a friendly greeting message',
    arguments: [
      { name: 'username', description: 'The username to greet', required: true },
    ],
  },
  {
    name: 'summarize_conversation',
    description: 'Summarize a conversation thread',
    arguments: [
      { name: 'conversationId', description: 'The conversation to summarize', required: true },
    ],
  },
];

// MCP Protocol Endpoints

// Get server info
app.get('/mcp', (req, res) => {
  res.json(MCP_SERVER_INFO);
});

// List available tools
app.get('/mcp/tools', (req, res) => {
  res.json({ tools: TOOLS });
});

// List available resources
app.get('/mcp/resources', (req, res) => {
  res.json({ resources: RESOURCES });
});

// List available prompts
app.get('/mcp/prompts', (req, res) => {
  res.json({ prompts: PROMPTS });
});

// Execute a tool
app.post('/mcp/tools/execute', async (req, res) => {
  const { toolName, arguments: args } = req.body;

  try {
    let result;

    switch (toolName) {
      case 'get_user_info': {
        const response = await fetch(`${process.env.CHAT_API_URL}/users/${args.userId}`, {
          headers: { Authorization: `Bearer ${args.token}` },
        });
        result = await response.json();
        break;
      }

      case 'get_conversation_messages': {
        const response = await fetch(
          `${process.env.CHAT_API_URL}/messages/conversation/${args.conversationId}?limit=${args.limit || 50}`,
          {
            headers: { Authorization: `Bearer ${args.token}` },
          }
        );
        result = await response.json();
        break;
      }

      case 'send_message': {
        const response = await fetch(`${process.env.CHAT_API_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${args.token}`,
          },
          body: JSON.stringify({
            conversationId: args.conversationId,
            content: args.content,
          }),
        });
        result = await response.json();
        break;
      }

      case 'create_conversation': {
        const response = await fetch(`${process.env.CHAT_API_URL}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${args.token}`,
          },
          body: JSON.stringify({
            participantIds: args.participantIds,
            type: args.type,
            name: args.name,
          }),
        });
        result = await response.json();
        break;
      }

      case 'get_all_users': {
        const response = await fetch(`${process.env.CHAT_API_URL}/users`, {
          headers: { Authorization: `Bearer ${args.token}` },
        });
        result = await response.json();
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown tool: ${toolName}` });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Tool execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get resource content
app.get('/mcp/resources/:uri', async (req, res) => {
  const { uri } = req.params;

  try {
    let content;

    switch (uri) {
      case 'chat://users': {
        const response = await fetch(`${process.env.CHAT_API_URL}/users`, {
          headers: { Authorization: `Bearer ${req.query.token}` },
        });
        content = await response.json();
        break;
      }

      case 'chat://conversations': {
        const response = await fetch(`${process.env.CHAT_API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${req.query.token}` },
        });
        content = await response.json();
        break;
      }

      default:
        return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Resource fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute a prompt
app.post('/mcp/prompts/execute', async (req, res) => {
  const { promptName, arguments: args } = req.body;

  try {
    let result;

    switch (promptName) {
      case 'greeting': {
        result = `Hello ${args.username}! 👋 Welcome to the chat. How can I help you today?`;
        break;
      }

      case 'summarize_conversation': {
        const response = await fetch(
          `${process.env.CHAT_API_URL}/messages/conversation/${args.conversationId}?limit=100`,
          {
            headers: { Authorization: `Bearer ${args.token}` },
          }
        );
        const messages = await response.json();
        
        // Simple summarization logic
        const participantCount = messages.length;
        const uniqueSenders = new Set(messages.map(m => m.senderId)).size;
        result = `This conversation has ${messages.length} messages from ${uniqueSenders} participant(s). Recent topics include: ${messages.slice(-5).map(m => m.content.substring(0, 50)).join('... ')}`;
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown prompt: ${promptName}` });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Prompt execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Chat endpoint (integrates with AI model)
app.post('/mcp/chat', async (req, res) => {
  const { message, conversationId, context } = req.body;

  try {
    // This would integrate with your AI model of choice
    // For now, return a simple response
    const aiResponse = {
      response: `I received your message: "${message}". This is a demo MCP AI assistant response.`,
      suggestedActions: [
        { type: 'send_message', label: 'Send to chat' },
        { type: 'summarize', label: 'Summarize conversation' },
      ],
    };

    res.json(aiResponse);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`🤖 MCP Server running on port ${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
});
