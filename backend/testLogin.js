const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test the sample credentials
        const testCredentials = [
            { email: 'hr@techcorp.com', password: 'password' },
            { email: 'john@student.com', password: 'password' }
        ];

        for (const cred of testCredentials) {
            console.log(`\nTesting login for: ${cred.email}`);
            
            // Find user
            const user = await User.findOne({ email: cred.email }).select('+password');
            
            if (!user) {
                console.log(`❌ User not found: ${cred.email}`);
                continue;
            }

            console.log(`✅ User found: ${user.name} (${user.role})`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Password hash exists: ${!!user.password}`);

            // Test password comparison
            const isMatch = await user.comparePassword(cred.password);
            console.log(`   Password match: ${isMatch ? '✅' : '❌'}`);

            if (!isMatch) {
                // Try to check what the actual stored password looks like
                console.log(`   Stored password hash: ${user.password.substring(0, 20)}...`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testLogin();
