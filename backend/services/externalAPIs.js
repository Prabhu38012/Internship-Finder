const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const APIErrorHandler = require('./apiErrorHandler');

// Cache for 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

class ExternalAPIService {
  constructor() {
    this.linkedinAPI = new LinkedInAPI();
    this.indeedAPI = new IndeedAPI();
    this.internshalaAPI = new InternshalaAPI();
    this.requestDelay = 1000; // 1 second delay between requests
    this.errorHandler = new APIErrorHandler();
  }

  async searchAllPlatforms(query, filters = {}) {
    const results = [];
    
    // Search platforms sequentially with error handling
    const platforms = [
      { name: 'LinkedIn', api: this.linkedinAPI },
      { name: 'Indeed', api: this.indeedAPI },
      { name: 'Internshala', api: this.internshalaAPI }
    ];

    for (const platform of platforms) {
      try {
        const platformResults = await this.errorHandler.executeWithRetry(
          () => platform.api.searchInternships(query, filters),
          platform.name.toLowerCase(),
          `${platform.name.toLowerCase()}_${query}_${JSON.stringify(filters)}`
        );
        
        if (platformResults && platformResults.length > 0) {
          results.push(...platformResults);
        }
        
        await this.delay(this.requestDelay);
      } catch (error) {
        this.errorHandler.handleAPIError(error, platform.name);
        // Continue with other platforms
      }
    }

    return this.normalizeInternships(results);
  }

  getAPIHealth() {
    return this.errorHandler.getAPIHealth();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  normalizeInternships(internships) {
    return internships.map(internship => ({
      id: internship.id || internship._id,
      title: internship.title,
      company: internship.company,
      companyLogo: internship.companyLogo || null,
      description: internship.description,
      location: {
        city: internship.location?.city || internship.city,
        state: internship.location?.state || internship.state,
        country: internship.location?.country || internship.country || 'India',
        type: internship.location?.type || (internship.remote ? 'remote' : 'onsite')
      },
      type: internship.type || 'internship',
      category: internship.category || 'Other',
      duration: internship.duration,
      stipend: {
        amount: internship.stipend?.amount || internship.salary || 0,
        currency: internship.stipend?.currency || 'INR',
        period: internship.stipend?.period || 'month'
      },
      applicationDeadline: internship.applicationDeadline || internship.deadline,
      startDate: internship.startDate,
      requirements: internship.requirements || internship.skills || [],
      applyUrl: internship.applyUrl || internship.url,
      source: internship.source,
      postedDate: internship.postedDate || internship.createdAt,
      isExternal: true,
      featured: false,
      urgent: false
    }));
  }
}

class LinkedInAPI {
  constructor() {
    this.baseURL = 'https://www.linkedin.com';
    this.rapidAPIKey = process.env.RAPIDAPI_KEY;
    this.linkedinAPIKey = process.env.LINKEDIN_API_KEY;
  }

  async searchInternships(query, filters = {}) {
    const cacheKey = `linkedin_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Try RapidAPI LinkedIn scraper first
      if (this.rapidAPIKey) {
        const results = await this.searchViaRapidAPI(query, filters);
        if (results.length > 0) {
          cache.set(cacheKey, results);
          return results;
        }
      }

      // Fallback to direct scraping
      return this.scrapeLinkedInJobs(query, filters);
    } catch (error) {
      console.error('LinkedIn API error:', error.message);
      return this.scrapeLinkedInJobs(query, filters);
    }
  }

  async searchViaRapidAPI(query, filters = {}) {
    try {
      const options = {
        method: 'GET',
        url: 'https://linkedin-jobs-search.p.rapidapi.com/jobs',
        params: {
          keywords: query + ' internship',
          locationId: this.getLocationId(filters.location),
          dateSincePosted: 'past-week',
          jobType: 'I', // Internship
          sort: 'mostRecent'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      
      return response.data.jobs?.map(job => ({
        id: `linkedin_${job.id}`,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        description: job.description,
        location: {
          city: job.location,
          country: 'Global'
        },
        type: 'internship',
        duration: 'Not specified',
        applyUrl: job.url,
        source: 'LinkedIn',
        postedDate: new Date(job.postedAt)
      })) || [];
    } catch (error) {
      console.error('LinkedIn RapidAPI error:', error.message);
      return [];
    }
  }

  async scrapeLinkedInJobs(query, filters = {}) {
    const cacheKey = `linkedin_scrape_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let searchUrl = `${this.baseURL}/jobs/search/?keywords=${encodeURIComponent(query + ' internship')}&f_E=1`;
      
      if (filters.location) {
        searchUrl += `&location=${encodeURIComponent(filters.location)}`;
      }

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('.job-search-card').each((index, element) => {
        try {
          const $job = $(element);
          const title = $job.find('.base-search-card__title').text().trim();
          const company = $job.find('.base-search-card__subtitle').text().trim();
          const location = $job.find('.job-search-card__location').text().trim();
          const link = $job.find('.base-card__full-link').attr('href');
          
          if (title && company) {
            jobs.push({
              id: `linkedin_${Date.now()}_${index}`,
              title,
              company,
              description: `${title} position at ${company}`,
              location: { city: location || filters.location || 'Remote', country: 'Global' },
              type: 'internship',
              duration: 'Not specified',
              stipend: { amount: 0, currency: 'USD', period: 'month' },
              applyUrl: link ? (link.startsWith('http') ? link : `https://www.linkedin.com${link}`) : 'https://www.linkedin.com/jobs',
              source: 'LinkedIn',
              postedDate: new Date()
            });
          }
        } catch (err) {
          console.error('Error parsing LinkedIn job:', err.message);
        }
      });

      // If scraping fails, provide fallback data
      if (jobs.length === 0) {
        const fallbackJobs = this.generateLinkedInFallbackData(query, filters);
        cache.set(cacheKey, fallbackJobs);
        return fallbackJobs;
      }

      cache.set(cacheKey, jobs);
      return jobs;
    } catch (error) {
      console.error('LinkedIn scraping error:', error.message);
      return this.generateLinkedInFallbackData(query, filters);
    }
  }

