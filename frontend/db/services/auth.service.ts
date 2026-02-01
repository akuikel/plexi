/**
 * Authentication service - handles authentication business logic
 * This service operates at the database layer and should only be used in API routes
 */
import bcrypt from 'bcrypt';
import { UserService } from './user.service';

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  profileUrl?: string;
  role: string;
  username: string;
}

export interface OAuthUserData {
  email: string;
  name: string | null;
  googleId: string;
  profileUrl?: string;
}

export class AuthService {
  /**
   * Authenticate user with email/username and password
   */
  static async authenticateUser(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { identifier, password } = credentials;

      // Try to find user by email or username
      const user = (await UserService.findByEmail(identifier)) || (await UserService.findByUsername(identifier));

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.passwordHash) {
        return { success: false, error: 'Password not set. Please use social login or reset password.' };
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileUrl: user.profileUrl || undefined,
          role: user.role,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(signupData: SignupData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { email, password, name, username } = signupData;

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      const existingUsername = await UserService.findByUsername(username);
      if (existingUsername) {
        return { success: false, error: 'Username already taken' };
      }

      // Create new user
      const newUser = await UserService.create({
        email,
        password,
        name,
        username,
        role: 'USER',
      });

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          profileUrl: newUser.profileUrl || undefined,
          role: newUser.role,
          username: newUser.username,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Find or create user from OAuth data
   */
  static async findOrCreateOAuthUser(oauthData: OAuthUserData): Promise<AuthUser> {
    const { email, name, googleId, profileUrl } = oauthData;

    // First, check if user exists with this email
    let user = await UserService.findByEmail(email);

    if (user) {
      // User exists - link Google account if not already linked and update profile if needed
      if (!user.googleId) {
        user = await UserService.linkGoogleAccount(user.id, googleId, profileUrl);
      } else if (profileUrl && user.profileUrl !== profileUrl) {
        // Update profile URL if it has changed
        user = await UserService.updateProfileUrl(user.id, profileUrl);
      }

      if (!user) {
        throw new Error('Failed to update user');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        profileUrl: user.profileUrl || undefined,
        role: user.role,
        username: user.username,
      };
    }

    // User doesn't exist - create new user with OAuth data
    const newUser = await UserService.createOAuthUser({
      email,
      name,
      googleId,
      profileUrl,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profileUrl: newUser.profileUrl || undefined,
      role: newUser.role,
      username: newUser.username,
    };
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await UserService.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return { success: true };
      }

      await UserService.createPasswordResetToken(user.id);
      return { success: true };
    } catch (error) {
      console.error('Password reset token generation error:', error);
      return { success: false, error: 'Failed to generate reset token' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await UserService.resetPasswordWithToken(token, newPassword);
      if (!result) {
        return { success: false, error: 'Invalid or expired reset token' };
      }
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      await UserService.updatePassword(userId, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
}
