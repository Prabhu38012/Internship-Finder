const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const ExternalAPIService = require('../services/externalAPIs');
const RealtimeService = require('../services/realtimeService');
const AnalyticsService = require('../services/analyticsService');
const { trackInternshipCreated, trackInternshipViewed, trackSearchPerformed } = require('../middleware/activityTracker');

const router = express.Router();
const externalAPIService = new ExternalAPIService();

// @desc    Get all internships with filtering, sorting, and pagination
// @route   GET /api/internships
// @access  Public
router.get('/', [
  query('page').optional().custom(value => value === '' || (Number.isInteger(+value) && +value >= 1)),
  query('limit').optional().custom(value => value === '' || (Number.isInteger(+value) && +value >= 1 && +value <= 50)),
  query('category').optional().trim(),
  query('location').optional().trim(),
  query('type').optional().trim(),
  query('remote').optional().isIn(['true', 'false', true, false]),
  query('stipendMin').optional().custom(value => value === '' || !isNaN(value)),
  query('stipendMax').optional().custom(value => value === '' || !isNaN(value)),
  query('search').optional().trim(),
  query('includeExternal').optional().isIn(['true', 'false', true, false])
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'active', applicationDeadline: { $gte: new Date() } };

    // Filters
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.remote === 'true') {
      query['location.type'] = 'remote';
    } else if (req.query.remote === 'false') {
      query['location.type'] = { $ne: 'remote' };
    }

    if (req.query.location && req.query.remote !== 'true') {
      query.$or = [
        { 'location.city': new RegExp(req.query.location, 'i') },
        { 'location.state': new RegExp(req.query.location, 'i') },
        { 'location.country': new RegExp(req.query.location, 'i') }
      ];
    }

    if (req.query.stipendMin || req.query.stipendMax) {
      query['stipend.amount'] = {};
      if (req.query.stipendMin) {
        query['stipend.amount'].$gte = parseInt(req.query.stipendMin);
      }
      if (req.query.stipendMax) {
        query['stipend.amount'].$lte = parseInt(req.query.stipendMax);
      }
    }

    // Text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Build sort
    let sort = {};
    if (req.query.search) {
      sort.score = { $meta: 'textScore' };
    }
    sort.featured = -1;
    sort.urgent = -1;
    sort.createdAt = -1;

    // Execute query
    const internships = await Internship.find(query)
      .populate('company', 'name companyProfile.companyName companyProfile.logo companyProfile.verified')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Internship.countDocuments(query);

    // Add user-specific data if authenticated
    if (req.user) {
      for (let internship of internships) {
        internship._doc.isSaved = req.user.savedInternships.includes(internship._id);
        
        // Check if user has applied
        const application = await Application.findOne({
          internship: internship._id,
          applicant: req.user._id
        });
        internship._doc.hasApplied = !!application;
        internship._doc.applicationStatus = application?.status;
      }
    }

    let allInternships = [...internships];
    let totalCount = total;

    // Fetch external internships if requested
    if (req.query.includeExternal === 'true' || req.query.includeExternal === true) {
      try {
        const externalFilters = {
          location: req.query.location,
          category: req.query.category,
          remote: req.query.remote === 'true'
        };
        
        const externalInternships = await externalAPIService.searchAllPlatforms(
          req.query.search || 'internship',
          externalFilters
        );
        
        // Add external internships to results
        allInternships = [...allInternships, ...externalInternships.slice(0, limit)];
        totalCount += externalInternships.length;
      } catch (error) {
        console.error('External API error:', error);
        // Continue with local results only
      }
    }

    res.status(200).json({
      success: true,
      count: allInternships.length,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      data: allInternships,
      sources: {
        local: internships.length,
        external: allInternships.length - internships.length
      }
    });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('company', 'name companyProfile.companyName companyProfile.logo companyProfile.verified companyProfile.description');

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // Increment views
    await internship.incrementViews();

    // Add user-specific data if authenticated
    if (req.user) {
      internship._doc.isSaved = req.user.savedInternships.includes(internship._id);
      
      // Check if user has applied
      const application = await Application.findOne({
        internship: internship._id,
        applicant: req.user._id
      });
      internship._doc.hasApplied = !!application;
      internship._doc.applicationStatus = application?.status;
    }

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private (Company only)
router.post('/', protect, authorize('company'), trackInternshipCreated, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('category').isIn([
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Mobile Development', 'UI/UX Design', 'Digital Marketing', 'Business Development',
    'Finance', 'Human Resources', 'Content Writing', 'Graphic Design', 'Sales',
    'Operations', 'Research', 'Other'
  ]).withMessage('Invalid category'),
  body('type').isIn(['internship', 'project', 'full-time', 'part-time']).withMessage('Invalid type'),
  body('duration').trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    console.log('Internship creation request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const internshipData = {
      ...req.body,
      company: req.user._id,
      companyName: req.user.companyProfile?.companyName || req.user.name
    };

    const internship = await Internship.create(internshipData);

    // Send real-time notification about new internship
    RealtimeService.notifyInternshipCreated(internship);
    
    // Update analytics
    AnalyticsService.onInternshipCreated();

    res.status(201).json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Company owner only)
