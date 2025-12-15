const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { protect: auth } = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
    }
  }
});

// @route   GET /api/ai/recommendations
// @desc    Get AI-powered job recommendations for user
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get internships (you can add filters here)
    const internships = await Internship.find({ status: 'active' }).limit(100);

    const recommendations = await aiService.getJobRecommendations(
      user,
      internships,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

// @route   POST /api/ai/analyze-resume
// @desc    Analyze uploaded resume and extract skills
// @access  Private
router.post('/analyze-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let resumeText = '';

    console.log('Processing file:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = docxData.value;
    } else if (req.file.mimetype === 'text/plain') {
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'Could not extract text from file' });
    }

    const analysis = await aiService.analyzeResume(resumeText);

    // Optionally update user profile with extracted skills
    if (req.body.updateProfile === 'true') {
      const user = await User.findById(req.user.id);
      if (user && user.studentProfile) {
        // Merge extracted skills with existing skills
        const allSkills = Object.values(analysis.skills).flat();
        const existingSkills = user.studentProfile.skills || [];
        const mergedSkills = [...new Set([...existingSkills, ...allSkills])];

        user.studentProfile.skills = mergedSkills;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: analysis,
      message: 'Resume analyzed successfully'
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
});

// @route   POST /api/ai/chatbot
// @desc    Get chatbot response for user query
// @access  Private
router.post('/chatbot', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = await User.findById(req.user.id);
    const userContext = {
      role: user.role,
      skills: user.studentProfile?.skills || [],
      interests: user.studentProfile?.interests || [],
      experienceLevel: user.studentProfile?.experienceLevel || 'entry'
    };

    const response = await aiService.getChatbotResponse(message, userContext);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chatbot request',
      error: error.message
    });
  }
});

// @route   POST /api/ai/predict-success
// @desc    Predict application success rate for specific internship
// @access  Private
router.post('/predict-success/:internshipId', auth, async (req, res) => {
  try {
    const { internshipId } = req.params;

    const user = await User.findById(req.user.id);
    const internship = await Internship.findById(internshipId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Get historical application data for better predictions
    const historicalData = await Application.find({
      $or: [
        { internship: internshipId },
        { 'internshipDetails.category': internship.category },
        { 'internshipDetails.companyName': internship.companyName }
      ]
    }).select('status internshipDetails applicant').limit(100);

    const prediction = await aiService.predictApplicationSuccess(
      user,
      internship,
      historicalData
    );

    res.json({
      success: true,
      data: prediction,
      internship: {
        id: internship._id,
        title: internship.title,
        company: internship.companyName
      }
    });
  } catch (error) {
    console.error('Error predicting success:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting application success',
      error: error.message
    });
  }
});

// @route   POST /api/ai/auto-tag
// @desc    Auto-tag internship with AI-generated categories and tags
// @access  Private (Company/Admin only)
router.post('/auto-tag/:internshipId', auth, async (req, res) => {
  try {
    const { internshipId } = req.params;

    // Check if user is company or admin
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if company owns this internship
    if (req.user.role === 'company' && internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tags = await aiService.autoTagInternship(internship);

    // Optionally update the internship with generated tags
    if (req.body.applyTags === 'true') {
      internship.aiTags = tags;
      internship.categories = tags.categories.map(cat => cat.category);
      internship.skillTags = tags.skills;
      internship.industryTags = tags.industries;
      await internship.save();
    }

    res.json({
      success: true,
      data: tags,
      internship: {
        id: internship._id,
        title: internship.title,
        company: internship.companyName
      }
    });
  } catch (error) {
    console.error('Error auto-tagging internship:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-tagging internship',
      error: error.message
    });
  }
});

