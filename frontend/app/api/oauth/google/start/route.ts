import { NextResponse } from 'next/server';
import {
  generateOAuthState,
  validateOAuthConfig,
  getBaseUrl,
  buildGoogleAuthUrl,
  getStateCookieOptions,
  OAUTH_ERRORS,
} from '@/lib/utils/oauth';

/**
 * Google OAuth Start Route
 * Initiates the OAuth flow by redirecting to Google's authorization server
 */
export async function GET(req: Request) {
  try {
    // Validate OAuth configuration
    const { isValid, missingVars } = validateOAuthConfig();
    if (!isValid) {
      console.error('[OAuth] Missing environment variables:', missingVars);
      const baseUrl = getBaseUrl(req.url);
      return NextResponse.redirect(`${baseUrl}/login?error=${OAUTH_ERRORS.MISSING_CONFIG}`);
    }

    const baseUrl = getBaseUrl(req.url);
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const state = generateOAuthState();

    // Build Google OAuth authorization URL
    const authUrl = buildGoogleAuthUrl(clientId, redirectUri, state);

    if (process.env.NODE_ENV === 'development') {
      console.log('[OAuth] Starting flow with redirect URI:', redirectUri);
    }

    // Create redirect response with secure state cookie
    const response = NextResponse.redirect(authUrl);
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('oauth_state', state, getStateCookieOptions(isProduction));

    return response;
  } catch (error) {
    console.error('[OAuth] Start error:', error);
    const baseUrl = getBaseUrl(req.url);
    return NextResponse.redirect(`${baseUrl}/login?error=${OAUTH_ERRORS.START_FAILED}`);
  }
}
