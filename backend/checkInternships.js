const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Internship = require('./models/Internship');

    console.log('=== All Internships ===');
    console.log('Current Date:', new Date());

    const all = await Internship.find({}).sort({ createdAt: -1 });
    all.forEach((internship, i) => {
        const deadlinePassed = new Date(internship.applicationDeadline) < new Date();
        console.log(`\n${i + 1}. ${internship.title}`);
        console.log(`   Status: ${internship.status}`);
        console.log(`   Deadline: ${internship.applicationDeadline} ${deadlinePassed ? 'PASSED' : 'FUTURE'}`);
        console.log(`   Company Name: ${internship.companyName}`);
        console.log(`   Will show on list: ${internship.status === 'active' && !deadlinePassed ? 'YES' : 'NO'}`);
    });

    process.exit(0);
}).catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
