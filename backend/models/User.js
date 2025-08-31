const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  // Student specific fields
  studentProfile: {
    university: String,
    degree: String,
    graduationYear: Number,
    skills: [String],
    resume: String,
    portfolio: String,
    bio: String,
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      grade: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      link: String,
      github: String
    }]
  },
  // Company specific fields
  companyProfile: {
    companyName: String,
    industry: String,
    companySize: String,
    website: String,
    description: String,
    logo: String,
    verified: {
      type: Boolean,
      default: false
    },
    verificationDocument: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  // Preferences and settings
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  },
  // Activity tracking
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  savedInternships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship'
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ name: 'text', email: 'text', 'studentProfile.skills': 'text' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (remove sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.preferences;
  delete userObject.companyProfile?.verificationDocument;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