// @route   GET /api/ai/skill-insights
// @desc    Get AI insights about skills in demand
// @access  Private
router.get('/skill-insights', auth, async (req, res) => {
  try {
    const { category, location } = req.query;

    // Get recent internships to analyze skill trends
    const query = { status: 'active' };
    if (category) query.category = category;
    if (location) query['location.city'] = location;

    const internships = await Internship.find(query)
      .select('requirements.skills category location stipend')
      .limit(200);

    // Analyze skill frequency and trends
    const skillAnalysis = {};
    const categoryAnalysis = {};
    const locationAnalysis = {};

    internships.forEach(internship => {
      // Skills analysis
      if (internship.requirements && internship.requirements.skills) {
        internship.requirements.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (!skillAnalysis[skillLower]) {
            skillAnalysis[skillLower] = { count: 0, avgStipend: 0, categories: new Set() };
          }
          skillAnalysis[skillLower].count++;
          if (internship.stipend) {
            skillAnalysis[skillLower].avgStipend += internship.stipend.amount || 0;
          }
          skillAnalysis[skillLower].categories.add(internship.category);
        });
      }

      // Category analysis
      if (!categoryAnalysis[internship.category]) {
        categoryAnalysis[internship.category] = { count: 0, avgStipend: 0 };
      }
      categoryAnalysis[internship.category].count++;
      if (internship.stipend) {
        categoryAnalysis[internship.category].avgStipend += internship.stipend.amount || 0;
      }

      // Location analysis
      const locationKey = `${internship.location.city}, ${internship.location.country}`;
      if (!locationAnalysis[locationKey]) {
        locationAnalysis[locationKey] = { count: 0, avgStipend: 0 };
      }
      locationAnalysis[locationKey].count++;
      if (internship.stipend) {
        locationAnalysis[locationKey].avgStipend += internship.stipend.amount || 0;
      }
    });

    // Calculate averages and sort by demand
    const topSkills = Object.entries(skillAnalysis)
      .map(([skill, data]) => ({
        skill,
        demand: data.count,
        avgStipend: data.count > 0 ? Math.round(data.avgStipend / data.count) : 0,
        categories: Array.from(data.categories)
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 20);

    const topCategories = Object.entries(categoryAnalysis)
      .map(([category, data]) => ({
        category,
        opportunities: data.count,
        avgStipend: data.count > 0 ? Math.round(data.avgStipend / data.count) : 0
      }))
      .sort((a, b) => b.opportunities - a.opportunities)
      .slice(0, 10);

    const topLocations = Object.entries(locationAnalysis)
      .map(([location, data]) => ({
        location,
        opportunities: data.count,
        avgStipend: data.count > 0 ? Math.round(data.avgStipend / data.count) : 0
      }))
      .sort((a, b) => b.opportunities - a.opportunities)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        topSkills,
        topCategories,
        topLocations,
        totalInternships: internships.length,
        analysisDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting skill insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing skill insights',
      error: error.message
    });
  }
});

