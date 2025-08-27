const mongoose = require('mongoose');
const User = require('./models/User');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample farmers data
const farmersData = [
  {
    name: 'Adebayo Farms',
    email: 'adebayo@farms.com',
    phone: '+2348011234567',
    farmName: 'Adebayo Farms',
    location: { city: 'Lagos', state: 'Lagos State', country: 'Nigeria' },
    specializations: ['Crop Farming', 'Organic Farming']
  },
  {
    name: 'Plateau Rice Mills',
    email: 'plateau@ricemill.com',
    phone: '+2348012345678',
    farmName: 'Plateau Rice Mills',
    location: { city: 'Jos', state: 'Plateau State', country: 'Nigeria' },
    specializations: ['Crop Farming']
  },
  {
    name: 'Kano Agric Co-op',
    email: 'kano@agric.com',  
    phone: '+2348013456789',
    farmName: 'Kano Agric Co-op',
    location: { city: 'Kano', state: 'Kano State', country: 'Nigeria' },
    specializations: ['Crop Farming', 'Mixed Farming']
  },
  {
    name: 'Jos Highland Farms',
    email: 'jos@highland.com',
    phone: '+2348014567890',
    farmName: 'Jos Highland Farms',
    location: { city: 'Jos', state: 'Plateau State', country: 'Nigeria' },
    specializations: ['Crop Farming']
  },
  {
    name: 'Ogun Spice Gardens',
    email: 'ogun@spice.com',
    phone: '+2348015678901',
    farmName: 'Ogun Spice Gardens',
    location: { city: 'Abeokuta', state: 'Ogun State', country: 'Nigeria' },
    specializations: ['Crop Farming', 'Organic Farming']
  },
  {
    name: 'Cross River Plantain Estate',
    email: 'crossriver@plantain.com',
    phone: '+2348016789012',
    farmName: 'Cross River Plantain Estate',
    location: { city: 'Calabar', state: 'Cross River State', country: 'Nigeria' },
    specializations: ['Crop Farming']
  },
  {
    name: 'Enugu Vegetable Cooperative',
    email: 'enugu@veggie.com',
    phone: '+2348017890123',
    farmName: 'Enugu Vegetable Cooperative',
    location: { city: 'Enugu', state: 'Enugu State', country: 'Nigeria' },
    specializations: ['Crop Farming', 'Organic Farming']
  },
  {
    name: 'Kaduna Groundnut Association',
    email: 'kaduna@groundnut.com',
    phone: '+2348018901234',
    farmName: 'Kaduna Groundnut Association',
    location: { city: 'Kaduna', state: 'Kaduna State', country: 'Nigeria' },
    specializations: ['Crop Farming']
  }
];

