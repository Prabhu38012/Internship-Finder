const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { upload } = require('../middleware/upload');

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'name email avatar role')
    .populate('lastMessage')
    .populate('applicationId', 'internship status')
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Conversation.countDocuments({
      participants: req.user.id,
      isActive: true
    });

    res.json({
      success: true,
      data: conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get or create conversation
// @route   POST /api/messages/conversations
// @access  Private
router.post('/conversations', protect, async (req, res) => {
  try {
    const { participantId, type = 'direct', applicationId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
      type,
      ...(applicationId && { applicationId })
    }).populate('participants', 'name email avatar role');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user.id, participantId],
        type,
        ...(applicationId && { applicationId })
      });
      await conversation.save();
      await conversation.populate('participants', 'name email avatar role');
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({
      conversation: req.params.id,
      isDeleted: false
    })
    .populate('sender', 'name email avatar role')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversation: req.params.id,
      isDeleted: false
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: { readBy: { user: req.user.id } }
      }
    );

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Send a message
// @route   POST /api/messages/conversations/:id/messages
// @access  Private
router.post('/conversations/:id/messages', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachments required'
      });
    }

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    })) : [];

    // Create message
    const message = new Message({
      conversation: req.params.id,
      sender: req.user.id,
      content: content || '',
      messageType,
      attachments,
      ...(replyTo && { replyTo })
    });

    await message.save();
    await message.populate('sender', 'name email avatar role');

    // Update conversation last activity and message
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      // Send to all participants except sender
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== req.user.id) {
          io.to(`user_${participantId}`).emit('new_message', {
            conversationId: conversation._id,
            message
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const conversation = await Conversation.findById(message.conversation);
      conversation.participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('message_deleted', {
          messageId: message._id,
          conversationId: message.conversation
        });
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/messages/conversations/:id/read
// @access  Private
router.put('/conversations/:id/read', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !conversation.hasParticipant(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: { readBy: { user: req.user.id } }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      conversation: {
        $in: await Conversation.find({
          participants: req.user.id,
          isActive: true
        }).distinct('_id')
      },
      sender: { $ne: req.user.id },
      'readBy.user': { $ne: req.user.id },
      isDeleted: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
