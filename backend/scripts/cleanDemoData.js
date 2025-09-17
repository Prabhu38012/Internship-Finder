const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
require('dotenv').config();

const cleanDemoData = async () => {
  try {
    console.log('🧹 Starting demo data cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // List of demo company names to identify and remove
    const demoCompanyNames = [
      'Tech Corp',
      'InnovateLabs',
      'DataFlow Systems',
      'CloudNine Solutions',
      'FinTech Dynamics',
      'GreenTech Innovations',
      'CyberShield Security',
      'HealthTech Pro',
      'EduPlatform Inc',
      'GameStudio Alpha',
      'RoboTech Industries',
      'SocialConnect',
      'EcoSmart Solutions',
      'VirtualReality Labs',
      'BlockChain Ventures',
      'AutoDrive Systems',
      'SpaceTech Dynamics',
      'BioTech Innovations',
      'SmartHome Tech',
      'QuantumCompute Labs'
    ];

    // Demo student emails to identify and remove
    const demoStudentEmails = [
      'john@student.com'
    ];

    console.log('🔍 Finding demo companies...');
    
    // Find demo companies by email patterns and company names
    const demoCompanies = await User.find({
      $or: [
        { 'companyProfile.companyName': { $in: demoCompanyNames } },
        { email: { $regex: /@(techcorp|innovatelabs|dataflow|cloudnine|fintechdynamics|greentech|cybershield|healthtechpro|eduplatform|gamestudio|robotech|socialconnect|ecosmart|vrlabs|blockchainventures|autodrive|spacetech|biotechinnovations|smarthometech|quantumcompute)\.com$/i } }
      ],
      role: 'company'
    });

    console.log(`📊 Found ${demoCompanies.length} demo companies`);

    // Find demo students
    const demoStudents = await User.find({
      email: { $in: demoStudentEmails },
      role: 'student'
    });

    console.log(`📊 Found ${demoStudents.length} demo students`);

    // Get all demo user IDs
    const demoUserIds = [...demoCompanies, ...demoStudents].map(user => user._id);

    if (demoUserIds.length === 0) {
      console.log('✅ No demo data found to clean up');
      return;
    }

    console.log('🗑️ Removing related data...');

    // Remove applications related to demo users
    const applicationDeleteResult = await Application.deleteMany({
      $or: [
        { applicant: { $in: demoUserIds } },
        { company: { $in: demoUserIds } }
      ]
    });
    console.log(`🗑️ Removed ${applicationDeleteResult.deletedCount} demo applications`);

    // Remove wishlists related to demo users
    const wishlistDeleteResult = await Wishlist.deleteMany({
      student: { $in: demoUserIds }
    });
    console.log(`🗑️ Removed ${wishlistDeleteResult.deletedCount} demo wishlist items`);

    // Remove notifications related to demo users
    const notificationDeleteResult = await Notification.deleteMany({
      $or: [
        { recipient: { $in: demoUserIds } },
        { sender: { $in: demoUserIds } }
      ]
    });
    console.log(`🗑️ Removed ${notificationDeleteResult.deletedCount} demo notifications`);

    // Remove internships posted by demo companies
    const internshipDeleteResult = await Internship.deleteMany({
      company: { $in: demoUserIds }
    });
    console.log(`🗑️ Removed ${internshipDeleteResult.deletedCount} demo internships`);

    // Remove demo companies from Company collection (if using separate Company model)
    try {
      const companyDeleteResult = await Company.deleteMany({
        $or: [
          { 'profile.companyName': { $in: demoCompanyNames } },
          { email: { $regex: /@(techcorp|innovatelabs|dataflow|cloudnine|fintechdynamics|greentech|cybershield|healthtechpro|eduplatform|gamestudio|robotech|socialconnect|ecosmart|vrlabs|blockchainventures|autodrive|spacetech|biotechinnovations|smarthometech|quantumcompute)\.com$/i } }
        ]
      });
      console.log(`🗑️ Removed ${companyDeleteResult.deletedCount} demo companies from Company collection`);
    } catch (error) {
      console.log('ℹ️ Company collection cleanup skipped (collection may not exist)');
    }

    // Remove demo users
    const userDeleteResult = await User.deleteMany({
      _id: { $in: demoUserIds }
    });
    console.log(`🗑️ Removed ${userDeleteResult.deletedCount} demo users`);

    console.log('✅ Demo data cleanup completed successfully!');
    console.log('📈 Your platform is now ready for real users and companies');
    
  } catch (error) {
    console.error('❌ Error during demo data cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Add verification function to check what would be deleted
const verifyDemoData = async () => {
  try {
    console.log('🔍 Verifying demo data to be cleaned...');
    
    await mongoose.connect(process.env.MONGO_URI);
    
    const demoCompanyNames = [
      'Tech Corp', 'InnovateLabs', 'DataFlow Systems', 'CloudNine Solutions',
      'FinTech Dynamics', 'GreenTech Innovations', 'CyberShield Security',
      'HealthTech Pro', 'EduPlatform Inc', 'GameStudio Alpha', 'RoboTech Industries',
      'SocialConnect', 'EcoSmart Solutions', 'VirtualReality Labs', 'BlockChain Ventures',
      'AutoDrive Systems', 'SpaceTech Dynamics', 'BioTech Innovations', 'SmartHome Tech',
      'QuantumCompute Labs'
    ];

    const demoCompanies = await User.find({
      $or: [
        { 'companyProfile.companyName': { $in: demoCompanyNames } },
        { email: { $regex: /@(techcorp|innovatelabs|dataflow|cloudnine|fintechdynamics|greentech|cybershield|healthtechpro|eduplatform|gamestudio|robotech|socialconnect|ecosmart|vrlabs|blockchainventures|autodrive|spacetech|biotechinnovations|smarthometech|quantumcompute)\.com$/i } }
      ],
      role: 'company'
    }).select('name email companyProfile.companyName');

    const demoStudents = await User.find({
      email: 'john@student.com',
      role: 'student'
    }).select('name email');

    const demoUserIds = [...demoCompanies, ...demoStudents].map(user => user._id);

    const internshipCount = await Internship.countDocuments({ company: { $in: demoUserIds } });
    const applicationCount = await Application.countDocuments({
      $or: [{ applicant: { $in: demoUserIds } }, { company: { $in: demoUserIds } }]
    });
    const wishlistCount = await Wishlist.countDocuments({ student: { $in: demoUserIds } });
    const notificationCount = await Notification.countDocuments({
      $or: [{ recipient: { $in: demoUserIds } }, { sender: { $in: demoUserIds } }]
    });

    console.log('\n📊 Demo Data Summary:');
    console.log(`Companies: ${demoCompanies.length}`);
    console.log(`Students: ${demoStudents.length}`);
    console.log(`Internships: ${internshipCount}`);
    console.log(`Applications: ${applicationCount}`);
    console.log(`Wishlist Items: ${wishlistCount}`);
    console.log(`Notifications: ${notificationCount}`);
    
    if (demoCompanies.length > 0) {
      console.log('\n🏢 Demo Companies to be removed:');
      demoCompanies.forEach(company => {
        console.log(`- ${company.companyProfile?.companyName || company.name} (${company.email})`);
      });
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    await mongoose.disconnect();
  }
};

// Command line interface
const command = process.argv[2];

if (command === 'verify') {
  verifyDemoData();
} else if (command === 'clean') {
  cleanDemoData();
} else {
  console.log('Usage:');
  console.log('  node cleanDemoData.js verify  - Show what demo data would be removed');
  console.log('  node cleanDemoData.js clean   - Remove all demo data');
}

module.exports = { cleanDemoData, verifyDemoData };
