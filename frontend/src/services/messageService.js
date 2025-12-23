import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class MessageService {
  // Get user's conversations
  async getConversations(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create or get conversation
  async createConversation(
    participantId,
    type = "direct",
    applicationId = null,
  ) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/conversations`,
        {
          participantId,
          type,
          applicationId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messages in conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await axios.get(
        `${API_URL}/messages/conversations/${conversationId}/messages`,
        {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send message
  async sendMessage(
    conversationId,
    content,
    messageType = "text",
    attachments = [],
    replyTo = null,
  ) {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("messageType", messageType);

      if (replyTo) {
        formData.append("replyTo", replyTo);
      }

      // Add attachments
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await axios.post(
        `${API_URL}/messages/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mark messages as read
  async markAsRead(conversationId) {
    try {
      const response = await axios.put(
        `${API_URL}/messages/conversations/${conversationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await axios.get(`${API_URL}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new MessageService();
