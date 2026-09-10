const OpenAI = require('openai');
const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');
const keywordExtractor = require('keyword-extractor');
const NodeCache = require('node-cache');

// Initialize AI client (Configured for Groq LPU inference, with OpenAI fallback)
const isGroq = Boolean(process.env.GROQ_API_KEY) || !process.env.OPENAI_API_KEY;
const aiApiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '';

const aiClient = new OpenAI({
  apiKey: aiApiKey || 'dummy_key',
  baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined,
});

const AI_MODEL = isGroq ? (process.env.GROQ_MODEL || 'qwen/qwen3.8-27b') : 'gpt-3.5-turbo';

// Cache for AI responses (1 hour TTL)
const aiCache = new NodeCache({ stdTTL: 3600 });

class AIService {
  constructor() {
    this.tokenizer = natural.WordTokenizer;
    this.stemmer = natural.PorterStemmer;
    this.sentimentAnalyzer = new sentiment();
    this.tfidf = new natural.TfIdf();
  }

  // 1. Smart Job Matching - AI-powered recommendation engine
  async getJobRecommendations(userProfile, internships, limit = 10) {
    try {
      const cacheKey = `recommendations_${userProfile._id}_${limit}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;

      const userSkills = userProfile.studentProfile?.skills || [];
      const userInterests = userProfile.studentProfile?.interests || [];
      const userBio = userProfile.studentProfile?.bio || '';

      // Score each internship
      const scoredInternships = internships.map(internship => {
        const internshipSkills = internship.requirements?.skills || internship.skills || [];
        const skillMatch = this.calculateSkillMatch(userSkills, internshipSkills);
        const categoryMatch = this.calculateCategoryMatch(userInterests, internship.category);
        const locationPreference = this.calculateLocationPreference(userProfile, internship);
        const experienceMatch = this.calculateExperienceMatch(userProfile, internship);
        
        const finalScore = (skillMatch * 0.4) + (categoryMatch * 0.25) + (experienceMatch * 0.25) + (locationPreference * 0.1);
        
        return {
          internship,
          score: finalScore,
          reasons: this.generateRecommendationReasons(skillMatch, categoryMatch, experienceMatch, internship)
        };
      });

      const recommendations = scoredInternships
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      aiCache.set(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error in getJobRecommendations:', error);
      throw error;
    }
  }

  // 2. Resume Analysis - Automatic skill extraction and matching
  async analyzeResume(resumeText) {
    try {
      const cacheKey = `resume_analysis_${Buffer.from(resumeText).toString('base64').slice(0, 50)}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;

      const extractedSkills = this.extractSkills(resumeText);
      const experienceLevel = this.extractExperienceLevel(resumeText);
      const education = this.extractEducation(resumeText);
      const projects = this.extractProjects(resumeText);
      const sentimentScore = this.sentimentAnalyzer.analyze(resumeText);
      
      const suggestions = await this.generateResumeSuggestions(resumeText);
      
      const analysis = {
        skills: extractedSkills,
        experienceLevel,
        education,
        projects,
        sentiment: {
          score: sentimentScore.score,
          comparative: sentimentScore.comparative,
          tokens: sentimentScore.tokens.length
        },
        suggestions,
        overallScore: this.calculateResumeScore(extractedSkills, experienceLevel, education, projects)
      };

      aiCache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error in analyzeResume:', error);
      throw error;
    }
  }

