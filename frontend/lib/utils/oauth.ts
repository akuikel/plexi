/**
 * OAuth utility functions
 * Shared utilities for OAuth authentication flows
 */

import { randomBytes } from 'crypto';

// OAuth Configuration
export const OAUTH_CONFIG = {
  GOOGLE: {
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USERINFO_URL: 'https://openidconnect.googleapis.com/v1/userinfo',
    SCOPES: 'openid email profile',
  },
  STATE_COOKIE: {
    NAME: 'oauth_state',
    MAX_AGE: 600, // 10 minutes
  },
  SESSION_COOKIE: {
    NAME: 'session',
    MAX_AGE: 60 * 60 * 24 * 7, // 7 days
  },
} as const;

// Error codes for OAuth flows
export const OAUTH_ERRORS = {
  MISSING_CONFIG: 'oauth_config_missing',
  START_FAILED: 'oauth_start_failed',
  STATE_MISMATCH: 'oauth_state_mismatch',
  DENIED: 'oauth_denied',
  TOKEN_FAILED: 'oauth_token_failed',
  PROFILE_INVALID: 'oauth_profile_invalid',
  SERVER_ERROR: 'oauth_server_error',
} as const;

// Types
export interface OAuthState {
  value: string;
  timestamp: number;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * Generate a secure random state parameter for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate OAuth environment variables
 */
export function validateOAuthConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'AUTH_SECRET', 'NEXT_PUBLIC_BASE_URL'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Get base URL from request or environment
 */
export function getBaseUrl(requestUrl?: string): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
  }

  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }

  return 'http://localhost:3000';
}

/**
 * Build OAuth authorization URL
 */
export function buildGoogleAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.GOOGLE.SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${OAUTH_CONFIG.GOOGLE.AUTH_URL}?${params.toString()}`;
}

/**
 * Generate a safe username from email
 */
export function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  // Remove any non-alphanumeric characters except dots and underscores
  const cleaned = localPart.replace(/[^a-zA-Z0-9._]/g, '');
  return cleaned || 'user';
}

/**
 * Create cookie options for OAuth state
 */
export function getStateCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: OAUTH_CONFIG.STATE_COOKIE.MAX_AGE,
  };
}

/**
 * Create cookie options for session
 */
export function getSessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: OAUTH_CONFIG.SESSION_COOKIE.MAX_AGE,
  };
}