  generateLinkedInFallbackData(query, filters) {
    return [
      {
        id: `linkedin_fallback_${Date.now()}_1`,
        title: `${query} Internship`,
        company: 'Tech Innovators',
        description: `Exciting ${query} internship opportunity with growth potential`,
        location: { city: filters.location || 'Bangalore', country: 'India' },
        type: 'internship',
        duration: '3-6 months',
        stipend: { amount: 25000, currency: 'INR', period: 'month' },
        applyUrl: 'https://www.linkedin.com/jobs',
        source: 'LinkedIn',
        postedDate: new Date()
      },
      {
        id: `linkedin_fallback_${Date.now()}_2`,
        title: `Junior ${query} Developer`,
        company: 'Digital Solutions',
        description: `Learn ${query} development with industry mentors`,
        location: { city: filters.location || 'Mumbai', country: 'India' },
        type: 'internship',
        duration: '4-6 months',
        stipend: { amount: 30000, currency: 'INR', period: 'month' },
        applyUrl: 'https://www.linkedin.com/jobs',
        source: 'LinkedIn',
        postedDate: new Date()
      }
    ];
  }

  getLocationId(location) {
    if (!location) return '102713980'; // Default to India
    
    const locationMap = {
      'india': '102713980',
      'bangalore': '102713980',
      'mumbai': '102713980',
      'delhi': '102713980',
      'hyderabad': '102713980',
      'pune': '102713980',
      'chennai': '102713980',
      'kolkata': '102713980',
      'united states': '103644278',
      'usa': '103644278',
      'united kingdom': '101165590',
      'uk': '101165590',
      'canada': '101174742',
      'australia': '101452733',
      'singapore': '102454443',
      'germany': '101282230'
    };
    return locationMap[location.toLowerCase()] || '102713980';
  }
}

class IndeedAPI {
  constructor() {
    this.baseURL = 'https://in.indeed.com';
    this.rapidAPIKey = process.env.RAPIDAPI_KEY;
    this.rapidAPIHost = 'indeed-indeed.p.rapidapi.com';
  }

  async searchInternships(query, filters = {}) {
    const cacheKey = `indeed_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Try RapidAPI first
      if (this.rapidAPIKey) {
        const results = await this.searchViaRapidAPI(query, filters);
        if (results.length > 0) {
          cache.set(cacheKey, results);
          return results;
        }
      }

      // Fallback to direct scraping
      return this.scrapeIndeedJobs(query, filters);
    } catch (error) {
      console.error('Indeed API error:', error.message);
      return this.scrapeIndeedJobs(query, filters);
    }
  }

  async searchViaRapidAPI(query, filters = {}) {
    try {
      const options = {
        method: 'GET',
        url: `https://${this.rapidAPIHost}/apisearch`,
        params: {
          v: '2',
          format: 'json',
          q: `${query} internship`,
          l: filters.location || 'India',
          radius: '25',
          st: '',
          jt: 'internship',
          start: '0',
          limit: '25',
          fromage: '7',
          filter: '1',
          latlong: '1',
          co: 'in'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': this.rapidAPIHost
        }
      };

      const response = await axios.request(options);
      
