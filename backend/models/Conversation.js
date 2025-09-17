const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'application'], // direct for general chat, application for internship-related
    default: 'direct'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: function() { return this.type === 'application'; }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    title: String,
    description: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ type: 1, applicationId: 1 });

// Virtual for participant count
conversationSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to check if user is participant
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to get other participant (for direct conversations)
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

module.exports = mongoose.model('Conversation', conversationSchema);
