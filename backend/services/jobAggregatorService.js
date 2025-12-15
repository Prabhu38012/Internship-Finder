const cron = require('node-cron');
const ExternalJob = require('../models/ExternalJob');
const ExternalAPIService = require('./externalAPIs');

class JobAggregatorService {
    constructor() {
        this.externalAPIService = new ExternalAPIService();
        this.isRunning = false;
        this.lastSyncTime = null;
        this.syncStats = {
            totalSynced: 0,
            bySource: {},
            errors: []
        };
    }

    /**
     * Initialize the daily scheduler
     * Runs at 2:00 AM IST every day
     */
    initializeScheduler() {
        // Schedule for 2:00 AM IST (8:30 PM UTC previous day)
        cron.schedule('30 20 * * *', async () => {
            console.log('📅 [JobAggregator] Starting scheduled daily sync...');
            await this.syncAllPlatforms();
        }, {
            timezone: 'Asia/Kolkata'
        });

        console.log('✅ [JobAggregator] Daily scheduler initialized (runs at 2:00 AM IST)');

        // Also run initial sync on startup (with delay to allow server to fully start)
        setTimeout(() => {
            console.log('🚀 [JobAggregator] Running initial sync on startup...');
            this.syncAllPlatforms().catch(err => {
                console.error('❌ [JobAggregator] Initial sync failed:', err.message);
            });
        }, 10000); // 10 second delay
    }

    /**
     * Sync internships from all platforms
     */
    async syncAllPlatforms(searchQueries = ['software development', 'web development', 'data science', 'marketing', 'design']) {
        if (this.isRunning) {
            console.log('⚠️ [JobAggregator] Sync already in progress, skipping...');
            return { success: false, message: 'Sync already in progress' };
        }

        this.isRunning = true;
        this.syncStats = {
            totalSynced: 0,
            bySource: { LinkedIn: 0, Indeed: 0, Internshala: 0, Google: 0 },
            errors: [],
            startTime: new Date()
        };

        try {
            console.log('🔄 [JobAggregator] Starting aggregation from all platforms...');

            for (const query of searchQueries) {
                try {
                    console.log(`📥 [JobAggregator] Fetching: "${query}"...`);

                    const internships = await this.externalAPIService.searchAllPlatforms(query, {});

                    for (const internship of internships) {
                        try {
                            await this.upsertInternship(internship);
                            this.syncStats.totalSynced++;
                            this.syncStats.bySource[internship.source] = (this.syncStats.bySource[internship.source] || 0) + 1;
                        } catch (upsertError) {
                            this.syncStats.errors.push({
                                source: internship.source,
                                title: internship.title,
                                error: upsertError.message
                            });
                        }
                    }

                    // Delay between queries to avoid rate limiting
                    await this.delay(2000);
                } catch (queryError) {
                    console.error(`❌ [JobAggregator] Error fetching "${query}":`, queryError.message);
                    this.syncStats.errors.push({
                        query,
                        error: queryError.message
                    });
                }
            }

            this.lastSyncTime = new Date();
            this.syncStats.endTime = new Date();
            this.syncStats.duration = this.syncStats.endTime - this.syncStats.startTime;

            console.log('✅ [JobAggregator] Sync completed!');
            console.log(`   📊 Total synced: ${this.syncStats.totalSynced}`);
            console.log(`   📊 By source:`, this.syncStats.bySource);
            console.log(`   ⏱️ Duration: ${Math.round(this.syncStats.duration / 1000)}s`);

            if (this.syncStats.errors.length > 0) {
                console.log(`   ⚠️ Errors: ${this.syncStats.errors.length}`);
            }

            return {
                success: true,
                stats: this.syncStats
            };
        } catch (error) {
            console.error('❌ [JobAggregator] Sync failed:', error.message);
            this.syncStats.errors.push({ general: error.message });
            return {
                success: false,
                error: error.message,
                stats: this.syncStats
            };
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Upsert a single internship into the database
     */
    async upsertInternship(internship) {
        const externalId = internship.id || `${internship.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const jobData = {
            externalId,
            source: internship.source,
            title: internship.title,
            company: internship.company,
            companyLogo: internship.companyLogo,
            description: internship.description || `${internship.title} at ${internship.company}`,
            location: {
                city: internship.location?.city || 'India',
                state: internship.location?.state || '',
                country: internship.location?.country || 'India',
                type: internship.location?.type || 'onsite'
            },
            type: internship.type || 'internship',
            category: this.categorizeInternship(internship.title, internship.description),
            duration: internship.duration || 'Not specified',
            stipend: {
                amount: internship.stipend?.amount || 0,
                currency: internship.stipend?.currency || 'INR',
                period: internship.stipend?.period || 'month'
            },
            requirements: {
                skills: internship.requirements?.skills || internship.skills || []
            },
            applyUrl: internship.applyUrl || internship.url,
            postedDate: internship.postedDate || new Date(),
            isActive: true
        };

        return ExternalJob.upsertJob(jobData);
    }

    /**
     * Auto-categorize internship based on title and description
     */
    categorizeInternship(title, description) {
        const text = `${title} ${description}`.toLowerCase();

        const categories = {
            'Software Development': ['software', 'developer', 'engineer', 'programming', 'backend', 'frontend', 'full stack'],
            'Web Development': ['web', 'html', 'css', 'javascript', 'react', 'angular', 'vue', 'node'],
            'Mobile Development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'app development'],
            'Data Science': ['data science', 'data analyst', 'analytics', 'data engineer', 'big data'],
            'Machine Learning': ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'nlp'],
            'UI/UX Design': ['ui', 'ux', 'design', 'figma', 'sketch', 'user interface', 'user experience'],
            'Digital Marketing': ['marketing', 'digital marketing', 'seo', 'social media', 'content marketing'],
            'Business Development': ['business development', 'sales', 'bd', 'client relations'],
            'Finance': ['finance', 'accounting', 'financial', 'investment', 'banking'],
            'Human Resources': ['hr', 'human resources', 'recruitment', 'talent'],
            'Content Writing': ['content', 'writing', 'copywriting', 'blog', 'editorial'],
            'Graphic Design': ['graphic design', 'photoshop', 'illustrator', 'visual design'],
            'Research': ['research', 'r&d', 'researcher']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }

        return 'Other';
    }

    /**
     * Get current sync status and statistics
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSyncTime: this.lastSyncTime,
            lastSyncStats: this.syncStats,
            apiHealth: this.externalAPIService.getAPIHealth()
        };
    }

    /**
     * Get stored external jobs with filters
     */
    async getExternalJobs(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const query = { isActive: true };

        if (filters.source) {
            query.source = filters.source;
        }
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        if (filters.location) {
            query.$or = [
                { 'location.city': new RegExp(filters.location, 'i') },
                { 'location.state': new RegExp(filters.location, 'i') },
                { 'location.country': new RegExp(filters.location, 'i') }
            ];
        }
        if (filters.remote === true || filters.remote === 'true') {
            query['location.type'] = 'remote';
        }

        const [jobs, total] = await Promise.all([
            ExternalJob.find(query)
                .sort({ postedDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ExternalJob.countDocuments(query)
        ]);

        // Add isExternal flag for consistency
        const jobsWithFlag = jobs.map(job => ({
            ...job,
            isExternal: true
        }));

        return {
            data: jobsWithFlag,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get aggregation statistics
     */
    async getStats() {
        return ExternalJob.getStats();
    }

    /**
     * Helper delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
module.exports = new JobAggregatorService();
