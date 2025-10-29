const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'verifications');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// All user routes require authentication
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    const orders = await Order.find({ user: req.user.id })
      .populate('farmer', 'farmName')
      .populate('product', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @desc    Upload verification document for approval
// @route   POST /api/users/verify
// @access  Private
router.post('/verify', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Optional: basic file 'scan' placeholder (replace with real virus scanner like ClamAV)
    const scanFile = async (filePath) => {
      // Placeholder: accept all files. Integrate ClamAV or third-party scanning for production.
      console.log('Scanning file (placeholder) ->', filePath);
      return true;
    };

    const uploadedPath = `/uploads/verifications/${req.file.filename}`;

    // Attempt image resizing if sharp is available
    try {
      const sharp = require('sharp');
      const absPath = path.join(uploadDir, req.file.filename);
      const resizedPath = path.join(uploadDir, `resized-${req.file.filename}`);
      // Only resize if image mime-type
      if (req.file.mimetype && req.file.mimetype.startsWith('image/')) {
        await sharp(absPath).resize({ width: 1200, height: 1200, fit: 'inside' }).toFile(resizedPath);
        // replace original with resized
        fs.unlinkSync(absPath);
        fs.renameSync(resizedPath, absPath);
        console.log('Image resized for verification upload:', req.file.filename);
      }
    } catch (resizeErr) {
      // sharp not installed or resize failed; continue without resizing
      console.log('Image resize skipped or failed (sharp not available):', resizeErr.message);
    }

    // Perform basic scan (placeholder)
    const scanned = await scanFile(path.join(uploadDir, req.file.filename));
    if (!scanned) {
      // remove file
  try { fs.unlinkSync(path.join(uploadDir, req.file.filename)); } catch { }
      return res.status(400).json({ success: false, message: 'Uploaded file failed security scan' });
    }

    // Ensure verification structure exists
    if (!user.verification) user.verification = {};
    if (!Array.isArray(user.verification.documents)) user.verification.documents = [];

    user.verification.documents.push({
      url: uploadedPath,
      filename: req.file.filename,
      uploadedAt: new Date()
    });
    user.verification.status = 'pending';
    user.verification.submittedAt = new Date();
    user.verification.adminNotes = null;

    await user.save();

    res.status(200).json({ success: true, message: 'Verification document uploaded', data: { user } });
  } catch (error) {
    console.error('Upload verification error:', error);
    res.status(500).json({ success: false, message: 'Error uploading verification document', error: error.message });
  }
});

module.exports = router;
