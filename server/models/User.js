import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    bio: String,
    location: String,
    website: String,
    linkedIn: String,
    github: String
  },
  // Student-specific fields
  studentProfile: {
    university: String,
    degree: String,
    major: String,
    graduationYear: Number,
    gpa: Number,
    skills: [String],
    resume: String,
    portfolio: String,
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      gpa: Number
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      link: String,
      github: String
    }],
    preferences: {
      jobTypes: [String],
      locations: [String],
      salaryRange: {
        min: Number,
        max: Number
      },
      remoteWork: Boolean
    }
  },
  // Company-specific fields
  companyProfile: {
    companyName: String,
    industry: String,
    size: String,
    founded: Number,
    headquarters: String,
    description: String,
    logo: String,
    website: String,
    verified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [String],
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      totalReviews: {
        type: Number,
        default: 0
      }
    }
  },
  // Activity tracking
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);