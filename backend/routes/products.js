const express = require('express');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 24;
    const category = req.query.category;
    const search = req.query.search;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' },
        select: 'farmName location user'
      })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Product.countDocuments(query);

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.pricing.basePrice,
      unit: product.pricing.unit,
      image: product.emoji,
      farmer: product.farmer.farmName,
      farmerName: product.farmer.user?.name || product.farmer.farmName,
      farmerPhone: product.farmer.user?.phone,
      location: product.farmer.location?.city && product.farmer.location?.state 
        ? `${product.farmer.location.city}, ${product.farmer.location.state}`
        : product.farmer.location?.address || 'Location not specified',
      inStock: product.inventory.available,
      rating: product.rating.average,
      totalSold: product.totalSold,
      isOrganic: product.quality.organic,
      grade: product.quality.grade
    }));

    res.status(200).json({
      success: true,
      count: transformedProducts.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: transformedProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone email' },
        select: 'farmName location user rating'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Transform product to match frontend format
    const transformedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.pricing.basePrice,
      unit: product.pricing.unit,
      image: product.emoji,
      images: product.images,
      farmer: product.farmer.farmName,
      farmerName: product.farmer.user?.name || product.farmer.farmName,
      farmerPhone: product.farmer.user?.phone,
      farmerEmail: product.farmer.user?.email,
      location: product.farmer.location?.city && product.farmer.location?.state 
        ? `${product.farmer.location.city}, ${product.farmer.location.state}`
        : product.farmer.location?.address || 'Location not specified',
      inStock: product.inventory.available,
      rating: product.rating.average,
      totalSold: product.totalSold,
      isOrganic: product.quality.organic,
      grade: product.quality.grade,
      nutritionalInfo: product.nutritionalInfo,
      harvestDate: product.inventory.harvestDate,
      expiryDate: product.inventory.expiryDate
    };

    res.status(200).json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @desc    Create sample products (for development)
// @route   POST /api/products/seed
// @access  Private (Admin only in production)
router.post('/seed', async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Products already exist. Use individual create endpoint.'
      });
    }

    // Create sample farmers first
    const sampleFarmers = [
      {
        farmName: 'Adebayo Farms',
        location: { city: 'Lagos', state: 'Lagos State', country: 'Nigeria' },
        specializations: ['Crop Farming'],
        isVerified: true
      },
      {
        farmName: 'Plateau Rice Mills',
        location: { city: 'Jos', state: 'Plateau State', country: 'Nigeria' },
        specializations: ['Crop Farming'],
        isVerified: true
      },
      {
        farmName: 'Kano Agric Co-op',
        location: { city: 'Kano', state: 'Kano State', country: 'Nigeria' },
        specializations: ['Crop Farming'],
        isVerified: true
      }
    ];

    // Create farmers with dummy user accounts
    const farmers = [];
    for (let i = 0; i < sampleFarmers.length; i++) {
      const dummyUser = await User.create({
        name: `Farmer ${i + 1}`,
        email: `farmer${i + 1}@agritech.com`,
        password: 'password123',
        phone: `+234801234567${i}`,
        role: 'farmer'
      });

      const farmer = await Farmer.create({
        ...sampleFarmers[i],
        user: dummyUser._id
      });

      farmers.push(farmer);
    }

    // Sample products data
    const sampleProducts = [
      {
        name: 'Fresh Tomatoes',
        description: 'Fresh, juicy tomatoes perfect for cooking and salads',
        category: 'Vegetables',
        emoji: '🍅',
        pricing: { basePrice: 800, unit: 'kg' },
        inventory: { available: 100, unit: 'kg' },
        farmer: farmers[0]._id
      },
      {
        name: 'White Rice',
        description: 'Premium quality white rice, locally grown',
        category: 'Grains',
        emoji: '🍚',
        pricing: { basePrice: 1200, unit: 'kg' },
        inventory: { available: 500, unit: 'kg' },
        farmer: farmers[1]._id
      },
      {
        name: 'Yellow Maize',
        description: 'High-quality yellow maize for various uses',
        category: 'Grains',
        emoji: '🌽',
        pricing: { basePrice: 600, unit: 'kg' },
        inventory: { available: 200, unit: 'kg' },
        farmer: farmers[2]._id
      }
    ];

    const products = await Product.create(sampleProducts);

    res.status(201).json({
      success: true,
      message: 'Sample products created successfully',
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Seed products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sample products',
      error: error.message
    });
  }
});

module.exports = router;
