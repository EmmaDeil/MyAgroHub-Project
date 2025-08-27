const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test configuration
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'test123',
  phone: '+2348011111111'
};

const adminUser = {
  email: 'eclefzy@gmail.com',
  password: 'admin123'
};

let authToken = '';
let testUserId = '';

// Colored console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (type, message) => {
  const timestamp = new Date().toLocaleTimeString();
  const color = colors[type] || colors.reset;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
};

// Test functions
const testProductsAPI = async () => {
  try {
    log('blue', '🌱 Testing Products API...');
    const response = await axios.get(`${BASE_URL}/products`);
    
    if (response.data.success && response.data.count > 0) {
      log('green', `✅ Products API: ${response.data.count} products loaded`);
      log('blue', `   Sample: ${response.data.data[0].name} - ₦${response.data.data[0].price}/${response.data.data[0].unit}`);
      return true;
    } else {
      log('red', '❌ Products API: No products found');
      return false;
    }
  } catch (error) {
    log('red', `❌ Products API Error: ${error.message}`);
    return false;
  }
};

const testUserRegistration = async () => {
  try {
    log('blue', '👤 Testing User Registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      testUserId = response.data.data.user.id;
      log('green', `✅ User Registration: ${testUser.email} registered successfully`);
      return true;
    } else {
      log('red', '❌ User Registration failed');
      return false;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      log('yellow', '⚠️  User Registration: Email already exists (expected)');
      return true;
    }
    log('red', `❌ User Registration Error: ${error.message}`);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    log('blue', '🔐 Testing User Login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log('green', `✅ User Login: ${testUser.email} logged in successfully`);
      return true;
    } else {
      log('red', '❌ User Login failed');
      return false;
    }
  } catch (error) {
    log('red', `❌ User Login Error: ${error.message}`);
    return false;
  }
};

const testAdminLogin = async () => {
  try {
    log('blue', '👑 Testing Admin Login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, adminUser);
    
    if (response.data.success && response.data.data.user.role === 'admin') {
      log('green', `✅ Admin Login: ${adminUser.email} logged in as admin`);
      return { success: true, token: response.data.token };
    } else {
      log('red', '❌ Admin Login failed');
      return { success: false };
    }
  } catch (error) {
    log('red', `❌ Admin Login Error: ${error.message}`);
    return { success: false };
  }
};

const testOrderCreation = async () => {
  if (!authToken) {
    log('red', '❌ Order Creation: No auth token available');
    return false;
  }

  try {
    log('blue', '🛒 Testing Order Creation...');
    
    // Get first product
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const product = productsResponse.data.data[0];
    
    const orderData = {
      productId: product.id,
      quantity: 2,
      customerName: testUser.name,
      customerPhone: testUser.phone,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
        zipCode: '100001'
      },
      paymentMethod: 'Cash on Delivery'
    };

    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      log('green', `✅ Order Creation: Order ${response.data.data.orderNumber} created successfully`);
      log('blue', `   Total: ₦${response.data.data.orderDetails.totalPrice}`);
      return true;
    } else {
      log('red', '❌ Order Creation failed');
      return false;
    }
  } catch (error) {
    log('red', `❌ Order Creation Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.errors) {
      log('yellow', `   Validation Errors: ${JSON.stringify(error.response.data.errors, null, 2)}`);
    }
    return false;
  }
};

const testFarmersAPI = async () => {
  try {
    log('blue', '👨‍🌾 Testing Farmers API...');
    const response = await axios.get(`${BASE_URL}/farmers`);
    
    if (response.data.success && response.data.count > 0) {
      log('green', `✅ Farmers API: ${response.data.count} farmers loaded`);
      log('blue', `   Sample: ${response.data.data[0].farmName} in ${response.data.data[0].location?.city || 'Unknown City'}`);
      return true;
    } else {
      log('red', '❌ Farmers API: No farmers found');
      return false;
    }
  } catch (error) {
    log('red', `❌ Farmers API Error: ${error.message}`);
    return false;
  }
};

const testAdminDashboard = async (adminToken) => {
  try {
    log('blue', '📊 Testing Admin Dashboard...');
    const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data.stats;
      log('green', '✅ Admin Dashboard: Data loaded successfully');
      log('blue', `   Total Users: ${stats.totalUsers}`);
      log('blue', `   Total Products: ${stats.totalProducts}`);
      log('blue', `   Total Orders: ${stats.totalOrders}`);
      log('blue', `   Total Revenue: ₦${stats.totalRevenue}`);
      return true;
    } else {
      log('red', '❌ Admin Dashboard failed');
      return false;
    }
  } catch (error) {
    log('red', `❌ Admin Dashboard Error: ${error.message}`);
    return false;
  }
};

// Main test runner
const runIntegrationTests = async () => {
  console.log('\n🧪 AgriTech Integration Tests Starting...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Products API', fn: testProductsAPI },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Order Creation', fn: testOrderCreation },
    { name: 'Farmers API', fn: testFarmersAPI }
  ];

  // Run basic tests
  for (const test of tests) {
    results.total++;
    log('blue', `\n🔄 Running: ${test.name}`);
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Test admin functionality
  results.total++;
  log('blue', '\n🔄 Running: Admin Login');
  const adminResult = await testAdminLogin();
  if (adminResult.success) {
    results.passed++;
    
    // Test admin dashboard
    results.total++;
    log('blue', '\n🔄 Running: Admin Dashboard');
    const dashboardPassed = await testAdminDashboard(adminResult.token);
    if (dashboardPassed) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    results.failed++;
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 INTEGRATION TEST RESULTS');
  console.log('='.repeat(50));
  log('blue', `Total Tests: ${results.total}`);
  log('green', `Passed: ${results.passed}`);
  log('red', `Failed: ${results.failed}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  if (results.failed === 0) {
    log('green', `\n🎉 ALL TESTS PASSED! Success Rate: ${successRate}%`);
  } else {
    log('yellow', `\n⚠️  Some tests failed. Success Rate: ${successRate}%`);
  }
  
  console.log('='.repeat(50) + '\n');
};

// Run tests
runIntegrationTests().catch(error => {
  log('red', `❌ Test Runner Error: ${error.message}`);
  process.exit(1);
});
