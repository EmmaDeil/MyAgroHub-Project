// Continuous MongoDB Connection Test
const mongoose = require('mongoose');
require('dotenv').config();

const testConnectionContinuous = async () => {
  console.log('🔄 Continuous MongoDB Atlas Connection Test');
  console.log('📍 Testing connection every 30 seconds...');
  console.log('⏹️  Press Ctrl+C to stop');
  console.log('');

  let attempt = 1;
  
  const testInterval = setInterval(async () => {
    console.log(`\n🧪 Attempt ${attempt}: Testing connection...`);
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      console.log('🎉 SUCCESS! MongoDB Atlas connected!');
      console.log('🌱 Database:', mongoose.connection.name);
      console.log('🏠 Host:', mongoose.connection.host);
      
      // Test database operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📋 Collections:', collections.length > 0 ? collections.map(c => c.name) : 'None yet');
      
      await mongoose.disconnect();
      console.log('\n✅ Database connection is working!');
      console.log('🚀 You can now run: npm run dev-db');
      
      clearInterval(testInterval);
      process.exit(0);
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message.substring(0, 60)}...`);
      
      if (error.message.includes('IP')) {
        console.log('💡 Waiting for IP whitelist to take effect...');
      }
      
      attempt++;
    }
  }, 30000); // Test every 30 seconds
  
  // Run first test immediately
  setTimeout(() => {
    console.log('🧪 Attempt 1: Testing connection...');
  }, 1000);
};

testConnectionContinuous();
