const mongoose = require('mongoose');

const externalJobSchema = new mongoose.Schema({
    // Unique identifier from the source platform
    externalId: {
        type: String,
        required: true,
        unique: true
    },
    // Source platform
    source: {
        type: String,
        required: true,
        enum: ['LinkedIn', 'Indeed', 'Internshala', 'Google'],
        index: true
    },
    // Job details
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    // Location information
    location: {
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        type: {
            type: String,
            enum: ['remote', 'onsite', 'hybrid'],
            default: 'onsite'
        }
    },
    // Job type and category
    type: {
        type: String,
        enum: ['internship', 'project', 'full-time', 'part-time'],
        default: 'internship'
    },
    category: {
        type: String,
        default: 'Other'
    },
    // Duration and compensation
    duration: {
        type: String,
        default: 'Not specified'
    },
    stipend: {
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        period: {
            type: String,
            enum: ['month', 'monthly', 'week', 'weekly', 'total', 'hourly'],
            default: 'month'
        }
    },
    // Requirements
    requirements: {
        skills: [String],
        experience: String,
        education: String
    },
    // Application details
    applyUrl: {
        type: String,
        required: true
    },
    applicationDeadline: Date,
    // Dates
    postedDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    // Aggregation metadata
    lastSyncedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
externalJobSchema.index({ title: 'text', company: 'text', description: 'text' });
externalJobSchema.index({ source: 1, isActive: 1 });
externalJobSchema.index({ category: 1, 'location.type': 1 });
externalJobSchema.index({ postedDate: -1 });
externalJobSchema.index({ lastSyncedAt: 1 });

// TTL index - auto-delete after 30 days of not being updated
externalJobSchema.index({ lastSyncedAt: 1 }, {
    expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

// Static method to get active external jobs
externalJobSchema.statics.getActiveJobs = function (filters = {}) {
    const query = { isActive: true };

    if (filters.source) {
        query.source = filters.source;
    }
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.location) {
        query.$or = [
            { 'location.city': new RegExp(filters.location, 'i') },
            { 'location.state': new RegExp(filters.location, 'i') },
            { 'location.country': new RegExp(filters.location, 'i') }
        ];
    }
    if (filters.remote) {
        query['location.type'] = 'remote';
    }

    return this.find(query).sort({ postedDate: -1 });
};

// Static method to upsert jobs during aggregation
externalJobSchema.statics.upsertJob = async function (jobData) {
    return this.findOneAndUpdate(
        { externalId: jobData.externalId },
        {
            ...jobData,
            lastSyncedAt: new Date(),
            lastUpdated: new Date()
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );
};

// Static method to get aggregation statistics
externalJobSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 },
                avgStipend: { $avg: '$stipend.amount' }
            }
        }
    ]);

    const total = await this.countDocuments({ isActive: true });

    return {
        total,
        bySource: stats.reduce((acc, item) => {
            acc[item._id] = { count: item.count, avgStipend: Math.round(item.avgStipend || 0) };
            return acc;
        }, {})
    };
};

// Mark as external for frontend identification
externalJobSchema.virtual('isExternal').get(function () {
    return true;
});

// Ensure virtuals are included in JSON
externalJobSchema.set('toJSON', { virtuals: true });
externalJobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ExternalJob', externalJobSchema);
