import { io } from "socket.io-client";
import { store } from "../store/store";
import { addNotification } from "../store/slices/notificationSlice";
import { updateInternshipRealtime } from "../store/slices/internshipSlice";
import toast from "react-hot-toast";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connectionTimeout = null;
    this.lastConnectionAttempt = null;
    this.pendingEvents = new Map();
  }
  getConnectionStatus() {
    return this.isConnected;
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name,
      ping: this.socket?.io?.engine?.transport?.ping || null,
    };
  }
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (!token) {
      // Silently skip connection without token
      return null;
    }

    // Prevent connection spam
    const now = Date.now();
    if (this.lastConnectionAttempt && now - this.lastConnectionAttempt < 2000) {
      // Silently throttle connection attempts
      return null;
    }
    this.lastConnectionAttempt = now;

    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      this.socket = io(serverUrl, {
        auth: { token },
        transports: ["polling", "websocket"], // Try polling first to avoid WebSocket errors
        timeout: 5000,
        reconnection: true,
        reconnectionDelay: 5000, // Wait longer between reconnection attempts
        reconnectionAttempts: 3, // Limit reconnection attempts
        reconnectionDelayMax: 10000,
        autoConnect: true,
        query: {
          clientVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    } catch (error) {
      // Silently handle connection errors
      return null;
    }

    this.setupEventListeners();
    // Skip connection timeout setup to avoid warnings

    return this.socket;
  }

  setupConnectionTimeout() {
    // Disabled to prevent console warnings during development
    // Connection will be handled by socket.io's built-in reconnection logic
    return;
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Enhanced connection events
    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.processPendingEvents();

      // Silently connect without toast notifications
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;

      // Silently handle disconnects without toast notifications
      if (reason === "io server disconnect") {
        // Server initiated disconnect, don't reconnect automatically
      } else if (reason !== "io client disconnect") {
        // Don't show toast for intentional client disconnects
        this.socket.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      this.isConnected = false;
      this.reconnectAttempts++;

      // Silently handle connection errors without logging or toasts
    });

    // Enhanced notification handling
    this.socket.on("notification", (notification) => {
      store.dispatch(addNotification(notification));

      toast(notification.message, {
        duration: 5000,
        icon:
          notification.type === "success"
            ? "🔔"
            : notification.type === "error"
              ? "⚠️"
              : "💬",
      });
    });

    // Enhanced internship updates
    this.socket.on("internship:created", (internship) => {
      store.dispatch(
        updateInternshipRealtime({
          type: "created",
          data: internship,
        }),
      );

      if (this.shouldShowInternshipNotification(internship)) {
        toast.success("New internship matching your preferences!", {
          icon: "🎯",
          duration: 7000,
        });
      }
    });

    // ...existing event listeners...

    // New error handling events - silently handled
    this.socket.on("error", (error) => {
      // Silently handle socket errors
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      // Silently handle reconnection attempts
    });

    this.socket.on("reconnect_failed", () => {
      // Silently handle reconnection failures
    });
  }

  shouldShowInternshipNotification(internship) {
    // Add logic to check user preferences
    return true; // Implement your filtering logic
  }

  reconnect() {
    if (
      this.socket &&
      !this.isConnected &&
      this.reconnectAttempts < this.maxReconnectAttempts
    ) {
      this.socket.connect();
    }
  }

  processPendingEvents() {
    for (const [event, data] of this.pendingEvents.entries()) {
      this.emit(event, data);
    }
    this.pendingEvents.clear();
  }

  // Enhanced emit with queuing
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    } else {
      // Silently queue event without logging
      this.pendingEvents.set(event, data);
      return false;
    }
  }

  // Add event listener method
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
    // Silently skip if socket not available
  }

  // Remove event listener method
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    this.emit("join_conversation", conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    this.emit("leave_conversation", conversationId);
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    this.emit("typing", { conversationId, isTyping });
  }

  // Mark message as read
  markMessageRead(conversationId, messageId) {
    this.emit("message_read", { conversationId, messageId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.pendingEvents.clear();

      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
    }
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name,
      ping: this.socket?.io?.engine?.transport?.ping || null,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
