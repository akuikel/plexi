/**
 * Authentication and session utilities
 */
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { UserService } from '@/db';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'WAITLIST';
}

export interface SessionPayload {
  sub: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'WAITLIST';
  iat: number;
  exp: number;
}

/**
 * Create a JWT token for user session
 */
export async function createSession(user: {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
}): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verify and decode JWT token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySession(token);
  if (!payload) {
    return null;
  }

  // Verify user still exists in database
  const user = await UserService.findById(payload.sub);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name || undefined,
    role: user.role,
  };
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'ADMIN';
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

/**
 * Require admin access - throws if not admin
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return session;
}

/**
 * Validate session from request - returns validation result
 */
export async function validateSession(request: Request): Promise<{
  isValid: boolean;
  user: SessionUser | null;
  error?: string;
}> {
  try {
    // Extract token from cookies in the request
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { isValid: false, user: null, error: 'No cookies found' };
    }

    // Parse cookies to find session token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['session'];
    if (!token) {
      return { isValid: false, user: null, error: 'No session token found' };
    }

    const payload = await verifySession(token);
    if (!payload) {
      return { isValid: false, user: null, error: 'Invalid session token' };
    }

    // Verify user still exists in database
    const user = await UserService.findById(payload.sub);
    if (!user) {
      return { isValid: false, user: null, error: 'User not found' };
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name || undefined,
        role: user.role,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
