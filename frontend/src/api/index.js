import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, username, password) =>
    api.post('/auth/register', { email, username, password }),
  logout: () => api.post('/auth/logout'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  addParticipant: (id, userId) =>
    api.post(`/conversations/${id}/participants`, { userId }),
};

export const messagesAPI = {
  getByConversation: (conversationId) =>
    api.get(`/messages/conversation/${conversationId}`),
  send: (conversationId, content, type = 'text') =>
    api.post('/messages', { conversationId, content, type }),
  delete: (id) => api.delete(`/messages/${id}`),
};

export default api;
