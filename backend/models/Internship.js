const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide internship title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide internship description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'project', 'full-time', 'part-time'],
    default: 'internship'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Software Development',
      'Data Science',
      'Machine Learning',
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Digital Marketing',
      'Business Development',
      'Finance',
      'Human Resources',
      'Content Writing',
      'Graphic Design',
      'Sales',
      'Operations',
      'Research',
      'Other'
    ]
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite'
    },
    city: String,
    state: String,
    country: String,
    address: String
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly', 'total', 'hourly'],
      default: 'monthly'
    }
  },
  requirements: {
    skills: [String],
    experience: String,
    education: String,
    languages: [String]
  },
  responsibilities: [String],
  benefits: [String],
  applicationDeadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'expired'],
    default: 'active'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  maxApplications: {
    type: Number,
    default: 100
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
internshipSchema.index({ title: 'text', description: 'text', companyName: 'text', 'requirements.skills': 'text' });
internshipSchema.index({ category: 1, 'location.type': 1, status: 1 });
internshipSchema.index({ applicationDeadline: 1, startDate: 1 });
internshipSchema.index({ company: 1, status: 1 });
internshipSchema.index({ featured: -1, createdAt: -1 });

// Virtual for checking if internship is expired
internshipSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline < new Date();
});

// Pre-save middleware to update status if expired
internshipSchema.pre('save', function(next) {
  if (this.applicationDeadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Static method to get active internships
internshipSchema.statics.getActiveInternships = function() {
  return this.find({
    status: 'active',
    applicationDeadline: { $gte: new Date() }
  });
};

// Method to increment views
internshipSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Internship', internshipSchema);
