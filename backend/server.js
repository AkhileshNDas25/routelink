// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import User from './models/User.js';  // Add this import
import authRoutes from './routes/authRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware - CORRECTED CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://routelink-kappa.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for diagnostics
app.use(morgan('combined'));
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl} - origin: ${req.headers.origin}`);
  next();
});

// Connect to MongoDB
connectDB();

// Lightweight test endpoint for routes availability
app.get('/api/routes/test', (req, res) => {
  res.json({ ok: true, message: 'Routes endpoint reachable' });
});

// Test user endpoint (add this BEFORE routes)
app.get('/api/create-test-user', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      return res.json({ 
        success: true,
        message: 'Test user already exists!', 
        email: 'test@test.com', 
        password: 'test123' 
      });
    }

    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123'
    });

    res.json({ 
      success: true,
      message: 'Test user created!', 
      email: 'test@test.com', 
      password: 'test123' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
import { setIo, addActiveUser, removeActiveUserBySocketId, getSocketId, listActiveUsers } from './utils/socket.js';

setIo(io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    addActiveUser(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message, senderId, chatId } = data;
    console.log('socket sendMessage:', { senderId, receiverId, chatId });
    const receiverSocketId = getSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message,
        chatId,
        timestamp: new Date()
      });
      console.log('Message emitted to socket:', receiverSocketId);
    } else {
      console.log('Receiver not connected, socket id not found:', receiverId);
    }
  });

  socket.on('requestUpdate', (data) => {
    const { receiverId, status, requestId } = data;
    const receiverSocketId = getSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('requestStatusChanged', {
        requestId,
        status
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = removeActiveUserBySocketId(socket.id);
    if (userId) console.log(`User ${userId} disconnected`);
  });
});

// Debug endpoint to list currently active users
app.get('/api/socket/active', (req, res) => {
  res.json({ active: listActiveUsers() });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful error handlers for better diagnostics (useful on Render)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Optionally exit process: process.exit(1);
});
