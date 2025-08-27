const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { protect, isAdmin } = require('../middleware/auth');
const AfricasTalking = require('africastalking');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Delivered' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Farmer.countDocuments(),
      Farmer.countDocuments({ isVerified: true })
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['Delivered', 'Processing', 'Shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('farmer', 'farmName')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: stats[0],
          totalAdmins: stats[1],
          totalFarmers: stats[2],
          totalCustomers: stats[3],
          totalOrders: stats[4],
          pendingOrders: stats[5],
          processingOrders: stats[6],
          deliveredOrders: stats[7],
          totalProducts: stats[8],
          activeProducts: stats[9],
          totalFarmers: stats[10],
          verifiedFarmers: stats[11],
          totalRevenue
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('farmer', 'farmName user')
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' }
      })
      .populate('product', 'name category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('farmer')
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    if (note) {
      order.notes.adminNotes = note;
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.user._id
    });

    await order.save();

    // Send SMS notification to farmer if status is Processing
    if (status === 'Processing' && order.farmer && order.farmer.user) {
      try {
        await sendSmsToFarmer(order);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Don't fail the whole request if SMS fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const role = req.query.role;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deactivation of admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private/Admin
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await Farmer.find()
      .populate('user', 'name email phone isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers
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

// @desc    Verify/Reject farmer with detailed feedback
// @route   PUT /api/admin/farmers/:id/verify
// @access  Private/Admin
router.put('/farmers/:id/verify', async (req, res) => {
  try {
    const { isVerified, rejectionReason, requiredDocuments, adminNotes } = req.body;
    
    const farmer = await Farmer.findById(req.params.id).populate('user', 'name email');
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Update farmer verification status
    farmer.isVerified = isVerified;
    farmer.verificationDate = isVerified ? new Date() : null;
    
    // If rejected, store rejection details
    if (!isVerified) {
      farmer.rejectionDetails = {
        reason: rejectionReason || 'General rejection',
        requiredDocuments: requiredDocuments || [],
        adminNotes: adminNotes || '',
        rejectedAt: new Date(),
        rejectedBy: req.user._id
      };
    } else {
      // Clear rejection details if approved
      farmer.rejectionDetails = undefined;
    }
    
    await farmer.save();

    // Send email notification
    try {
      const emailService = require('../services/emailService');
      
      if (isVerified) {
        await emailService.sendFarmerApprovalEmail(farmer.user.email, {
          farmerName: farmer.user.name,
          farmName: farmer.farmName,
          approvalDate: new Date().toLocaleDateString()
        });
        console.log(`✅ Approval email sent to: ${farmer.user.email}`);
      } else {
        await emailService.sendFarmerRejectionEmail(farmer.user.email, {
          farmerName: farmer.user.name,
          farmName: farmer.farmName,
          rejectionReason: rejectionReason || 'General rejection',
          requiredDocuments: requiredDocuments || [],
          adminNotes: adminNotes || '',
          rejectionDate: new Date().toLocaleDateString()
        });
        console.log(`📧 Rejection email sent to: ${farmer.user.email}`);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the verification process if email fails
    }

    console.log(`${isVerified ? '✅ Verified' : '❌ Rejected'} farmer: ${farmer.farmName} (${farmer.user?.email})`);

    res.status(200).json({
      success: true,
      message: `Farmer ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: farmer
    });
  } catch (error) {
    console.error('Farmer verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farmer verification',
      error: error.message
    });
  }
});

// @desc    Send SMS to farmer
// @route   POST /api/admin/sms/farmer
// @access  Private/Admin
router.post('/sms/farmer', async (req, res) => {
  try {
    const { farmerId, message, phone } = req.body;

    if (!message || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Message and phone number are required'
      });
    }

    const result = await sendSms(phone, message);

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending SMS',
      error: error.message
    });
  }
});

// Helper function to send SMS to farmer
const sendSmsToFarmer = async (order) => {
  try {
    if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
      console.log('⚠️ SMS not configured - skipping farmer notification');
      return;
    }

    const message = `🌾 AgriTech Order Alert!
New order received:
Product: ${order.orderDetails.productName}
Quantity: ${order.orderDetails.quantity} ${order.orderDetails.unit}
Customer: ${order.customerInfo.name}
Phone: ${order.customerInfo.phone}
Delivery: ${order.customerInfo.deliveryAddress.city}, ${order.customerInfo.deliveryAddress.state}
Order ID: #${order.orderNumber}
Please prepare for delivery. Thank you!`;

    const phone = order.farmer.user.phone;
    await sendSms(phone, message);

    // Update order with SMS notification
    order.addSmsNotification('farmer', phone, message);
    await order.save();

    console.log(`✅ SMS sent to farmer: ${phone}`);
  } catch (error) {
    console.error('❌ Failed to send SMS to farmer:', error);
    throw error;
  }
};

// Helper function to send SMS
const sendSms = async (phone, message) => {
  try {
    const africastalking = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME
    });

    const sms = africastalking.SMS;
    
    const result = await sms.send({
      to: phone,
      message: message,
      from: 'AgriTech'
    });

    return result;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send SMS: ' + error.message);
  }
};

// =====================
// USER MANAGEMENT ROUTES
// =====================

// @desc    Get all users with filtering and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Get user statistics
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      admins: await User.countDocuments({ role: 'admin' }),
      farmers: await User.countDocuments({ role: 'farmer' }),
      users: await User.countDocuments({ role: 'user' }),
      newThisMonth: await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    };

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      stats
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('orders');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'user',
      isActive = true,
      address
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      isActive
    };

    if (address) {
      userData.address = address;
    }

    const user = await User.create(userData);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      isActive,
      address
    } = req.body;

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user has orders - if so, deactivate instead of delete
    const userOrders = await Order.countDocuments({ user: req.params.id });
    
    if (userOrders > 0) {
      // Deactivate user instead of deleting
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User deactivated successfully (has existing orders)',
        data: { deactivated: true }
      });
    }

    // Delete user if no orders
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { deleted: true }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Bulk update users
// @route   PATCH /api/admin/users/bulk
// @access  Private/Admin
router.patch('/users/bulk', async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user IDs array'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData.isActive = false;
        message = 'Users deactivated successfully';
        break;
      case 'changeRole':
        if (!value || !['user', 'farmer', 'admin'].includes(value)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role provided'
          });
        }
        updateData.role = value;
        message = `Users role changed to ${value} successfully`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action provided'
        });
    }

    // Prevent admin from changing their own status/role
    const filteredUserIds = userIds.filter(id => id !== req.user.id);

    const result = await User.updateMany(
      { _id: { $in: filteredUserIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating users',
      error: error.message
    });
  }
});

module.exports = router;
