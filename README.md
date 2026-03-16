# 💬 Real-time Chat Application

A full-stack real-time messaging application with **React**, **Node.js**, **PostgreSQL**, **Socket.io**, and **MCP** (Model Context Protocol) integration for AI assistant features.

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Register, login, JWT-based auth
- 💬 **Real-time Messaging** - Instant message delivery via WebSocket
- 👥 **1-on-1 & Group Chats** - Private and group conversations
- 🟢 **Online Status** - See who's online/offline
- ⌨️ **Typing Indicators** - Real-time typing notifications
- 📱 **Responsive UI** - Works on desktop and mobile

### MCP AI Integration
- 🤖 **AI Assistant** - Built-in AI chat helper
- 🔧 **Tool Execution** - AI can fetch users, messages, send messages
- 📋 **Conversation Summaries** - Auto-summarize chat threads
- 💡 **Smart Suggestions** - AI-powered response suggestions

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Database   │
│ React+Vite  │◀───▶│ Express+IO  │◀───▶│ PostgreSQL  │
│ TailwindCSS │     │  Socket.io  │     │   Prisma    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ MCP Server  │
                    │   AI Tools  │
                    └─────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone or navigate to the project
cd chat-app

# Start all services with Docker Compose
docker-compose up -d

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# MCP Server: http://localhost:6000
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

#### 1. Setup Database

```bash
# Start PostgreSQL (ensure it's running on port 5432)
# Or use Docker:
docker run -d --name chatapp-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chatapp \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start the server
npm run dev
```

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# Start the dev server
npm run dev
```

#### 4. Setup MCP Server (Optional)

```bash
cd mcp-server

# Install dependencies
npm install

# Copy environment file
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# Start the server
npm run dev
```

## 📁 Project Structure

```
chat-app/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── server.js       # Main server entry
│   │   ├── db/prisma.js    # Database connection
│   │   ├── routes/         # API routes
│   │   │   ├── auth.js     # Authentication
│   │   │   ├── users.js    # User endpoints
│   │   │   ├── conversations.js
│   │   │   └── messages.js
│   │   ├── middleware/     # Auth middleware
│   │   └── socket/         # WebSocket handlers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   ├── api/           # API client
│   │   ├── store/         # Zustand state management
│   │   ├── pages/         # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Chat.jsx
│   │   └── components/    # Reusable components
│   │       ├── ConversationList.jsx
│   │       ├── ChatWindow.jsx
│   │       └── UserList.jsx
│   └── package.json
│
├── mcp-server/            # MCP AI server
│   └── src/
│       └── server.js      # MCP endpoints
│
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get user's conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id` | Get conversation details |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversation/:id` | Get messages |
| POST | `/api/messages` | Send message |
| DELETE | `/api/messages/:id` | Delete message |

### MCP Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mcp` | Server info |
| GET | `/mcp/tools` | List available tools |
| POST | `/mcp/tools/execute` | Execute a tool |
| GET | `/mcp/resources` | List resources |
| POST | `/mcp/prompts/execute` | Execute prompt |

## 🧪 Testing

### Create Test Users

1. Open http://localhost:5173
2. Register first user (e.g., `user1@test.com`)
3. Open incognito window
4. Register second user (e.g., `user2@test.com`)
5. Start chatting between the two users!

### Test Real-time Features

- Send messages between users - instant delivery
- Check typing indicators when typing
- Watch online/offline status changes
- Create group conversations

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatapp"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

**MCP Server (.env)**
```env
PORT=6000
CHAT_API_URL=http://localhost:5000/api
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, Material UI, Zustand |
| Backend | Node.js, Express, Socket.io |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Real-time | Socket.io (WebSocket) |
| AI/MCP | Custom MCP Server |
| DevOps | Docker, Docker Compose |

## 📝 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

