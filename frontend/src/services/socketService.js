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
    this.queuedListeners = new Map();
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
    if (!token) {
      token = localStorage.getItem("token");
    }
    if (!token || token === "null" || token === "undefined") {
      return null;
    }

    if (this.socket) {
      if (this.socket.connected) {
        return this.socket;
      }
      if (this.socket.auth?.token !== token) {
        this.socket.auth = { token };
      }
      this.socket.connect();
      return this.socket;
    }

    const serverUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000");

    try {
      this.socket = io(serverUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
        reconnectionDelayMax: 5000,
        autoConnect: true,
        withCredentials: true,
        query: {
          clientVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
      return null;
    }

    this.setupEventListeners();
    return this.socket;
  }

  setupConnectionTimeout() {
    return;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.processPendingEvents();

      // Attach all queued listeners without duplicates
      this.queuedListeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => {
          this.socket.off(event, cb);
          this.socket.on(event, cb);
        });
      });

      // Re-join active conversation room if one was active
      if (this.activeConversationId) {
        this.emit("join_conversation", this.activeConversationId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      if (reason === "io server disconnect") {
        this.socket.connect();
      } else if (reason !== "io client disconnect") {
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

  // Add event listener method with queueing
  on(event, callback) {
    if (!this.queuedListeners.has(event)) {
      this.queuedListeners.set(event, new Set());
    }
    this.queuedListeners.get(event).add(callback);

    if (this.socket) {
      this.socket.off(event, callback);
      this.socket.on(event, callback);
    }
  }

  // Remove event listener method
  off(event, callback) {
    if (this.queuedListeners.has(event)) {
      if (callback) {
        this.queuedListeners.get(event).delete(callback);
      } else {
        this.queuedListeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (!conversationId) return;
    const cId = typeof conversationId === "object" ? (conversationId._id || conversationId.id) : conversationId;
    this.activeConversationId = String(cId);
    this.emit("join_conversation", String(cId));
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (!conversationId) return;
    const cId = typeof conversationId === "object" ? (conversationId._id || conversationId.id) : conversationId;
    if (this.activeConversationId === String(cId)) {
      this.activeConversationId = null;
    }
    this.emit("leave_conversation", String(cId));
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    this.emit("typing", { conversationId, isTyping });
  }

  // Mark message as read
  markMessageRead(conversationId, messageId) {
    this.emit("message_read", { conversationId, messageId });
  }

  // Request online users list
  getOnlineUsers() {
    this.emit("get_online_users");
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
