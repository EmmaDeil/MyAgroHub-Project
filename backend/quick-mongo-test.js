const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('🔧 Quick MongoDB Test (5s timeout)');
console.log('==================================');

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000
});

async function quickTest() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Connecting...');
    await client.connect();
    
    const duration = Date.now() - startTime;
    console.log(`✅ SUCCESS! Connected in ${duration}ms`);
    console.log('🌱 Testing ping...');
    
    await client.db("admin").command({ ping: 1 });
    console.log('🏓 Ping successful!');
    console.log('🎉 IP WHITELISTING WORKED!');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Failed after ${duration}ms`);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('🚨 IP NOT WHITELISTED YET');
      console.log('   Add 102.89.68.199/32 to MongoDB Atlas Network Access');
    } else if (error.message.includes('timeout') || error.name === 'MongoServerSelectionError') {
      console.log('🚨 CONNECTION TIMEOUT - IP STILL NOT WHITELISTED');
    } else {
      console.log('❓ Other error:', error.message);
    }
  } finally {
    try {
      await client.close();
    } catch (e) {}
  }
  
  process.exit(0);
}

quickTest();
