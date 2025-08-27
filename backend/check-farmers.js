const mongoose = require('mongoose');
const User = require('./models/User');
const Farmer = require('./models/Farmer');
require('dotenv').config();

async function checkPendingFarmers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all farmers
    const allFarmers = await Farmer.find().populate('user', 'name email role isActive');
    console.log(`\n📊 Total farmers in database: ${allFarmers.length}`);
    
    // Get pending verification farmers
    const pendingFarmers = await Farmer.find({ isVerified: false }).populate('user', 'name email role isActive');
    console.log(`⏳ Farmers pending verification: ${pendingFarmers.length}`);
    
    // Get inactive farmers
    const inactiveFarmers = await Farmer.find({ isActive: false }).populate('user', 'name email role isActive');
    console.log(`❌ Inactive farmers: ${inactiveFarmers.length}`);
    
    // Get users with farmer role
    const farmerUsers = await User.find({ role: 'farmer' });
    console.log(`👨‍🌾 Users with farmer role: ${farmerUsers.length}`);
    
    // Get all users (to see if farmer signed up as regular user)
    const allUsers = await User.find().select('name email role isActive createdAt');
    console.log(`\n👥 All users in database:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive} - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    if (pendingFarmers.length > 0) {
      console.log(`\n⏳ Farmers pending verification:`);
      pendingFarmers.forEach(farmer => {
        console.log(`   - ${farmer.farmName} (${farmer.user?.email}) - Verified: ${farmer.isVerified} - Active: ${farmer.isActive}`);
      });
    }
    
    if (allFarmers.length > 0) {
      console.log(`\n🌱 All farmers:`);
      allFarmers.forEach(farmer => {
        console.log(`   - ${farmer.farmName} (${farmer.user?.email}) - Verified: ${farmer.isVerified} - Active: ${farmer.isActive}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkPendingFarmers();