// @route   POST /api/ai/batch-tag
// @desc    Auto-tag multiple internships in batch
// @access  Private (Admin only)
router.post('/batch-tag', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { limit = 50 } = req.body;

    // Get internships that haven't been auto-tagged yet
    const internships = await Internship.find({
      aiTags: { $exists: false },
      status: 'active'
    }).limit(parseInt(limit));

    const results = [];

    for (const internship of internships) {
      try {
        const tags = await aiService.autoTagInternship(internship);

        // Update internship with tags
        internship.aiTags = tags;
        internship.categories = tags.categories.map(cat => cat.category);
        internship.skillTags = tags.skills;
        internship.industryTags = tags.industries;
        await internship.save();

        results.push({
          internshipId: internship._id,
          title: internship.title,
          success: true,
          tags: tags
        });
      } catch (error) {
        results.push({
          internshipId: internship._id,
          title: internship.title,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    console.error('Error batch tagging:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch tagging internships',
      error: error.message
    });
  }
});

// @route   GET /api/ai/user-insights
// @desc    Get personalized AI insights for user
// @access  Private
router.get('/user-insights', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const userSkills = user.studentProfile.skills || [];
    const userInterests = user.studentProfile.interests || [];

    // Get user's applications for success rate analysis
    const applications = await Application.find({ applicant: req.user.id })
      .populate('internship', 'category requirements stipend location');

    // Analyze user's application patterns
    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      successRate: applications.length > 0 ?
        (applications.filter(app => app.status === 'accepted').length / applications.length) * 100 : 0
    };

    // Get skill recommendations based on market demand
    const allInternships = await Internship.find({ status: 'active' })
      .select('requirements.skills category');

    const skillDemand = {};
    allInternships.forEach(internship => {
      if (internship.requirements && internship.requirements.skills) {
        internship.requirements.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          skillDemand[skillLower] = (skillDemand[skillLower] || 0) + 1;
        });
      }
    });

    // Find skills user doesn't have but are in high demand
    const recommendedSkills = Object.entries(skillDemand)
      .filter(([skill]) => !userSkills.some(userSkill =>
        userSkill.toLowerCase().includes(skill) || skill.includes(userSkill.toLowerCase())
      ))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, demand]) => ({ skill, demand }));

    // Career path suggestions based on current skills
    const careerPaths = this.suggestCareerPaths(userSkills, userInterests);

    res.json({
      success: true,
      data: {
        applicationStats,
        recommendedSkills,
        careerPaths,
        profileCompleteness: this.calculateProfileCompleteness(user.studentProfile),
        nextSteps: this.generateNextSteps(user.studentProfile, applicationStats)
      }
    });
  } catch (error) {
    console.error('Error getting user insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating user insights',
      error: error.message
    });
  }
});

// Helper methods
router.suggestCareerPaths = (skills, interests) => {
  const careerPaths = {
    'Frontend Developer': ['javascript', 'react', 'html', 'css', 'vue', 'angular'],
    'Backend Developer': ['node.js', 'python', 'java', 'sql', 'mongodb', 'express'],
    'Full Stack Developer': ['javascript', 'react', 'node.js', 'mongodb', 'sql'],
    'Data Scientist': ['python', 'sql', 'pandas', 'machine learning', 'statistics'],
    'UI/UX Designer': ['figma', 'sketch', 'photoshop', 'ui/ux', 'design'],
    'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'linux', 'jenkins'],
    'Mobile Developer': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android']
  };

  const skillsLower = skills.map(skill => skill.toLowerCase());
  const suggestions = [];

  Object.entries(careerPaths).forEach(([career, requiredSkills]) => {
    const matchingSkills = requiredSkills.filter(skill =>
      skillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );

    if (matchingSkills.length > 0) {
      const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
      const missingSkills = requiredSkills.filter(skill =>
        !skillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
      );

      suggestions.push({
        career,
        matchPercentage: Math.round(matchPercentage),
        matchingSkills,
        missingSkills,
        priority: matchPercentage > 50 ? 'high' : matchPercentage > 25 ? 'medium' : 'low'
      });
    }
  });

  return suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);
};

router.calculateProfileCompleteness = (profile) => {
  const fields = ['skills', 'interests', 'bio', 'university', 'degree', 'graduationYear'];
  const completedFields = fields.filter(field => profile[field] &&
    (Array.isArray(profile[field]) ? profile[field].length > 0 : profile[field].toString().trim() !== '')
  );

  return Math.round((completedFields.length / fields.length) * 100);
};

router.generateNextSteps = (profile, applicationStats) => {
  const steps = [];

  if (!profile.skills || profile.skills.length < 3) {
    steps.push('Add more skills to your profile to improve job matching');
  }

  if (!profile.bio || profile.bio.length < 50) {
    steps.push('Write a compelling bio to stand out to employers');
  }

  if (applicationStats.successRate < 20 && applicationStats.total > 5) {
    steps.push('Consider improving your application strategy or targeting different roles');
  }

  if (applicationStats.total === 0) {
    steps.push('Start applying to internships that match your skills and interests');
  }

  steps.push('Upload your resume for AI-powered analysis and suggestions');
  steps.push('Use the chatbot to get personalized career advice');

  return steps.slice(0, 5);
};

module.exports = router;
