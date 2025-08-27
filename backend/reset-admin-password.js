const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'eclefzy@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('📧 Found admin user:', adminUser.email);
    
    // Reset password to a known value
    const newPassword = 'admin123';
    adminUser.password = newPassword;
    await adminUser.save();
    
    console.log('✅ Password reset successfully!');
    console.log('🔑 New password:', newPassword);
    console.log('📧 Admin email:', adminUser.email);
    
    await mongoose.disconnect();
    console.log('\n🎉 You can now log in with:');
    console.log('   Email: eclefzy@gmail.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

resetAdminPassword();
