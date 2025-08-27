const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnector {
  constructor() {
    this.isConnected = false;
    this.connectionType = null;
  }

  async connect() {
    console.log('🔄 Attempting database connection...');
    
    // Try MongoDB Atlas first
    try {
      console.log('📡 Trying MongoDB Atlas...');
      await this.connectToAtlas();
      this.connectionType = 'atlas';
      this.isConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully!');
      return 'atlas';
    } catch (atlasError) {
      console.log('❌ Atlas connection failed:', atlasError.message);
      
      // Try local MongoDB
      try {
        console.log('🏠 Trying local MongoDB...');
        await this.connectToLocal();
        this.connectionType = 'local';
        this.isConnected = true;
        console.log('✅ Connected to local MongoDB successfully!');
        return 'local';
      } catch (localError) {
        console.log('❌ Local MongoDB connection failed:', localError.message);
        throw new Error('Both Atlas and local MongoDB connections failed');
      }
    }
  }

  async connectToAtlas() {
    const atlasUri = process.env.MONGODB_URI;
    if (!atlasUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
  }

  async connectToLocal() {
    const localUri = process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/agritech';
    
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      type: this.connectionType,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };
  }
}

module.exports = DatabaseConnector;
