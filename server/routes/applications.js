import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get user's applications
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.userId })
      .populate('job', 'title companyName location type')
      .populate('company', 'companyName profile')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company's applications
router.get('/company', authenticateToken, authorizeRoles('company'), async (req, res) => {
  try {
    const applications = await Application.find({ company: req.userId })
      .populate('job', 'title location type')
      .populate('applicant', 'profile studentProfile')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for a job
router.post('/', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { jobId, coverLetter, resume, portfolio } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.userId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    const application = new Application({
      job: jobId,
      applicant: req.userId,
      company: job.company,
      coverLetter,
      resume,
      portfolio
    });
    
    await application.save();
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (company only)
router.patch('/:id/status', authenticateToken, authorizeRoles('company'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (application.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    if (notes) {
      application.notes.company = notes;
    }
    
    // Add to timeline
    application.timeline.push({
      status,
      note: notes || `Status changed to ${status}`
    });
    
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'profile studentProfile')
      .populate('company', 'companyName profile companyProfile');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is authorized to view this application
    if (application.applicant.toString() !== req.userId && 
        application.company.toString() !== req.userId &&
        req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;