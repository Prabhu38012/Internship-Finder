const mongoose = require('mongoose');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Application = require('./models/Application');
require('dotenv').config();

async function viewDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).select('name email role isActive companyProfile.companyName');
        console.log(`👥 USERS (${users.length} total):`);
        console.log('=' .repeat(50));
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            if (user.role === 'company' && user.companyProfile?.companyName) {
                console.log(`   Company: ${user.companyProfile.companyName}`);
            }
            console.log('');
        });

        // Get all internships
        const internships = await Internship.find({}).populate('company', 'name companyProfile.companyName');
        console.log(`💼 INTERNSHIPS (${internships.length} total):`);
        console.log('=' .repeat(50));
        internships.forEach((internship, index) => {
            console.log(`${index + 1}. ${internship.title}`);
            console.log(`   Company: ${internship.companyName || internship.company?.companyProfile?.companyName || internship.company?.name}`);
            console.log(`   Category: ${internship.category}`);
            console.log(`   Type: ${internship.type}`);
            console.log(`   Status: ${internship.status}`);
            console.log(`   Location: ${internship.location?.city || 'Remote'}, ${internship.location?.country || ''}`);
            console.log(`   Stipend: ${internship.stipend?.amount || 0} ${internship.stipend?.currency || 'USD'} / ${internship.stipend?.period || 'month'}`);
            console.log('');
        });

        // Get all applications
        const applications = await Application.find({})
            .populate('applicant', 'name email')
            .populate('internship', 'title companyName');
        console.log(`📋 APPLICATIONS (${applications.length} total):`);
        console.log('=' .repeat(50));
        if (applications.length === 0) {
            console.log('No applications found.\n');
        } else {
            applications.forEach((app, index) => {
                console.log(`${index + 1}. ${app.applicant?.name || 'Unknown'} -> ${app.internship?.title || 'Unknown'}`);
                console.log(`   Status: ${app.status}`);
                console.log(`   Applied: ${app.createdAt?.toDateString()}`);
                console.log('');
            });
        }

        // Summary
        console.log('📊 SUMMARY:');
        console.log('=' .repeat(50));
        console.log(`Total Users: ${users.length}`);
        console.log(`- Students: ${users.filter(u => u.role === 'student').length}`);
        console.log(`- Companies: ${users.filter(u => u.role === 'company').length}`);
        console.log(`- Admins: ${users.filter(u => u.role === 'admin').length}`);
        console.log(`Total Internships: ${internships.length}`);
        console.log(`- Active: ${internships.filter(i => i.status === 'active').length}`);
        console.log(`- Inactive: ${internships.filter(i => i.status !== 'active').length}`);
        console.log(`Total Applications: ${applications.length}`);

        // Show login credentials
        console.log('\n🔑 SAMPLE LOGIN CREDENTIALS:');
        console.log('=' .repeat(50));
        const sampleUsers = users.filter(u => 
            u.email === 'hr@techcorp.com' || 
            u.email === 'john@student.com' || 
            u.email === 'prabhukd77@gmail.com'
        );
        sampleUsers.forEach(user => {
            console.log(`${user.role.toUpperCase()}: ${user.email} / password`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

viewDatabase();
