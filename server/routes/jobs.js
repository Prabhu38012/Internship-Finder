import express from 'express';
import Job from '../models/Job.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    const jobs = await Job.find(query)
      .populate('company', 'companyName profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName profile companyProfile');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Increment views
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job (company only)
router.post('/', authenticateToken, authorizeRoles('company'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      company: req.userId
    };
    
    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (company only)
router.put('/:id', authenticateToken, authorizeRoles('company'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(job, req.body);
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (company only)
router.delete('/:id', authenticateToken, authorizeRoles('company'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmark job
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const isBookmarked = job.bookmarks.includes(req.userId);
    
    if (isBookmarked) {
      job.bookmarks = job.bookmarks.filter(id => id.toString() !== req.userId);
    } else {
      job.bookmarks.push(req.userId);
    }
    
    await job.save();
    res.json({ message: isBookmarked ? 'Job unbookmarked' : 'Job bookmarked' });
  } catch (error) {
    console.error('Bookmark job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;