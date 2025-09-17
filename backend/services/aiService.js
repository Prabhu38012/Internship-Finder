const OpenAI = require('openai');
const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');
const keywordExtractor = require('keyword-extractor');
const NodeCache = require('node-cache');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        const skillMatch = this.calculateSkillMatch(userSkills, internship.requirements.skills);
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
  async getChatbotResponse(message, userContext = {}) {
    try {
      const cacheKey = `chatbot_${Buffer.from(message).toString('base64').slice(0, 50)}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;

      const intent = this.analyzeIntent(message);
      let response;
      
      switch (intent.type) {
        case 'job_search':
          response = await this.handleJobSearchIntent(message, userContext);
          break;
        case 'career_advice':
          response = await this.handleCareerAdviceIntent(message, userContext);
          break;
        case 'application_help':
          response = await this.handleApplicationHelpIntent(message, userContext);
          break;
        case 'skill_development':
          response = await this.handleSkillDevelopmentIntent(message, userContext);
          break;
        default:
          response = await this.handleGeneralIntent(message, userContext);
      }

      aiCache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error in getChatbotResponse:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        type: 'error',
        suggestions: ['Try rephrasing your question', 'Contact support if the issue persists']
      };
    }
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
      const prompt = `Analyze this resume and provide 3-5 specific improvement suggestions: ${resumeText.slice(0, 1000)}`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
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
    
    if (messageLower.includes('job') || messageLower.includes('internship')) {
      return { type: 'job_search', confidence: 0.8 };
    }
    if (messageLower.includes('career') || messageLower.includes('advice')) {
      return { type: 'career_advice', confidence: 0.7 };
    }
    if (messageLower.includes('application') || messageLower.includes('resume')) {
      return { type: 'application_help', confidence: 0.8 };
    }
    if (messageLower.includes('skill') || messageLower.includes('learn')) {
      return { type: 'skill_development', confidence: 0.7 };
    }
    
    return { type: 'general', confidence: 0.5 };
  }

  async handleJobSearchIntent(message, userContext) {
    const prompt = `Help with job search: "${message}". User: ${JSON.stringify(userContext)}. Provide specific advice.`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      });
      
      return {
        message: completion.choices[0].message.content,
        type: 'job_search',
        suggestions: ['Browse internships', 'Update profile', 'Set job alerts']
      };
    } catch (error) {
      return {
        message: "I can help you find internships! Try browsing our available positions or updating your profile.",
        type: 'job_search',
        suggestions: ['Browse internships', 'Update profile', 'Set job alerts']
      };
    }
  }

  async handleCareerAdviceIntent(message, userContext) {
    return {
      message: "Career development is a journey! Focus on building relevant skills, gaining experience through internships, and networking with professionals in your field.",
      type: 'career_advice',
      suggestions: ['Explore career paths', 'Skill assessment', 'Connect with mentors']
    };
  }

  async handleApplicationHelpIntent(message, userContext) {
    return {
      message: "For successful applications, tailor your resume to each position, highlight relevant skills and experiences, and prepare thoughtful questions for interviews.",
      type: 'application_help',
      suggestions: ['Resume tips', 'Interview preparation', 'Application tracking']
    };
  }

  async handleSkillDevelopmentIntent(message, userContext) {
    return {
      message: "Focus on developing both technical and soft skills. Identify skills in demand for your target roles and practice through projects and courses.",
      type: 'skill_development',
      suggestions: ['Skill roadmap', 'Online courses', 'Practice projects']
    };
  }

  async handleGeneralIntent(message, userContext) {
    return {
      message: "I'm here to help with your internship search and career development! You can ask me about finding jobs, career advice, application tips, or skill development.",
      type: 'general',
      suggestions: [
        'Find internships matching my skills',
        'How to improve my resume?',
        'What skills should I learn?',
        'Career advice for my field'
      ]
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
      const prompt = `Generate 5 relevant tags for this internship: ${fullText.slice(0, 500)}`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50
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
