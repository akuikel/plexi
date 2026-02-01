#!/usr/bin/env node

/**
 * Real-time scheduler monitor
 * Usage: node monitor-scheduler.js [base-url]
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSchedulerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/scheduler/control`);
    if (response.ok) {
      return await response.json();
    }
    return { error: `HTTP ${response.status}` };
  } catch (error) {
    return { error: error.message };
  }
}

function formatTime(isoString) {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleString();
}

function formatDuration(ms) {
  if (!ms) return '0s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

async function monitorScheduler() {
  console.log('📊 Real-time Scheduler Monitor');
  console.log('📍 URL:', BASE_URL);
  console.log('⏰ Started:', new Date().toLocaleString());
  console.log('💡 Press Ctrl+C to stop\n');

  let previousLastRun = null;
  let executionCount = 0;

  while (true) {
    try {
      // Clear screen (works in most terminals)
      process.stdout.write('\x1B[2J\x1B[0f');

      const result = await getSchedulerStatus();

      console.log('📊 Scheduler Status Monitor');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🕐 Current Time: ${new Date().toLocaleString()}`);
      console.log(`📍 Monitoring:   ${BASE_URL}`);
      console.log('');

      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      } else if (result.scheduler) {
        const { scheduler } = result;

        console.log(`🔄 Status:       ${scheduler.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
        console.log(`📅 Schedule:     ${scheduler.cronSchedule}`);
        console.log(`⏰ Last Run:     ${formatTime(scheduler.lastRunTime)}`);
        console.log(`⏭️ Next Run:     ${formatTime(scheduler.nextExecutionTime)}`);
        console.log(`⏱️ Uptime:       ${formatDuration(scheduler.uptime)}`);
        console.log('');

        // Check for new executions
        if (scheduler.lastRunTime && scheduler.lastRunTime !== previousLastRun) {
          if (previousLastRun) {
            executionCount++;
            console.log(`🔥 NEW EXECUTION DETECTED! (#${executionCount})`);
          }
          previousLastRun = scheduler.lastRunTime;
        }

        if (scheduler.lastRunResult) {
          const result = scheduler.lastRunResult;
          console.log('📋 Last Execution Results:');
          console.log(`   ✅ Success:    ${result.success ? 'Yes' : 'No'}`);
          console.log(`   ⏱️ Duration:   ${result.duration}ms`);
          console.log(`   🕐 Time:       ${formatTime(result.timestamp)}`);

          if (result.data) {
            console.log(`   📊 Processed:  ${result.data.processed || 0} calls`);
            console.log(`   ✅ Successful: ${result.data.successful || 0}`);
            console.log(`   ❌ Failed:     ${result.data.failed || 0}`);

            if (result.data.results && result.data.results.length > 0) {
              console.log('   📝 Call Details:');
              result.data.results.slice(0, 3).forEach((call, i) => {
                const status = call.status === 'success' ? '✅' : '❌';
                const delay = call.delayMinutes ? ` (${call.delayMinutes}m delay)` : '';
                console.log(`      ${i + 1}. ${status} ${call.callId}${delay}`);
              });
              if (result.data.results.length > 3) {
                console.log(`      ... and ${result.data.results.length - 3} more`);
              }
            }
          }

          if (result.error) {
            console.log(`   ❌ Error:      ${result.error}`);
          }
        } else {
          console.log('📋 No execution results yet');
        }
      }

      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📈 Total Executions Detected: ${executionCount}`);
      console.log('🔄 Refreshing in 5 seconds... (Ctrl+C to stop)');
    } catch (error) {
      console.error('Monitor error:', error);
    }

    await sleep(5000); // Refresh every 5 seconds
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor stopped');
  process.exit(0);
});

// Start monitoring
monitorScheduler();
