import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Jobs by category
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        pendingApplications
      },
      usersByRole,
      jobsByCategory,
      applicationsByStatus,
      monthlyRegistrations
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'companyProfile.companyName': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all jobs with pagination and filtering
router.get('/jobs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(filter)
      .populate('company', 'profile.companyName companyProfile.companyName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get admin jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all applications with pagination and filtering
router.get('/applications', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate([
        {
          path: 'job',
          select: 'title company',
          populate: {
            path: 'company',
            select: 'profile.companyName companyProfile.companyName'
          }
        },
        { path: 'applicant', select: 'profile email' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job status
router.patch('/jobs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('company', 'profile.companyName companyProfile.companyName');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up related data
    await Job.deleteMany({ company: req.params.id });
    await Application.deleteMany({ applicant: req.params.id });
    await Notification.deleteMany({ 
      $or: [
        { recipient: req.params.id },
        { sender: req.params.id }
      ]
    });

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Clean up related applications
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: 'Job and related applications deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify company
router.patch('/companies/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'companyProfile.verified': verified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Create notification
    const notification = new Notification({
      recipient: req.params.id,
      type: 'system_notification',
      title: verified ? 'Company Verified' : 'Verification Revoked',
      message: verified 
        ? 'Your company has been verified and can now post jobs'
        : 'Your company verification has been revoked',
      priority: 'high'
    });

    await notification.save();

    res.json(user);
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ type: 'system_notification' })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Get system notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send system notification
router.post('/notifications', async (req, res) => {
  try {
    const { recipients, title, message, priority = 'medium' } = req.body;

    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      type: 'system_notification',
      title,
      message,
      priority
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications
    if (req.io) {
      recipients.forEach(recipientId => {
        req.io.to(recipientId).emit('notification', {
          title,
          message,
          type: 'system_notification',
          priority
        });
      });
    }

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;