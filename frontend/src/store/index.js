import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  // Conversations & Messages
  conversations: [],
  activeConversation: null,
  messages: [],

  // Users
  users: [],

  // Socket
  socket: null,

  // Typing indicators
  typingUsers: {},

  // Auth actions
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    const { socket } = get();
    if (socket) socket.disconnect();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      conversations: [],
      activeConversation: null,
      messages: [],
      socket: null,
    });
  },

  // Socket actions
  connectSocket: () => {
    const { token } = get();
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('message:new', (message) => {
      const { messages, activeConversation } = get();
      if (message.conversationId === activeConversation?.id) {
        set({ messages: [...messages, message] });
      }
      // Update conversations list
      get().fetchConversations();
    });

    socket.on('message:deleted', ({ id }) => {
      const { messages } = get();
      set({ messages: messages.filter((m) => m.id !== id) });
    });

    socket.on('typing:indicator', ({ userId, conversationId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [`${conversationId}-${userId}`]: isTyping,
        },
      }));
    });

    socket.on('user:status', ({ userId, status }) => {
      get().fetchUsers();
    });

    set({ socket });
    return socket;
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // API actions
  fetchConversations: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const conversations = await res.json();
        set({ conversations });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  fetchMessages: async (conversationId) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const messages = await res.json();
        set({ messages });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: async (conversationId, content) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, content }),
      });
      if (res.ok) {
        const message = await res.json();
        return message;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  createConversation: async (participantIds, type = 'direct', name = null) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantIds, type, name }),
      });
      if (res.ok) {
        const conversation = await res.json();
        get().fetchConversations();
        return conversation;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  },

  fetchUsers: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const users = await res.json();
        set({ users });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  setActiveConversation: (conversation) => {
    const { socket } = get();
    if (socket && get().activeConversation) {
      socket.emit('conversation:leave', { conversationId: get().activeConversation.id });
    }
    if (socket && conversation) {
      socket.emit('conversation:join', { conversationId: conversation.id });
    }
    set({ activeConversation: conversation });
    if (conversation) {
      get().fetchMessages(conversation.id);
    }
  },

  startTyping: (conversationId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:start', { conversationId });
    }
  },

  stopTyping: (conversationId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:stop', { conversationId });
    }
  },
}));
