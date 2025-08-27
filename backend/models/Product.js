const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Vegetables',
      'Fruits',
      'Grains',
      'Legumes',
      'Tubers',
      'Spices',
      'Livestock',
      'Poultry',
      'Dairy',
      'Other'
    ]
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  emoji: {
    type: String,
    default: '🌱'
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Price unit is required'],
      enum: ['kg', 'g', 'lbs', 'piece', 'dozen', 'bag', 'basket', 'crate', 'ton']
    },
    discounts: [{
      minQuantity: Number,
      discountPercent: Number,
      validUntil: Date
    }]
  },
  inventory: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Inventory unit is required'],
      enum: ['kg', 'g', 'lbs', 'piece', 'dozen', 'bag', 'basket', 'crate', 'ton']
    },
    harvestDate: Date,
    expiryDate: Date
  },
  quality: {
    grade: {
      type: String,
      enum: ['Premium', 'Grade A', 'Grade B', 'Grade C'],
      default: 'Grade A'
    },
    organic: {
      type: Boolean,
      default: false
    },
    certifications: [String]
  },
  location: {
    farmLocation: String,
    deliveryZones: [String], // Areas where delivery is available
    pickupAvailable: { type: Boolean, default: true }
  },
  seasonality: {
    isSeasonalProduct: { type: Boolean, default: false },
    seasonStart: Date,
    seasonEnd: Date
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    vitamins: [String]
  },
  tags: [String], // For search optimization
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalSold: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Virtual for total inventory
productSchema.virtual('totalInventory').get(function() {
  return this.inventory.available + this.inventory.reserved;
});

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function() {
  if (this.inventory.available === 0) return 'Out of Stock';
  if (this.inventory.available < 10) return 'Low Stock';
  return 'In Stock';
});

// Virtual for farmer info
productSchema.virtual('farmerInfo', {
  ref: 'Farmer',
  localField: 'farmer',
  foreignField: '_id',
  justOne: true
});

// Method to calculate discounted price
productSchema.methods.getDiscountedPrice = function(quantity) {
  const basePrice = this.pricing.basePrice;
  const applicableDiscount = this.pricing.discounts
    .filter(discount => 
      quantity >= discount.minQuantity && 
      (!discount.validUntil || discount.validUntil > new Date())
    )
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];

  if (applicableDiscount) {
    return basePrice * (1 - applicableDiscount.discountPercent / 100);
  }
  
  return basePrice;
};

// Method to reserve inventory
productSchema.methods.reserveInventory = function(quantity) {
  if (this.inventory.available >= quantity) {
    this.inventory.available -= quantity;
    this.inventory.reserved += quantity;
    return true;
  }
  return false;
};

// Method to release reserved inventory
productSchema.methods.releaseReservedInventory = function(quantity) {
  if (this.inventory.reserved >= quantity) {
    this.inventory.reserved -= quantity;
    this.inventory.available += quantity;
    return true;
  }
  return false;
};

// Index for performance and search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ farmer: 1 });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
