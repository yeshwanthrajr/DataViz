#!/usr/bin/env node

/**
 * Comprehensive test script for dashboard functionality
 */

const testCredentials = [
  { email: 'user@dataviz.com', password: 'admin123', role: 'user' },
  { email: 'admin@dataviz.com', password: 'admin123', role: 'admin' },
  { email: 'superadmin@dataviz.com', password: 'admin123', role: 'superadmin' },
];

async function testDashboardAccess(email, password, expectedRole) {
  try {
    console.log(`\n🔐 Testing ${expectedRole.toUpperCase()} dashboard access...`);

    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      console.log(`❌ Login failed for ${email}`);
      return false;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log(`✅ Login successful for ${email} (${loginData.user.role})`);

    // Test dashboard-specific endpoints based on role
    const endpoints = [
      { url: '/api/stats/dashboard', desc: 'Dashboard stats' },
      { url: '/api/files', desc: 'Files list' },
      { url: '/api/charts', desc: 'Charts list' },
    ];

    // Add role-specific endpoints
    if (expectedRole === 'admin' || expectedRole === 'superadmin') {
      endpoints.push(
        { url: '/api/stats/admin', desc: 'Admin stats' },
        { url: '/api/files/pending', desc: 'Pending files' }
      );
    }

    if (expectedRole === 'superadmin') {
      endpoints.push(
        { url: '/api/stats/superadmin', desc: 'Super admin stats' },
        { url: '/api/users', desc: 'Users list' },
        { url: '/api/admin-requests/pending', desc: 'Admin requests' }
      );
    }

    let successCount = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000${endpoint.url}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          console.log(`  ✅ ${endpoint.desc}: ${response.status}`);
          successCount++;
        } else {
          console.log(`  ❌ ${endpoint.desc}: ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint.desc}: Error - ${error.message}`);
      }
    }

    console.log(`📊 ${expectedRole.toUpperCase()} dashboard: ${successCount}/${endpoints.length} endpoints working`);
    return successCount === endpoints.length;

  } catch (error) {
    console.log(`❌ Error testing ${expectedRole} dashboard: ${error.message}`);
    return false;
  }
}

async function testPageAccess() {
  console.log('\n🌐 Testing page accessibility...');

  const pages = [
    { url: 'http://localhost:5000', desc: 'Main page' },
    { url: 'http://localhost:5000/login', desc: 'Login page' },
  ];

  let successCount = 0;

  for (const page of pages) {
    try {
      const response = await fetch(page.url);
      if (response.ok) {
        console.log(`✅ ${page.desc}: ${response.status}`);
        successCount++;
      } else {
        console.log(`❌ ${page.desc}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${page.desc}: Error - ${error.message}`);
    }
  }

  return successCount === pages.length;
}

async function testFileOperations(token) {
  console.log('\n📁 Testing file operations...');

  // Create a simple test file
  const testData = [
    { name: 'Alice', age: 25, city: 'New York' },
    { name: 'Bob', age: 30, city: 'London' },
    { name: 'Charlie', age: 35, city: 'Paris' }
  ];

  try {
    // Test file creation (this would normally be done via form upload)
    const createResponse = await fetch('http://localhost:5000/api/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: 'test-file.json',
        originalName: 'test-data.json',
        path: '/uploads/test-file.json',
        data: testData,
        status: 'pending'
      })
    });

    if (createResponse.ok) {
      console.log('✅ File creation: Success');
      return true;
    } else {
      console.log(`❌ File creation: ${createResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ File operations error: ${error.message}`);
    return false;
  }
}

async function runDashboardTests() {
  console.log('🧪 Comprehensive Dashboard Testing\n');
  console.log('=' .repeat(50));

  // Test page accessibility
  const pagesWorking = await testPageAccess();

  // Test dashboard access for each role
  let dashboardTests = 0;
  let dashboardSuccess = 0;

  for (const cred of testCredentials) {
    dashboardTests++;
    const success = await testDashboardAccess(cred.email, cred.password, cred.role);
    if (success) dashboardSuccess++;
  }

  // Test file operations with user token
  console.log('\n📁 Testing file operations...');
  try {
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@dataviz.com', password: 'admin123' }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      await testFileOperations(loginData.token);
    }
  } catch (error) {
    console.log(`❌ File operations test failed: ${error.message}`);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 DASHBOARD TEST RESULTS');
  console.log('=' .repeat(50));
  console.log(`🌐 Page Accessibility: ${pagesWorking ? 'PASS' : 'FAIL'}`);
  console.log(`👥 Dashboard Access: ${dashboardSuccess}/${dashboardTests} roles working`);

  const totalTests = 1 + dashboardTests; // pages + dashboards
  const totalSuccess = (pagesWorking ? 1 : 0) + dashboardSuccess;

  console.log(`📈 Overall Success Rate: ${totalSuccess}/${totalTests} (${((totalSuccess/totalTests)*100).toFixed(1)}%)`);

  if (totalSuccess === totalTests) {
    console.log('\n🎉 ALL DASHBOARD TESTS PASSED!');
    console.log('\n🔗 Dashboard URLs:');
    console.log('   User Dashboard: http://localhost:5000 (after login)');
    console.log('   Admin Dashboard: http://localhost:5000/admin');
    console.log('   Super Admin Dashboard: http://localhost:5000/super-admin');
    console.log('\n👤 Demo Credentials:');
    console.log('   User: user@dataviz.com / admin123');
    console.log('   Admin: admin@dataviz.com / admin123');
    console.log('   Super Admin: superadmin@dataviz.com / admin123');
  } else {
    console.log('\n⚠️  Some dashboard tests failed. Check the server logs for details.');
  }
}

// Wait for server to be ready
setTimeout(runDashboardTests, 3000);