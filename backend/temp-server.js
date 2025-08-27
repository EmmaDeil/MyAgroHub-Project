const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth-fallback');
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

// Skip database connection for now - use localStorage fallback
console.log('⚠️  Running in NO-DATABASE mode');
console.log('📝 All data will be stored in localStorage');
console.log('💡 To fix: Whitelist your IP in MongoDB Atlas');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AgriTech Backend Server is running (NO DATABASE)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'LocalStorage fallback mode'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌾 Welcome to AgriTech Backend API (Temp Mode)',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
    note: 'Running without database - using localStorage fallback'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log('🚀 AgriTech Backend Server running on port', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('📱 Frontend URL:', process.env.FRONTEND_URL);
  console.log('⚠️  Database: DISABLED (localStorage mode)');
  console.log('');
  console.log('📋 To enable database:');
  console.log('1. Whitelist IP in MongoDB Atlas: https://cloud.mongodb.com');
  console.log('2. Or install MongoDB locally');
  console.log('3. Then use: npm start');
});

module.exports = app;
