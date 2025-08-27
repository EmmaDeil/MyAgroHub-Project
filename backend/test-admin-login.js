const http = require('http');

async function testAdminLogin() {
  const passwords = ['admin123', 'password123', 'eclefzy', '123456'];
  
  for (const password of passwords) {
    console.log(`\n🔑 Testing password: ${password}`);
    
    const loginData = JSON.stringify({
      email: 'eclefzy@gmail.com',
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const result = await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ status: res.statusCode, data: response });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (e) => {
        resolve({ error: e.message });
      });

      req.write(loginData);
      req.end();
    });

    console.log(`   Status: ${result.status}`);
    if (result.status === 200 && result.data.success) {
      console.log(`   ✅ SUCCESS! Password is: ${password}`);
      console.log(`   🎟️ Token: ${result.data.token.substring(0, 50)}...`);
      return;
    } else if (result.data.message) {
      console.log(`   ❌ ${result.data.message}`);
    } else {
      console.log(`   ❌ Failed:`, result.data);
    }
  }
  
  console.log('\n❌ None of the common passwords worked');
  console.log('💡 You may need to reset the admin password or try the exact password you used during signup');
}

testAdminLogin();
