import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');

    // Test basic query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
