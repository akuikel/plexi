import * as cron from 'node-cron';

interface SchedulerConfig {
  baseUrl: string;
  secretToken: string;
  cronSchedule: string;
  enabled: boolean;
}

export class CallSchedulerService {
  private static instance: CallSchedulerService;
  private cronJob: cron.ScheduledTask | null = null;
  private config: SchedulerConfig;
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private lastRunResult: any = null;

  private constructor(config: SchedulerConfig) {
    this.config = config;
  }

  static getInstance(config?: SchedulerConfig): CallSchedulerService {
    if (!CallSchedulerService.instance) {
      if (!config) {
        throw new Error('SchedulerConfig required for first initialization');
      }
      CallSchedulerService.instance = new CallSchedulerService(config);
    }
    return CallSchedulerService.instance;
  }

  /**
   * Start the cron job scheduler
   */
  start(): void {
    if (this.cronJob) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('📴 Scheduler is disabled');
      return;
    }

    console.log('🚀 Starting Call Scheduler Service...');
    console.log(`📅 Schedule: ${this.config.cronSchedule}`);
    console.log(`🌐 Target URL: ${this.config.baseUrl}/api/scheduler/process-calls`);
    console.log(`🔐 Auth: ${this.config.secretToken ? 'Configured' : 'Not configured'}`);

    this.cronJob = cron.schedule(
      this.config.cronSchedule,
      async () => {
        await this.executeScheduler();
      },
      {
        timezone: 'UTC', // Always work in UTC
      }
    );

    this.cronJob.start();
    this.isRunning = true;

    console.log('✅ Call Scheduler Service started successfully');
    console.log(`⏰ Next execution: ${this.getNextExecutionTime()}`);
  }

  /**
   * Stop the cron job scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isRunning = false;
      console.log('🛑 Call Scheduler Service stopped');
    } else {
      console.log('⚠️ Scheduler was not running');
    }
  }

  /**
   * Execute the scheduler endpoint
   */
  private async executeScheduler(): Promise<void> {
    const startTime = new Date();
    console.log('\n🔄 Executing scheduled call processor...');
    console.log(`⏰ Execution time: ${startTime.toISOString()}`);

    try {
      const url = `${this.config.baseUrl}/api/scheduler/process-calls`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.secretToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PersaAI-Scheduler/1.0',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseData = await response.json();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.lastRunTime = startTime;
      this.lastRunResult = {
        success: response.ok,
        status: response.status,
        data: responseData,
        duration,
        timestamp: startTime.toISOString(),
      };

      if (response.ok) {
        const { processed, successful, failed } = responseData;
        console.log(`✅ Scheduler executed successfully (${duration}ms)`);
        console.log(`📊 Results: ${processed || 0} processed, ${successful || 0} successful, ${failed || 0} failed`);

        if (processed > 0) {
          console.log('📋 Processed calls:');
          responseData.results?.forEach((result: any, index: number) => {
            const status = result.status === 'success' ? '✅' : '❌';
            const delay = result.delayMinutes ? ` (${result.delayMinutes}m delay)` : '';
            console.log(`   ${index + 1}. ${status} Call ${result.callId}${delay}`);
          });
        }
      } else {
        console.error(`❌ Scheduler failed: ${response.status} ${response.statusText}`);
        console.error(`📝 Response: ${JSON.stringify(responseData, null, 2)}`);
      }
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.lastRunTime = startTime;
      this.lastRunResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: startTime.toISOString(),
      };

      console.error(`💥 Scheduler execution failed (${duration}ms):`, error);

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏱️ Request timed out after 30 seconds');
      }
    }

    console.log(`⏭️ Next execution: ${this.getNextExecutionTime()}\n`);
  }

  /**
   * Get the next execution time
   */
  private getNextExecutionTime(): string {
    if (!this.cronJob) {
      return 'Not scheduled';
    }

    try {
      // This is a simplified approach - node-cron doesn't have built-in next execution time
      // For every minute schedule, next execution is within 1 minute
      const nextTime = new Date(Date.now() + 60000);
      return nextTime.toISOString();
    } catch (error) {
      return 'Unable to calculate';
    }
  }

  /**
   * Get scheduler status and statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cronSchedule: this.config.cronSchedule,
      baseUrl: this.config.baseUrl,
      lastRunTime: this.lastRunTime?.toISOString() || null,
      lastRunResult: this.lastRunResult,
      nextExecutionTime: this.getNextExecutionTime(),
      uptime: this.lastRunTime ? Date.now() - this.lastRunTime.getTime() : 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isRunning) {
      console.log('🔄 Restarting scheduler with new configuration...');
      this.stop();
      this.start();
    }
  }

  /**
   * Execute scheduler manually (for testing)
   */
  async executeManually(): Promise<any> {
    console.log('🧪 Manual scheduler execution triggered...');
    await this.executeScheduler();
    return this.lastRunResult;
  }
}

// Scheduler configuration helper
const getSchedulerConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const secretToken = process.env.SCHEDULER_SECRET_TOKEN;

  if (!secretToken) {
    console.warn('⚠️ SCHEDULER_SECRET_TOKEN not found in environment variables');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
    secretToken: secretToken || '',
    cronSchedule: process.env.SCHEDULER_CRON_SCHEDULE || '* * * * *', // Every minute by default
    enabled: process.env.SCHEDULER_ENABLED !== 'false', // Enabled by default
  };
};

// Initialize and start scheduler (only on server side)
let schedulerInstance: CallSchedulerService | null = null;

export const initializeScheduler = () => {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return null;
  }

  // Only initialize once
  if (schedulerInstance) {
    return schedulerInstance;
  }

  try {
    const config = getSchedulerConfig();

    console.log('🔧 Initializing Call Scheduler...');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Base URL: ${config.baseUrl}`);
    console.log(`📅 Schedule: ${config.cronSchedule}`);
    console.log(`⚡ Enabled: ${config.enabled}`);

    schedulerInstance = CallSchedulerService.getInstance(config);

    if (config.enabled) {
      schedulerInstance.start();
    } else {
      console.log('📴 Scheduler disabled by configuration');
    }

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      console.log('\n🛑 Shutting down scheduler...');
      schedulerInstance?.stop();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    return schedulerInstance;
  } catch (error) {
    console.error('💥 Failed to initialize scheduler:', error);
    return null;
  }
};

export const getScheduler = () => schedulerInstance;
