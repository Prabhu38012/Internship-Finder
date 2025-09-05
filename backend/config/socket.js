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
          return next(new Error('Authentication error: No token provided'));
        }

        // Rate limiting for connection attempts
        const clientIp = socket.handshake.address;
        if (this.isRateLimited(clientIp)) {
          return next(new Error('Too many connection attempts'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
          .select('-password')
          .lean()
          .cache(30); // Cache user data for 30 seconds
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        // Add user data and metadata to socket
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
      this.handleNewConnection(socket);
      this.setupSocketEventHandlers(socket);
    });

    // Global error handler
    this.io.engine.on('connection_error', (err) => {
      console.error('Connection error:', err);
    });
  }

  handleNewConnection(socket) {
    console.log(`User ${socket.user.name} connected (${socket.id})`);
    
    // Store user connection with metadata
    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.id, {
      userId: socket.userId,
      user: socket.user,
      joinedAt: new Date(),
      metadata: socket.metadata
    });

    // Join default rooms
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.user.role}`);

    // Emit online status
    this.emitUserStatus(socket, true);
    
    // Send initial state
    socket.emit('connection:established', {
      userId: socket.userId,
      timestamp: new Date(),
      activeUsers: this.getActiveUsersCount()
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
}

module.exports = new SocketManager();