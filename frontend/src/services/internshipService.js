import api from "./api";

const internshipService = {
  // Get all internships with filters
  getInternships: async (params = {}, token) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await api.get("/internships", { ...config, params });
    return response.data;
  },

  // Get single internship
  getInternship: async (id, token) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await api.get(`/internships/${id}`, config);
    return response.data;
  },

  // Create internship (company only)
  createInternship: async (internshipData, token) => {
    const response = await api.post("/internships", internshipData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update internship (company only)
  updateInternship: async (id, internshipData, token) => {
    const response = await api.put(`/internships/${id}`, internshipData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete internship (company only)
  deleteInternship: async (id, token) => {
    const response = await api.delete(`/internships/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Save/Unsave internship (student only)
  toggleSaveInternship: async (id, token) => {
    const response = await api.put(
      `/internships/${id}/save`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Get company's internships
  getMyInternships: async (params = {}, token) => {
    const response = await api.get("/internships/company/mine", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  // Get internships with external sources included
  getInternshipsWithExternal: async (params = {}, token) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const enhancedParams = { ...params, includeExternal: "true" };
    const response = await api.get("/internships", {
      ...config,
      params: enhancedParams,
    });
    return response.data;
  },

  // Get external internships only
  getExternalInternships: async (params = {}) => {
    const response = await api.get("/internships/external", { params });
    return response.data;
  },

  // Get external internships stats
  getExternalStats: async () => {
    const response = await api.get("/internships/external/stats");
    return response.data;
  },
};

export default internshipService;
