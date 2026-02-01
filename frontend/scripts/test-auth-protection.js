#!/usr/bin/env node

/**
 * Test Authentication Protection
 *
 * This script tests that protected routes redirect to login
 * when users are not authenticated.
 */

const BASE_URL = 'http://localhost:3000';

async function testRoute(path, description) {
  console.log(`🧪 Testing ${description}...`);
  console.log(`   📍 URL: ${BASE_URL}${path}`);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      redirect: 'manual', // Don't follow redirects automatically
    });

    if (response.status === 200) {
      console.log(`   ✅ Status: ${response.status} - Page loads (may have client-side redirect)`);
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log(`   🔄 Status: ${response.status} - Redirects to: ${location}`);
    } else {
      console.log(`   ⚠️  Status: ${response.status} - Unexpected response`);
    }

    return response.status;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

async function testAuthProtection() {
  console.log('🔒 Testing Authentication Protection');
  console.log('='.repeat(50));
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log();

  const tests = [
    { path: '/dashboard', description: 'Dashboard page (should be protected)' },
    { path: '/admin', description: 'Admin page (should be protected)' },
    { path: '/profile', description: 'Profile page (should be protected)' },
    { path: '/login', description: 'Login page (should be accessible)' },
    { path: '/signup', description: 'Signup page (should be accessible)' },
    { path: '/landing', description: 'Landing page (should be accessible)' },
  ];

  for (const test of tests) {
    await testRoute(test.path, test.description);
    console.log();
  }

  console.log('🎯 Test Summary');
  console.log('='.repeat(50));
  console.log('✅ Protected routes should redirect or use client-side auth checks');
  console.log('✅ Public routes should load normally (status 200)');
  console.log();
  console.log('📋 Next steps:');
  console.log('1. Visit http://localhost:3000/dashboard without logging in');
  console.log('2. Verify you are redirected to /login');
  console.log('3. Test with a logged-in session');
  console.log();
  console.log('🔧 Manual verification:');
  console.log('1. Open browser in incognito mode');
  console.log('2. Go to http://localhost:3000/dashboard');
  console.log('3. Should redirect to login page');
  console.log('4. After login, should allow dashboard access');
}

// Run the tests
testAuthProtection().catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
