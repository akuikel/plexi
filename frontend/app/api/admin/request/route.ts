import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db';
import { EmailService } from '@/db/services';
import crypto from 'crypto';
import { jwtVerify } from 'jose';

// Super admin email (you can change this)
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'abhiyans0@gmail.com';

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET missing');
  return new TextEncoder().encode(s);
}

export async function POST(request: NextRequest) {
  try {
    // Get token from session cookie (JWT format) or token cookie (base64 format)
    const sessionToken = request.cookies.get('session')?.value;
    const legacyToken = request.cookies.get('token')?.value;

    if (!sessionToken && !legacyToken) {
      return NextResponse.json({ error: 'Please log in first to request admin access' }, { status: 401 });
    }

    let userId: string;
    let userEmail: string;

    // Try JWT session token first (from login API)
    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken, key());
        userId = payload.sub as string;
        userEmail = payload.email as string;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
      }
    }
    // Fallback to legacy base64 token
    else if (legacyToken) {
      try {
        const payload = JSON.parse(Buffer.from(legacyToken, 'base64').toString());
        userId = payload.userId;
        userEmail = payload.email;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'No valid authentication found' }, { status: 401 });
    }

    // Get user from database
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already admin
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'You are already an admin!' }, { status: 400 });
    }

    // Check if there's already a pending request
    const existingRequest = await (prisma.adminRequest.findFirst as any)({
      where: {
        userId: userId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending admin request. Please wait for approval.' },
        { status: 400 }
      );
    }

    // Generate authorization token
    const authToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create admin request in database
    const adminRequest = await (prisma.adminRequest.create as any)({
      data: {
        userId: userId,
        userEmail: userEmail,
        userName: user.name || 'Unknown',
        authToken: authToken,
        expiresAt: expiresAt,
        status: 'PENDING',
      },
    });

    // Send email to super admin using the new email service
    const approveUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }/api/admin/approve?token=${authToken}&action=approve`;

    try {
      await EmailService.sendAdminRequest(SUPER_ADMIN_EMAIL, user.name || 'Unknown User', approveUrl);
      console.log('✅ Admin request email sent successfully to:', SUPER_ADMIN_EMAIL);
    } catch (emailError) {
      console.error('Error sending admin request email:', emailError);
      return NextResponse.json({ error: 'Failed to send admin request email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin access request sent! The super admin will review your request and respond via email.',
      requestId: adminRequest.id,
    });
  } catch (error) {
    console.error('Admin request error:', error);
    return NextResponse.json({ error: 'Failed to send admin request' }, { status: 500 });
  }
}
