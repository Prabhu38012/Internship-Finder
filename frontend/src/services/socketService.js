import { io } from 'socket.io-client'
import { store } from '../store/store'
import { addNotification } from '../store/slices/notificationSlice'
import { updateInternshipRealtime } from '../store/slices/internshipSlice'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket
    }

    // Don't attempt connection without a valid token
    if (!token) {
      return null
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3
    })

    this.setupEventListeners()
    return this.socket
  }

  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      // Silently handle connection errors to reduce console spam
      this.isConnected = false
    })

    // Real-time notifications
    this.socket.on('notification', (notification) => {
      store.dispatch(addNotification(notification))
      
      // Show toast notification
      toast.success(notification.message, {
        duration: 5000,
        icon: '🔔'
      })
    })

    // Real-time internship updates
    this.socket.on('internship:created', (internship) => {
      store.dispatch(updateInternshipRealtime({ type: 'created', data: internship }))
      toast.success('New internship posted!', { icon: '🎉' })
    })

    this.socket.on('internship:updated', (internship) => {
      store.dispatch(updateInternshipRealtime({ type: 'updated', data: internship }))
    })

    this.socket.on('internship:deleted', (internshipId) => {
      store.dispatch(updateInternshipRealtime({ type: 'deleted', data: { _id: internshipId } }))
    })

    // Application status updates
    this.socket.on('application:status_changed', (application) => {
      const statusMessages = {
        'accepted': 'Your application has been accepted! 🎉',
        'rejected': 'Your application was not selected this time.',
        'interview': 'You have been shortlisted for an interview! 📞',
        'reviewed': 'Your application is being reviewed.'
      }
      
      const message = statusMessages[application.status] || 'Application status updated'
      toast(message, {
        icon: application.status === 'accepted' ? '🎉' : 
              application.status === 'interview' ? '📞' : 
              application.status === 'rejected' ? '😔' : '📋'
      })
    })

    // Live user activity
    this.socket.on('user:online', (userId) => {
      console.log(`User ${userId} came online`)
    })

    this.socket.on('user:offline', (userId) => {
      console.log(`User ${userId} went offline`)
    })
  }

  // Join specific rooms
  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('join', room)
    }
  }

  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('leave', room)
    }
  }

  // Send typing indicators
  startTyping(room) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', room)
    }
  }

  stopTyping(room) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', room)
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  // Listen to custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

// Create singleton instance
const socketService = new SocketService()
export default socketService
