const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Wishlist = require('../models/Wishlist');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private (Student only)
router.get('/', protect, authorize('student'), [
  query('category').optional().isIn(['interested', 'backup', 'dream_job', 'applied', 'rejected']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('applicationStatus').optional().isIn(['not_applied', 'planning_to_apply', 'applied', 'no_longer_interested']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.applicationStatus) filters.applicationStatus = req.query.applicationStatus;

    const wishlistItems = await Wishlist.getUserWishlist(req.user._id, filters)
      .skip(skip)
      .limit(limit);

    const total = await Wishlist.countDocuments({
      user: req.user._id,
      isActive: true,
      ...filters
    });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: wishlistItems
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add internship to wishlist
// @route   POST /api/wishlist
// @access  Private (Student only)
router.post('/', protect, authorize('student'), [
  body('internshipId').isMongoId().withMessage('Valid internship ID is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('category').optional().isIn(['interested', 'backup', 'dream_job', 'applied', 'rejected']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('reminderDate').optional().isISO8601().withMessage('Invalid reminder date')
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

    const { internshipId, notes, priority, category, tags, reminderDate } = req.body;

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      user: req.user._id,
      internship: internshipId
    });

    if (existingWishlistItem) {
      if (existingWishlistItem.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Internship already in wishlist'
        });
      } else {
        // Reactivate if previously removed
        existingWishlistItem.isActive = true;
        existingWishlistItem.notes = notes || existingWishlistItem.notes;
        existingWishlistItem.priority = priority || existingWishlistItem.priority;
        existingWishlistItem.category = category || existingWishlistItem.category;
        existingWishlistItem.tags = tags || existingWishlistItem.tags;
        existingWishlistItem.reminderDate = reminderDate || existingWishlistItem.reminderDate;
        
        await existingWishlistItem.save();
        await existingWishlistItem.populate('internship', 'title company companyName category location stipend applicationDeadline status');
        
        return res.status(200).json({
          success: true,
          data: existingWishlistItem,
          message: 'Internship re-added to wishlist'
        });
      }
    }

    // Create new wishlist item
    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      internship: internshipId,
      notes,
      priority: priority || 'medium',
      category: category || 'interested',
      tags: tags || [],
      reminderDate
    });

    await wishlistItem.populate('internship', 'title company companyName category location stipend applicationDeadline status');

    // Update internship saves count
    await Internship.findByIdAndUpdate(internshipId, { $inc: { saves: 1 } });

    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: 'Internship added to wishlist'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Internship already in wishlist'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update wishlist item
// @route   PUT /api/wishlist/:id
// @access  Private (Student only)
router.put('/:id', protect, authorize('student'), [
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('category').optional().isIn(['interested', 'backup', 'dream_job', 'applied', 'rejected']).withMessage('Invalid category'),
  body('applicationStatus').optional().isIn(['not_applied', 'planning_to_apply', 'applied', 'no_longer_interested']).withMessage('Invalid application status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('reminderDate').optional().isISO8601().withMessage('Invalid reminder date')
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

    const wishlistItem = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        wishlistItem[key] = req.body[key];
      }
    });

    await wishlistItem.save();
    await wishlistItem.populate('internship', 'title company companyName category location stipend applicationDeadline status');

    res.status(200).json({
      success: true,
      data: wishlistItem,
      message: 'Wishlist item updated'
    });
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private (Student only)
router.delete('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    // Soft delete
    wishlistItem.isActive = false;
    await wishlistItem.save();

    // Update internship saves count
    await Internship.findByIdAndUpdate(wishlistItem.internship, { $inc: { saves: -1 } });

    res.status(200).json({
      success: true,
      message: 'Internship removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get wishlist statistics
// @route   GET /api/wishlist/stats
// @access  Private (Student only)
router.get('/stats', protect, authorize('student'), async (req, res) => {
  try {
    const stats = await Wishlist.getWishlistStats(req.user._id);
    
    // Get reminders due
    const remindersDue = await Wishlist.find({
      user: req.user._id,
      isActive: true,
      reminderDate: { $lte: new Date() }
    }).countDocuments();

    // Get internships closing soon (within 7 days)
    const closingSoon = await Wishlist.find({
      user: req.user._id,
      isActive: true
    }).populate({
      path: 'internship',
      match: {
        applicationDeadline: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const closingSoonCount = closingSoon.filter(item => item.internship).length;

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        remindersDue,
        closingSoon: closingSoonCount
      }
    });
  } catch (error) {
    console.error('Get wishlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get wishlist reminders
// @route   GET /api/wishlist/reminders
// @access  Private (Student only)
router.get('/reminders', protect, authorize('student'), async (req, res) => {
  try {
    const reminders = await Wishlist.find({
      user: req.user._id,
      isActive: true,
      reminderDate: { $lte: new Date() }
    }).populate('internship', 'title companyName applicationDeadline')
      .sort({ reminderDate: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Bulk update wishlist items
// @route   PUT /api/wishlist/bulk
// @access  Private (Student only)
router.put('/bulk', protect, authorize('student'), [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.id').isMongoId().withMessage('Valid item ID is required'),
  body('items.*.updates').isObject().withMessage('Updates object is required')
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

    const { items } = req.body;
    const results = [];

    for (const item of items) {
      try {
        const wishlistItem = await Wishlist.findOne({
          _id: item.id,
          user: req.user._id,
          isActive: true
        });

        if (wishlistItem) {
          Object.keys(item.updates).forEach(key => {
            if (item.updates[key] !== undefined) {
              wishlistItem[key] = item.updates[key];
            }
          });
          
          await wishlistItem.save();
          results.push({ id: item.id, success: true });
        } else {
          results.push({ id: item.id, success: false, error: 'Item not found' });
        }
      } catch (error) {
        results.push({ id: item.id, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      data: results,
      message: 'Bulk update completed'
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
