import { NextRequest, NextResponse } from 'next/server';
import { getScheduler, initializeScheduler } from '@/db/services';

export async function GET() {
  try {
    const scheduler = getScheduler() || initializeScheduler();

    if (!scheduler) {
      return NextResponse.json(
        {
          error: 'Scheduler not available',
          status: 'unavailable',
        },
        { status: 500 }
      );
    }

    const status = scheduler.getStatus();

    return NextResponse.json({
      success: true,
      scheduler: status,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simple authentication
    const authToken = request.headers.get('authorization');
    const expectedToken = process.env.SCHEDULER_SECRET_TOKEN;

    if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const scheduler = getScheduler() || initializeScheduler();

    if (!scheduler) {
      return NextResponse.json(
        {
          error: 'Scheduler not available',
        },
        { status: 500 }
      );
    }

    switch (action) {
      case 'start':
        scheduler.start();
        return NextResponse.json({
          success: true,
          message: 'Scheduler started',
          status: scheduler.getStatus(),
        });

      case 'stop':
        scheduler.stop();
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped',
          status: scheduler.getStatus(),
        });

      case 'restart':
        scheduler.stop();
        scheduler.start();
        return NextResponse.json({
          success: true,
          message: 'Scheduler restarted',
          status: scheduler.getStatus(),
        });

      case 'execute':
        console.log('🧪 Manual execution requested via API');
        const result = await scheduler.executeManually();
        return NextResponse.json({
          success: true,
          message: 'Manual execution completed',
          result,
          status: scheduler.getStatus(),
        });

      case 'status':
        return NextResponse.json({
          success: true,
          status: scheduler.getStatus(),
        });

      default:
        return NextResponse.json(
          {
            error: 'Invalid action. Use: start, stop, restart, execute, or status',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scheduler control error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
