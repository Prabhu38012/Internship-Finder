const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
const Internship = require('../models/Internship');
const User = require('../models/User');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.initializeCronJobs();
  }

  // Initialize scheduled tasks
  initializeCronJobs() {
    // Check for wishlist reminders every hour
    cron.schedule('0 * * * *', () => {
      this.checkWishlistReminders();
    });

    // Check for deadline alerts twice daily
    cron.schedule('0 9,18 * * *', () => {
      this.checkDeadlineAlerts();
    });

    // Check for expired internships daily
    cron.schedule('0 0 * * *', () => {
      this.checkExpiredInternships();
    });

    // Send weekly wishlist summary
    cron.schedule('0 9 * * 1', () => {
      this.sendWeeklyWishlistSummary();
    });
  }

  // Create notification for wishlist reminder
  async createWishlistReminderNotification(userId, wishlistItem) {
    try {
      await Notification.createWishlistNotification('wishlist_reminder', userId, {
        title: 'Wishlist Reminder',
        message: `Don't forget about "${wishlistItem.internship.title}" at ${wishlistItem.internship.companyName}`,
        data: {
          internshipId: wishlistItem.internship._id,
          wishlistId: wishlistItem._id,
          url: `/internships/${wishlistItem.internship._id}`,
          actionRequired: true
        },
        priority: wishlistItem.priority
      });
    } catch (error) {
      console.error('Error creating wishlist reminder notification:', error);
    }
  }

  // Create notification for deadline approaching
  async createDeadlineNotification(userId, internship, daysLeft) {
    try {
      const urgencyLevel = daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low';
      
      await Notification.createNotification({
        recipient: userId,
        type: 'wishlist_deadline_approaching',
        title: 'Application Deadline Approaching',
        message: `"${internship.title}" application deadline is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        data: {
          internshipId: internship._id,
          url: `/internships/${internship._id}`,
          actionRequired: true,
          metadata: { daysLeft }
        },
        priority: urgencyLevel
      });
    } catch (error) {
      console.error('Error creating deadline notification:', error);
    }
  }

  // Create notification for new similar internship
  async createSimilarInternshipNotification(userId, newInternship, similarWishlistItem) {
    try {
      await Notification.createWishlistNotification('new_similar_internship', userId, {
        title: 'Similar Internship Found',
        message: `New ${newInternship.category} internship at ${newInternship.companyName} matches your interests`,
        data: {
          internshipId: newInternship._id,
          wishlistId: similarWishlistItem._id,
          url: `/internships/${newInternship._id}`,
          actionRequired: false,
          metadata: {
            category: newInternship.category,
            similarity: 'category_match'
          }
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating similar internship notification:', error);
    }
  }

  // Create notification for wishlist internship update
  async createInternshipUpdateNotification(userId, internship, updateType) {
    try {
      const messages = {
        deadline_extended: `Application deadline for "${internship.title}" has been extended`,
        stipend_updated: `Stipend for "${internship.title}" has been updated`,
        requirements_changed: `Requirements for "${internship.title}" have been updated`,
        location_changed: `Location for "${internship.title}" has been updated`
      };

      await Notification.createWishlistNotification('wishlist_internship_updated', userId, {
        title: 'Saved Internship Updated',
        message: messages[updateType] || `"${internship.title}" has been updated`,
        data: {
          internshipId: internship._id,
          url: `/internships/${internship._id}`,
          actionRequired: updateType === 'deadline_extended',
          metadata: { updateType }
        },
        priority: updateType === 'deadline_extended' ? 'high' : 'medium'
      });
    } catch (error) {
      console.error('Error creating internship update notification:', error);
    }
  }

  // Check for wishlist reminders
  async checkWishlistReminders() {
    try {
      const dueReminders = await Wishlist.find({
        isActive: true,
        reminderDate: { $lte: new Date() }
      }).populate('internship user');

      for (const reminder of dueReminders) {
        await this.createWishlistReminderNotification(reminder.user._id, reminder);
        
        // Clear the reminder date to avoid duplicate notifications
        reminder.reminderDate = null;
        await reminder.save();
      }

      console.log(`Processed ${dueReminders.length} wishlist reminders`);
    } catch (error) {
      console.error('Error checking wishlist reminders:', error);
    }
  }

  // Check for approaching deadlines
  async checkDeadlineAlerts() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const wishlistItems = await Wishlist.find({
        isActive: true,
        applicationStatus: { $in: ['not_applied', 'planning_to_apply'] }
      }).populate({
        path: 'internship',
        match: {
          status: 'active',
          applicationDeadline: {
            $gte: new Date(),
            $lte: threeDaysFromNow
          }
        }
      }).populate('user');

      for (const item of wishlistItems) {
        if (item.internship) {
          const daysLeft = Math.ceil(
            (item.internship.applicationDeadline - new Date()) / (1000 * 60 * 60 * 24)
          );
          
          // Check if user wants deadline alerts
          if (item.user.preferences?.deadlineAlerts !== false) {
            await this.createDeadlineNotification(item.user._id, item.internship, daysLeft);
          }
        }
      }

      console.log(`Processed deadline alerts for ${wishlistItems.length} items`);
    } catch (error) {
      console.error('Error checking deadline alerts:', error);
    }
  }

  // Check for expired internships
  async checkExpiredInternships() {
    try {
      const expiredInternships = await Internship.find({
        status: 'active',
        applicationDeadline: { $lt: new Date() }
      });

      for (const internship of expiredInternships) {
        // Update internship status
        internship.status = 'expired';
        await internship.save();

        // Notify users who have this in their wishlist
        const wishlistItems = await Wishlist.find({
          internship: internship._id,
          isActive: true,
          applicationStatus: { $in: ['not_applied', 'planning_to_apply'] }
        }).populate('user');

        for (const item of wishlistItems) {
          await Notification.createWishlistNotification('wishlist_internship_expired', item.user._id, {
            title: 'Internship Expired',
            message: `Application deadline for "${internship.title}" has passed`,
            data: {
              internshipId: internship._id,
              wishlistId: item._id,
              url: `/internships/${internship._id}`,
              actionRequired: false
            },
            priority: 'low'
          });

          // Update wishlist item status
          item.applicationStatus = 'no_longer_interested';
          item.category = 'rejected';
          await item.save();
        }
      }

      console.log(`Processed ${expiredInternships.length} expired internships`);
    } catch (error) {
      console.error('Error checking expired internships:', error);
    }
  }

  // Send weekly wishlist summary
  async sendWeeklyWishlistSummary() {
    try {
      const users = await User.find({
        role: 'student',
        'preferences.emailNotifications': { $ne: false }
      });

      for (const user of users) {
        const wishlistStats = await Wishlist.getWishlistStats(user._id);
        
        if (wishlistStats.total > 0) {
          const upcomingDeadlines = await Wishlist.find({
            user: user._id,
            isActive: true
          }).populate({
            path: 'internship',
            match: {
              status: 'active',
              applicationDeadline: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              }
            }
          });

          const validDeadlines = upcomingDeadlines.filter(item => item.internship);

          await Notification.createNotification({
            recipient: user._id,
            type: 'system_update',
            title: 'Weekly Wishlist Summary',
            message: `You have ${wishlistStats.total} items in your wishlist with ${validDeadlines.length} deadlines this week`,
            data: {
              url: '/dashboard/wishlist',
              actionRequired: validDeadlines.length > 0,
              metadata: {
                totalItems: wishlistStats.total,
                upcomingDeadlines: validDeadlines.length,
                stats: wishlistStats
              }
            },
            priority: validDeadlines.length > 0 ? 'medium' : 'low'
          });
        }
      }

      console.log(`Sent weekly summaries to ${users.length} users`);
    } catch (error) {
      console.error('Error sending weekly summaries:', error);
    }
  }

  // Notify about new internships matching user interests
  async notifyNewMatchingInternships(internship) {
    try {
      // Find users with similar interests based on their wishlist
      const similarWishlistItems = await Wishlist.find({
        isActive: true
      }).populate({
        path: 'internship',
        match: {
          category: internship.category,
          _id: { $ne: internship._id }
        }
      }).populate('user');

      const notifiedUsers = new Set();

      for (const item of similarWishlistItems) {
        if (item.internship && !notifiedUsers.has(item.user._id.toString())) {
          // Check if user wants new match alerts
          if (item.user.preferences?.newMatchAlerts !== false) {
            await this.createSimilarInternshipNotification(item.user._id, internship, item);
            notifiedUsers.add(item.user._id.toString());
          }
        }
      }

      console.log(`Notified ${notifiedUsers.size} users about new matching internship`);
    } catch (error) {
      console.error('Error notifying about new matching internships:', error);
    }
  }

  // Notify about internship updates
  async notifyInternshipUpdate(internship, updateType, previousData) {
    try {
      const wishlistItems = await Wishlist.find({
        internship: internship._id,
        isActive: true
      }).populate('user');

      for (const item of wishlistItems) {
        await this.createInternshipUpdateNotification(item.user._id, internship, updateType);
      }

      console.log(`Notified ${wishlistItems.length} users about internship update`);
    } catch (error) {
      console.error('Error notifying about internship update:', error);
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }
}

module.exports = new NotificationService();
