const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendOrderConfirmation, sendFarmerNotification } = require('../services/emailService');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
  body('deliveryAddress').isObject().withMessage('Delivery address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').trim().notEmpty().withMessage('State is required')
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

    const {
      productId,
      quantity,
      customerName,
      customerPhone,
      deliveryAddress,
      paymentMethod = 'Cash on Delivery'
    } = req.body;

    // Get product with farmer info
    const product = await Product.findById(productId)
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check inventory
    if (product.inventory.available < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory. Available: ' + product.inventory.available
      });
    }

    // Calculate pricing
    const unitPrice = product.getDiscountedPrice(quantity);
    const totalPrice = unitPrice * quantity;

    // Create order
    const orderData = {
      user: req.user._id,
      farmer: product.farmer._id,
      product: productId,
      orderDetails: {
        productName: product.name,
        productImage: product.emoji,
        quantity,
        unit: product.pricing.unit,
        unitPrice,
        totalPrice
      },
      customerInfo: {
        name: customerName,
        email: req.user.email,
        phone: customerPhone,
        deliveryAddress: {
          street: deliveryAddress.street || '',
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          country: deliveryAddress.country || 'Nigeria',
          zipCode: deliveryAddress.zipCode || ''
        }
      },
      farmerInfo: {
        name: product.farmer.user?.name || product.farmer.farmName,
        farmName: product.farmer.farmName,
        phone: product.farmer.user?.phone || '',
        location: product.farmer.location?.city && product.farmer.location?.state 
          ? `${product.farmer.location.city}, ${product.farmer.location.state}`
          : 'Location not specified'
      },
      paymentInfo: {
        method: paymentMethod
      },
      totalAmount: totalPrice
    };

    const order = await Order.create(orderData);

    // Reserve inventory
    product.reserveInventory(quantity);
    await product.save();

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' }
      })
      .populate('product', 'name category');

    console.log(`✅ New order created: #${order.orderNumber} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name phone' },
        select: 'farmName location user'
      })
      .populate('product', 'name category emoji')
      .sort({ createdAt: -1 });

    // Transform orders to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      productName: order.orderDetails.productName,
      productImage: order.orderDetails.productImage,
      quantity: order.orderDetails.quantity,
      unit: order.orderDetails.unit,
      unitPrice: order.orderDetails.unitPrice,
      total: order.totalAmount,
      status: order.status,
      farmerName: order.farmerInfo.name,
      farmerLocation: order.farmerInfo.location,
      customerName: order.customerInfo.name,
      customerPhone: order.customerInfo.phone,
      address: order.fullDeliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: transformedOrders.length,
      data: transformedOrders
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    .populate({
      path: 'farmer',
      populate: { path: 'user', select: 'name phone' },
      select: 'farmName location user'
    })
    .populate('product', 'name category emoji');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    // Update order status
    order.status = 'Cancelled';
    await order.save();

    // Release reserved inventory
    if (order.product) {
      order.product.releaseReservedInventory(order.orderDetails.quantity);
      await order.product.save();
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
});

// @desc    Send order confirmation email
// @route   POST /api/orders/send-confirmation
// @access  Private
router.post('/send-confirmation', [
  body('to').isEmail().withMessage('Valid email address is required'),
  body('subject').trim().notEmpty().withMessage('Email subject is required'),
  body('orderDetails').isObject().withMessage('Order details are required'),
  body('orderDetails.orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('orderDetails.customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('orderDetails.items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('orderDetails.total').isNumeric().withMessage('Order total is required'),
  body('orderDetails.deliveryAddress').isObject().withMessage('Delivery address is required')
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

    const { to, orderDetails } = req.body;

    // Prepare email data
    const emailData = {
      customerEmail: to,
      customerName: orderDetails.customerName,
      orderId: orderDetails.orderId,
      items: orderDetails.items,
      total: orderDetails.total,
      deliveryAddress: orderDetails.deliveryAddress,
      paymentMethod: orderDetails.paymentMethod || 'Cash on Delivery',
      orderDate: orderDetails.orderDate || new Date().toISOString()
    };

    // Send confirmation email
    const emailResult = await sendOrderConfirmation(emailData);

    console.log(`✅ Order confirmation email sent to ${to} for order ${orderDetails.orderId}`);

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully',
      data: {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl // For testing with Ethereal
      }
    });

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation email',
      error: error.message
    });
  }
});

module.exports = router;
