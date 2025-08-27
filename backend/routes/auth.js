const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if this is the admin email
    const isAdminEmail = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    
    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role: isAdminEmail ? 'admin' : 'user'
    };

    if (address) {
      userData.address = address;
    }

    const user = await User.create(userData);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ New ${user.role} registered:`, user.email);
    if (isAdminEmail) {
      console.log('🔐 Admin account created for:', user.email);
    }

    createSendToken(user, 201, res, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ User logged in:`, user.email, `(${user.role})`);

    createSendToken(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, address, preferences, profileImage } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (preferences) updateData.preferences = preferences;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Update profile image
// @route   PUT /api/auth/profile-image
// @access  Private
router.put('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert image to base64
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageBase64 },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        user,
        profileImage: imageBase64
      }
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile image',
      error: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.correctPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

// @desc    Create farmer profile
// @route   POST /api/auth/farmer-profile
// @access  Private
router.post('/farmer-profile', [
  protect,
  body('farmName')
    .trim()
    .notEmpty()
    .withMessage('Farm name is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('specializations')
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has a farmer profile
    const existingFarmer = await Farmer.findOne({ user: user._id });
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile already exists'
      });
    }

    const {
      farmName,
      location,
      farmSize,
      farmingExperience,
      specializations,
      bankDetails
    } = req.body;

    // Create farmer profile
    const farmer = await Farmer.create({
      user: user._id,
      farmName,
      location: {
        ...location,
        country: location.country || 'Nigeria'
      },
      farmSize,
      farmingExperience,
      specializations,
      bankDetails,
      isVerified: false, // Pending admin verification
      isActive: true
    });

    // Update user role to farmer
    user.role = 'farmer';
    await user.save();

    console.log(`🌱 New farmer profile created: ${farmName} by ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Farmer profile created successfully. Pending admin verification.',
      data: {
        farmer: {
          id: farmer._id,
          farmName: farmer.farmName,
          location: farmer.fullLocation,
          specializations: farmer.specializations,
          isVerified: farmer.isVerified,
          isActive: farmer.isActive
        }
      }
    });

  } catch (error) {
    console.error('Farmer profile creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating farmer profile',
      error: error.message
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