router.put('/:id', protect, authorize('company'), async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // Check ownership
    if (internship.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this internship'
      });
    }

    internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Send real-time notification about internship update
    RealtimeService.notifyInternshipUpdated(internship);

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Company owner only)
router.delete('/:id', protect, authorize('company'), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // Check ownership
    if (internship.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this internship'
      });
    }

    const internshipId = internship._id;
    await internship.deleteOne();

    // Send real-time notification about internship deletion
    RealtimeService.notifyInternshipDeleted(internshipId);

    res.status(200).json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Save/Unsave internship
// @route   PUT /api/internships/:id/save
// @access  Private (Student only)
router.put('/:id/save', protect, authorize('student'), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    const user = req.user;
    const isSaved = user.savedInternships.includes(internship._id);

    if (isSaved) {
      // Unsave
      user.savedInternships = user.savedInternships.filter(
        id => id.toString() !== internship._id.toString()
      );
      internship.saves = Math.max(0, internship.saves - 1);
    } else {
      // Save
      user.savedInternships.push(internship._id);
      internship.saves += 1;
    }

    await user.save();
    await internship.save();

    res.status(200).json({
      success: true,
      message: isSaved ? 'Internship unsaved' : 'Internship saved',
      saved: !isSaved
    });
  } catch (error) {
    console.error('Save internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company's internships
// @route   GET /api/internships/company/mine
// @access  Private (Company only)
router.get('/company/mine', protect, authorize('company'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const internships = await Internship.find({ company: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Internship.countDocuments({ company: req.user._id });

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
    console.error('Get company internships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search external internships only
// @route   GET /api/internships/external/search
// @access  Public
router.get('/external/search', [
  query('q').optional().trim(),
  query('location').optional().trim(),
  query('category').optional().trim(),
  query('platform').optional().isIn(['linkedin', 'indeed', 'internshala', 'all'])
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

    const query = req.query.q || 'internship';
    const filters = {
      location: req.query.location,
      category: req.query.category
    };

    let results = [];

    if (!req.query.platform || req.query.platform === 'all') {
      results = await externalAPIService.searchAllPlatforms(query, filters);
    } else {
      switch (req.query.platform) {
        case 'linkedin':
          results = await externalAPIService.linkedinAPI.searchInternships(query, filters);
          break;
        case 'indeed':
          results = await externalAPIService.indeedAPI.searchInternships(query, filters);
          break;
        case 'internshala':
          results = await externalAPIService.internshalaAPI.searchInternships(query, filters);
          break;
      }
      results = externalAPIService.normalizeInternships(results);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      platform: req.query.platform || 'all',
      apiHealth: externalAPIService.getAPIHealth()
    });
  } catch (error) {
    console.error('External search error:', error);
    res.status(500).json({
      success: false,
      message: 'External API search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// @desc    Get API health status
// @route   GET /api/internships/external/health
// @access  Public
router.get('/external/health', async (req, res) => {
  try {
    const health = externalAPIService.getAPIHealth();
    
    res.status(200).json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

module.exports = router;
