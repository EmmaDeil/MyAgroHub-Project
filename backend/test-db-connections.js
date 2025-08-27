const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 MongoDB Connection Resolver');
console.log('=============================');

async function testAllConnections() {
  console.log('📍 Your IP: 102.89.68.199 (needs to be whitelisted)');
  console.log('');
  
  // Test 1: MongoDB Atlas
  console.log('🔍 Test 1: MongoDB Atlas');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ SUCCESS: MongoDB Atlas is working!');
    console.log('🎉 Your IP has been whitelisted correctly!');
    await mongoose.disconnect();
    return 'atlas-working';
  } catch (error) {
    console.log('❌ FAILED: MongoDB Atlas connection blocked');
    console.log('   Reason:', error.message.split('.')[0]);
    
    if (error.message.includes('IP')) {
      console.log('   💡 Solution: Whitelist 102.89.68.199/32 in MongoDB Atlas');
    }
  }
  
  console.log('');
  
  // Test 2: Local MongoDB
  console.log('🔍 Test 2: Local MongoDB');
  try {
    await mongoose.connect('mongodb://localhost:27017/agritech', {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ SUCCESS: Local MongoDB is available!');
    console.log('💡 You can use local database instead of Atlas');
    await mongoose.disconnect();
    return 'local-working';
  } catch (error) {
    console.log('❌ FAILED: Local MongoDB not available');
    console.log('   💡 Solution: Install MongoDB locally or use Atlas');
  }
  
  console.log('');
  console.log('🚨 NO DATABASE AVAILABLE');
  console.log('📝 Application will run in localStorage mode only');
  console.log('');
  console.log('🔧 Solutions:');
  console.log('   1. Fix Atlas: https://cloud.mongodb.com → Network Access → Add 102.89.68.199/32');
  console.log('   2. Install local: https://www.mongodb.com/try/download/community');
  console.log('   3. Continue with localStorage (limited functionality)');
  
  return 'none-working';
}

testAllConnections().then(result => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🎯 Final result: ${result}`);
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
