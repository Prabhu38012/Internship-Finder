const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [String],
  reminderDate: Date,
  applicationStatus: {
    type: String,
    enum: ['not_applied', 'planning_to_apply', 'applied', 'no_longer_interested'],
    default: 'not_applied'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['interested', 'backup', 'dream_job', 'applied', 'rejected'],
    default: 'interested'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-internship pairs
wishlistSchema.index({ user: 1, internship: 1 }, { unique: true });

// Index for efficient queries
wishlistSchema.index({ user: 1, isActive: 1, priority: -1 });
wishlistSchema.index({ user: 1, category: 1, createdAt: -1 });
wishlistSchema.index({ reminderDate: 1, isActive: 1 });

// Static method to get user's wishlist with filters
wishlistSchema.statics.getUserWishlist = function(userId, filters = {}) {
  const query = { user: userId, isActive: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.applicationStatus) query.applicationStatus = filters.applicationStatus;
  
  return this.find(query)
    .populate('internship', 'title company companyName category location stipend applicationDeadline status')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get wishlist statistics
wishlistSchema.statics.getWishlistStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byCategory: {
          $push: {
            category: '$category',
            priority: '$priority'
          }
        },
        byPriority: {
          $push: '$priority'
        }
      }
    }
  ]);

  if (!stats.length) {
    return {
      total: 0,
      byCategory: {},
      byPriority: { high: 0, medium: 0, low: 0 }
    };
  }

  const result = stats[0];
  const categoryStats = {};
  const priorityStats = { high: 0, medium: 0, low: 0 };

  result.byCategory.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  result.byPriority.forEach(priority => {
    priorityStats[priority] = (priorityStats[priority] || 0) + 1;
  });

  return {
    total: result.total,
    byCategory: categoryStats,
    byPriority: priorityStats
  };
};

// Method to check if reminder is due
wishlistSchema.methods.isReminderDue = function() {
  return this.reminderDate && this.reminderDate <= new Date() && this.isActive;
};

// Method to update application status
wishlistSchema.methods.updateApplicationStatus = function(status) {
  this.applicationStatus = status;
  if (status === 'applied') {
    this.category = 'applied';
  }
  return this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
