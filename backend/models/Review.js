const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    workEnvironment: {
      type: Number,
      min: 1,
      max: 5
    },
    mentorship: {
      type: Number,
      min: 1,
      max: 5
    },
    learningOpportunity: {
      type: Number,
      min: 1,
      max: 5
    },
    compensation: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  pros: [String],
  cons: [String],
  advice: {
    type: String,
    maxlength: 500
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    reasons: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ internship: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ company: 1, status: 1 });
reviewSchema.index({ 'rating.overall': -1, createdAt: -1 });

// Method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
