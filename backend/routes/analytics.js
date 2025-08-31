const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const AnalyticsService = require('../services/analyticsService');

const router = express.Router();

// @desc    Get real-time analytics
// @route   GET /api/analytics
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const analytics = await AnalyticsService.calculateAnalytics();
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get dashboard analytics for companies
// @route   GET /api/analytics/company
// @access  Private (Company only)
router.get('/company', protect, authorize('company'), async (req, res) => {
  try {
    const Internship = require('../models/Internship');
    const Application = require('../models/Application');
    
    // Get company's internships and applications
    const internships = await Internship.find({ company: req.user._id });
    const internshipIds = internships.map(i => i._id);
    
    const applications = await Application.find({ 
      internship: { $in: internshipIds } 
    });
    
    // Calculate company-specific analytics
    const analytics = {
      totalInternships: internships.length,
      activeInternships: internships.filter(i => i.status === 'active').length,
      totalApplications: applications.length,
      applicationsByStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {}),
      topInternships: internships
        .sort((a, b) => b.applicationsCount - a.applicationsCount)
        .slice(0, 5)
        .map(i => ({
          title: i.title,
          applicationsCount: i.applicationsCount,
          category: i.category
        }))
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Company analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get dashboard analytics for students
// @route   GET /api/analytics/student
// @access  Private (Student only)
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Internship = require('../models/Internship');
    
    // Get student's applications
    const applications = await Application.find({ 
      applicant: req.user._id 
    }).populate('internship', 'title category');
    
    // Get available internships by category
    const categoryStats = await Internship.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const analytics = {
      totalApplications: applications.length,
      applicationsByStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {}),
      applicationsByCategory: applications.reduce((acc, app) => {
        const category = app.internship?.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      availableInternships: categoryStats.slice(0, 10),
      recentApplications: applications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(app => ({
          internshipTitle: app.internship?.title,
          status: app.status,
          appliedAt: app.createdAt
        }))
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
