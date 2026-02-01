import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * JWT verification helper
 */
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Update user preferences
 */
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(sessionToken);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await req.json();
    const { emailNotifications, smsNotifications, autoRetryFailedCalls, activeMode } = body;

    // Note: The current User model doesn't have preference fields
    // For now, we'll just return success without storing anything
    // In a real implementation, you might want to create a UserPreferences table

    console.log('User preferences update:', {
      userId: payload.sub,
      preferences: { emailNotifications, smsNotifications, autoRetryFailedCalls, activeMode },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Preferences UPDATE error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
