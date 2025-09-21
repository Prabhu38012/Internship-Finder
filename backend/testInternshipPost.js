const mongoose = require('mongoose');
const Company = require('./models/Company');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const testInternshipPost = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Get first company
    const company = await Company.findOne({ accountStatus: 'active' });
    if (!company) {
      console.log('❌ No active companies found');
      return;
    }
    
    console.log('✅ Found company:', company.companyName);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: company._id, type: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('🔑 Generated JWT token');
    console.log('📋 Company can post internships:', company.canPostInternship());
    console.log('📊 Current posts:', company.subscription.currentInternshipPosts);
    console.log('📈 Max posts:', company.subscription.maxInternshipPosts);
    
    console.log('\n🎯 To test manually:');
    console.log('1. Login with:', company.companyEmail);
    console.log('2. Use this token in localStorage:', token.substring(0, 50) + '...');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testInternshipPost();
