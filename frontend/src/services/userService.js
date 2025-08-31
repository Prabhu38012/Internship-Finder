import api from './api'

const userService = {
  // Get user profile
  getUserProfile: async (id, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    const response = await api.get(`/users/${id}`, config)
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData, token) => {
    const formData = new FormData()
    
    // Add text fields
    Object.keys(profileData).forEach(key => {
      if (key !== 'avatar') {
        if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]))
        } else {
          formData.append(key, profileData[key])
        }
      }
    })
    
    // Add avatar file
    if (profileData.avatar && profileData.avatar instanceof File) {
      formData.append('avatar', profileData.avatar)
    }
    
    const response = await api.put('/users/profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Upload resume
  uploadResume: async (resumeFile, token) => {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    
    const response = await api.post('/users/resume', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get user dashboard stats
  getDashboardStats: async (token) => {
    const response = await api.get('/users/stats/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // Update user preferences
  updatePreferences: async (preferences, token) => {
    const response = await api.put('/users/preferences', preferences, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },
}

export default userService
