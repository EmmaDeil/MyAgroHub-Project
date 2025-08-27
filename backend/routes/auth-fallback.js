const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Mock user storage (in real app, this would be database)
let mockUsers = [
  {
    id: 'user_1',
    name: 'Demo User',
    email: 'demo@agrohub.com',
    password: '$2a$12$...' // hashed 'password123'
  },
  {
    id: 'admin_1', 
    name: 'Admin User',
    email: 'admin@agrohub.com',
    password: '$2a$12$...' // hashed 'admin123'
  }
];

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Demo credentials for testing
    if (email === 'demo@agrohub.com' && password === 'password123') {
      const token = signToken('demo_user_1');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          user: {
            id: 'demo_user_1',
            name: 'Demo User',
            email: 'demo@agrohub.com',
            role: 'user'
          }
        }
      });
    }

    if (email === 'admin@agrohub.com' && password === 'admin123') {
      const token = signToken('admin_1');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          user: {
            id: 'admin_1',
            name: 'Admin User',
            email: 'admin@agrohub.com',
            role: 'admin'
          }
        }
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists (in localStorage mode, just check demo accounts)
    if (email === 'demo@agrohub.com' || email === 'admin@agrohub.com') {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user (in localStorage mode)
    const newUserId = `user_${Date.now()}`;
    const token = signToken(newUserId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        user: {
          id: newUserId,
          name,
          email,
          role: 'user'
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', (req, res) => {
  // Simple middleware bypass for localStorage mode
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Return mock user data
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: decoded.id,
          name: decoded.id.includes('admin') ? 'Admin User' : 'Demo User',
          email: decoded.id.includes('admin') ? 'admin@agrohub.com' : 'demo@agrohub.com',
          role: decoded.id.includes('admin') ? 'admin' : 'user'
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
