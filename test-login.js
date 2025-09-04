#!/usr/bin/env node

/**
 * Simple test script for login functionality
 */

const testCredentials = [
  { email: 'user@dataviz.com', password: 'admin123', expectedRole: 'user' },
  { email: 'admin@dataviz.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'superadmin@dataviz.com', password: 'admin123', expectedRole: 'superadmin' },
];

async function testLogin(email, password, expectedRole) {
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
      console.log(`✅ Login successful for ${email}`);
      console.log(`   Role: ${data.user.role} (expected: ${expectedRole})`);
      console.log(`   Token received: ${data.token ? 'Yes' : 'No'}`);
      return data.user.role === expectedRole;
    } else {
      console.log(`❌ Login failed for ${email}: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing ${email}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Login Functionality\n');

  let passed = 0;
  let total = testCredentials.length;

  for (const cred of testCredentials) {
    const success = await testLogin(cred.email, cred.password, cred.expectedRole);
    if (success) passed++;
    console.log(''); // Empty line for readability
  }

  console.log(`📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All login tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the server logs for details.');
  }
}

// Wait a moment for server to be ready
setTimeout(runTests, 2000);