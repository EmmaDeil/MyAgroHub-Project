const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');

// MongoDB Connection Test
async function testMongoConnection() {
  try {
    console.log('📡 Connecting to MongoDB...');
    console.log('🌐 URI:', process.env.MONGODB_URI ? 'Found in .env file' : 'NOT FOUND');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    console.log('✅ MongoDB Connection Successful!');
    console.log('🏷️  Database Name:', mongoose.connection.name);
    console.log('🌍 Host:', mongoose.connection.host);
    console.log('📊 Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Test basic operations
    console.log('\n🧪 Testing database operations...');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available Collections:', collections.map(c => c.name).join(', ') || 'None');
    
    // Check connection stats
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log('⚡ MongoDB Version:', serverStatus.version);
    console.log('💾 Storage Engine:', serverStatus.storageEngine?.name || 'Unknown');
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('🚨 Error Details:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Possible Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas cluster is running');
      console.error('   3. Check if IP address is whitelisted in MongoDB Atlas');
      console.error('   4. Verify credentials in .env file');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('\n💡 Connection string format issue:');
      console.error('   - Check MONGODB_URI format in .env file');
      console.error('   - Ensure no extra spaces or characters');
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed.');
    process.exit(0);
  }
}

// Run the test
testMongoConnection();
