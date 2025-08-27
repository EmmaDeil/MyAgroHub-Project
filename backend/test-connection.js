const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Atlas connection...');
console.log('📍 Current IP should be whitelisted: 102.89.68.199');
console.log('🔗 Connecting to Atlas cluster...');

const connectTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000 // 15 second timeout
    });
    
    console.log('✅ SUCCESS: MongoDB Atlas connection established!');
    console.log('🌱 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('⚡ Connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED: MongoDB connection error');
    console.error('💡 Error type:', error.name);
    console.error('📝 Message:', error.message);
    
    if (error.reason) {
      console.error('🔍 Topology details:', error.reason.type);
      console.error('🔍 Servers checked:', Object.keys(error.reason.servers || {}));
    }
    
    // Additional troubleshooting info
    if (error.message.includes('IP')) {
      console.error('');
      console.error('🚨 IP WHITELIST ISSUE DETECTED:');
      console.error('   Your IP 102.89.68.199 is not whitelisted in MongoDB Atlas');
      console.error('   Go to: https://cloud.mongodb.com');
      console.error('   Navigate to: Network Access > Add IP Address');
      console.error('   Add: 102.89.68.199/32');
      console.error('   Or add: 0.0.0.0/0 (for development only)');
    }
    
    process.exit(1);
  }
};

connectTest();
