const RealtimeService = require('../services/realtimeService')

// Middleware to track user activities
const trackActivity = (activityType) => {
  return (req, res, next) => {
    // Store original send function
    const originalSend = res.send

    // Override send function to track successful activities
    res.send = function(data) {
      // Only track if request was successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const activity = {
          type: activityType,
          userId: req.user._id,
          userEmail: req.user.email,
          method: req.method,
          path: req.path,
          timestamp: new Date(),
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        }

        // Add specific data based on activity type
        switch (activityType) {
          case 'internship_created':
            activity.details = { internshipId: JSON.parse(data).data?._id }
            break
          case 'application_submitted':
            activity.details = { applicationId: JSON.parse(data).data?._id }
            break
          case 'application_status_updated':
            activity.details = { 
              applicationId: req.params.id,
              newStatus: req.body.status 
            }
            break
          case 'profile_updated':
            activity.details = { profileFields: Object.keys(req.body) }
            break
          case 'login':
            activity.details = { loginTime: new Date() }
            break
        }

        // Track the activity
        RealtimeService.trackUserActivity(req.user._id, activity)
      }

      // Call original send function
      return originalSend.call(this, data)
    }

    next()
  }
}

// Specific activity trackers
const trackLogin = trackActivity('login')
const trackInternshipCreated = trackActivity('internship_created')
const trackApplicationSubmitted = trackActivity('application_submitted')
const trackApplicationStatusUpdated = trackActivity('application_status_updated')
const trackProfileUpdated = trackActivity('profile_updated')
const trackInternshipViewed = trackActivity('internship_viewed')
const trackSearchPerformed = trackActivity('search_performed')

module.exports = {
  trackActivity,
  trackLogin,
  trackInternshipCreated,
  trackApplicationSubmitted,
  trackApplicationStatusUpdated,
  trackProfileUpdated,
  trackInternshipViewed,
  trackSearchPerformed
}
