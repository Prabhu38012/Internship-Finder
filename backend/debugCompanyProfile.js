const mongoose = require('mongoose');
const Company = require('./models/Company');
require('dotenv').config();

const debugCompanyProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    const companies = await Company.find({});
    console.log(`📊 Found ${companies.length} companies\n`);
    
    companies.forEach((company, index) => {
      console.log(`--- Company ${index + 1} ---`);
      console.log('ID:', company._id);
      console.log('Company Name:', company.companyName);
      console.log('Company Email:', company.companyEmail);
      console.log('Account Status:', company.accountStatus);
      console.log('Has Company Profile:', !!company.companyProfile);
      
      if (company.companyProfile) {
        console.log('Company Profile Details:');
        console.log('  - Description:', company.companyProfile.description?.substring(0, 50) + '...');
        console.log('  - Industry:', company.companyProfile.industry);
        console.log('  - Company Size:', company.companyProfile.companySize);
        console.log('  - Website:', company.companyProfile.website);
      }
      
      console.log('Contact Info:');
      console.log('  - HR Name:', company.contactInfo?.hrName);
      console.log('  - HR Email:', company.contactInfo?.hrEmail);
      console.log('  - HR Phone:', company.contactInfo?.hrPhone);
      
      console.log('Subscription:');
      console.log('  - Plan:', company.subscription?.plan);
      console.log('  - Max Posts:', company.subscription?.maxInternshipPosts);
      console.log('  - Current Posts:', company.subscription?.currentInternshipPosts);
      
      console.log('Can Post Internship:', company.canPostInternship());
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugCompanyProfile();
