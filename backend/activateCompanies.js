const mongoose = require('mongoose');
const Company = require('./models/Company');
require('dotenv').config();

const activateCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    
    // Update all companies to active status
    const result = await Company.updateMany(
      { accountStatus: 'pending_approval' },
      { 
        accountStatus: 'active',
        'verification.isVerified': true,
        'verification.verificationStatus': 'verified'
      }
    );
    
    console.log(`✅ Activated ${result.modifiedCount} companies`);
    
    // Show updated companies
    const companies = await Company.find({});
    companies.forEach(company => {
      console.log(`- ${company.companyName} (${company.companyEmail}) - Status: ${company.accountStatus}`);
    });
    
    console.log('\n🎉 All companies are now active and can post internships!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

activateCompanies();
