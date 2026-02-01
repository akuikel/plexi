#!/usr/bin/env node

/**
 * Create a test scheduled call that's due immediately for testing
 * Usage: node create-test-call.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function createTestCall() {
  console.log('🧪 Creating test scheduled call...');
  console.log('📍 Base URL:', BASE_URL);

  // Schedule call for 1 minute ago (so it's immediately due)
  const scheduledTime = new Date(Date.now() - 60000); // 1 minute ago

  console.log('⏰ Scheduled time:', scheduledTime.toISOString());
  console.log('⏰ Current time:', new Date().toISOString());
  console.log('');

  try {
    const response = await fetch(`${BASE_URL}/api/calls/scheduled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need to be logged in for this to work
        // Or modify the API to accept a test mode
      },
      body: JSON.stringify({
        prompt: 'Test scheduled call - please call the support team about the server issue',
        scheduledStartTime: scheduledTime.toISOString(),
      }),
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('');
      console.log('✅ Test call created successfully!');
      console.log('🚀 Now run the scheduler to process it:');
      console.log(`   node test-scheduler.js ${BASE_URL}`);
    }
  } catch (error) {
    console.error('❌ Failed to create test call:', error);
  }
}

// Run the test
createTestCall();
