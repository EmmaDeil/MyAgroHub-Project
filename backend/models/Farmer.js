const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  location: {
    address: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  farmSize: {
    value: Number,
    unit: { type: String, enum: ['acres', 'hectares'], default: 'acres' }
  },
  farmingExperience: {
    type: Number, // years
    min: 0
  },
  specializations: [{
    type: String,
    enum: [
      'Crop Farming',
      'Livestock',
      'Poultry',
      'Fish Farming',
      'Mixed Farming',
      'Organic Farming',
      'Hydroponics',
      'Other'
    ]
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    dateIssued: Date,
    expiryDate: Date,
    document: String // URL to certificate document
  }],
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bvn: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    documentType: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalSales: {
    type: Number,
    default: 0
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

// Virtual for products
farmerSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'farmer'
});

// Virtual for orders
farmerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'farmer'
});

// Virtual for full location
farmerSchema.virtual('fullLocation').get(function() {
  if (!this.location) return '';
  const { city, state, country } = this.location;
  return [city, state, country].filter(Boolean).join(', ');
});

// Index for performance
farmerSchema.index({ 'location.state': 1 });
farmerSchema.index({ specializations: 1 });
farmerSchema.index({ isVerified: 1 });
farmerSchema.index({ isActive: 1 });

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
