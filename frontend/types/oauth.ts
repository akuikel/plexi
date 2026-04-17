/**
 * OAuth Types
 * Type definitions for OAuth flows
 */

// Google OAuth Types
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleTokenRequest {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: 'authorization_code';
}

export interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// Database User Types
export interface CreateUserData {
  email: string;
  username: string;
  name: string | null;
  passwordHash: string;
  googleId: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserSession {
  sub: string;
  email: string;
  username: string;
  role: string;
}

// OAuth Error Types
export type OAuthError =
  | 'oauth_config_missing'
  | 'oauth_start_failed'
  | 'oauth_state_mismatch'
  | 'oauth_denied'
  | 'oauth_token_failed'
  | 'oauth_profile_invalid'
  | 'oauth_server_error'
  | 'oauth_user_creation_failed';

export interface OAuthErrorResponse {
  error: OAuthError;
  description?: string;
  hint?: string;
}

// Configuration validation
export interface OAuthConfigValidation {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

// Cookie options
export interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
  path: string;
  maxAge: number;
}

// OAuth State
export interface OAuthState {
  value: string;
  timestamp: number;
  nonce?: string;
}
