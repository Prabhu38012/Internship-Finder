const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');
require('dotenv').config();

const debugUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    console.log('\n=== USERS COLLECTION ===');
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);
    
    users.forEach((user, index) => {
      console.log(`--- User ${index + 1} ---`);
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Name:', user.name);
      console.log('---\n');
    });
    
    console.log('\n=== COMPANIES COLLECTION ===');
    const companies = await Company.find({});
    console.log(`📊 Found ${companies.length} companies`);
    
    companies.forEach((company, index) => {
      console.log(`--- Company ${index + 1} ---`);
      console.log('ID:', company._id);
      console.log('Company Email:', company.companyEmail);
      console.log('Company Name:', company.companyName);
      console.log('Account Status:', company.accountStatus);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugUsers();
