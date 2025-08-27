const https = require('https');
const http = require('http');

console.log('🏥 Testing Backend Health Check...\n');

// Test local backend server
function testBackendHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test MongoDB connection via backend
function testMongoViaBackend() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/products',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, hasData: data.length > 0 }));
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function runHealthChecks() {
  console.log('1️⃣ Testing Backend Server...');
  try {
    const healthResult = await testBackendHealth();
    console.log('✅ Backend Server:', healthResult.status === 200 ? 'HEALTHY' : `Status ${healthResult.status}`);
    if (healthResult.data.database) {
      console.log('✅ Database Status:', healthResult.data.database);
    }
  } catch (error) {
    console.log('❌ Backend Server: NOT RUNNING');
    console.log('   Error:', error.message);
    console.log('\n💡 To start backend: run start-fullstack.bat or cd backend && node server.js');
    return;
  }

  console.log('\n2️⃣ Testing MongoDB via Backend...');
  try {
    const mongoResult = await testMongoViaBackend();
    console.log('✅ MongoDB Connection:', mongoResult.status === 200 ? 'WORKING' : `Status ${mongoResult.status}`);
    console.log('✅ Data Available:', mongoResult.hasData ? 'YES' : 'NO');
  } catch (error) {
    console.log('❌ MongoDB Connection: FAILED');
    console.log('   Error:', error.message);
  }

  console.log('\n🎯 Summary:');
  console.log('   Backend:  http://localhost:5001');
  console.log('   Frontend: http://localhost:5175');
  console.log('   Health:   http://localhost:5001/api/health');
}

runHealthChecks();
