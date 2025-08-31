import api from './api'

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  // Login user
  login: async (userData) => {
    const response = await api.post('/auth/login', userData)
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  // Get current user
  getMe: async (token) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // Update profile
  updateProfile: async (userData, token) => {
    const response = await api.put('/auth/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
    
    return response.data
  },

  // Change password
  changePassword: async (passwordData, token) => {
    const response = await api.put('/auth/password', passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

export default authService
