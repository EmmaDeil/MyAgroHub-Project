const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 MongoDB Connection Diagnostic Test');
console.log('=====================================');
console.log('📍 Your IP:', '102.89.68.199');
console.log('🔗 Connection URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
console.log('⏰ Starting connection test with 10s timeout...');

// Set shorter timeout for faster feedback
mongoose.set('serverSelectionTimeoutMS', 10000);

const testConnection = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Attempting connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const duration = Date.now() - startTime;
    console.log(`✅ SUCCESS! Connected in ${duration}ms`);
    console.log('🌱 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    process.exit(0);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ FAILED after ${duration}ms`);
    console.log('Error:', error.name);
    console.log('Message:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🚨 IP WHITELIST ISSUE:');
      console.log('   Add 102.89.68.199/32 to MongoDB Atlas Network Access');
      console.log('   Or add 0.0.0.0/0 for development');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔐 AUTHENTICATION ISSUE:');
      console.log('   Check username/password in MongoDB Atlas Database Access');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\n🌐 DNS/NETWORK ISSUE:');
      console.log('   Cannot resolve cluster hostname');
      console.log('   Check internet connection or cluster URL');
    }
    
    process.exit(1);
  }
};

testConnection();
