require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing test user
    await User.deleteOne({ email: 'test@student.com' });

    // Create a simple test user
    const testUser = await User.create({
      name: 'Test Student',
      email: 'test@student.com',
      password: 'password', // This will be hashed by the pre-save middleware
      role: 'student',
      isVerified: true,
      studentProfile: {
        university: 'Test University',
        degree: 'Computer Science',
        graduationYear: 2025,
        skills: ['JavaScript', 'React', 'Node.js']
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('Login with: test@student.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
