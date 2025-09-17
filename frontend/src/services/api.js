import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/register pages and token exists
      const currentPath = window.location.pathname
      const token = localStorage.getItem('token')
      
      if (token && !currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('Token expired or invalid, redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Use React Router navigation instead of window.location
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Wishlist API endpoints
export const wishlistAPI = {
  getWishlist: (params = {}) => api.get('/wishlist', { params }),
  addToWishlist: (data) => api.post('/wishlist', data),
  updateWishlistItem: (itemId, data) => api.put(`/wishlist/${itemId}`, data),
  removeFromWishlist: (itemId) => api.delete(`/wishlist/${itemId}`),
  getStats: () => api.get('/wishlist/stats'),
  getReminders: () => api.get('/wishlist/reminders'),
  bulkUpdate: (items) => api.put('/wishlist/bulk', { items })
};

// Notification API endpoints
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getStats: () => api.get('/notifications/stats'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  bulkMarkAsRead: (notificationIds) => api.put('/notifications/bulk-read', { notificationIds }),
  bulkDelete: (notificationIds) => api.delete('/notifications/bulk', { data: notificationIds })
};

// Company API endpoints
export const companyAPI = {
  // Company registration
  register: (data) => api.post('/company/register', data),

  // Company login
  login: (data) => api.post('/company/login', data),

  // Get company profile
  getProfile: () => api.get('/company/profile'),

  // Update company profile
  updateProfile: (data) => api.put('/company/profile', data),

  // Upload company logo
  uploadLogo: (formData) => api.post('/company/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Get company dashboard data
  getDashboard: () => api.get('/company/dashboard'),

  // Get all companies (public)
  getAll: (params = {}) => api.get('/company/all', { params }),

  // Get company public profile
  getPublicProfile: (companyId) => api.get(`/company/${companyId}`)
};

// Internship API endpoints for companies
export const internshipAPI = {
  // Create new internship
  create: (data) => api.post('/internships', data),

  // Get company's internships
  getCompanyInternships: (params = {}) => api.get('/internships/company', { params }),

  // Update internship
  update: (internshipId, data) => api.put(`/internships/${internshipId}`, data),

  // Delete internship
  delete: (internshipId) => api.delete(`/internships/${internshipId}`),

  // Get internship applications
  getApplications: (internshipId, params = {}) => api.get(`/internships/${internshipId}/applications`, { params }),

  // Update application status
  updateApplicationStatus: (applicationId, status) => api.put(`/applications/${applicationId}/status`, { status })
};

export default api
