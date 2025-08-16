import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'interview', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  portfolio: {
    type: String
  },
  additionalDocuments: [{
    name: String,
    url: String
  }],
  notes: {
    applicant: String,
    company: String
  },
  interview: {
    scheduled: Date,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
      default: 'video'
    },
    notes: String
  },
  feedback: {
    company: String,
    applicant: String
  },
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Ensure one application per job per applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);