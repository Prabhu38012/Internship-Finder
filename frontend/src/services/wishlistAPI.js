import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const wishlistAPI = {
  // Get user's wishlist with filters
  getWishlist: (params = {}) => {
    return api.get("/wishlist", { params });
  },

  // Add internship to wishlist
  addToWishlist: (data) => {
    return api.post("/wishlist", data);
  },

  // Update wishlist item
  updateWishlistItem: (itemId, data) => {
    return api.put(`/wishlist/${itemId}`, data);
  },

  // Remove from wishlist
  removeFromWishlist: (itemId) => {
    return api.delete(`/wishlist/${itemId}`);
  },

  // Get wishlist statistics
  getStats: () => {
    return api.get("/wishlist/stats");
  },

  // Get wishlist reminders
  getReminders: () => {
    return api.get("/wishlist/reminders");
  },

  // Bulk update wishlist items
  bulkUpdate: (items) => {
    return api.put("/wishlist/bulk", { items });
  },
};

export const notificationAPI = {
  // Get notifications with filters
  getNotifications: (params = {}) => {
    return api.get("/notifications", { params });
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put("/notifications/read-all");
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // Get notification statistics
  getStats: () => {
    return api.get("/notifications/stats");
  },

  // Update notification preferences
  updatePreferences: (preferences) => {
    return api.put("/notifications/preferences", preferences);
  },

  // Bulk mark as read
  bulkMarkAsRead: (notificationIds) => {
    return api.put("/notifications/bulk-read", { notificationIds });
  },

  // Bulk delete
  bulkDelete: (notificationIds) => {
    return api.delete("/notifications/bulk", { data: notificationIds });
  },
};

export default { wishlistAPI, notificationAPI };
