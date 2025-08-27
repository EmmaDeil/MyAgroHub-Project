// MongoDB Connection Test Script
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('🧪 Testing MongoDB Atlas Connection...');
  console.log('📍 Your current IP should be: 102.89.68.199');
  console.log('🔗 Connection URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
  
  try {
    console.log('⏳ Attempting connection...');
    
    // Set a shorter timeout for testing
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ SUCCESS! Connected to MongoDB Atlas');
    console.log('🌱 Database Name:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('📊 Connection State:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 IP Whitelist Issue Detected!');
      console.log('📍 Your IP: 102.89.68.199');
      console.log('🔗 Fix at: https://cloud.mongodb.com');
      console.log('   → Network Access → Add IP Address → Add Current IP');
      console.log('   → OR add 0.0.0.0/0 for development');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication Issue Detected!');
      console.log('   → Check username/password in MongoDB URI');
    }
    
    process.exit(1);
  }
};

testConnection();
