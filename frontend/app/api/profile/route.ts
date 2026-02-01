import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { UserService } from '@/db/services';

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
 * Generate new JWT token with updated user data
 */
async function generateNewToken(user: any) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    phone: user.phone ?? null,
    location: user.location ?? null,
    bio: user.bio ?? null,
    profileUrl: user.profileUrl ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Get user profile
 */
export async function GET() {
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

    const user = await UserService.findById(payload.sub as string);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        profileUrl: user.profileUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * Update user profile
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
    const { name, phone, location, bio } = body;

    // Update user profile with new fields
    const updatedUser = await UserService.update(payload.sub as string, {
      name: name || null,
      phone: phone || null,
      location: location || null,
      bio: bio || null,
    });

    // Generate new JWT token with updated user data
    const newToken = await generateNewToken(updatedUser);

    // Create response
    const response = NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        location: updatedUser.location,
        bio: updatedUser.bio,
        profileUrl: updatedUser.profileUrl,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });

    // Update the session cookie with new token
    response.cookies.set({
      name: 'session',
      value: newToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Profile UPDATE error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
