const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCompanies,
      totalInternships,
      activeInternships,
      totalApplications,
      pendingVerifications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' }),
      Internship.countDocuments(),
      Internship.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      User.countDocuments({ role: 'company', 'companyProfile.verified': false })
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInternships = await Internship.find()
      .select('title companyName status createdAt')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly stats for charts
    const monthlyStats = await getMonthlyStats();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalCompanies,
          totalInternships,
          activeInternships,
          totalApplications,
          pendingVerifications
        },
        recentActivity: {
          users: recentUsers,
          internships: recentInternships
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.verified === 'false') {
      query['companyProfile.verified'] = false;
    }
    
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Verify company
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
router.put('/users/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'company') {
      return res.status(400).json({
        success: false,
        message: 'Only companies can be verified'
      });
    }

    user.companyProfile.verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Company verified successfully'
    });
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Deactivate user account
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin only)
router.put('/users/:id/deactivate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all internships for admin management
// @route   GET /api/admin/internships
// @access  Private (Admin only)
router.get('/internships', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { companyName: new RegExp(req.query.search, 'i') }
      ];
    }

    const internships = await Internship.find(query)
      .populate('company', 'name email companyProfile.companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Internship.countDocuments(query);

    res.status(200).json({
      success: true,
      count: internships.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: internships
    });
  } catch (error) {
    console.error('Get admin internships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update internship status (admin)
// @route   PUT /api/admin/internships/:id/status
// @access  Private (Admin only)
router.put('/internships/:id/status', protect, authorize('admin'), [
  body('status').isIn(['active', 'closed', 'draft', 'expired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    res.status(200).json({
      success: true,
      data: internship,
      message: 'Internship status updated successfully'
    });
  } catch (error) {
    console.error('Update internship status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to get monthly statistics
async function getMonthlyStats() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [userStats, internshipStats, applicationStats] = await Promise.all([
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]),
    Internship.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]),
    Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])
  ]);

  return {
    users: userStats,
    internships: internshipStats,
    applications: applicationStats
  };
}

module.exports = router;
