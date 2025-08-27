const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test admin user creation
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL;
    
    console.log(`🔍 Checking for admin user: ${adminEmail}`);
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('❌ No admin user found. You need to sign up first.');
      console.log(`📝 Go to your frontend and sign up with: ${adminEmail}`);
    } else {
      console.log('✅ Admin user exists!');
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Name: ${adminUser.name}`);
    }
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 FIX: Add your IP to MongoDB Atlas whitelist:');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Navigate to Network Access → IP Whitelist');
      console.log('   3. Click "Add IP Address"');
      console.log('   4. Click "Add Current IP Address"');
    }
  }
  
  process.exit(0);
}

testConnection();
