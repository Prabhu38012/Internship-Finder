const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check what users exist
        const users = await User.find({}).select('name email role');
        console.log('\nExisting users:');
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });

        // Create a test student user for applications
        const studentEmail = 'student@test.com';
        const existingStudent = await User.findOne({ email: studentEmail });
        
        if (!existingStudent) {
            const student = await User.create({
                name: 'Test Student',
                email: studentEmail,
                password: 'password',
                role: 'student',
                studentProfile: {
                    university: 'Test University',
                    degree: 'Computer Science',
                    graduationYear: 2025
                }
            });
            console.log(`\n✅ Created student account: ${studentEmail} / password`);
        } else {
            console.log(`\n✅ Student account exists: ${studentEmail} / password`);
        }

        // Create company user if needed
        const companyEmail = 'company@test.com';
        const existingCompany = await User.findOne({ email: companyEmail });
        
        if (!existingCompany) {
            const company = await User.create({
                name: 'Test Company',
                email: companyEmail,
                password: 'password',
                role: 'company',
                companyProfile: {
                    companyName: 'Test Tech Corp',
                    industry: 'Technology'
                }
            });
            console.log(`✅ Created company account: ${companyEmail} / password`);
        } else {
            console.log(`✅ Company account exists: ${companyEmail} / password`);
        }

        console.log('\n🔑 LOGIN CREDENTIALS:');
        console.log('Student (for applications): student@test.com / password');
        console.log('Company (for posting jobs): company@test.com / password');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixLogin();
