const mongoose = require('mongoose');
require('dotenv').config();

async function checkInternships() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Internship = require('./models/Internship');

        const now = new Date();
        console.log('Current Date:', now.toISOString());

        // Check ALL internships
        const all = await Internship.find({}).select('title status applicationDeadline company').lean();
        console.log('\n=== ALL Internships ===');
        console.log('Total:', all.length);
        all.forEach(i => {
            const deadline = new Date(i.applicationDeadline);
            const isValid = i.status === 'active' && deadline >= now;
            console.log(`- ${i.title}`);
            console.log(`  Status: ${i.status}`);
            console.log(`  Deadline: ${i.applicationDeadline}`);
            console.log(`  Would Show: ${isValid}`);
        });

        // Check with ACTIVE filter only
        const active = await Internship.find({ status: 'active' }).lean();
        console.log('\n=== ACTIVE Status Only ===');
        console.log('Count:', active.length);

        // Check with BOTH filters (what the API uses)
        const query = { status: 'active', applicationDeadline: { $gte: now } };
        const matching = await Internship.find(query).lean();
        console.log('\n=== Matching API Query (status=active AND deadline>=now) ===');
        console.log('Count:', matching.length);
        matching.forEach(i => console.log(`- ${i.title}`));

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkInternships();
