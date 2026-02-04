# The Rooms - Real-Time Chat Application

A modern, privacy-focused real-time chat application built with Next.js, featuring WebSocket communication, role-based access control, and a sleek dark-mode interface.

## 📋 Project Overview

**The Rooms** is a full-stack web application that enables real-time messaging between users with support for both personal and group conversations. The application emphasizes security, real-time communication, and modern UI/UX design principles.

### Key Features

- **Real-Time Messaging**: Instant message delivery using Socket.IO WebSockets
- **Authentication System**: Secure login with bcrypt password hashing and JWT sessions
- **Role-Based Access Control**: Admin and user roles with protected routes
- **Personal & Group Chats**: Support for one-on-one and multi-user conversations
- **Real-Time Notifications**: Live updates for new messages and chat deletions
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Mode UI**: Modern, elegant interface with glassmorphism effects
- **Admin Dashboard**: User management and system administration

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Socket.IO** - WebSocket server for real-time communication
- **Prisma ORM** - Type-safe database access
- **SQLite** - Lightweight database (easily swappable)
- **bcryptjs** - Password hashing
- **jose** - JWT token management

### Architecture Patterns
- **Server Components** - Optimized rendering strategy
- **React Portals** - Proper modal rendering
- **Custom Hooks** - Reusable stateful logic
- **Middleware** - Route protection and authentication
- **WebSocket Events** - Real-time bidirectional communication

## 📁 Project Structure

```
The Rooms/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── chats/         # Chat CRUD operations
│   │   │   ├── users/         # User management
│   │   │   └── admin/         # Admin endpoints
│   │   ├── chat/              # Chat pages
│   │   ├── login/             # Login page
│   │   └── admin/             # Admin dashboard
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── chat/              # Chat UI components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   └── prisma.ts          # Prisma client
│   └── middleware.ts          # Route protection
├── server.js                  # Custom Next.js + Socket.IO server
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "The Rooms"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create admin user**
   ```bash
   node create_admin.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with:
     - **Username**: `admin`
     - **Password**: `admin`

## 🔐 Authentication & Security

### Authentication Flow
1. User submits credentials via login form
2. Server validates against hashed passwords in database
3. JWT token generated and stored in HTTP-only cookie
4. Middleware validates token on protected routes
5. Session data available via `getSession()` helper

### Security Features
- Password hashing with bcrypt (10 rounds)
- HTTP-only cookies prevent XSS attacks
- JWT tokens with expiration
- Role-based route protection
- CSRF protection via SameSite cookies
- Input validation on all endpoints

## 💬 Real-Time Communication

### WebSocket Architecture

The application uses Socket.IO for bidirectional real-time communication:

**Server Events** (`server.js`):
- `connection` - Client connects
- `join-chat` - User joins a chat room
- `identify` - User identifies for notifications
- `send-message` - Message sent to chat
- `broadcast-delete-chat` - Chat deletion notification

**Client Events**:
- `new-message` - Receive new message
- `chat-removed` - Chat deleted notification
- `chat-closed` - Chat room closed

### Message Flow
1. User types message in chat interface
2. Client emits `send-message` via Socket.IO
3. Server saves message to database via Prisma
4. Server broadcasts to all users in chat room
5. Clients receive and display message instantly

## 🗄️ Database Schema

### Core Models

**User**
- Unique username
- Hashed password (access_key_hash)
- Role (admin/user)
- Timestamps

**Chat**
- Type (personal/group)
- Optional name (for groups)
- Timestamps

**ChatMember**
- Links users to chats
- Role (owner/member)
- Timestamps

**Message**
- Content
- Sender reference
- Chat reference
- Optional expiration
- Timestamps

### Relationships
- One-to-Many: User → Messages
- Many-to-Many: User ↔ Chat (via ChatMember)
- One-to-Many: Chat → Messages
- Cascade deletion on chat removal

## 🎨 UI/UX Features

### Design Principles
- **Dark Mode First**: Elegant dark theme with carefully chosen colors
- **Glassmorphism**: Subtle backdrop blur effects
- **Micro-interactions**: Smooth transitions and hover states
- **Responsive Layout**: Mobile-first with desktop enhancements
- **Accessibility**: Semantic HTML and keyboard navigation

### Key Components
- **ChatShell**: Main layout with sidebar and message area
- **ChatList**: Scrollable list of conversations
- **ChatRoom**: Message display and input
- **CreateChatModal**: User selection for new chats
- **ConfirmationModal**: Deletion confirmations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chats
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `DELETE /api/chats/[id]` - Delete chat

### Messages
- `GET /api/chats/[id]/messages` - Fetch messages
- WebSocket for sending (via Socket.IO)

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `DELETE /api/admin/users/[id]` - Delete user

### Users
- `GET /api/users` - List users (for chat creation)

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create personal chat
- [ ] Create group chat
- [ ] Send and receive messages
- [ ] Delete chat (both users see removal)
- [ ] Admin dashboard access
- [ ] User management (admin only)
- [ ] Responsive design on mobile
- [ ] WebSocket reconnection

## 🚀 Deployment

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL="file:./dev.db"
```

### Production Considerations
1. **Database**: Migrate from SQLite to PostgreSQL/MySQL
2. **Environment**: Set `NODE_ENV=production`
3. **Security**: Use strong JWT secret
4. **HTTPS**: Enable SSL/TLS
5. **WebSocket**: Configure proper CORS
6. **Scaling**: Consider Redis for Socket.IO adapter

### Deploy to Vercel
```bash
npm run build
vercel deploy
```

## 📚 Learning Outcomes

This project demonstrates:
- Full-stack TypeScript development
- Real-time WebSocket communication
- Database design and ORM usage
- Authentication and authorization
- RESTful API design
- Modern React patterns (Server Components, Hooks)
- Responsive UI/UX design
- Security best practices


---

**Note**: This application is designed for educational purposes and demonstrates real-world web development patterns including real-time communication, authentication, and database management.
