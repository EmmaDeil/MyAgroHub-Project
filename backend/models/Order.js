const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  orderDetails: {
    productName: { type: String, required: true },
    productImage: String,
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    appliedDiscount: {
      type: Number,
      default: 0
    }
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryAddress: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'Nigeria' },
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  farmerInfo: {
    name: { type: String, required: true },
    farmName: String,
    phone: { type: String, required: true },
    location: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  paymentInfo: {
    method: {
      type: String,
      enum: ['Cash on Delivery', 'Bank Transfer', 'Card Payment', 'Mobile Money'],
      default: 'Cash on Delivery'
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  deliveryInfo: {
    method: {
      type: String,
      enum: ['Home Delivery', 'Pickup', 'Third Party'],
      default: 'Home Delivery'
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryFee: { type: Number, default: 0 },
    trackingNumber: String,
    deliveryNotes: String
  },
  communication: {
    smsNotifications: [{
      recipient: String, // 'customer' or 'farmer'
      phone: String,
      message: String,
      status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' },
      sentAt: Date,
      provider: String // 'AfricasTalking', etc.
    }],
    emailNotifications: [{
      recipient: String,
      email: String,
      subject: String,
      status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' },
      sentAt: Date
    }]
  },
  rating: {
    customerRating: { type: Number, min: 1, max: 5 },
    customerReview: String,
    farmerRating: { type: Number, min: 1, max: 5 },
    farmerReview: String,
    ratedAt: Date
  },
  notes: {
    customerNotes: String,
    farmerNotes: String,
    adminNotes: String
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full delivery address
orderSchema.virtual('fullDeliveryAddress').get(function() {
  if (!this.customerInfo.deliveryAddress) return '';
  const { street, city, state, country } = this.customerInfo.deliveryAddress;
  return [street, city, state, country].filter(Boolean).join(', ');
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.orderNumber = `AGT${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Method to add SMS notification
orderSchema.methods.addSmsNotification = function(recipient, phone, message) {
  this.communication.smsNotifications.push({
    recipient,
    phone,
    message,
    status: 'Pending'
  });
};

// Method to update notification status
orderSchema.methods.updateNotificationStatus = function(notificationId, status) {
  const notification = this.communication.smsNotifications.id(notificationId);
  if (notification) {
    notification.status = status;
    notification.sentAt = new Date();
  }
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).populate('user farmer product');
};

// Static method to get farmer orders
orderSchema.statics.getFarmerOrders = function(farmerId) {
  return this.find({ farmer: farmerId }).populate('user product');
};

// Index for performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ farmer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
