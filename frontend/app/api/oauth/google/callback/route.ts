import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import {
  getBaseUrl,
  getSessionCookieOptions,
  OAUTH_CONFIG,
  OAUTH_ERRORS,
  type GoogleProfile,
  type GoogleTokenResponse,
} from '@/lib/utils/oauth';
import { AuthService } from '@/db/services';

/**
 * Google OAuth Callback Route
 * Handles the OAuth callback from Google and creates/authenticates users
 */

const JWT_EXPIRY = '7d';

/**
 * Generate JWT signing key from environment
 */
function getJWTKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  console.log('[OAuth] AUTH_SECRET available:', !!secret);
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Clear OAuth state cookie and redirect with error
 */
function createErrorRedirect(baseUrl: string, error: string): NextResponse {
  const response = NextResponse.redirect(`${baseUrl}/login?error=${error}`);
  response.cookies.set('oauth_state', '', { path: '/', maxAge: 0 });
  return response;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth credentials');
  }

  const response = await fetch(OAUTH_CONFIG.GOOGLE.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  return response.json();
}

/**
 * Fetch user profile from Google
 */
async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(OAUTH_CONFIG.GOOGLE.USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  return response.json();
}

/**
 * Create JWT session token
 */
async function createSessionToken(user: any): Promise<string> {
  console.log('[OAuth] Creating session token for user:', {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  try {
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role || 'USER',
      phone: user.phone ?? null,
      location: user.location ?? null,
      bio: user.bio ?? null,
      profileUrl: user.profileUrl ?? null,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(getJWTKey());

    console.log('[OAuth] Session token created successfully');
    return token;
  } catch (error) {
    console.error('[OAuth] Failed to create session token:', error);
    throw error;
  }
}

/**
 * Main OAuth callback handler
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const baseUrl = getBaseUrl(req.url);
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('[OAuth] Google returned error:', error);
      return createErrorRedirect(baseUrl, OAUTH_ERRORS.DENIED);
    }

    const cookieStore = await cookies();
    const stateCookie = cookieStore.get('oauth_state')?.value;

    if (!code || !state || !stateCookie || state !== stateCookie) {
      console.error('[OAuth] Invalid state or missing code');
      return createErrorRedirect(baseUrl, OAUTH_ERRORS.STATE_MISMATCH);
    }

    console.log('[OAuth] Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    if (!tokenData.access_token) {
      console.error('[OAuth] Token exchange failed:', tokenData.error);
      return createErrorRedirect(baseUrl, OAUTH_ERRORS.TOKEN_FAILED);
    }

    console.log('[OAuth] Fetching profile from Google...');
    const profile = await fetchGoogleProfile(tokenData.access_token);

    console.log('[OAuth] Profile data received:', { email: profile.email, name: profile.name, sub: profile.sub });

    if (!profile.sub || !profile.email) {
      console.error('[OAuth] Invalid profile data');
      return createErrorRedirect(baseUrl, OAUTH_ERRORS.PROFILE_INVALID);
    }

    const email = profile.email.toLowerCase();
    const name = profile.name || null;
    const googleId = profile.sub;
    const profileUrl = profile.picture || undefined;

    console.log('[OAuth] Finding or creating user...', { email, googleId });
    // Use AuthService to find or create OAuth user
    const user = await AuthService.findOrCreateOAuthUser({
      email,
      name,
      googleId,
      profileUrl,
    });

    console.log('[OAuth] User found/created:', { id: user.id, email: user.email });

    console.log('[OAuth] Creating session token...');
    const sessionToken = await createSessionToken(user);

    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('oauth_state', '', { path: '/', maxAge: 0 });

    response.cookies.set('session', sessionToken, getSessionCookieOptions(isProduction));

    if (process.env.NODE_ENV === 'development') {
      console.log('[OAuth] Successfully authenticated user:', email);
    }

    return response;
  } catch (error) {
    console.error('[OAuth] Callback error:', error);
    console.error('[OAuth] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[OAuth] Error message:', error instanceof Error ? error.message : 'Unknown error');
    const baseUrl = getBaseUrl(req.url);
    return createErrorRedirect(baseUrl, OAUTH_ERRORS.SERVER_ERROR);
  }
}