  // 3. Chatbot Assistant - Help students find relevant internships
  async getChatbotResponse(message, userContext = {}, conversationHistory = []) {
    try {
      const intent = this.analyzeIntent(message);
      
      // Build rich system prompt with platform awareness
      const systemPrompt = this.buildSystemPrompt(userContext, intent);
      
      // Build conversation messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.formatConversationHistory(conversationHistory),
        { role: 'user', content: message }
      ];

      let response;
      try {
        if (!aiApiKey) {
          throw new Error('No GROQ_API_KEY configured');
        }

        const completion = await aiClient.chat.completions.create({
          model: AI_MODEL,
          messages,
          max_tokens: 500,
          temperature: 0.7,
        });
        
        const aiReply = completion.choices[0].message.content;
        
        response = {
          message: aiReply,
          type: intent.type,
          confidence: intent.confidence,
          suggestions: this.generateContextualSuggestions(intent, userContext),
          actions: this.generateProactiveActions(intent, userContext),
          guidance: this.generateUserGuidance(userContext)
        };
      } catch (apiError) {
        console.warn('AI API error, using enhanced fallback:', apiError.message);
        response = this.getEnhancedFallbackResponse(intent, message, userContext);
      }

      return response;
    } catch (error) {
      console.error('Error in getChatbotResponse:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        type: 'error',
        suggestions: ['Try rephrasing your question', 'Contact support if the issue persists'],
        actions: [],
        guidance: null
      };
    }
  }

  // Build comprehensive system prompt for ChatGPT
  buildSystemPrompt(userContext, intent) {
    const profileSummary = userContext.skills?.length > 0
      ? `Their skills include: ${userContext.skills.join(', ')}.`
      : 'They have not added skills to their profile yet.';

    const interestSummary = userContext.interests?.length > 0
      ? `Their interests are: ${userContext.interests.join(', ')}.`
      : 'They have not specified interests yet.';

    const applicationSummary = userContext.applicationStats
      ? `They have submitted ${userContext.applicationStats.total} applications (${userContext.applicationStats.accepted} accepted, ${userContext.applicationStats.pending} pending, ${userContext.applicationStats.rejected} rejected).`
      : 'No application history available yet.';

    const profileComplete = userContext.profileCompleteness
      ? `Profile completeness: ${userContext.profileCompleteness}%.`
      : '';

    return `You are InternQuest AI Assistant — an expert career coach and internship advisor built into the InternQuest platform. Your role is to provide accurate, actionable, and personalized guidance.

PLATFORM FEATURES (guide users to these):
- Browse Internships: Search and filter live internship listings
- AI Recommendations: Smart job matching based on user skills and interests
- Resume Analyzer: Upload resume for AI-powered skill extraction and scoring
- Success Predictor: Predict application success probability for any internship
- Market Insights: View in-demand skills, top categories, and salary trends
- Application Tracker: Track all submitted applications and their statuses
- Wishlist: Save internships for later review
- Messaging: Direct communication with companies
- Profile: Manage skills, bio, education, and experience

USER CONTEXT:
- Role: ${userContext.role || 'student'}
- Experience Level: ${userContext.experienceLevel || 'entry'}
- ${profileSummary}
- ${interestSummary}
- ${applicationSummary}
- ${profileComplete}

INSTRUCTIONS:
1. Always give specific, actionable advice — never vague platitudes
2. Proactively suggest relevant platform features the user should try
3. If the user's profile is incomplete, encourage them to complete it with specific steps
4. Reference the user's actual skills and interests when giving advice
5. When discussing internships, mention using the AI Recommendations or Browse features
6. For resume questions, mention the Resume Analyzer tool
7. Keep responses concise but thorough (2-4 paragraphs max)
8. Use bullet points and clear formatting for step-by-step instructions
9. End responses with a clear next step or call-to-action
10. If you detect the user is confused or new, provide a guided walkthrough of the platform`;
  }

  // Format conversation history for multi-turn context
  formatConversationHistory(history) {
    if (!history || !Array.isArray(history)) return [];
    // Keep last 10 messages for context window management
    return history.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }

  // Generate context-aware suggestion chips
  generateContextualSuggestions(intent, userContext) {
    const baseSuggestions = {
      job_search: [
        'Show me remote internships',
        'What roles match my skills?',
        'How do I use AI Recommendations?'
      ],
      career_advice: [
        'What skills are in demand right now?',
        'Suggest a career path for me',
        'How to transition into tech?'
      ],
      application_help: [
        'Analyze my resume',
        'Predict my success for an internship',
        'How to write a cover letter?'
      ],
      skill_development: [
        'What skills should I learn next?',
        'Show me Market Insights',
        'How to build a portfolio?'
      ],
      platform_help: [
        'How do I apply for internships?',
        'How to use AI Recommendations?',
        'How to message a company?'
      ],
      interview_prep: [
        'Common technical interview questions',
        'How to prepare for behavioral interviews?',
        'Tips for virtual interviews'
      ],
      general: [
        'Find internships for my skills',
        'Analyze my resume',
        'What skills are trending?',
        'Guide me through the platform'
      ]
    };

    const suggestions = baseSuggestions[intent.type] || baseSuggestions.general;

    // Add profile-specific suggestions
    if (!userContext.skills || userContext.skills.length === 0) {
      suggestions.unshift('Help me add skills to my profile');
    }
    if (userContext.profileCompleteness && userContext.profileCompleteness < 60) {
      suggestions.unshift('How to complete my profile?');
    }

    return suggestions.slice(0, 4);
  }

  // Generate proactive action buttons (navigable)
  generateProactiveActions(intent, userContext) {
    const actions = [];

    if (intent.type === 'job_search') {
      actions.push({ label: 'Browse Internships', route: '/internships', icon: 'search' });
      actions.push({ label: 'AI Recommendations', route: '/ai', icon: 'auto_awesome' });
    }
    if (intent.type === 'application_help') {
      actions.push({ label: 'Resume Analyzer', route: '/ai?tab=1', icon: 'assessment' });
      actions.push({ label: 'My Applications', route: '/applications', icon: 'description' });
    }
    if (intent.type === 'skill_development') {
      actions.push({ label: 'Market Insights', route: '/ai?tab=3', icon: 'trending_up' });
      actions.push({ label: 'Update Skills', route: '/profile', icon: 'edit' });
    }
    if (intent.type === 'career_advice') {
      actions.push({ label: 'Success Predictor', route: '/ai?tab=2', icon: 'psychology' });
      actions.push({ label: 'AI Recommendations', route: '/ai', icon: 'auto_awesome' });
    }
    if (!userContext.skills || userContext.skills.length === 0) {
      actions.push({ label: 'Complete Profile', route: '/profile', icon: 'person' });
    }

    return actions.slice(0, 3);
  }

  // Generate proactive guidance based on user state
  generateUserGuidance(userContext) {
    const tips = [];

    if (!userContext.skills || userContext.skills.length === 0) {
      tips.push({
        priority: 'high',
        message: 'Add your skills to your profile — this powers our AI matching and helps you get better recommendations.',
        action: { label: 'Go to Profile', route: '/profile' }
      });
    }

    if (userContext.profileCompleteness && userContext.profileCompleteness < 50) {
      tips.push({
        priority: 'high',
        message: `Your profile is only ${userContext.profileCompleteness}% complete. A complete profile significantly increases your visibility to employers.`,
        action: { label: 'Complete Profile', route: '/profile' }
      });
    }

    if (userContext.applicationStats && userContext.applicationStats.total === 0) {
      tips.push({
        priority: 'medium',
        message: "You haven't applied to any internships yet. Use AI Recommendations to find the best matches for your skills!",
        action: { label: 'View Recommendations', route: '/ai' }
      });
    }

    if (userContext.applicationStats && userContext.applicationStats.total > 5 && userContext.applicationStats.successRate < 20) {
      tips.push({
        priority: 'medium',
        message: 'Your application success rate could be improved. Try using the Resume Analyzer to optimize your resume.',
        action: { label: 'Analyze Resume', route: '/ai?tab=1' }
      });
    }

    return tips.length > 0 ? tips[0] : null;
  }

  // Enhanced fallback when OpenAI API is unavailable
  getEnhancedFallbackResponse(intent, message, userContext) {
    const skillsText = userContext.skills?.length > 0
      ? `Based on your skills (${userContext.skills.slice(0, 5).join(', ')}), `
      : '';

    const fallbacks = {
      job_search: {
        message: `${skillsText}here are steps to find the best internships for you:\n\n` +
          `1. **Use AI Recommendations** — Go to the AI Dashboard for smart matches based on your profile\n` +
          `2. **Browse & Filter** — Search internships by category, location, or skills\n` +
          `3. **Check Success Predictor** — Before applying, see your match probability\n` +
          `4. **Save to Wishlist** — Bookmark interesting positions to review later\n\n` +
          `Would you like me to help refine your search?`,
        type: 'job_search',
        suggestions: ['Show remote internships', 'Roles matching my skills', 'How to use AI Recommendations?'],
        actions: [
          { label: 'AI Recommendations', route: '/ai', icon: 'auto_awesome' },
          { label: 'Browse Internships', route: '/internships', icon: 'search' }
        ]
      },
      career_advice: {
        message: `${skillsText}here's a career development roadmap:\n\n` +
          `1. **Assess Your Skills** — Upload your resume to the Resume Analyzer for a detailed skill breakdown\n` +
          `2. **Explore Market Insights** — See which skills are most in-demand right now\n` +
          `3. **Identify Gaps** — Compare your skills against trending requirements\n` +
          `4. **Build Experience** — Apply to internships that develop your target skills\n\n` +
          `The Market Insights tab has real-time data on skill demand and salary trends.`,
        type: 'career_advice',
        suggestions: ['What skills are trending?', 'Analyze my resume', 'Recommend a career path'],
        actions: [
          { label: 'Market Insights', route: '/ai?tab=3', icon: 'trending_up' },
          { label: 'Resume Analyzer', route: '/ai?tab=1', icon: 'assessment' }
        ]
      },
      application_help: {
        message: `Here's how to strengthen your applications:\n\n` +
          `1. **Analyze Your Resume** — Use our Resume Analyzer to get an AI-powered score and specific improvement tips\n` +
          `2. **Check Success Probability** — The Success Predictor shows how well you match each role\n` +
          `3. **Tailor Each Application** — Customize your resume keywords to match the job requirements\n` +
          `4. **Track Progress** — Monitor all your applications in the Applications dashboard\n\n` +
          `Start by uploading your resume for a detailed analysis!`,
        type: 'application_help',
        suggestions: ['Analyze my resume', 'Track my applications', 'Interview tips'],
        actions: [
          { label: 'Resume Analyzer', route: '/ai?tab=1', icon: 'assessment' },
          { label: 'My Applications', route: '/applications', icon: 'description' }
        ]
      },
      skill_development: {
        message: `${skillsText}here's how to level up your skills:\n\n` +
          `1. **Check Market Insights** — See which skills are most in-demand in your target field\n` +
          `2. **Identify Skill Gaps** — Compare your current skills with top job requirements\n` +
          `3. **Learn Strategically** — Focus on high-demand skills that align with your interests\n` +
          `4. **Build Projects** — Apply new skills through hands-on projects for your portfolio\n\n` +
          `Visit the Market Insights tab for real-time skill demand data!`,
        type: 'skill_development',
        suggestions: ['In-demand skills', 'Skill gap analysis', 'Learning resources'],
        actions: [
          { label: 'Market Insights', route: '/ai?tab=3', icon: 'trending_up' },
          { label: 'Update Skills', route: '/profile', icon: 'edit' }
        ]
      },
      platform_help: {
        message: `Welcome to InternQuest! Here's a quick guide:\n\n` +
          `1. **Complete Your Profile** — Add skills, education, and bio for better AI matching\n` +
          `2. **Browse Internships** — Search and filter available positions\n` +
          `3. **AI Dashboard** — Get smart recommendations, analyze your resume, and predict success\n` +
          `4. **Apply** — Submit applications directly and track their status\n` +
          `5. **Message Companies** — Communicate directly with employers\n\n` +
          `Start by completing your profile, then check out AI Recommendations!`,
        type: 'platform_help',
        suggestions: ['How to apply?', 'Set up my profile', 'Use AI features'],
        actions: [
          { label: 'Complete Profile', route: '/profile', icon: 'person' },
          { label: 'AI Dashboard', route: '/ai', icon: 'auto_awesome' }
        ]
      },
      interview_prep: {
        message: `Here's how to prepare for your internship interviews:\n\n` +
          `1. **Research the Company** — Study their mission, products, and recent news\n` +
          `2. **Review Common Questions** — Prepare for behavioral (STAR method) and technical questions\n` +
          `3. **Practice Your Pitch** — Prepare a 60-second elevator pitch about your background\n` +
          `4. **Prepare Questions** — Have 3-5 thoughtful questions ready for the interviewer\n` +
          `5. **Technical Prep** — For tech roles, practice coding problems and system design\n\n` +
          `Check the Success Predictor to see which areas to focus on before your interview!`,
        type: 'interview_prep',
        suggestions: ['Common interview questions', 'STAR method examples', 'Technical prep tips'],
        actions: [
          { label: 'Success Predictor', route: '/ai?tab=2', icon: 'psychology' }
        ]
      },
      general: {
        message: `I'm your InternQuest AI Career Assistant! Here's what I can help you with:\n\n` +
          `🔍 **Find Internships** — Search roles matching your skills and interests\n` +
          `📄 **Resume Help** — Get AI analysis and improvement suggestions\n` +
          `📊 **Career Insights** — Explore in-demand skills and market trends\n` +
          `🎯 **Application Strategy** — Predict success and optimize applications\n` +
          `💡 **Career Advice** — Get personalized guidance for your career path\n\n` +
          `Just type your question or pick a suggestion below!`,
        type: 'general',
        suggestions: ['Find internships for me', 'Analyze my resume', 'What skills should I learn?', 'Guide me through the platform'],
        actions: [
          { label: 'AI Dashboard', route: '/ai', icon: 'auto_awesome' },
          { label: 'Browse Internships', route: '/internships', icon: 'search' }
        ]
      }
    };

    const fallback = fallbacks[intent.type] || fallbacks.general;
    fallback.confidence = intent.confidence;
    fallback.guidance = this.generateUserGuidance(userContext);
    return fallback;
  }

  // 4. Predictive Analytics - Success rate predictions for applications
  async predictApplicationSuccess(userProfile, internship, historicalData = []) {
    try {
      const cacheKey = `prediction_${userProfile._id}_${internship._id}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;

      const baseSuccessRate = this.calculateBaseSuccessRate(historicalData, internship);
      const skillMatchScore = this.calculateSkillMatch(
        userProfile.studentProfile?.skills || [],
        internship.requirements.skills
      );
      const experienceScore = this.calculateExperienceRelevance(userProfile, internship);
      const educationScore = this.calculateEducationMatch(userProfile, internship);
      const timingScore = this.calculateApplicationTiming(internship);
      const competitionScore = this.calculateCompetitionLevel(internship);
      
      const successProbability = (
        baseSuccessRate * 0.2 +
        skillMatchScore * 0.25 +
        experienceScore * 0.2 +
        educationScore * 0.15 +
        timingScore * 0.1 +
        competitionScore * 0.1
      );
      
      const prediction = {
        successProbability: Math.min(Math.max(successProbability, 0), 1),
        confidence: this.calculatePredictionConfidence(skillMatchScore, experienceScore, educationScore),
        factors: {
          skillMatch: skillMatchScore,
          experience: experienceScore,
          education: educationScore,
          timing: timingScore,
          competition: competitionScore
        },
        recommendations: this.generateApplicationRecommendations(successProbability, skillMatchScore, experienceScore)
      };

      aiCache.set(cacheKey, prediction);
      return prediction;
    } catch (error) {
      console.error('Error in predictApplicationSuccess:', error);
      throw error;
    }
  }

  // 5. Auto-tagging - Intelligent categorization of internships
  async autoTagInternship(internshipData) {
    try {
      const cacheKey = `autotag_${Buffer.from(JSON.stringify(internshipData)).toString('base64').slice(0, 50)}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;

      const { title, description, requirements, responsibilities } = internshipData;
      const fullText = `${title} ${description} ${requirements.skills?.join(' ') || ''} ${responsibilities?.join(' ') || ''}`;

      const keywords = keywordExtractor.extract(fullText, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });

      const categories = this.categorizeInternship(fullText, keywords);
      const skillTags = this.extractSkillTags(fullText);
      const industryTags = this.extractIndustryTags(fullText);
      const levelTags = this.extractLevelTags(fullText);
      const locationTags = this.extractLocationTags(internshipData);
      const aiTags = await this.generateAITags(fullText);

      const tags = {
        categories,
        skills: skillTags,
        industries: industryTags,
        levels: levelTags,
        location: locationTags,
        ai_generated: aiTags,
        keywords: keywords.slice(0, 20),
        confidence: this.calculateTaggingConfidence(categories, skillTags, industryTags)
      };

      aiCache.set(cacheKey, tags);
      return tags;
    } catch (error) {
      console.error('Error in autoTagInternship:', error);
      throw error;
    }
  }

  // Helper methods
  calculateSkillMatch(userSkills, requiredSkills) {
    if (!userSkills.length || !requiredSkills.length) return 0;
    
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(skill => skill.toLowerCase());
    
    const matches = userSkillsLower.filter(skill => 
      requiredSkillsLower.some(required => 
        required.includes(skill) || skill.includes(required)
      )
    );
    
    return matches.length / requiredSkills.length;
  }

  calculateCategoryMatch(userInterests, internshipCategory) {
    if (!userInterests.length) return 0.5;
    
    const categoryLower = internshipCategory.toLowerCase();
    const matches = userInterests.filter(interest => 
      categoryLower.includes(interest.toLowerCase()) || 
      interest.toLowerCase().includes(categoryLower)
    );
    
    return matches.length > 0 ? 1 : 0.3;
  }

  calculateLocationPreference(userProfile, internship) {
    if (internship.location.type === 'remote') return 0.8;
    if (internship.location.type === 'hybrid') return 0.6;
    return 0.4;
  }

  calculateExperienceMatch(userProfile, internship) {
    const userExp = userProfile.studentProfile?.experienceLevel || 'entry';
    const requiredExp = internship.requirements?.experience || 'entry level';
    
    const expLevels = { 'entry': 0, 'junior': 1, 'mid': 2, 'senior': 3 };
    const userLevel = expLevels[userExp] || 0;
    const requiredLevel = requiredExp.toLowerCase().includes('senior') ? 3 :
                         requiredExp.toLowerCase().includes('mid') ? 2 :
                         requiredExp.toLowerCase().includes('junior') ? 1 : 0;
    
    const diff = Math.abs(userLevel - requiredLevel);
    return Math.max(0, 1 - (diff * 0.3));
  }

  generateRecommendationReasons(skillMatch, categoryMatch, experienceMatch, internship) {
    const reasons = [];
    
    if (skillMatch > 0.7) reasons.push(`Strong skill match (${Math.round(skillMatch * 100)}%)`);
    if (categoryMatch > 0.8) reasons.push('Matches your interests');
    if (experienceMatch > 0.8) reasons.push('Perfect experience level');
    if (internship.location.type === 'remote') reasons.push('Remote work opportunity');
    if (internship.stipend && internship.stipend.amount > 2000) reasons.push('Competitive stipend');
    
    return reasons;
  }

  extractSkills(resumeText) {
    const skillCategories = {
      programming: ['javascript', 'python', 'java', 'c++', 'react', 'node.js', 'angular', 'vue', 'typescript'],
      databases: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
      cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      design: ['figma', 'sketch', 'photoshop', 'ui/ux'],
      analytics: ['tableau', 'power bi', 'excel', 'sql', 'pandas']
    };
    
    const extractedSkills = {};
    const textLower = resumeText.toLowerCase();
    
    Object.keys(skillCategories).forEach(category => {
      extractedSkills[category] = skillCategories[category].filter(skill => 
        textLower.includes(skill.toLowerCase())
      );
    });
    
    return extractedSkills;
  }

  extractExperienceLevel(resumeText) {
    const textLower = resumeText.toLowerCase();
    
    if (textLower.includes('senior') || textLower.includes('lead')) return 'senior';
    if (textLower.includes('junior') || textLower.includes('associate')) return 'junior';
    if (textLower.includes('intern') || textLower.includes('student')) return 'entry';
    
    const yearMatches = textLower.match(/(\d+)\s*years?\s*(of\s*)?(experience|exp)/g);
    if (yearMatches) {
      const years = Math.max(...yearMatches.map(match => parseInt(match.match(/\d+/)[0])));
      if (years >= 5) return 'senior';
      if (years >= 2) return 'mid';
      return 'junior';
    }
    
    return 'entry';
  }

  extractEducation(resumeText) {
    const degrees = ['bachelor', 'master', 'phd', 'diploma'];
    const fields = ['computer science', 'engineering', 'business', 'design'];
    
    const textLower = resumeText.toLowerCase();
    const foundDegrees = degrees.filter(degree => textLower.includes(degree));
    const foundFields = fields.filter(field => textLower.includes(field));
    
    return { degrees: foundDegrees, fields: foundFields };
  }

  extractProjects(resumeText) {
    const projectSections = resumeText.match(/projects?:?\s*(.*?)(?=\n\s*[A-Z]|\n\s*$)/gis);
    const projects = [];
    
    if (projectSections) {
      projectSections.forEach(section => {
        const lines = section.split('\n').filter(line => line.trim().length > 10);
        projects.push(...lines.slice(0, 5));
      });
    }
    
    return projects;
  }

  calculateResumeScore(skills, experienceLevel, education, projects) {
    let score = 0;
    
    const totalSkills = Object.values(skills).reduce((acc, skillArray) => acc + skillArray.length, 0);
    score += Math.min(totalSkills / 10, 1) * 0.4;
    
    const expScores = { entry: 0.3, junior: 0.5, mid: 0.7, senior: 1.0 };
    score += (expScores[experienceLevel] || 0.3) * 0.3;
    
    score += Math.min(education.degrees.length / 2, 1) * 0.2;
    score += Math.min(projects.length / 5, 1) * 0.1;
    
    return Math.round(score * 100);
  }

  async generateResumeSuggestions(resumeText) {
    try {
      if (!aiApiKey) {
        throw new Error('No GROQ_API_KEY configured');
      }

      const prompt = `Analyze this resume and provide 3-5 specific improvement suggestions: ${resumeText.slice(0, 1000)}`;
      
      const completion = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250
      });
      
      return completion.choices[0].message.content.split('\n').filter(s => s.trim());
    } catch (error) {
      return [
        'Add more specific technical skills',
        'Include quantifiable achievements',
        'Improve formatting and structure',
        'Add relevant project descriptions'
      ];
    }
  }

  analyzeIntent(message) {
    const messageLower = message.toLowerCase();

    // Weighted keyword scoring for accurate intent detection
    const intentKeywords = {
      job_search: {
        strong: ['internship', 'job', 'position', 'vacancy', 'opening', 'opportunity', 'hire', 'hiring', 'role', 'work'],
        moderate: ['find', 'search', 'browse', 'look for', 'available', 'remote', 'onsite', 'part-time', 'full-time', 'recommend', 'match', 'suitable'],
        weak: ['company', 'employer', 'location', 'salary', 'stipend', 'apply']
      },
      career_advice: {
        strong: ['career', 'career path', 'future', 'growth', 'transition', 'switch', 'roadmap'],
        moderate: ['advice', 'guidance', 'direction', 'plan', 'strategy', 'goal', 'what should i do'],
        weak: ['industry', 'field', 'sector', 'trend']
      },
      application_help: {
        strong: ['resume', 'cv', 'cover letter', 'application', 'apply'],
        moderate: ['submit', 'portfolio', 'tailor', 'customize', 'format', 'template'],
        weak: ['deadline', 'status', 'track', 'follow up']
      },
      skill_development: {
        strong: ['skill', 'learn', 'course', 'certification', 'training'],
        moderate: ['improve', 'develop', 'study', 'practice', 'tutorial', 'resource', 'project', 'portfolio'],
        weak: ['technology', 'framework', 'language', 'tool', 'trending']
      },
      platform_help: {
        strong: ['how to use', 'how does', 'platform', 'feature', 'navigate', 'where is', 'how do i'],
        moderate: ['help', 'guide', 'tutorial', 'explain', 'show me', 'walkthrough', 'get started'],
        weak: ['dashboard', 'settings', 'account', 'profile setup']
      },
      interview_prep: {
        strong: ['interview', 'behavioral', 'technical interview', 'coding interview'],
        moderate: ['prepare', 'question', 'answer', 'practice', 'mock', 'star method'],
        weak: ['nervous', 'confident', 'presentation', 'communication']
      }
    };

    const scores = {};
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      let score = 0;
      keywords.strong.forEach(kw => { if (messageLower.includes(kw)) score += 3; });
      keywords.moderate.forEach(kw => { if (messageLower.includes(kw)) score += 2; });
      keywords.weak.forEach(kw => { if (messageLower.includes(kw)) score += 1; });
      scores[intent] = score;
    }

    const topIntent = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    if (topIntent[1] >= 2) {
      const confidence = Math.min(0.5 + (topIntent[1] * 0.1), 0.95);
      return { type: topIntent[0], confidence };
    }

    // Greeting detection
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'what\'s up'];
    if (greetings.some(g => messageLower.includes(g))) {
      return { type: 'general', confidence: 0.9 };
    }

    return { type: 'general', confidence: 0.5 };
  }

  // Get proactive welcome guidance for a user (called on chatbot open)
  getWelcomeGuidance(userContext) {
    const tips = [];
    const actions = [];

    if (!userContext.skills || userContext.skills.length === 0) {
      tips.push('🎯 **Start by adding your skills** — This powers our AI matching engine and helps you get personalized recommendations.');
      actions.push({ label: 'Add Skills', route: '/profile', icon: 'edit' });
    } else if (userContext.skills.length < 3) {
      tips.push(`💡 You have ${userContext.skills.length} skill(s) listed. Adding more skills improves your match accuracy.`);
      actions.push({ label: 'Update Skills', route: '/profile', icon: 'edit' });
    }

    if (userContext.profileCompleteness && userContext.profileCompleteness < 60) {
      tips.push(`📋 Your profile is ${userContext.profileCompleteness}% complete. Complete profiles get 3x more visibility to employers.`);
      actions.push({ label: 'Complete Profile', route: '/profile', icon: 'person' });
    }

    if (!userContext.applicationStats || userContext.applicationStats.total === 0) {
      tips.push('🚀 **Ready to apply?** Check out AI Recommendations to find internships perfectly matched to your profile.');
      actions.push({ label: 'View Recommendations', route: '/ai', icon: 'auto_awesome' });
    }

    if (userContext.applicationStats && userContext.applicationStats.total > 0 && userContext.applicationStats.successRate < 25) {
      tips.push('📄 **Boost your success rate** — Use the Resume Analyzer to identify improvements and tailor your applications.');
      actions.push({ label: 'Analyze Resume', route: '/ai?tab=1', icon: 'assessment' });
    }

    const greeting = tips.length > 0
      ? `👋 Welcome back! Here are some personalized tips to boost your internship search:\n\n${tips.join('\n\n')}\n\nHow can I help you today?`
      : `👋 Welcome! I'm your AI Career Assistant. I can help you find internships, optimize your applications, develop skills, and plan your career. What would you like to explore?`;

    return {
      message: greeting,
      type: 'welcome',
      suggestions: [
        'Find internships for my skills',
        'Analyze my resume',
        'What skills are most in demand?',
        'Guide me through the platform'
      ],
      actions: actions.length > 0 ? actions.slice(0, 3) : [
        { label: 'AI Recommendations', route: '/ai', icon: 'auto_awesome' },
        { label: 'Browse Internships', route: '/internships', icon: 'search' }
      ],
      guidance: this.generateUserGuidance(userContext)
    };
  }

  // Additional helper methods for predictions and tagging
  calculateBaseSuccessRate(historicalData, internship) {
    if (!historicalData.length) return 0.3;
    
    const similarInternships = historicalData.filter(data => 
      data.category === internship.category || data.companyName === internship.companyName
    );
    
    if (similarInternships.length === 0) return 0.3;
    
    const successfulApplications = similarInternships.filter(data => data.status === 'accepted').length;
    return successfulApplications / similarInternships.length;
  }

  calculateExperienceRelevance(userProfile, internship) {
    const userExp = userProfile.studentProfile?.experienceLevel || 'entry';
    const requiredExp = internship.requirements?.experience || 'entry level';
    
    const expLevels = { 'entry': 0, 'junior': 1, 'mid': 2, 'senior': 3 };
    const userLevel = expLevels[userExp] || 0;
    const requiredLevel = requiredExp.toLowerCase().includes('senior') ? 3 :
                         requiredExp.toLowerCase().includes('mid') ? 2 :
                         requiredExp.toLowerCase().includes('junior') ? 1 : 0;
    
    const diff = Math.abs(userLevel - requiredLevel);
    return Math.max(0, 1 - (diff * 0.3));
  }

  calculateEducationMatch(userProfile, internship) {
    const userEducation = userProfile.studentProfile?.degree || '';
    const requiredEducation = internship.requirements?.education || '';
    
    if (!requiredEducation) return 0.7;
    
    const educationLower = userEducation.toLowerCase();
    const requiredLower = requiredEducation.toLowerCase();
    
    if (educationLower.includes(requiredLower) || requiredLower.includes(educationLower)) {
      return 1.0;
    }
    
    return 0.4;
  }

  calculateApplicationTiming(internship) {
    const now = new Date();
    const deadline = new Date(internship.applicationDeadline);
    const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilDeadline < 0) return 0;
    if (daysUntilDeadline > 30) return 1;
    if (daysUntilDeadline > 7) return 0.8;
    return 0.5;
  }

  calculateCompetitionLevel(internship) {
    let competitionScore = 0.5;
    
    if (internship.stipend && internship.stipend.amount > 3000) competitionScore += 0.2;
    if (internship.location.type === 'remote') competitionScore += 0.1;
    
    return Math.min(competitionScore, 1);
  }

  calculatePredictionConfidence(skillMatch, experienceScore, educationScore) {
    return (skillMatch + experienceScore + educationScore) / 3;
  }

  generateApplicationRecommendations(successProbability, skillMatch, experienceScore) {
    const recommendations = [];
    
    if (successProbability > 0.7) {
      recommendations.push("Strong match! Apply with confidence.");
    } else if (successProbability > 0.4) {
      recommendations.push("Good potential. Consider applying.");
    } else {
      recommendations.push("Lower match. Focus on improving relevant skills first.");
    }
    
    if (skillMatch < 0.5) {
      recommendations.push("Consider developing the required technical skills.");
    }
    
    if (experienceScore < 0.5) {
      recommendations.push("Gain more relevant experience through projects or courses.");
    }
    
    return recommendations;
  }

  categorizeInternship(fullText, keywords) {
    const categories = {
      'Software Development': ['software', 'developer', 'programming', 'coding', 'frontend', 'backend'],
      'Data Science': ['data', 'analytics', 'machine learning', 'ai', 'python', 'statistics'],
      'Design': ['design', 'ui', 'ux', 'graphic', 'visual', 'creative'],
      'Marketing': ['marketing', 'digital', 'social media', 'content', 'seo'],
      'Business': ['business', 'management', 'strategy', 'consulting'],
      'Finance': ['finance', 'accounting', 'investment', 'banking']
    };
    
    const textLower = fullText.toLowerCase();
    const matchedCategories = [];
    
    Object.entries(categories).forEach(([category, terms]) => {
      const matches = terms.filter(term => textLower.includes(term)).length;
      if (matches > 0) {
        matchedCategories.push({ category, score: matches / terms.length });
      }
    });
    
    return matchedCategories.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  extractSkillTags(fullText) {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
      'git', 'docker', 'aws', 'mongodb', 'postgresql', 'figma', 'photoshop'
    ];
    
    const textLower = fullText.toLowerCase();
    return commonSkills.filter(skill => textLower.includes(skill));
  }

  extractIndustryTags(fullText) {
    const industries = [
      'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing',
      'consulting', 'media', 'gaming', 'automotive', 'aerospace', 'energy'
    ];
    
    const textLower = fullText.toLowerCase();
    return industries.filter(industry => textLower.includes(industry));
  }

  extractLevelTags(fullText) {
    const textLower = fullText.toLowerCase();
    const levels = [];
    
    if (textLower.includes('entry') || textLower.includes('beginner') || textLower.includes('intern')) {
      levels.push('entry-level');
    }
    if (textLower.includes('intermediate') || textLower.includes('mid')) {
      levels.push('intermediate');
    }
    if (textLower.includes('advanced') || textLower.includes('senior')) {
      levels.push('advanced');
    }
    
    return levels.length > 0 ? levels : ['entry-level'];
  }

  extractLocationTags(internshipData) {
    const tags = [];
    
    if (internshipData.location) {
      tags.push(internshipData.location.type);
      if (internshipData.location.city) tags.push(internshipData.location.city);
      if (internshipData.location.country) tags.push(internshipData.location.country);
    }
    
    return tags;
  }

  async generateAITags(fullText) {
    try {
      if (!aiApiKey) {
        throw new Error('No GROQ_API_KEY configured');
      }

      const prompt = `Generate 5 relevant tags for this internship: ${fullText.slice(0, 500)}`;
      
      const completion = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60
      });
      
      return completion.choices[0].message.content.split(',').map(tag => tag.trim());
    } catch (error) {
      return ['technology', 'internship', 'career', 'development', 'opportunity'];
    }
  }

  calculateTaggingConfidence(categories, skillTags, industryTags) {
    const totalTags = categories.length + skillTags.length + industryTags.length;
    return Math.min(totalTags / 10, 1);
  }
}

module.exports = new AIService();
