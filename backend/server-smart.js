const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const farmerRoutes = require('./routes/farmers');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Smart Database connection with multiple fallbacks
const connectToDatabase = async () => {
  console.log('🔄 Starting smart database connection...');
  
  // Option 1: Try MongoDB Atlas
  try {
    console.log('📡 Attempting MongoDB Atlas connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('🌱 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    return 'atlas';
    
  } catch (atlasError) {
    console.log('❌ Atlas connection failed:', atlasError.message);
    
    // Option 2: Try Local MongoDB
    try {
      console.log('🏠 Attempting local MongoDB connection...');
      const localUri = process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/agritech';
      
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      
      console.log('✅ SUCCESS: Connected to local MongoDB!');
      console.log('🌱 Database:', mongoose.connection.name);
      console.log('🏠 Host:', mongoose.connection.host);
      return 'local';
      
    } catch (localError) {
      console.log('❌ Local MongoDB connection failed:', localError.message);
      
      // Option 3: Start without database (localStorage mode)
      console.log('\n🚨 ALL DATABASE CONNECTIONS FAILED!');
      console.log('🔄 Starting in NO-DATABASE mode (localStorage fallback)');
      console.log('\n💡 To fix Atlas connection:');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Network Access → Add IP Address');
      console.log('   3. Add your IP: 102.89.68.199/32');
      console.log('   4. Or add 0.0.0.0/0 for development');
      console.log('\n💡 To use local MongoDB:');
      console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('   2. Start MongoDB service');
      console.log('   3. Restart this server');
      
      // Don't exit - continue without database
      return 'none';
    }
  }
};

// Initialize database connection
connectToDatabase().then((connectionType) => {
  if (connectionType === 'none') {
    console.log('\n⚠️  RUNNING WITHOUT DATABASE');
    console.log('📝 All data will be stored in localStorage only');
  }
}).catch((error) => {
  console.error('🚨 Database initialization failed:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'OK',
    message: 'AgriTech Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStates[dbStatus] || 'unknown',
      name: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'not connected'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌾 AgriTech Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'GET /api/products - Get all products',
      'POST /api/orders - Create order'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log('\n🚀 AgriTech Backend Server is running!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
