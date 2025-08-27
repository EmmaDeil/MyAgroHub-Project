const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI (partial):', process.env.MONGODB_URI ? 'mongodb+srv://[hidden]@cluster0...' : 'Not found');

async function verifyDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    console.log('\n📊 Database Information:');
    console.log('Database Name:', db.databaseName);
    console.log('Connection State:', mongoose.connection.readyState); // 1 = connected
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    if (collections.length === 0) {
      console.log('  No collections found (database is empty)');
    } else {
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    }
    
    // Test creating a document to prove it's working
    console.log('\n🧪 Testing database write capability...');
    const testCollection = db.collection('test_connection');
    const result = await testCollection.insertOne({
      message: 'MongoDB Atlas is working!',
      timestamp: new Date(),
      from: 'AgriTech App'
    });
    console.log('✅ Test document inserted with ID:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    console.log('\n🎉 CONFIRMATION: MongoDB Atlas IS your database!');
    console.log('   - It stores all your application data');
    console.log('   - It\'s hosted in the cloud by MongoDB');
    console.log('   - Your app connects to it via the internet');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB Atlas');
    process.exit(0);
  }
}

verifyDatabase();
