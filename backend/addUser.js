const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function addUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const newUser = new User({
        name: 'Prabhu',
        email: 'prabhukd77@gmail.com',
        password: 'password',
        role: 'company',
        companyProfile: {
            companyName: 'Prabhu Tech Solutions',
            industry: 'Technology',
            companySize: '10-50',
            description: 'A growing tech company'
        }
    });
    
    await newUser.save();
    console.log('User created: prabhukd77@gmail.com / password');
    await mongoose.connection.close();
}

addUser().catch(console.error);
