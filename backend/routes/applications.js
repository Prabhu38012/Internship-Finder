const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { sendEmail, emailTemplates } = require('../utils/email');
const RealtimeService = require('../services/realtimeService');
const AnalyticsService = require('../services/analyticsService');
const { trackApplicationSubmitted, trackApplicationStatusUpdated } = require('../middleware/activityTracker');

const router = express.Router();

// @desc    Apply for internship
// @route   POST /api/applications
// @access  Private (Student only)
router.post('/', protect, authorize('student'), trackApplicationSubmitted, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 3 }
]), handleMulterError, [
  body('internshipId').isMongoId().withMessage('Valid internship ID is required'),
  body('coverLetter').optional().isLength({ max: 1000 }).withMessage('Cover letter cannot exceed 1000 characters')
], async (req, res) => {
  try {
    console.log('Application request - User:', req.user ? req.user.email : 'No user');
    console.log('Application request - Body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Application validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { internshipId, coverLetter, answers } = req.body;

    // Check if internship exists and is active
    const internship = await Internship.findById(internshipId).populate('company');
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    if (internship.status !== 'active' || internship.applicationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This internship is no longer accepting applications'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      internship: internshipId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this internship'
      });
    }

    // Check if max applications reached
    if (internship.applicationsCount >= internship.maxApplications) {
      return res.status(400).json({
        success: false,
        message: 'Maximum applications limit reached for this internship'
      });
    }

    // Process uploaded files
    let resumeUrl = '';
    let additionalDocuments = [];

    if (req.files) {
      if (req.files.resume) {
        resumeUrl = `/uploads/resumes/${req.files.resume[0].filename}`;
      }
      
      if (req.files.additionalDocuments) {
        additionalDocuments = req.files.additionalDocuments.map(file => ({
          name: file.originalname,
          url: `/uploads/documents/${file.filename}`,
          type: file.mimetype
        }));
      }
    }

    // Use existing resume if no new one uploaded
    if (!resumeUrl && req.user.studentProfile?.resume) {
      resumeUrl = req.user.studentProfile.resume;
    }

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required to apply'
      });
    }

    // Create application
    const application = await Application.create({
      internship: internshipId,
      applicant: req.user._id,
      company: internship.company._id,
      coverLetter,
      resume: resumeUrl,
      additionalDocuments,
      answers: answers ? JSON.parse(answers) : []
    });

    // Update internship applications count
    internship.applicationsCount += 1;
    await internship.save();

    // Create notification for company
    await Notification.createNotification({
      recipient: internship.company._id,
      sender: req.user._id,
      type: 'application_received',
      title: 'New Application Received',
      message: `${req.user.name} has applied for ${internship.title}`,
      data: {
        internshipId: internship._id,
        applicationId: application._id,
        url: `/dashboard/applications/${application._id}`
      }
    });

    // Send real-time notification about new application
    await RealtimeService.notifyNewApplication({
      _id: application._id,
      applicant: req.user,
      internship: internship
    });

    // Update analytics
    AnalyticsService.onApplicationSubmitted();

    // Send email notification to company
    try {
      const emailContent = emailTemplates.applicationReceived(req.user.name, internship.title);
      await sendEmail({
        email: internship.company.email,
        subject: emailContent.subject,
        html: emailContent.html
      });
    } catch (emailError) {
      console.error('Application notification email failed:', emailError);
    }

    // Emit real-time notification
    if (req.io) {
      req.io.to(internship.company._id.toString()).emit('newApplication', {
        application: await application.populate('applicant', 'name avatar'),
        internship: { title: internship.title, _id: internship._id }
      });
    }

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private (Student only)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { applicant: req.user._id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('internship', 'title companyName location type status applicationDeadline')
      .populate('company', 'name companyProfile.companyName companyProfile.logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get applications for company's internships
// @route   GET /api/applications/company
// @access  Private (Company only)
router.get('/company', protect, authorize('company'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { company: req.user._id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.internshipId) {
      query.internship = req.query.internshipId;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'name email avatar studentProfile.university studentProfile.degree studentProfile.skills')
      .populate('internship', 'title type location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: applications
    });
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Owner or Company)
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone avatar studentProfile')
      .populate('internship', 'title description companyName location type requirements')
      .populate('company', 'name companyProfile.companyName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isCompany = application.company._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Company only)
router.put('/:id/status', protect, authorize('company'), trackApplicationStatusUpdated, [
  body('status').isIn(['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected']).withMessage('Invalid status'),
  body('note').optional().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
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

    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('internship', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Store old status for real-time notification
    const oldStatus = application.status;

    // Update status with timeline
    await application.updateStatus(status, note, req.user._id);

    // Create notification for applicant
    await Notification.createNotification({
      recipient: application.applicant._id,
      sender: req.user._id,
      type: 'application_status_update',
      title: 'Application Status Updated',
      message: `Your application for ${application.internship.title} has been ${status}`,
      data: {
        internshipId: application.internship._id,
        applicationId: application._id,
        url: `/dashboard/applications/${application._id}`
      }
    });

    // Send real-time notification about status change
    await RealtimeService.notifyApplicationStatusChanged(application, oldStatus, status);

    // Update analytics
    AnalyticsService.onApplicationStatusChanged();

    // Send email notification
    try {
      const emailContent = emailTemplates.statusUpdate(
        application.applicant.name,
        application.internship.title,
        status
      );
      await sendEmail({
        email: application.applicant.email,
        subject: emailContent.subject,
        html: emailContent.html
      });
    } catch (emailError) {
      console.error('Status update email failed:', emailError);
    }

    // Emit real-time notification
    if (req.io) {
      req.io.to(application.applicant._id.toString()).emit('statusUpdate', {
        applicationId: application._id,
        status,
        internshipTitle: application.internship.title
      });
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Student only)
router.put('/:id/withdraw', protect, authorize('student'), [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Check if can be withdrawn
    if (['accepted', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application in current status'
      });
    }

    application.status = 'withdrawn';
    application.withdrawalReason = req.body.reason;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
