import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class AIService {
  // Get AI-powered job recommendations
  async getRecommendations(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/ai/recommendations`, {
        params: { limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Analyze uploaded resume
  async analyzeResume(file, updateProfile = false) {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("updateProfile", updateProfile.toString());

      const response = await axios.post(
        `${API_URL}/ai/analyze-resume`,
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

  // Get chatbot response
  async getChatbotResponse(message) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/chatbot`,
        { message },
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

  // Predict application success
  async predictSuccess(internshipId) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/predict-success/${internshipId}`,
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

  // Auto-tag internship
  async autoTagInternship(internshipId, applyTags = false) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/auto-tag/${internshipId}`,
        { applyTags },
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

  // Get skill insights
  async getSkillInsights(category = "", location = "") {
    try {
      const response = await axios.get(`${API_URL}/ai/skill-insights`, {
        params: { category, location },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user insights
  async getUserInsights() {
    try {
      const response = await axios.get(`${API_URL}/ai/user-insights`, {
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

export default new AIService();