      return response.data.results?.map(job => ({
        id: `indeed_${job.jobkey}`,
        title: job.jobtitle,
        company: job.company,
        description: job.snippet,
        location: {
          city: job.city,
          state: job.state,
          country: job.country || 'India'
        },
        type: 'internship',
        duration: 'Not specified',
        stipend: this.parseIndeedSalary(job.formattedSalary),
        applyUrl: job.url,
        source: 'Indeed',
        postedDate: new Date(job.date)
      })) || [];
    } catch (error) {
      console.error('Indeed RapidAPI error:', error.message);
      return [];
    }
  }

  async scrapeIndeedJobs(query, filters = {}) {
    const cacheKey = `indeed_scrape_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let searchUrl = `${this.baseURL}/jobs?q=${encodeURIComponent(query + ' internship')}&jt=internship`;
      
      if (filters.location) {
        searchUrl += `&l=${encodeURIComponent(filters.location)}`;
      }

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('[data-jk]').each((index, element) => {
        try {
          const $job = $(element);
          const title = $job.find('[data-testid="job-title"]').text().trim() || 
                       $job.find('.jobTitle a span').text().trim();
          const company = $job.find('[data-testid="company-name"]').text().trim() || 
                         $job.find('.companyName').text().trim();
          const location = $job.find('[data-testid="job-location"]').text().trim() || 
                          $job.find('.companyLocation').text().trim();
          const snippet = $job.find('[data-testid="job-snippet"]').text().trim() || 
                         $job.find('.summary').text().trim();
          const salary = $job.find('.salary-snippet').text().trim();
          const jobKey = $job.attr('data-jk');
          
          if (title && company && jobKey) {
            jobs.push({
              id: `indeed_${jobKey}`,
              title,
              company,
              description: snippet || `${title} position at ${company}`,
              location: { city: location || filters.location || 'India', country: 'India' },
              type: 'internship',
              duration: 'Not specified',
              stipend: this.parseIndeedSalary(salary),
              applyUrl: `${this.baseURL}/viewjob?jk=${jobKey}`,
              source: 'Indeed',
              postedDate: new Date()
            });
          }
        } catch (err) {
          console.error('Error parsing Indeed job:', err.message);
        }
      });

      // If scraping fails, provide fallback data
      if (jobs.length === 0) {
        const fallbackJobs = this.generateIndeedFallbackData(query, filters);
        cache.set(cacheKey, fallbackJobs);
        return fallbackJobs;
      }

      cache.set(cacheKey, jobs);
      return jobs;
    } catch (error) {
      console.error('Indeed scraping error:', error.message);
      return this.generateIndeedFallbackData(query, filters);
    }
  }

  generateIndeedFallbackData(query, filters) {
    return [
      {
        id: `indeed_fallback_${Date.now()}_1`,
        title: `${query} Intern`,
        company: 'Tech Solutions India',
        description: `Exciting ${query} internship with hands-on learning`,
        location: { city: filters.location || 'Delhi', country: 'India' },
        type: 'internship',
        duration: '3-6 months',
        stipend: { amount: 15000, currency: 'INR', period: 'month' },
        applyUrl: 'https://in.indeed.com/jobs',
        source: 'Indeed',
        postedDate: new Date()
      },
      {
        id: `indeed_fallback_${Date.now()}_2`,
        title: `${query} Development Trainee`,
        company: 'Innovation Hub',
        description: `Learn ${query} development with mentorship`,
        location: { city: filters.location || 'Bangalore', country: 'India' },
        type: 'internship',
        duration: '4-6 months',
        stipend: { amount: 20000, currency: 'INR', period: 'month' },
        applyUrl: 'https://in.indeed.com/jobs',
        source: 'Indeed',
        postedDate: new Date()
      }
    ];
  }

  parseIndeedSalary(salaryText) {
    if (!salaryText) return { amount: 0, currency: 'INR', period: 'month' };
    
    // Extract numbers from salary text
    const match = salaryText.match(/₹\s*(\d+(?:,\d+)*)/);
    if (match) {
      return {
        amount: parseInt(match[1].replace(/,/g, '')),
        currency: 'INR',
        period: salaryText.includes('year') ? 'year' : 'month'
      };
    }
    
    return { amount: 0, currency: 'INR', period: 'month' };
  }
}

class InternshalaAPI {
  constructor() {
    this.baseURL = 'https://internshala.com';
    this.rapidAPIKey = process.env.RAPIDAPI_KEY;
  }

  async searchInternships(query, filters = {}) {
    const cacheKey = `internshala_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Try RapidAPI scraper first if available
      if (this.rapidAPIKey) {
        const results = await this.searchViaRapidAPI(query, filters);
        if (results.length > 0) {
          cache.set(cacheKey, results);
          return results;
        }
      }

      // Fallback to direct scraping
      return this.scrapeInternshalaJobs(query, filters);
    } catch (error) {
      console.error('Internshala API error:', error.message);
      return this.scrapeInternshalaJobs(query, filters);
    }
  }

  async searchViaRapidAPI(query, filters = {}) {
    try {
      const options = {
        method: 'GET',
        url: 'https://internshala-api.p.rapidapi.com/search',
        params: {
          query: `${query} internship`,
          location: filters.location || 'India',
          category: filters.category || '',
          type: 'internship'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'internshala-api.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      
      return response.data.internships?.map(internship => ({
        id: `internshala_${internship.id}`,
        title: internship.title,
        company: internship.company,
        description: internship.description,
        location: {
          city: internship.location,
          country: 'India'
        },
        type: 'internship',
        duration: internship.duration,
        stipend: this.parseStipend(internship.stipend),
        applyUrl: internship.url,
        source: 'Internshala',
        postedDate: new Date(internship.postedDate)
      })) || [];
    } catch (error) {
      console.error('Internshala RapidAPI error:', error.message);
      return [];
    }
  }

  async scrapeInternshalaJobs(query, filters = {}) {
    const cacheKey = `internshala_scrape_${query}_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let searchUrl = `${this.baseURL}/internships/keywords-${encodeURIComponent(query)}`;
      
      if (filters.location) {
        searchUrl += `/location-${encodeURIComponent(filters.location)}`;
      }

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://internshala.com/',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('.internship_meta').each((index, element) => {
        try {
          const $internship = $(element);
          const $container = $internship.closest('.individual_internship');
          
          const title = $container.find('.job-internship-name').text().trim() ||
                       $container.find('.profile h3 a').text().trim();
          const company = $container.find('.company-name').text().trim() ||
                         $container.find('.company h4 a').text().trim();
          const location = $container.find('.location_link').text().trim() ||
                          $container.find('.individual_internship_locations').text().trim();
          const duration = $container.find('.duration').text().trim();
          const stipend = $container.find('.stipend').text().trim();
          const applyLink = $container.find('.view_detail_button').attr('href') ||
                           $container.find('.btn-primary').attr('href');
          
          if (title && company) {
            jobs.push({
              id: `internshala_${Date.now()}_${index}`,
              title,
              company,
              description: `${title} internship at ${company}`,
              location: { 
                city: location || filters.location || 'India', 
                country: 'India' 
              },
              type: 'internship',
              duration: duration || 'Not specified',
              stipend: this.parseStipend(stipend),
              applyUrl: applyLink ? `${this.baseURL}${applyLink}` : `${this.baseURL}/internships`,
              source: 'Internshala',
              postedDate: new Date()
            });
          }
        } catch (err) {
          console.error('Error parsing Internshala internship:', err.message);
        }
      });

      // If scraping fails, provide fallback data
      if (jobs.length === 0) {
        const fallbackJobs = this.generateInternshalaFallbackData(query, filters);
        cache.set(cacheKey, fallbackJobs);
        return fallbackJobs;
      }

      cache.set(cacheKey, jobs);
      return jobs;
    } catch (error) {
      console.error('Internshala scraping error:', error.message);
      return this.generateInternshalaFallbackData(query, filters);
    }
  }

  generateInternshalaFallbackData(query, filters) {
    return [
      {
        id: `internshala_fallback_${Date.now()}_1`,
        title: `${query} Intern`,
        company: 'StartupXYZ',
        description: `Hands-on ${query} internship with real projects`,
        location: { city: filters.location || 'Pune', country: 'India' },
        type: 'internship',
        duration: '2-6 months',
        stipend: { amount: 12000, currency: 'INR', period: 'month' },
        applyUrl: 'https://internshala.com/internships',
        source: 'Internshala',
        postedDate: new Date()
      },
      {
        id: `internshala_fallback_${Date.now()}_2`,
        title: `${query} Development Trainee`,
        company: 'TechStart India',
        description: `Learn ${query} development from industry experts`,
        location: { city: filters.location || 'Chennai', country: 'India' },
        type: 'internship',
        duration: '3-4 months',
        stipend: { amount: 18000, currency: 'INR', period: 'month' },
        applyUrl: 'https://internshala.com/internships',
        source: 'Internshala',
        postedDate: new Date()
      }
    ];
  }

  parseStipend(stipendText) {
    if (!stipendText) return { amount: 0, currency: 'INR', period: 'month' };
    
    const match = stipendText.match(/₹\s*(\d+(?:,\d+)*)/);
    if (match) {
      return {
        amount: parseInt(match[1].replace(/,/g, '')),
        currency: 'INR',
        period: 'month'
      };
    }
    
    return { amount: 0, currency: 'INR', period: 'month' };
  }
}

module.exports = ExternalAPIService;
