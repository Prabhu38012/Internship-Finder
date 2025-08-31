const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@'));
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        
        console.log('✅ Successfully connected to MongoDB Atlas!');
        
        // Test basic operations
        const testCollection = mongoose.connection.db.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log('✅ Successfully performed write operation!');
        
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Successfully performed delete operation!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('IP')) {
            console.log('\n🔧 SOLUTION: Add your IP to MongoDB Atlas whitelist:');
            console.log('1. Go to https://cloud.mongodb.com');
            console.log('2. Navigate to Network Access');
            console.log('3. Click "Add IP Address"');
            console.log('4. Click "Add Current IP Address"');
            console.log('5. Save the changes');
        }
        
        if (error.message.includes('authentication')) {
            console.log('\n🔧 SOLUTION: Check your username/password in the connection string');
        }
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
}

testConnection();
