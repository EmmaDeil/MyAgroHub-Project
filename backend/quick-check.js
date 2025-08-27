const mongoose = require('mongoose');
const User = require('./models/User');
const Farmer = require('./models/Farmer');
require('dotenv').config();

async function quickCheck() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    
    const userCount = await User.countDocuments();
    const farmerCount = await Farmer.countDocuments();
    const pendingFarmers = await Farmer.countDocuments({ isVerified: false });
    
    console.log('\n📊 Quick Database Summary:');
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`🌱 Total Farmers: ${farmerCount}`);
    console.log(`⏳ Pending Verification: ${pendingFarmers}`);
    
    if (userCount > 0) {
      const users = await User.find().select('name email role createdAt');
      console.log('\n👥 Users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    if (farmerCount > 0) {
      const farmers = await Farmer.find().populate('user', 'name email').select('farmName isVerified isActive user');
      console.log('\n🌱 Farmers:');
      farmers.forEach(farmer => {
        console.log(`   - ${farmer.farmName} - ${farmer.user?.email} - Verified: ${farmer.isVerified}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Check complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

quickCheck();
