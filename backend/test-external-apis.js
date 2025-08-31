const ExternalAPIService = require('./services/externalAPIs');

async function testExternalAPIs() {
  console.log('🚀 Testing External API Integration...\n');
  
  const service = new ExternalAPIService();
  
  try {
    console.log('1. Testing Internshala scraping...');
    const internshalaResults = await service.internshalaAPI.searchInternships('software developer', { location: 'India' });
    console.log(`✅ Internshala: Found ${internshalaResults.length} internships`);
    if (internshalaResults.length > 0) {
      console.log(`   Sample: ${internshalaResults[0].title} at ${internshalaResults[0].company}`);
    }
    
    console.log('\n2. Testing Indeed scraping...');
    const indeedResults = await service.indeedAPI.searchInternships('software intern', { location: 'India' });
    console.log(`✅ Indeed: Found ${indeedResults.length} internships`);
    if (indeedResults.length > 0) {
      console.log(`   Sample: ${indeedResults[0].title} at ${indeedResults[0].company}`);
    }
    
    console.log('\n3. Testing LinkedIn scraping...');
    const linkedinResults = await service.linkedinAPI.searchInternships('developer intern', { location: 'India' });
    console.log(`✅ LinkedIn: Found ${linkedinResults.length} internships`);
    if (linkedinResults.length > 0) {
      console.log(`   Sample: ${linkedinResults[0].title} at ${linkedinResults[0].company}`);
    }
    
    console.log('\n4. Testing combined search...');
    const allResults = await service.searchAllPlatforms('software', { location: 'India' });
    console.log(`✅ Combined: Found ${allResults.length} total internships`);
    
    console.log('\n5. Testing data normalization...');
    const normalized = service.normalizeInternships(allResults);
    console.log(`✅ Normalized: ${normalized.length} internships with consistent format`);
    
    if (normalized.length > 0) {
      console.log('\n📋 Sample normalized internship:');
      const sample = normalized[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Company: ${sample.company}`);
      console.log(`   Location: ${sample.location.city}, ${sample.location.country}`);
      console.log(`   Source: ${sample.source}`);
      console.log(`   Apply URL: ${sample.applyUrl}`);
    }
    
    console.log('\n🎉 External API integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This is expected if you haven\'t set up API keys yet.');
    console.log('   The system will fallback to web scraping, which may have limitations.');
  }
}

testExternalAPIs();
