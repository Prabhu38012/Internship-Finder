const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @desc    Register company
// @route   POST /api/company/register
// @access  Public
router.post('/register', [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('companyEmail').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('description').notEmpty().withMessage('Company description is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('companySize').notEmpty().withMessage('Company size is required'),
  body('hrName').notEmpty().withMessage('HR contact name is required'),
  body('hrEmail').isEmail().withMessage('Valid HR email is required'),
  body('hrPhone').notEmpty().withMessage('HR phone number is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required')
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

    const {
      companyName,
      companyEmail,
      password,
      description,
      industry,
      companySize,
      foundedYear,
      website,
      linkedinUrl,
      hrName,
      hrEmail,
      hrPhone,
      city,
      state,
      country = 'India',
      address,
      zipCode
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ companyEmail });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists'
      });
    }

    // Create company
    const company = await Company.create({
      companyName,
      companyEmail,
      password,
      companyProfile: {
        description,
        industry,
        companySize,
        foundedYear,
        website,
        linkedinUrl,
        headquarters: {
          address,
          city,
          state,
          country,
          zipCode
        }
      },
      contactInfo: {
        hrName,
        hrEmail,
        hrPhone
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: company._id, type: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Emit real-time notification for new company registration
    const io = req.app.get('io');
    if (io) {
      io.emit('company_registered', {
        companyId: company._id,
        companyName: company.companyName,
        industry: company.companyProfile.industry,
        registeredAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Verification pending.',
      data: {
        company: {
          id: company._id,
          companyName: company.companyName,
          companyEmail: company.companyEmail,
          industry: company.companyProfile.industry,
          verificationStatus: company.verification.verificationStatus,
          accountStatus: company.accountStatus
        },
        token
      }
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Company login
// @route   POST /api/company/login
// @access  Public
router.post('/login', [
  body('companyEmail').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { companyEmail, password } = req.body;

    // Find company and include password
    const company = await Company.findOne({ companyEmail }).select('+password');
    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await company.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check account status
    if (company.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Please contact support.'
      });
    }

    // Update last active and login history
    company.lastActive = new Date();
    company.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    await company.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: company._id, type: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        company: {
          id: company._id,
          companyName: company.companyName,
          companyEmail: company.companyEmail,
          industry: company.companyProfile.industry,
          verificationStatus: company.verification.verificationStatus,
          accountStatus: company.accountStatus,
          subscription: company.subscription
        },
        token
      }
    });
  } catch (error) {
    console.error('Company login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private (Company)
router.get('/profile', protect, authorize('company'), async (req, res) => {
  try {
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private (Company)
router.put('/profile', protect, authorize('company'), [
  body('companyName').optional().notEmpty().withMessage('Company name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('linkedinUrl').optional().matches(/^https?:\/\/(www\.)?linkedin\.com\/company\/.+/).withMessage('Invalid LinkedIn URL')
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

    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'companyName', 'description', 'industry', 'companySize', 
      'foundedYear', 'website', 'linkedinUrl', 'hrName', 'hrEmail', 
      'hrPhone', 'city', 'state', 'country', 'address', 'zipCode'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        if (['city', 'state', 'country', 'address', 'zipCode'].includes(key)) {
          if (!updates['companyProfile.headquarters']) {
            updates['companyProfile.headquarters'] = {};
          }
          updates[`companyProfile.headquarters.${key}`] = req.body[key];
        } else if (['hrName', 'hrEmail', 'hrPhone'].includes(key)) {
          updates[`contactInfo.${key}`] = req.body[key];
        } else if (['description', 'industry', 'companySize', 'foundedYear', 'website', 'linkedinUrl'].includes(key)) {
          updates[`companyProfile.${key}`] = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const updatedCompany = await Company.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('company_profile_updated', {
        companyId: updatedCompany._id,
        companyName: updatedCompany.companyName,
        updatedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload company logo
// @route   POST /api/company/upload-logo
// @access  Private (Company)
router.post('/upload-logo', protect, authorize('company'), upload.single('logo'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const company = await Company.findByIdAndUpdate(
      req.user.id,
      { 'companyProfile.logo': req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: company.companyProfile.logo
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company dashboard stats
// @route   GET /api/company/dashboard
// @access  Private (Company)
router.get('/dashboard', protect, authorize('company'), async (req, res) => {
  try {
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get detailed statistics
    const stats = await Company.getCompanyStats(req.user._id);
    
    // Get recent internships
    const recentInternships = await Internship.find({ company: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applications', 'status createdAt');

    // Get recent applications
    const recentApplications = await Application.find()
      .populate({
        path: 'internship',
        match: { company: req.user._id },
        select: 'title'
      })
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const validApplications = recentApplications.filter(app => app.internship);

    res.status(200).json({
      success: true,
      data: {
        company: {
          name: company.companyName,
          verificationStatus: company.verification.verificationStatus,
          subscription: company.subscription,
          stats: company.stats
        },
        statistics: stats,
        recentInternships,
        recentApplications: validApplications
      }
    });
  } catch (error) {
    console.error('Get company dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all companies (Public - for students)
// @route   GET /api/company/all
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, industry, city, verified } = req.query;
    
    const query = { accountStatus: 'active' };
    
    if (industry) query['companyProfile.industry'] = industry;
    if (city) query['companyProfile.headquarters.city'] = new RegExp(city, 'i');
    if (verified === 'true') query['verification.isVerified'] = true;

    const companies = await Company.find(query)
      .select('companyName companyProfile.logo companyProfile.description companyProfile.industry companyProfile.headquarters verification.isVerified stats')
      .sort({ 'verification.isVerified': -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      count: companies.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: companies
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company public profile
// @route   GET /api/company/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .select('-password -loginHistory -notificationSettings');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get active internships
    const activeInternships = await Internship.find({
      company: req.params.id,
      status: 'active'
    }).select('title category location stipend applicationDeadline');

    res.status(200).json({
      success: true,
      data: {
        company,
        activeInternships
      }
    });
  } catch (error) {
    console.error('Get company public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
