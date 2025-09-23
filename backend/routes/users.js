const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search users for messaging
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    let searchFilter = {
      _id: { $ne: req.user.id }, // Exclude current user
      isActive: true
    };

    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }

    const users = await User.find(searchFilter)
      .select('name email role profilePicture')
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is private
    if (user.preferences?.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, upload.single('avatar'), handleMulterError, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle avatar upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'avatars',
          width: 300,
          height: 300,
          crop: 'fill'
        });
        updateData.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload avatar'
        });
      }
    }

    // Parse nested objects if they come as strings
    if (updateData.location && typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }
    
    if (updateData.studentProfile && typeof updateData.studentProfile === 'string') {
      updateData.studentProfile = JSON.parse(updateData.studentProfile);
    }
    
    if (updateData.companyProfile && typeof updateData.companyProfile === 'string') {
      updateData.companyProfile = JSON.parse(updateData.companyProfile);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload resume
// @route   POST /api/users/resume
// @access  Private
router.post('/resume', protect, upload.single('resume'), handleMulterError, async (req, res) => {
  try {
    console.log('Resume upload attempt:', {
      user: req.user?.email,
      role: req.user?.role,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
      // Fallback: store file locally and return local URL
      const localUrl = `/uploads/${req.file.filename}`;
      
      // Update user profile with local file path based on role
      const updateField = req.user.role === 'student' ? 'studentProfile.resume' : 'companyProfile.documents';
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { [updateField]: localUrl },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        data: {
          resumeUrl: localUrl
        },
        message: 'Resume uploaded successfully (stored locally)'
      });
    }

    // Upload to cloudinary if configured
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'resumes',
        resource_type: 'auto'
      });

      // Update user profile based on role
      const updateField = req.user.role === 'student' ? 'studentProfile.resume' : 'companyProfile.documents';
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { [updateField]: result.secure_url },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: {
          resumeUrl: result.secure_url
        },
        message: 'Resume uploaded successfully'
      });
    } catch (uploadError) {
      console.error('Resume upload error:', uploadError);
      return res.status(400).json({
        success: false,
        message: 'Failed to upload resume'
      });
    }
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/dashboard
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'student') {
      const Application = require('../models/Application');
      const applications = await Application.find({ applicant: req.user._id });
      
      stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        acceptedApplications: applications.filter(app => app.status === 'accepted').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        savedInternships: req.user.savedInternships.length,
        profileCompletion: calculateProfileCompletion(req.user)
      };
    } else if (req.user.role === 'company') {
      const Internship = require('../models/Internship');
      const Application = require('../models/Application');
      
      const internships = await Internship.find({ company: req.user._id });
      const applications = await Application.find({ company: req.user._id });
      
      stats = {
        totalInternships: internships.length,
        activeInternships: internships.filter(int => int.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        totalViews: internships.reduce((sum, int) => sum + int.views, 0),
        profileCompletion: calculateProfileCompletion(req.user)
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, [
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('profileVisibility').optional().isIn(['public', 'private'])
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

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: { ...req.user.preferences, ...req.body } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  let completion = 0;
  const totalFields = user.role === 'student' ? 10 : 8;

  // Basic fields
  if (user.name) completion++;
  if (user.email) completion++;
  if (user.avatar) completion++;
  if (user.phone) completion++;
  if (user.location?.city) completion++;

  if (user.role === 'student') {
    if (user.studentProfile?.university) completion++;
    if (user.studentProfile?.degree) completion++;
    if (user.studentProfile?.skills?.length > 0) completion++;
    if (user.studentProfile?.resume) completion++;
    if (user.studentProfile?.bio) completion++;
  } else if (user.role === 'company') {
    if (user.companyProfile?.companyName) completion++;
    if (user.companyProfile?.industry) completion++;
    if (user.companyProfile?.description) completion++;
  }

  return Math.round((completion / totalFields) * 100);
}

module.exports = router;
