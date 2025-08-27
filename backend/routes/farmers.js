const express = require('express');
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all farmers
// @route   GET /api/farmers
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const farmers = await Farmer.find({ isActive: true, isVerified: true })
      .populate('user', 'name phone email')
      .populate('products')
      .sort({ createdAt: -1 });

    const transformedFarmers = farmers.map(farmer => ({
      id: farmer._id,
      name: farmer.user?.name || farmer.farmName,
      farmName: farmer.farmName,
      phone: farmer.user?.phone,
      email: farmer.user?.email,
      location: farmer.fullLocation,
      specializations: farmer.specializations,
      rating: farmer.rating.average,
      totalSales: farmer.totalSales,
      experience: farmer.farmingExperience,
      isVerified: farmer.isVerified,
      productCount: farmer.products?.length || 0
    }));

    res.status(200).json({
      success: true,
      count: transformedFarmers.length,
      data: transformedFarmers
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
});

// @desc    Get single farmer
// @route   GET /api/farmers/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('products');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer',
      error: error.message
    });
  }
});

module.exports = router;
