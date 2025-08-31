const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create user document directly
        const hashedPassword = await bcrypt.hash('password', 12);
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // Check if user exists
        const existingUser = await usersCollection.findOne({ email: 'prabhukd77@gmail.com' });
        if (existingUser) {
            console.log('✅ User already exists');
            console.log('Email: prabhukd77@gmail.com');
            console.log('Password: password');
            return;
        }

        // Insert new user
        const result = await usersCollection.insertOne({
            name: 'Prabhu',
            email: 'prabhukd77@gmail.com',
            password: hashedPassword,
            role: 'company',
            isActive: true,
            companyProfile: {
                companyName: 'Prabhu Tech Solutions',
                industry: 'Technology',
                companySize: '10-50',
                description: 'A growing tech company focused on innovative solutions',
                verified: false
            },
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                profileVisibility: 'public'
            },
            savedInternships: [],
            rating: {
                average: 0,
                count: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ User created successfully!');
        console.log('Email: prabhukd77@gmail.com');
        console.log('Password: password');
        console.log('Role: company');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createUser();