// Complete products data
const productsData = [
  {
    name: 'Fresh Tomatoes',
    description: 'Fresh, juicy tomatoes perfect for cooking and salads',
    category: 'Vegetables',
    emoji: '🍅',
    pricing: { basePrice: 800, unit: 'kg' },
    inventory: { available: 100, unit: 'kg' },
    farmerIndex: 0
  },
  {
    name: 'White Rice',
    description: 'Premium quality white rice, locally grown',
    category: 'Grains',
    emoji: '🍚',
    pricing: { basePrice: 1200, unit: 'kg' },
    inventory: { available: 500, unit: 'kg' },
    farmerIndex: 1
  },
  {
    name: 'Yellow Maize',
    description: 'High-quality yellow maize for various uses',
    category: 'Grains',
    emoji: '🌽',
    pricing: { basePrice: 600, unit: 'kg' },
    inventory: { available: 200, unit: 'kg' },
    farmerIndex: 2
  },
  {
    name: 'Sweet Potatoes',
    description: 'Nutritious sweet potatoes, freshly harvested',
    category: 'Tubers',
    emoji: '🍠',
    pricing: { basePrice: 500, unit: 'kg' },
    inventory: { available: 150, unit: 'kg' },
    farmerIndex: 3
  },
  {
    name: 'Fresh Pepper',
    description: 'Hot and spicy peppers for your cooking needs',
    category: 'Spices',
    emoji: '🌶️',
    pricing: { basePrice: 2000, unit: 'kg' },
    inventory: { available: 50, unit: 'kg' },
    farmerIndex: 4
  },
  {
    name: 'Plantains',
    description: 'Fresh, ripe plantains ready for cooking',
    category: 'Fruits',
    emoji: '🍌',
    pricing: { basePrice: 300, unit: 'piece' },
    inventory: { available: 200, unit: 'piece' },
    farmerIndex: 5
  },
  {
    name: 'Garden Eggs',
    description: 'Fresh garden eggs, locally grown',
    category: 'Vegetables',
    emoji: '🍆',
    pricing: { basePrice: 400, unit: 'kg' },
    inventory: { available: 80, unit: 'kg' },
    farmerIndex: 6
  },
  {
    name: 'Groundnuts',
    description: 'Fresh groundnuts, rich in protein',
    category: 'Legumes',
    emoji: '🥜',
    pricing: { basePrice: 1500, unit: 'kg' },
    inventory: { available: 120, unit: 'kg' },
    farmerIndex: 7
  },
  {
    name: 'Yam Tubers',
    description: 'Quality yam tubers, perfect for pounding',
    category: 'Tubers',
    emoji: '🍠',
    pricing: { basePrice: 800, unit: 'kg' },
    inventory: { available: 300, unit: 'kg' },
    farmerIndex: 0
  },
  {
    name: 'Cassava',
    description: 'Fresh cassava roots for various preparations',
    category: 'Tubers',
    emoji: '🌾',
    pricing: { basePrice: 400, unit: 'kg' },
    inventory: { available: 250, unit: 'kg' },
    farmerIndex: 1
  },
  {
    name: 'Okra',
    description: 'Fresh okra pods for soups and stews',
    category: 'Vegetables',
    emoji: '🥒',
    pricing: { basePrice: 600, unit: 'kg' },
    inventory: { available: 60, unit: 'kg' },
    farmerIndex: 2
  },
  {
    name: 'Spinach',
    description: 'Fresh green spinach, rich in iron',
    category: 'Vegetables',
    emoji: '🥬',
    pricing: { basePrice: 500, unit: 'kg' },
    inventory: { available: 40, unit: 'kg' },
    farmerIndex: 3
  },
  {
    name: 'Onions',
    description: 'Fresh onions for cooking and seasoning',
    category: 'Vegetables',
    emoji: '🧅',
    pricing: { basePrice: 700, unit: 'kg' },
    inventory: { available: 180, unit: 'kg' },
    farmerIndex: 4
  },
  {
    name: 'Carrots',
    description: 'Fresh carrots, rich in vitamin A',
    category: 'Vegetables',
    emoji: '🥕',
    pricing: { basePrice: 800, unit: 'kg' },
    inventory: { available: 90, unit: 'kg' },
    farmerIndex: 5
  },
  {
    name: 'Green Beans',
    description: 'Fresh green beans, crisp and nutritious',
    category: 'Vegetables',
    emoji: '🟢',
    pricing: { basePrice: 900, unit: 'kg' },
    inventory: { available: 70, unit: 'kg' },
    farmerIndex: 6
  },
  {
    name: 'Cabbage',
    description: 'Fresh cabbage heads for salads and cooking',
    category: 'Vegetables',
    emoji: '🥬',
    pricing: { basePrice: 600, unit: 'piece' },
    inventory: { available: 50, unit: 'piece' },
    farmerIndex: 7
  },
  {
    name: 'Pineapples',
    description: 'Sweet, juicy pineapples freshly harvested',
    category: 'Fruits',
    emoji: '🍍',
    pricing: { basePrice: 800, unit: 'piece' },
    inventory: { available: 100, unit: 'piece' },
    farmerIndex: 0
  },
  {
    name: 'Oranges',
    description: 'Fresh oranges packed with vitamin C',
    category: 'Fruits',
    emoji: '🍊',
    pricing: { basePrice: 500, unit: 'kg' },
    inventory: { available: 200, unit: 'kg' },
    farmerIndex: 1
  },
  {
    name: 'Watermelons',
    description: 'Sweet, juicy watermelons perfect for hot weather',
    category: 'Fruits',
    emoji: '🍉',
    pricing: { basePrice: 1200, unit: 'piece' },
    inventory: { available: 80, unit: 'piece' },
    farmerIndex: 2
  },
  {
    name: 'Black Beans',
    description: 'Quality black-eyed beans, rich in protein',
    category: 'Legumes',
    emoji: '🫘',
    pricing: { basePrice: 1800, unit: 'kg' },
    inventory: { available: 160, unit: 'kg' },
    farmerIndex: 3
  },
  {
    name: 'Brown Beans',
    description: 'Nutritious brown beans for healthy meals',
    category: 'Legumes',
    emoji: '🌰',
    pricing: { basePrice: 1600, unit: 'kg' },
    inventory: { available: 140, unit: 'kg' },
    farmerIndex: 4
  },
  {
    name: 'Soybeans',
    description: 'High-protein soybeans for various uses',
    category: 'Legumes',
    emoji: '🫛',
    pricing: { basePrice: 2000, unit: 'kg' },
    inventory: { available: 100, unit: 'kg' },
    farmerIndex: 5
  },
  {
    name: 'Ginger',
    description: 'Fresh ginger root for cooking and health',
    category: 'Spices',
    emoji: '🫚',
    pricing: { basePrice: 3000, unit: 'kg' },
    inventory: { available: 30, unit: 'kg' },
    farmerIndex: 6
  },
  {
    name: 'Garlic',
    description: 'Fresh garlic bulbs for seasoning',
    category: 'Spices',
    emoji: '🧄',
    pricing: { basePrice: 2500, unit: 'kg' },
    inventory: { available: 40, unit: 'kg' },
    farmerIndex: 7
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await Farmer.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin user

    // Create farmer users and farmers
    console.log('👨‍🌾 Creating farmers...');
    const farmers = [];
    
    for (const farmerData of farmersData) {
      // Create user account for farmer
      const user = await User.create({
        name: farmerData.name,
        email: farmerData.email,
        password: 'farmer123',
        phone: farmerData.phone,
        role: 'farmer',
        address: {
          city: farmerData.location.city,
          state: farmerData.location.state,
          country: farmerData.location.country
        }
      });

      // Create farmer profile
      const farmer = await Farmer.create({
        user: user._id,
        farmName: farmerData.farmName,
        location: farmerData.location,
        specializations: farmerData.specializations,
        isVerified: true,
        isActive: true
      });

      farmers.push(farmer);
      console.log(`✅ Created farmer: ${farmerData.name}`);
    }

    // Create products
    console.log('🌱 Creating products...');
    for (const productData of productsData) {
      const farmer = farmers[productData.farmerIndex];
      
      await Product.create({
        name: productData.name,
        description: productData.description,
        category: productData.category,
        emoji: productData.emoji,
        pricing: productData.pricing,
        inventory: productData.inventory,
        farmer: farmer._id,
        quality: { grade: 'Grade A', organic: false },
        location: { pickupAvailable: true },
        isActive: true,
        isFeatured: Math.random() > 0.7 // 30% chance of being featured
      });

      console.log(`✅ Created product: ${productData.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${farmers.length} farmers and ${productsData.length} products`);
    
    // Display summary
    const userCount = await User.countDocuments();
    const farmerCount = await Farmer.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log('\n📈 Database Summary:');
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`👨‍🌾 Total Farmers: ${farmerCount}`);
    console.log(`🌱 Total Products: ${productCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
