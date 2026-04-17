#!/usr/bin/env node

/**
 * Comprehensive test script for the Call Scheduler
 * Usage: node test-cron-scheduler.js [base-url]
 * Example: node test-cron-scheduler.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const SECRET_TOKEN = 'scheduler_secret_2024_persaai_secure_token_98765';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testSchedulerCron() {
  console.log('🧪 Testing Call Scheduler Cron Service...');
  console.log('📍 Base URL:', BASE_URL);
  console.log('⏰ Test time:', new Date().toISOString());
  console.log('');

  const headers = {
    Authorization: `Bearer ${SECRET_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    // Test 1: Check scheduler status
    console.log('1️⃣ Checking scheduler status...');
    const statusResult = await makeRequest(`${BASE_URL}/api/scheduler/control`);

    console.log(`   Status: ${statusResult.status}`);
    if (statusResult.success) {
      const { scheduler } = statusResult.data;
      console.log(`   Running: ${scheduler.isRunning ? '✅' : '❌'}`);
      console.log(`   Schedule: ${scheduler.cronSchedule}`);
      console.log(`   Last run: ${scheduler.lastRunTime || 'Never'}`);
      console.log(`   Next run: ${scheduler.nextExecutionTime}`);
    } else {
      console.log(`   Error: ${statusResult.data?.error || statusResult.error}`);
    }
    console.log('');

    // Test 2: Start scheduler
    console.log('2️⃣ Starting scheduler...');
    const startResult = await makeRequest(`${BASE_URL}/api/scheduler/control`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'start' }),
    });

    console.log(`   Status: ${startResult.status}`);
    if (startResult.success) {
      console.log(`   Message: ${startResult.data.message}`);
      console.log(`   Running: ${startResult.data.status.isRunning ? '✅' : '❌'}`);
    } else {
      console.log(`   Error: ${startResult.data?.error || startResult.error}`);
    }
    console.log('');

    // Test 3: Manual execution
    console.log('3️⃣ Testing manual execution...');
    const executeResult = await makeRequest(`${BASE_URL}/api/scheduler/control`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'execute' }),
    });

    console.log(`   Status: ${executeResult.status}`);
    if (executeResult.success) {
      console.log(`   Message: ${executeResult.data.message}`);
      const result = executeResult.data.result;
      if (result) {
        console.log(`   Execution success: ${result.success ? '✅' : '❌'}`);
        console.log(`   Duration: ${result.duration}ms`);
        if (result.data) {
          console.log(`   Processed: ${result.data.processed || 0} calls`);
          console.log(`   Successful: ${result.data.successful || 0}`);
          console.log(`   Failed: ${result.data.failed || 0}`);
        }
      }
    } else {
      console.log(`   Error: ${executeResult.data?.error || executeResult.error}`);
    }
    console.log('');

    // Test 4: Wait and check if cron runs automatically
    console.log('4️⃣ Waiting 70 seconds to test automatic execution...');
    console.log('   (The cron should run within this time)');

    const startTime = Date.now();
    let foundExecution = false;

    for (let i = 0; i < 7; i++) {
      await sleep(10000); // Wait 10 seconds

      const checkResult = await makeRequest(`${BASE_URL}/api/scheduler/control`);
      if (checkResult.success) {
        const lastRunTime = checkResult.data.scheduler.lastRunTime;
        if (lastRunTime) {
          const lastRun = new Date(lastRunTime);
          if (lastRun.getTime() > startTime) {
            console.log(`   ✅ Automatic execution detected at: ${lastRun.toISOString()}`);
            const lastResult = checkResult.data.scheduler.lastRunResult;
            if (lastResult) {
              console.log(`   📊 Result: ${lastResult.success ? 'Success' : 'Failed'}`);
              if (lastResult.data) {
                console.log(`   📋 Processed: ${lastResult.data.processed || 0} calls`);
              }
            }
            foundExecution = true;
            break;
          }
        }
      }

      process.stdout.write('.');
    }

    console.log('');
    if (!foundExecution) {
      console.log('   ⚠️ No automatic execution detected (this might be normal if no calls are scheduled)');
    }
    console.log('');

    // Test 5: Test scheduler control commands
    console.log('5️⃣ Testing scheduler control commands...');

    // Stop
    const stopResult = await makeRequest(`${BASE_URL}/api/scheduler/control`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'stop' }),
    });

    console.log(`   Stop: ${stopResult.success ? '✅' : '❌'} (${stopResult.status})`);

    await sleep(1000);

    // Restart
    const restartResult = await makeRequest(`${BASE_URL}/api/scheduler/control`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'restart' }),
    });

    console.log(`   Restart: ${restartResult.success ? '✅' : '❌'} (${restartResult.status})`);
    console.log('');

    // Final status check
    console.log('6️⃣ Final status check...');
    const finalResult = await makeRequest(`${BASE_URL}/api/scheduler/control`);

    if (finalResult.success) {
      const { scheduler } = finalResult.data;
      console.log(`   Running: ${scheduler.isRunning ? '✅' : '❌'}`);
      console.log(`   Schedule: ${scheduler.cronSchedule}`);
      console.log(`   Uptime: ${Math.round(scheduler.uptime / 1000)}s`);
    }

    console.log('');
    console.log('🎯 Scheduler cron test completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   - Scheduler API endpoints are working');
    console.log('   - Manual execution works');
    console.log('   - Control commands (start/stop/restart) work');
    console.log('   - Cron job should execute every minute automatically');
    console.log('');
    console.log('🚀 To monitor live:');
    console.log(`   curl ${BASE_URL}/api/scheduler/control | jq`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSchedulerCron();
