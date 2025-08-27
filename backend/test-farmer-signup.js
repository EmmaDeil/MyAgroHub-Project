const http = require('http');

// Test data for farmer signup
const farmerData = {
  // First, user registration
  user: {
    name: 'Mary Farmer',
    email: 'mary.farmer@example.com',
    password: 'farmer123',
    phone: '+2348012345679'
  },
  // Then, farmer profile
  farmerProfile: {
    farmName: 'Mary\'s Organic Farm',
    location: {
      city: 'Kano',
      state: 'Kano State',
      country: 'Nigeria'
    },
    farmSize: {
      value: 5,
      unit: 'acres'
    },
    farmingExperience: 10,
    specializations: ['Crop Farming', 'Organic Farming'],
    bankDetails: {
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'Mary Farmer'
    }
  }
};

function makeRequest(path, method, data, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFarmerSignup() {
  console.log('🧪 Testing Farmer Signup Process...\n');

  try {
    // Step 1: Register as regular user
    console.log('1️⃣ Registering user...');
    const registerResult = await makeRequest('/auth/register', 'POST', farmerData.user);
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Response: ${JSON.stringify(registerResult.data, null, 2)}\n`);

    if (registerResult.status !== 201) {
      console.log('❌ User registration failed');
      return;
    }

    const token = registerResult.data.token;

    // Step 2: Create farmer profile
    console.log('2️⃣ Creating farmer profile...');
    const farmerResult = await makeRequest('/auth/farmer-profile', 'POST', farmerData.farmerProfile, token);
    console.log(`   Status: ${farmerResult.status}`);
    console.log(`   Response: ${JSON.stringify(farmerResult.data, null, 2)}\n`);

    if (farmerResult.status === 201) {
      console.log('✅ Farmer profile created successfully!');
      console.log('📝 The farmer is now pending admin verification.');
    } else {
      console.log('❌ Farmer profile creation failed');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFarmerSignup();
