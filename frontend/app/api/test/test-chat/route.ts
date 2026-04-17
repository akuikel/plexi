import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { getSession } from '@/lib/session';

// Test endpoint to verify chat message creation
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get recent calls and messages for this user
    const recentCalls = await prisma.call.findMany({
      where: { createdBy: user.id },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      recentCalls
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
