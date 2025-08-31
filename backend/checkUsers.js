const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if users exist
        const users = await User.find({}).select('name email role isActive');
        console.log(`\nFound ${users.length} users in database:`);
        
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
        });

        // Specifically check for sample users
        const sampleEmails = ['hr@techcorp.com', 'john@student.com'];
        
        for (const email of sampleEmails) {
            const user = await User.findOne({ email }).select('+password');
            if (user) {
                console.log(`\n✅ Found ${email}:`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Active: ${user.isActive}`);
                console.log(`   Has password: ${!!user.password}`);
                console.log(`   Password length: ${user.password?.length || 0}`);
            } else {
                console.log(`\n❌ User ${email} not found`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkUsers();
