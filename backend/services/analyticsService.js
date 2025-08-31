const RealtimeService = require('./realtimeService')
const Internship = require('../models/Internship')
const Application = require('../models/Application')
const User = require('../models/User')

class AnalyticsService {
  // Calculate and broadcast real-time analytics
  static async calculateAndBroadcastAnalytics() {
    try {
      const analytics = await this.calculateAnalytics()
      RealtimeService.broadcastAnalyticsUpdate(analytics)
      return analytics
    } catch (error) {
      console.error('Error calculating analytics:', error)
      throw error
    }
  }

  // Calculate comprehensive analytics
  static async calculateAnalytics() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Basic counts
    const totalInternships = await Internship.countDocuments({ status: 'active' })
    const totalApplications = await Application.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalCompanies = await User.countDocuments({ role: 'company' })
    const totalStudents = await User.countDocuments({ role: 'student' })

    // Recent activity (last 30 days)
    const recentInternships = await Internship.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'active'
    })
    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Weekly trends
    const weeklyInternships = await Internship.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      status: 'active'
    })
    const weeklyApplications = await Application.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    // Application status distribution
    const applicationStatusStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Category distribution
    const categoryStats = await Internship.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    // Location distribution
    const locationStats = await Internship.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ])

    // Daily activity for the last 7 days
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const internships = await Internship.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'active'
      })
      const applications = await Application.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      })

      dailyActivity.push({
        date: startOfDay.toISOString().split('T')[0],
        internships,
        applications
      })
    }

    // Top performing internships (by application count)
    const topInternships = await Internship.find({ status: 'active' })
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select('title companyName applicationsCount category')

    return {
      overview: {
        totalInternships,
        totalApplications,
        totalUsers,
        totalCompanies,
        totalStudents
      },
      recentActivity: {
        internships: recentInternships,
        applications: recentApplications,
        users: recentUsers
      },
      weeklyTrends: {
        internships: weeklyInternships,
        applications: weeklyApplications
      },
      distributions: {
        applicationStatus: applicationStatusStats,
        categories: categoryStats,
        locations: locationStats
      },
      dailyActivity,
      topInternships,
      timestamp: now
    }
  }

  // Update analytics when key events occur
  static async onInternshipCreated() {
    await this.calculateAndBroadcastAnalytics()
  }

  static async onApplicationSubmitted() {
    await this.calculateAndBroadcastAnalytics()
  }

  static async onApplicationStatusChanged() {
    await this.calculateAndBroadcastAnalytics()
  }

  static async onUserRegistered() {
    await this.calculateAndBroadcastAnalytics()
  }
}

module.exports = AnalyticsService
