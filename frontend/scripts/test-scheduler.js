#!/usr/bin/env node

/**
 * Comprehensive test script for the Call Scheduler system
 * Usage: node test-scheduler.js [url]
 * Example: node test-scheduler.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const SECRET_TOKEN = 'scheduler_secret_2024_persaai_secure_token_98765';

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testSchedulerSystem() {
  console.log('🧪 Testing Complete Call Scheduler System');
  console.log('='.repeat(50));
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Current time: ${new Date().toISOString()}`);
  console.log();

  let testsPassed = 0;
  let totalTests = 0;

  const test = async (name, testFn) => {
    totalTests++;
    console.log(`${totalTests}️⃣ ${name}...`);
    try {
      await testFn();
      console.log('   ✅ PASSED');
      testsPassed++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
    console.log();
  };

  // Test 1: Health check of process-calls endpoint
  await test('Testing process-calls health check', async () => {
    const { status, data } = await makeRequest('/api/scheduler/process-calls');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.message) throw new Error('No message in response');
    console.log(`   📊 Pending calls: ${data.pendingCalls || 0}`);
    console.log(`   📈 Upcoming calls: ${data.upcomingCalls || 0}`);
  });

  // Test 2: Unauthorized process-calls request
  await test('Testing process-calls without auth (should fail)', async () => {
    const { status } = await makeRequest('/api/scheduler/process-calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });

  // Test 3: Authorized process-calls request
  await test('Testing process-calls with auth', async () => {
    const { status, data } = await makeRequest('/api/scheduler/process-calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error('Success should be true');
    console.log(`   📋 Processed: ${data.processed || 0}`);
    console.log(`   ✅ Successful: ${data.successful || 0}`);
    console.log(`   ❌ Failed: ${data.failed || 0}`);
  });

  // Test 4: Scheduler control status
  await test('Testing scheduler control status', async () => {
    const { status, data } = await makeRequest('/api/scheduler/control');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error('Success should be true');
    console.log(`   🏃 Running: ${data.scheduler?.isRunning || false}`);
    console.log(`   📅 Schedule: ${data.scheduler?.cronSchedule || 'unknown'}`);
    console.log(`   ⏰ Last run: ${data.scheduler?.lastRunTime || 'never'}`);
  });

  // Test 5: Manual scheduler execution
  await test('Testing manual scheduler execution', async () => {
    const { status, data } = await makeRequest('/api/scheduler/control', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'execute' }),
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error('Success should be true');
    console.log(`   🔥 Manual execution completed`);
    console.log(`   📊 Result: ${JSON.stringify(data.result, null, 2)}`);
  });

  // Test 6: Scheduler restart
  await test('Testing scheduler restart', async () => {
    const { status, data } = await makeRequest('/api/scheduler/control', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'restart' }),
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error('Success should be true');
    console.log(`   🔄 Scheduler restarted successfully`);
  });

  // Test 7: Invalid action
  await test('Testing invalid action (should fail)', async () => {
    const { status } = await makeRequest('/api/scheduler/control', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'invalid' }),
    });
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
  });

  // Final summary
  console.log('🏁 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - testsPassed}/${totalTests}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log();
    console.log('🎉 All tests passed! The scheduler system is working correctly.');
    console.log();
    console.log('📋 Next steps:');
    console.log('   1. Create a scheduled call via the UI');
    console.log('   2. Watch the scheduler process it automatically');
    console.log('   3. Check the call reports for results');
    console.log();
    console.log('🔧 Monitoring commands:');
    console.log(`   curl ${BASE_URL}/api/scheduler/control`);
    console.log(
      `   curl -X POST -H "Authorization: Bearer ${SECRET_TOKEN}" ${BASE_URL}/api/scheduler/control -d '{"action":"execute"}'`
    );
  } else {
    console.log();
    console.log('⚠️ Some tests failed. Please check the server logs and configuration.');
    process.exit(1);
  }
}

// Run the tests
testSchedulerSystem().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
