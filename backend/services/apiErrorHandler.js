const NodeCache = require('node-cache');

// Cache for API health status (5 minutes)
const healthCache = new NodeCache({ stdTTL: 300 });

class APIErrorHandler {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.circuitBreakerThreshold = 5; // failures before circuit opens
    this.circuitBreakerTimeout = 300000; // 5 minutes
  }

  async executeWithRetry(apiCall, apiName, cacheKey) {
    const circuitKey = `circuit_${apiName}`;
    const failureKey = `failures_${apiName}`;
    
    // Check circuit breaker
    if (this.isCircuitOpen(circuitKey)) {
      console.log(`Circuit breaker open for ${apiName}, skipping API call`);
      return [];
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await apiCall();
        
        // Reset failure count on success
        healthCache.del(failureKey);
        
        return result;
      } catch (error) {
        console.error(`${apiName} API attempt ${attempt} failed:`, error.message);
        
        // Track failures
        const failures = healthCache.get(failureKey) || 0;
        healthCache.set(failureKey, failures + 1);
        
        // Open circuit breaker if threshold reached
        if (failures + 1 >= this.circuitBreakerThreshold) {
          healthCache.set(circuitKey, true, this.circuitBreakerTimeout / 1000);
          console.log(`Circuit breaker opened for ${apiName} due to repeated failures`);
        }

        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Exponential backoff
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  isCircuitOpen(circuitKey) {
    return healthCache.get(circuitKey) === true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleAPIError(error, apiName) {
    const errorInfo = {
      api: apiName,
      message: error.message,
      timestamp: new Date().toISOString(),
      status: error.response?.status,
      statusText: error.response?.statusText
    };

    // Log different types of errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(`${apiName} - Network error:`, errorInfo);
    } else if (error.response?.status === 429) {
      console.error(`${apiName} - Rate limit exceeded:`, errorInfo);
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      console.error(`${apiName} - Authentication error:`, errorInfo);
    } else {
      console.error(`${apiName} - General error:`, errorInfo);
    }

    return errorInfo;
  }

  getAPIHealth() {
    const apis = ['linkedin', 'indeed', 'internshala'];
    const health = {};

    apis.forEach(api => {
      const circuitKey = `circuit_${api}`;
      const failureKey = `failures_${api}`;
      
      health[api] = {
        status: this.isCircuitOpen(circuitKey) ? 'down' : 'up',
        failures: healthCache.get(failureKey) || 0,
        circuitOpen: this.isCircuitOpen(circuitKey)
      };
    });

    return health;
  }
}

module.exports = APIErrorHandler;
