#!/usr/bin/env node

/**
 * Comprehensive test script for login page functionality
 */

const testCredentials = [
  { email: 'user@dataviz.com', password: 'admin123', expectedRole: 'user' },
  { email: 'admin@dataviz.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'superadmin@dataviz.com', password: 'admin123', expectedRole: 'superadmin' },
];

const invalidCredentials = [
  { email: 'user@dataviz.com', password: 'wrongpassword' },
  { email: 'nonexistent@dataviz.com', password: 'admin123' },
  { email: '', password: 'admin123' },
  { email: 'user@dataviz.com', password: '' },
];

async function testValidLogin(email, password, expectedRole) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const success = data.user.role === expectedRole;
      console.log(`✅ Valid login: ${email} -> ${data.user.role} (${success ? 'PASS' : 'FAIL'})`);
      return success;
    } else {
      console.log(`❌ Valid login failed: ${email} -> ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing valid login ${email}: ${error.message}`);
    return false;
  }
}

async function testInvalidLogin(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log(`✅ Invalid login correctly rejected: ${email || 'empty email'} / ${password || 'empty password'}`);
      return true;
    } else {
      console.log(`❌ Invalid login not rejected: ${email} -> ${response.status} ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing invalid login: ${error.message}`);
    return false;
  }
}

async function testPageLoad(url, description) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`✅ ${description} loads successfully (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${description} failed to load (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error loading ${description}: ${error.message}`);
    return false;
  }
}

async function runComprehensiveTests() {
  console.log('🧪 Comprehensive Login Page Testing\n');
  console.log('=' .repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  // Test page loading
  console.log('\n📄 Testing Page Loading:');
  const pageTests = [
    { url: 'http://localhost:5000', desc: 'Main page' },
    { url: 'http://localhost:5000/login', desc: 'Login page' },
  ];

  for (const test of pageTests) {
    totalTests++;
    if (await testPageLoad(test.url, test.desc)) passedTests++;
  }

  // Test valid logins
  console.log('\n🔐 Testing Valid Logins:');
  for (const cred of testCredentials) {
    totalTests++;
    if (await testValidLogin(cred.email, cred.password, cred.expectedRole)) passedTests++;
  }

  // Test invalid logins
  console.log('\n🚫 Testing Invalid Logins:');
  for (const cred of invalidCredentials) {
    totalTests++;
    if (await testInvalidLogin(cred.email, cred.password)) passedTests++;
  }

  // Test authentication flow
  console.log('\n🔄 Testing Authentication Flow:');
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@dataviz.com', password: 'admin123' }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test protected route with token
      const protectedResponse = await fetch('http://localhost:5000/api/files', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      totalTests++;
      if (protectedResponse.ok) {
        console.log('✅ Protected route accessible with valid token');
        passedTests++;
      } else {
        console.log('❌ Protected route not accessible with valid token');
      }

      // Test protected route without token
      const noTokenResponse = await fetch('http://localhost:5000/api/files');
      totalTests++;
      if (noTokenResponse.status === 401) {
        console.log('✅ Protected route correctly rejects requests without token');
        passedTests++;
      } else {
        console.log('❌ Protected route should reject requests without token');
      }
    } else {
      console.log('❌ Could not complete auth flow test - login failed');
      totalTests += 2; // Still count the failed tests
    }
  } catch (error) {
    console.log(`❌ Error testing auth flow: ${error.message}`);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Login page is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation for issues.');
  }

  console.log('\n🔗 Access the login page at: http://localhost:5000/login');
  console.log('👤 Demo credentials:');
  console.log('   User: user@dataviz.com / admin123');
  console.log('   Admin: admin@dataviz.com / admin123');
  console.log('   Super Admin: superadmin@dataviz.com / admin123');
}

// Wait for server to be ready
setTimeout(runComprehensiveTests, 3000);