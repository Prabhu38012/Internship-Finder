# External API Integration Setup Guide

This guide explains how to set up and configure external API integrations for LinkedIn, Indeed, and Internshala to fetch internships in your MERN stack application.

## Overview

The application now supports fetching internships from external sources:
- **LinkedIn Jobs API** (with fallback to web scraping)
- **Indeed Publisher API** (with fallback to web scraping)
- **Internshala** (web scraping only - no public API)

## Backend Setup

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# External API Configuration
LINKEDIN_ACCESS_TOKEN=your-linkedin-access-token
INDEED_PUBLISHER_ID=your-indeed-publisher-id

# Rate Limiting for External APIs
EXTERNAL_API_RATE_LIMIT=100
EXTERNAL_API_CACHE_TTL=1800
```

### 2. API Keys Setup

#### LinkedIn API
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new application
3. Request access to LinkedIn Jobs API (requires partnership)
4. Get your access token and add it to `LINKEDIN_ACCESS_TOKEN`

**Note**: LinkedIn Jobs API requires partnership approval. Without it, the system will fallback to limited web scraping.

#### Indeed API
1. Go to [Indeed Publisher Portal](https://ads.indeed.com/jobroll/xmlfeed)
2. Sign up for a publisher account
3. Get your Publisher ID
4. Add it to `INDEED_PUBLISHER_ID`

#### Internshala
No API key required - uses web scraping only.

### 3. Dependencies

The following packages are automatically installed:
- `axios` - HTTP client for API requests
- `cheerio` - Web scraping library
- `node-cache` - Caching mechanism

## API Endpoints

### Get Internships with External Sources
```
GET /api/internships?includeExternal=true
```

Query parameters:
- `includeExternal=true` - Include external internships
- `search` - Search query
- `location` - Location filter
- `category` - Category filter
- `page` - Page number
- `limit` - Results per page

### Search External Internships Only
```
GET /api/internships/external/search
```

Query parameters:
- `q` - Search query (default: "internship")
- `location` - Location filter
- `category` - Category filter
- `platform` - Specific platform (linkedin, indeed, internshala, all)

## Frontend Integration

### Using the External API Toggle

The frontend includes an "Include External" button that:
- Fetches internships from both local database and external APIs
- Displays external internships with source badges
- Shows direct "Apply" buttons for external internships
- Maintains separate handling for local vs external internships

### External Internship Features

External internships have:
- Source badges (LinkedIn, Indeed, Internshala)
- Direct apply links that open in new tabs
- Cannot be saved (only local internships can be saved)
- Different styling to distinguish from local internships

## Data Normalization

All external internships are normalized to match the local schema:

```javascript
{
  id: string,
  title: string,
  company: string,
  companyLogo: string,
  description: string,
  location: {
    city: string,
    state: string,
    country: string,
    type: 'remote' | 'onsite'
  },
  type: 'internship' | 'project' | 'full-time' | 'part-time',
  category: string,
  duration: string,
  stipend: {
    amount: number,
    currency: 'INR' | 'USD',
    period: 'month' | 'week'
  },
  applicationDeadline: Date,
  startDate: Date,
  requirements: string[],
  applyUrl: string,
  source: 'LinkedIn' | 'Indeed' | 'Internshala',
  postedDate: Date,
  isExternal: true
}
```

## Caching

- External API responses are cached for 30 minutes (1800 seconds)
- Cache keys are based on search query and filters
- Reduces API calls and improves performance

## Error Handling

The system includes comprehensive error handling:
- API failures fallback to web scraping when possible
- Individual platform failures don't affect other platforms
- Graceful degradation - continues with local results if external APIs fail
- Rate limiting protection

## Rate Limiting

- Default rate limit: 100 requests per time window
- Configurable via `EXTERNAL_API_RATE_LIMIT` environment variable
- Prevents API quota exhaustion

## Testing

To test the integration:

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Test external API endpoint:
```bash
curl "http://localhost:5000/api/internships/external/search?q=software&location=India"
```

3. Test combined results:
```bash
curl "http://localhost:5000/api/internships?includeExternal=true&search=developer"
```

## Troubleshooting

### Common Issues

1. **LinkedIn API not working**
   - Ensure you have valid access token
   - Check if you have LinkedIn Jobs API access
   - System will fallback to web scraping

2. **Indeed API returning no results**
   - Verify your Publisher ID is correct
   - Check if your account is approved
   - System will fallback to web scraping

3. **Web scraping failures**
   - Sites may have changed their structure
   - Rate limiting may be in effect
   - Check console logs for specific errors

4. **Slow response times**
   - External APIs can be slow
   - Consider adjusting cache TTL
   - Monitor API response times

### Debugging

Enable debug logging by setting:
```env
NODE_ENV=development
```

Check logs for:
- API response times
- Cache hit/miss rates
- Scraping success/failure rates
- Error messages from external services

## Security Considerations

- API keys are stored in environment variables
- No API keys are exposed to frontend
- Rate limiting prevents abuse
- User-Agent headers are set for web scraping
- CORS is properly configured

## Performance Optimization

- Implement caching at multiple levels
- Use Promise.allSettled for parallel API calls
- Limit concurrent requests to external APIs
- Consider implementing request queuing for high traffic

## Future Enhancements

- Add more job platforms (Glassdoor, Monster, etc.)
- Implement real-time job alerts
- Add job recommendation engine
- Implement advanced filtering options
- Add analytics for external API usage
