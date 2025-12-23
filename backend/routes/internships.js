const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const RealtimeService = require('../services/realtimeService');
const AnalyticsService = require('../services/analyticsService');
const { trackInternshipCreated, trackInternshipViewed, trackSearchPerformed } = require('../middleware/activityTracker');
const jobAggregatorService = require('../services/jobAggregatorService');

const router = express.Router();

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
      // Show only remote internships
      query['location.type'] = 'remote';
    } else if (req.query.remote === 'onsite') {
      // Show only onsite internships (explicit filter)
      query['location.type'] = { $ne: 'remote' };
    }
    // Note: remote=false or no remote param shows ALL internships (no filter)

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

    // Include external internships if requested
    if (req.query.includeExternal === 'true' || req.query.includeExternal === true) {
      try {
        const externalFilters = {
          category: req.query.category,
          location: req.query.location,
          search: req.query.search,
          remote: req.query.remote
        };

        const externalResult = await jobAggregatorService.getExternalJobs(
          externalFilters,
          page,
          limit
        );

        if (externalResult.data && externalResult.data.length > 0) {
          allInternships = [...allInternships, ...externalResult.data];
          totalCount += externalResult.pagination.total;
        }
      } catch (error) {
        console.error('Error fetching external jobs:', error.message);
        // Continue with internal results only
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
        internal: internships.length,
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

    // Emit real-time view notification to company (for activity feed)
    if (req.user && req.user.role === 'student') {
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${internship.company._id || internship.company}`).emit('company_activity', {
          type: 'internship_viewed',
          userName: req.user.name,
          internshipTitle: internship.title,
          timestamp: new Date(),
          companyId: internship.company._id || internship.company
        });
      }
    }

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

// Test route to verify routing works
router.post('/test', (req, res) => {
  res.json({ success: true, message: 'Internship route is working!' });
});

// @desc    Create new internship (Real-time posting)
// @route   POST /api/internships
// @access  Private (Company only)
router.post('/', protect, authorize('company'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
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

    // Check if company can post more internships
    console.log('Looking for company with user ID:', req.user._id);
    console.log('User object keys:', Object.keys(req.user));
    console.log('User role:', req.user.role);
    console.log('Company name:', req.user.companyName);
    console.log('Company object:', req.user.toObject ? req.user.toObject() : req.user);

    // For Company model, the user is already the company object
    let company = req.user;

    // Check if this is a valid company object
    if (!company || !company._id) {
      console.log('No company object found');
      return res.status(404).json({
        success: false,
        message: 'Company authentication failed'
      });
    }

    // For Company model, companyName should exist, but let's be flexible
    if (!company.companyName && !company.name) {
      console.log('Company object missing name field');
      console.log('Available company properties:', Object.getOwnPropertyNames(company));
      return res.status(404).json({
        success: false,
        message: 'Company profile incomplete'
      });
    }

    // Check posting limits manually since canPostInternship might not be available
    const maxPosts = company.subscription?.maxInternshipPosts || 5;
    const currentPosts = company.subscription?.currentInternshipPosts || 0;

    if (currentPosts >= maxPosts) {
      return res.status(403).json({
        success: false,
        message: `You have reached your posting limit of ${maxPosts} internships. Upgrade your plan to post more.`
      });
    }

    const internshipData = {
      ...req.body,
      company: company._id,
      companyName: company.companyName || company.name || 'Unknown Company'
    };

    const internship = await Internship.create(internshipData);

    // Update company internship count manually
    try {
      const Company = require('../models/Company');
      await Company.findByIdAndUpdate(company._id, {
        $inc: { 'subscription.currentInternshipPosts': 1 }
      });
      console.log('✅ Company internship count updated');
    } catch (updateError) {
      console.error('Error updating company count:', updateError);
    }

    // Emit real-time notification to all students
    const io = req.app.get('io');
    if (io) {
      io.emit('new_internship_posted', {
        internship: {
          _id: internship._id,
          title: internship.title,
          companyName: internship.companyName,
          category: internship.category,
          location: internship.location,
          stipend: internship.stipend,
          applicationDeadline: internship.applicationDeadline,
          postedAt: new Date()
        }
      });
    }

    // Create notification for interested students
    const notificationService = req.app.get('notificationService');
    if (notificationService) {
      await notificationService.createBulkNotification({
        type: 'new_internship',
        title: 'New Internship Posted',
        message: `${company.companyName} posted a new ${internship.category} internship: ${internship.title}`,
        data: { internshipId: internship._id },
        targetAudience: 'students',
        filters: {
          interestedCategories: [internship.category],
          location: internship.location.city
        }
      });
    }

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

// ==================== EXTERNAL INTERNSHIP ROUTES ====================

// @desc    Get external internships only
// @route   GET /api/internships/external
// @access  Public
router.get('/external', [
  query('page').optional().custom(value => value === '' || (Number.isInteger(+value) && +value >= 1)),
  query('limit').optional().custom(value => value === '' || (Number.isInteger(+value) && +value >= 1 && +value <= 50)),
  query('source').optional().isIn(['LinkedIn', 'Indeed', 'Internshala', 'Google']),
  query('category').optional().trim(),
  query('location').optional().trim(),
  query('search').optional().trim()
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      source: req.query.source,
      category: req.query.category,
      location: req.query.location,
      search: req.query.search,
      remote: req.query.remote
    };

    const result = await jobAggregatorService.getExternalJobs(filters, page, limit);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get external internships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get external internships statistics
// @route   GET /api/internships/external/stats
// @access  Public
router.get('/external/stats', async (req, res) => {
  try {
    const stats = await jobAggregatorService.getStats();
    const status = jobAggregatorService.getStatus();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        syncStatus: status
      }
    });
  } catch (error) {
    console.error('Get external stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Manually trigger external job sync
// @route   POST /api/internships/external/sync
// @access  Private (Admin only)
router.post('/external/sync', protect, authorize('admin'), async (req, res) => {
  try {
    const { queries } = req.body;

    // Start sync in background
    const syncPromise = jobAggregatorService.syncAllPlatforms(queries);

    res.status(202).json({
      success: true,
      message: 'Sync started in background',
      status: jobAggregatorService.getStatus()
    });

    // Wait for sync to complete (non-blocking for response)
    syncPromise.then(result => {
      console.log('Manual sync completed:', result.stats?.totalSynced || 0, 'jobs synced');
    }).catch(error => {
      console.error('Manual sync failed:', error.message);
    });
  } catch (error) {
    console.error('Sync trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
