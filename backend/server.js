// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
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

// Connect to MongoDB
connectDB();

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
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message, senderId, chatId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message,
        chatId,
        timestamp: new Date()
      });
    }
  });

  socket.on('requestUpdate', (data) => {
    const { receiverId, status, requestId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('requestStatusChanged', {
        requestId,
        status
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
