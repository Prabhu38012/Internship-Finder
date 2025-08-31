const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

class SocketManager {
  constructor() {
    this.io = null
    this.connectedUsers = new Map() // userId -> socketId mapping
    this.userSockets = new Map() // socketId -> user data mapping
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    
    console.log('Socket.IO server initialized')
    return this.io
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        
        if (!user) {
          return next(new Error('Authentication error: User not found'))
        }

        socket.userId = user._id.toString()
        socket.user = user
        next()
      } catch (error) {
        console.error('Socket authentication error:', error)
        next(new Error('Authentication error'))
      }
    })
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} connected (${socket.id})`)
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id)
      this.userSockets.set(socket.id, {
        userId: socket.userId,
        user: socket.user,
        joinedAt: new Date()
      })

      // Join user-specific room
      socket.join(`user:${socket.userId}`)
      
      // Join role-specific room
      socket.join(`role:${socket.user.role}`)

      // Notify others that user is online
      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        name: socket.user.name,
        role: socket.user.role
      })

      // Handle room joining
      socket.on('join', (room) => {
        socket.join(room)
        console.log(`User ${socket.user.name} joined room: ${room}`)
      })

      // Handle room leaving
      socket.on('leave', (room) => {
        socket.leave(room)
        console.log(`User ${socket.user.name} left room: ${room}`)
      })

      // Handle typing indicators
      socket.on('typing:start', (room) => {
        socket.to(room).emit('typing:start', {
          userId: socket.userId,
          name: socket.user.name
        })
      })

      socket.on('typing:stop', (room) => {
        socket.to(room).emit('typing:stop', {
          userId: socket.userId
        })
      })

      // Handle notification read status
      socket.on('notification:read', (notificationId) => {
        console.log(`User ${socket.user.name} read notification: ${notificationId}`)
      })

      socket.on('notifications:mark_all_read', () => {
        console.log(`User ${socket.user.name} marked all notifications as read`)
      })

      socket.on('notifications:clear_all', () => {
        console.log(`User ${socket.user.name} cleared all notifications`)
      })

      // Handle real-time analytics requests
      socket.on('analytics:subscribe', () => {
        socket.join('analytics')
        console.log(`User ${socket.user.name} subscribed to analytics updates`)
      })

      socket.on('analytics:unsubscribe', () => {
        socket.leave('analytics')
        console.log(`User ${socket.user.name} unsubscribed from analytics updates`)
      })

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.user.name} disconnected: ${reason}`)
        
        // Remove user from tracking
        this.connectedUsers.delete(socket.userId)
        this.userSockets.delete(socket.id)

        // Notify others that user is offline
        socket.broadcast.emit('user:offline', {
          userId: socket.userId,
          name: socket.user.name
        })
      })

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.user.name}:`, error)
      })
    })
  }

  // Utility methods for emitting events
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString())
    if (socketId) {
      this.io.to(socketId).emit(event, data)
      return true
    }
    return false
  }

  emitToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data)
  }

  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data)
  }

  emitToAll(event, data) {
    this.io.emit(event, data)
  }

  getConnectedUsers() {
    return Array.from(this.userSockets.values())
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString())
  }

  getUserSocketData(userId) {
    const socketId = this.connectedUsers.get(userId.toString())
    return socketId ? this.userSockets.get(socketId) : null
  }
}

module.exports = new SocketManager()
