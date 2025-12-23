import api from "./api";

const applicationService = {
  // Apply for internship
  applyForInternship: async (applicationData, token) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(applicationData).forEach((key) => {
      if (key !== "resume" && key !== "additionalDocuments") {
        formData.append(key, applicationData[key]);
      }
    });

    // Add files
    if (applicationData.resume) {
      formData.append("resume", applicationData.resume);
    }

    if (applicationData.additionalDocuments) {
      applicationData.additionalDocuments.forEach((file) => {
        formData.append("additionalDocuments", file);
      });
    }

    const response = await api.post("/applications", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get user's applications
  getMyApplications: async (params = {}, token) => {
    const response = await api.get("/applications/my", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  // Get company's applications
  getCompanyApplications: async (params = {}, token) => {
    const response = await api.get("/applications/company", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  // Get single application
  getApplication: async (id, token) => {
    const response = await api.get(`/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update application status (company only)
  updateApplicationStatus: async (id, status, note, token) => {
    const response = await api.put(
      `/applications/${id}/status`,
      { status, note },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Withdraw application (student only)
  withdrawApplication: async (id, reason, token) => {
    const response = await api.put(
      `/applications/${id}/withdraw`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};

export default applicationService;
