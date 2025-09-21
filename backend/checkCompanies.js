const mongoose = require('mongoose');
const Company = require('./models/Company');
require('dotenv').config();

const checkCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    
    const companies = await Company.find({});
    console.log(`📊 Found ${companies.length} companies in database`);
    
    if (companies.length > 0) {
      companies.forEach(company => {
        console.log(`- ${company.companyName} (${company.companyEmail}) - Status: ${company.accountStatus}`);
      });
    } else {
      console.log('\n❌ No companies found!');
      console.log('💡 You need to register as a company first!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCompanies();
