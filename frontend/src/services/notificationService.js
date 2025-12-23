import api from "./api";

const notificationService = {
  // Get notifications
  getNotifications: async (params = {}, token) => {
    const response = await api.get("/notifications", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id, token) => {
    const response = await api.put(
      `/notifications/${id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (token) => {
    const response = await api.put(
      "/notifications/read-all",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id, token) => {
    const response = await api.delete(`/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default notificationService;
