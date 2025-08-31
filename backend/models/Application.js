const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
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
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  resume: {
    type: String,
    required: true
  },
  additionalDocuments: [{
    name: String,
    url: String,
    type: String
  }],
  answers: [{
    question: String,
    answer: String
  }],
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  interview: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    time: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical'],
      default: 'video'
    },
    link: String,
    location: String,
    notes: String,
    feedback: String,
    rating: Number
  },
  feedback: {
    rating: Number,
    comment: String,
    strengths: [String],
    improvements: [String]
  },
  withdrawalReason: String,
  rejectionReason: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Pre-save middleware to update timeline
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      date: new Date()
    });
  }
  next();
});

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = async function(companyId) {
  return await this.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to update status with timeline
applicationSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note: note,
    updatedBy: updatedBy
  });
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
