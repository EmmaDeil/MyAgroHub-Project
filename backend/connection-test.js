const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 MongoDB Connection Test');
console.log('========================');
console.log('📍 Your IP:', '102.89.68.199');
console.log('🔗 Testing connection...');

const testConnection = async () => {
  try {
    // Connect with proper timeout settings
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ SUCCESS: MongoDB Atlas connection established!');
    console.log('🌱 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('⚡ Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('🏓 Ping result:', result);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('   Error:', error.name);
    console.log('   Message:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP WHITELIST ISSUE:');
      console.log('   Your IP 102.89.68.199 needs to be whitelisted');
      console.log('   Go to MongoDB Atlas → Network Access → Add IP Address');
      console.log('   Add: 102.89.68.199/32');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 AUTHENTICATION ISSUE:');
      console.log('   Check your username/password in MongoDB Atlas');
    }
  }
  
  process.exit(0);
};

testConnection();
