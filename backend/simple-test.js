// Simple MongoDB connection test
const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('🔧 Simple MongoDB Connection Test');
console.log('================================');
console.log('📍 Your IP: 102.89.68.199');
console.log('🔗 URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
});

async function testConnection() {
  try {
    console.log('🔄 Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log('🏓 Ping successful!');
    
    console.log('📊 Server info:');
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    console.log('   Version:', serverStatus.version);
    console.log('   Host:', serverStatus.host);
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('   Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🚨 SOLUTION: Add 102.89.68.199/32 to MongoDB Atlas Network Access');
    }
  } finally {
    await client.close();
    console.log('🔒 Connection closed');
  }
}

testConnection();
