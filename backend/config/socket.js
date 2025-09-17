const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userSockets = new Map(); // socketId -> user data mapping
    this.rooms = new Set(); // Track active rooms
    this.connectionAttempts = new Map(); // Track connection attempts
  }

  initialize(server, options = {}) {
    const defaultOptions = {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5175", 
          process.env.CLIENT_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      connectTimeout: 45000,
      allowEIO3: true,
      upgradeTimeout: 30000,
      cookie: {
        name: 'io',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    };

    this.io = new Server(server, { ...defaultOptions, ...options });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('Socket.IO server initialized');
    return this.io;
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
          return next(new Error('Authentication error'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        socket.connectionTime = new Date();
        socket.metadata = {
          userAgent: socket.handshake.headers['user-agent'],
          ip: clientIp,
          lastActivity: new Date()
        };

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} connected (${socket.userId})`);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Update user's online status
      this.updateUserStatus(socket.userId, true);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.name} disconnected (${socket.userId})`);
        this.updateUserStatus(socket.userId, false);
      });
      
      // Handle typing indicators for messaging
      socket.on('typing', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: data.conversationId,
          isTyping: data.isTyping
        });
      });
      
      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });
      
      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });
      
      // Handle joining rooms (for notifications)
      socket.on('join_room', (room) => {
        socket.join(room);
      });
      
      // Handle leaving rooms
      socket.on('leave_room', (room) => {
        socket.leave(room);
      });
      
      // Handle message read receipts
      socket.on('message_read', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('message_read_receipt', {
          userId: socket.userId,
          messageId: data.messageId,
          conversationId: data.conversationId
        });
      });
    });
  }

  setupSocketEventHandlers(socket) {
    // Room management
    socket.on('join', (room) => this.handleRoomJoin(socket, room));
    socket.on('leave', (room) => this.handleRoomLeave(socket, room));

    // Typing indicators
    socket.on('typing:start', (room) => this.handleTyping(socket, room, true));
    socket.on('typing:stop', (room) => this.handleTyping(socket, room, false));

    // Notifications
    socket.on('notification:read', (notificationId) => {
      this.handleNotificationRead(socket, notificationId);
    });

    // Analytics
    socket.on('analytics:subscribe', () => this.handleAnalyticsSubscription(socket, true));
    socket.on('analytics:unsubscribe', () => this.handleAnalyticsSubscription(socket, false));

    // Disconnect handling
    socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason));
    
    // Error handling
    socket.on('error', (error) => this.handleSocketError(socket, error));
  }

  // Rate limiting helper
  isRateLimited(clientIp) {
    const attempts = this.connectionAttempts.get(clientIp) || 0;
    if (attempts > 100) return true; // 100 attempts per IP
    this.connectionAttempts.set(clientIp, attempts + 1);
    return false;
  }

  // Status management
  emitUserStatus(socket, isOnline) {
    const statusEvent = isOnline ? 'user:online' : 'user:offline';
    socket.broadcast.emit(statusEvent, {
      userId: socket.userId,
      name: socket.user.name,
      role: socket.user.role,
      timestamp: new Date()
    });
  }

  // Clean up helpers
  cleanupUserConnection(socket) {
    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);
    this.emitUserStatus(socket, false);
  }

  // Enhanced utility methods
  getActiveUsersCount() {
    return this.connectedUsers.size;
  }

  getRoomMembers(room) {
    return Array.from(this.io.sockets.adapter.rooms.get(room) || []);
  }

  broadcastToRoom(room, event, data, exceptSocket = null) {
    if (exceptSocket) {
      exceptSocket.to(room).emit(event, data);
    } else {
      this.io.to(room).emit(event, data);
    }
  }

  // Method to emit to users with specific role
  emitToRole(role, event, data) {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
    }
  }

  // Method to emit to specific room
  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  // Method to emit to specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Handle room join
  handleRoomJoin(socket, room) {
    socket.join(room);
    this.rooms.add(room);
    console.log(`User ${socket.user.name} joined room: ${room}`);
  }

  // Handle room leave
  handleRoomLeave(socket, room) {
    socket.leave(room);
    console.log(`User ${socket.user.name} left room: ${room}`);
  }

  // Handle typing indicators
  handleTyping(socket, room, isTyping) {
    socket.to(room).emit('typing', {
      userId: socket.userId,
      name: socket.user.name,
      isTyping,
      timestamp: new Date()
    });
  }

  // Handle notification read
  handleNotificationRead(socket, notificationId) {
    socket.emit('notification:read:confirmed', { notificationId });
  }

  // Handle analytics subscription
  handleAnalyticsSubscription(socket, subscribe) {
    if (subscribe) {
      socket.join('analytics');
    } else {
      socket.leave('analytics');
    }
  }

  // Handle disconnect
  handleDisconnect(socket, reason) {
    console.log(`User ${socket.user?.name || 'Unknown'} disconnected: ${reason}`);
    this.cleanupUserConnection(socket);
  }

  // Handle socket errors
  handleSocketError(socket, error) {
    console.error(`Socket error for user ${socket.user?.name || 'Unknown'}:`, error);
  }

  // Get socket instance
  getIO() {
    return this.io;
  }
}

module.exports = new SocketManager();