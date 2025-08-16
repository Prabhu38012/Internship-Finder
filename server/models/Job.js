import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
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
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'project'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  deadline: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isPartTime: {
    type: Boolean,
    default: false
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'advanced'],
    default: 'entry'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  views: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

export default mongoose.model('Job', jobSchema);