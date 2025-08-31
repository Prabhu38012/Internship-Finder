const socketManager = require('../config/socket')
const Notification = require('../models/Notification')

class RealtimeService {
  // Send notification to specific user
  static async sendNotificationToUser(userId, notification) {
    try {
      // Save notification to database
      const savedNotification = await Notification.create({
        ...notification,
        user: userId
      })

      // Send real-time notification if user is online
      const sent = socketManager.emitToUser(userId, 'notification', savedNotification)
      
      console.log(`Notification sent to user ${userId}: ${sent ? 'delivered' : 'queued'}`)
      return savedNotification
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  // Send notification to multiple users
  static async sendNotificationToUsers(userIds, notification) {
    try {
      const notifications = []
      
      for (const userId of userIds) {
        const savedNotification = await this.sendNotificationToUser(userId, notification)
        notifications.push(savedNotification)
      }
      
      return notifications
    } catch (error) {
      console.error('Error sending notifications to users:', error)
      throw error
    }
  }

  // Send notification to all users with specific role
  static async sendNotificationToRole(role, notification) {
    try {
      // Save notification for all users with this role
      const User = require('../models/User')
      const users = await User.find({ role }).select('_id')
      const userIds = users.map(user => user._id)

      // Create notifications in database
      const notifications = await Promise.all(
        userIds.map(userId => 
          Notification.create({
            ...notification,
            user: userId
          })
        )
      )

      // Send real-time notification to role room
      socketManager.emitToRole(role, 'notification', notification)
      
      console.log(`Notification sent to role ${role}: ${notifications.length} users`)
      return notifications
    } catch (error) {
      console.error('Error sending notification to role:', error)
      throw error
    }
  }

  // Internship-related real-time events
  static notifyInternshipCreated(internship) {
    try {
      // Notify all students about new internship
      socketManager.emitToRole('student', 'internship:created', internship)
      
      // Send notification to students
      this.sendNotificationToRole('student', {
        type: 'internship',
        title: 'New Internship Posted!',
        message: `${internship.title} at ${internship.companyName}`,
        data: { internshipId: internship._id }
      })
      
      console.log(`New internship notification sent: ${internship.title}`)
    } catch (error) {
      console.error('Error notifying internship created:', error)
    }
  }

  static notifyInternshipUpdated(internship) {
    try {
      // Notify all connected users about internship update
      socketManager.emitToAll('internship:updated', internship)
      console.log(`Internship update notification sent: ${internship.title}`)
    } catch (error) {
      console.error('Error notifying internship updated:', error)
    }
  }

  static notifyInternshipDeleted(internshipId) {
    try {
      // Notify all connected users about internship deletion
      socketManager.emitToAll('internship:deleted', internshipId)
      console.log(`Internship deletion notification sent: ${internshipId}`)
    } catch (error) {
      console.error('Error notifying internship deleted:', error)
    }
  }

  // Application-related real-time events
  static async notifyApplicationStatusChanged(application, oldStatus, newStatus) {
    try {
      const statusMessages = {
        'accepted': 'Congratulations! Your application has been accepted! 🎉',
        'rejected': 'Your application was not selected this time. Keep applying!',
        'interview': 'You have been shortlisted for an interview! 📞',
        'reviewing': 'Your application is being reviewed by the company.'
      }

      // Notify the applicant
      await this.sendNotificationToUser(application.applicant, {
        type: 'application',
        title: 'Application Status Update',
        message: statusMessages[newStatus] || `Application status changed to ${newStatus}`,
        data: { 
          applicationId: application._id,
          internshipId: application.internship,
          status: newStatus
        }
      })

      // Send real-time update
      socketManager.emitToUser(application.applicant, 'application:status_changed', {
        applicationId: application._id,
        status: newStatus,
        internshipTitle: application.internship?.title
      })

      console.log(`Application status notification sent: ${application._id} -> ${newStatus}`)
    } catch (error) {
      console.error('Error notifying application status change:', error)
    }
  }

  static async notifyNewApplication(application) {
    try {
      // Notify company about new application
      await this.sendNotificationToUser(application.internship.company, {
        type: 'application',
        title: 'New Application Received',
        message: `${application.applicant.name} applied for ${application.internship.title}`,
        data: { 
          applicationId: application._id,
          internshipId: application.internship._id
        }
      })

      // Send real-time update to company
      socketManager.emitToUser(application.internship.company, 'application:new', {
        applicationId: application._id,
        applicantName: application.applicant.name,
        internshipTitle: application.internship.title
      })

      console.log(`New application notification sent to company: ${application.internship.company}`)
    } catch (error) {
      console.error('Error notifying new application:', error)
    }
  }

  // User activity tracking
  static trackUserActivity(userId, activity) {
    try {
      // Broadcast user activity to relevant users (e.g., admins, company managers)
      socketManager.emitToRole('admin', 'user:activity', {
        userId,
        activity,
        timestamp: new Date()
      })

      console.log(`User activity tracked: ${userId} - ${activity}`)
    } catch (error) {
      console.error('Error tracking user activity:', error)
    }
  }

  // Analytics updates
  static broadcastAnalyticsUpdate(data) {
    try {
      // Send to users subscribed to analytics
      socketManager.emitToRoom('analytics', 'analytics:update', data)
      console.log('Analytics update broadcasted')
    } catch (error) {
      console.error('Error broadcasting analytics update:', error)
    }
  }

  // System-wide announcements
  static async broadcastSystemAnnouncement(announcement) {
    try {
      // Send to all connected users
      socketManager.emitToAll('system:announcement', announcement)
      
      // Also save as notification for all users
      await this.sendNotificationToRole('student', {
        type: 'system',
        title: 'System Announcement',
        message: announcement.message,
        data: announcement
      })

      await this.sendNotificationToRole('company', {
        type: 'system',
        title: 'System Announcement', 
        message: announcement.message,
        data: announcement
      })

      console.log('System announcement broadcasted')
    } catch (error) {
      console.error('Error broadcasting system announcement:', error)
    }
  }

  // Get online users
  static getOnlineUsers() {
    return socketManager.getConnectedUsers()
  }

  // Check if user is online
  static isUserOnline(userId) {
    return socketManager.isUserOnline(userId)
  }
}

module.exports = RealtimeService
