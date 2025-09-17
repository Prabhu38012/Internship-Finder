const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Company Profile Details
  companyProfile: {
    logo: {
      type: String,
      default: null
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Manufacturing',
        'Retail',
        'Consulting',
        'Media & Entertainment',
        'Real Estate',
        'Transportation',
        'Energy',
        'Non-Profit',
        'Government',
        'Other'
      ]
    },
    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be after 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    linkedinUrl: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/company\/.+/, 'Please enter a valid LinkedIn company URL']
    },
    headquarters: {
      address: String,
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'India'
      },
      zipCode: String
    },
    additionalLocations: [{
      city: String,
      state: String,
      country: String
    }]
  },

  // Contact Information
  contactInfo: {
    hrName: {
      type: String,
      required: [true, 'HR contact name is required']
    },
    hrEmail: {
      type: String,
      required: [true, 'HR email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid HR email']
    },
    hrPhone: {
      type: String,
      required: [true, 'HR phone number is required'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    alternateContact: {
      name: String,
      email: String,
      phone: String,
      designation: String
    }
  },

  // Verification & Status
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'in_review', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationDocuments: [{
      documentType: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'incorporation_certificate', 'other']
      },
      documentUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
  },

  // Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_approval'],
    default: 'pending_approval'
  },

  // Subscription & Plan
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    planStartDate: Date,
    planEndDate: Date,
    maxInternshipPosts: {
      type: Number,
      default: 5 // Free plan limit
    },
    currentInternshipPosts: {
      type: Number,
      default: 0
    }
  },

  // Statistics
  stats: {
    totalInternshipsPosted: {
      type: Number,
      default: 0
    },
    activeInternships: {
      type: Number,
      default: 0
    },
    totalApplicationsReceived: {
      type: Number,
      default: 0
    },
    totalStudentsHired: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },

  // Social Media & Additional Info
  socialMedia: {
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String
  },

  // Company Culture & Benefits
  culture: {
    workEnvironment: {
      type: String,
      enum: ['startup', 'corporate', 'hybrid', 'remote_first', 'traditional']
    },
    benefits: [{
      type: String,
      enum: [
        'health_insurance',
        'flexible_hours',
        'remote_work',
        'learning_budget',
        'gym_membership',
        'free_meals',
        'transportation',
        'performance_bonus',
        'stock_options',
        'paid_time_off',
        'mentorship_program',
        'career_development'
      ]
    }],
    companyValues: [String],
    workCulture: String
  },

  // Preferences
  preferences: {
    preferredSkills: [String],
    preferredUniversities: [String],
    minimumCGPA: {
      type: Number,
      min: 0,
      max: 10
    },
    preferredCourses: [String]
  },

  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    loginTime: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],

  // Notifications
  notificationSettings: {
    emailNotifications: {
      newApplications: {
        type: Boolean,
        default: true
      },
      applicationUpdates: {
        type: Boolean,
        default: true
      },
      systemUpdates: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      }
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
companySchema.index({ companyEmail: 1 });
companySchema.index({ 'companyProfile.industry': 1 });
companySchema.index({ 'verification.isVerified': 1 });
companySchema.index({ accountStatus: 1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ 'companyProfile.headquarters.city': 1 });

// Virtual for company age
companySchema.virtual('companyAge').get(function() {
  if (this.companyProfile.foundedYear) {
    return new Date().getFullYear() - this.companyProfile.foundedYear;
  }
  return null;
});

// Virtual for subscription status
companySchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.planEndDate) return 'active';
  return new Date() <= this.subscription.planEndDate ? 'active' : 'expired';
});

// Pre-save middleware to hash password
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
companySchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
companySchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to check if company can post internship
companySchema.methods.canPostInternship = function() {
  return this.subscription.currentInternshipPosts < this.subscription.maxInternshipPosts;
};

// Method to increment internship count
companySchema.methods.incrementInternshipCount = function() {
  this.subscription.currentInternshipPosts += 1;
  this.stats.totalInternshipsPosted += 1;
  this.stats.activeInternships += 1;
  return this.save();
};

// Static method to find verified companies
companySchema.statics.findVerified = function() {
  return this.find({ 'verification.isVerified': true, accountStatus: 'active' });
};

// Static method to get company statistics
companySchema.statics.getCompanyStats = async function(companyId) {
  const Internship = mongoose.model('Internship');
  const Application = mongoose.model('Application');
  
  const [internshipStats, applicationStats] = await Promise.all([
    Internship.aggregate([
      { $match: { company: mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]),
    Application.aggregate([
      {
        $lookup: {
          from: 'internships',
          localField: 'internship',
          foreignField: '_id',
          as: 'internshipData'
        }
      },
      { $unwind: '$internshipData' },
      { $match: { 'internshipData.company': mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);
  
  return {
    internships: internshipStats[0] || { total: 0, active: 0, closed: 0 },
    applications: applicationStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {})
  };
};

module.exports = mongoose.model('Company', companySchema);
