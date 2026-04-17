/**
 * Password reset service - handles password reset business logic
 * This service operates at the database layer and should only be used in API routes
 */
import { UserService } from './user.service';
import { EmailService } from './email-service';
import { randomBytes } from 'crypto';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export class PasswordResetService {
  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email) {
        return { success: false, error: 'Email is required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      // Find user by email
      const user = await UserService.findByEmail(email.toLowerCase());

      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (user) {
        // Generate reset token
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await UserService.setResetToken(email, resetToken, resetTokenExpiry);

        // Send reset email using EmailService
        try {
          const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
          await EmailService.sendPasswordReset(email.toLowerCase(), user.name || 'User', resetUrl);
        } catch (emailError) {
          console.error('Failed to send reset email:', emailError);
          // Don't fail the request if email sending fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!token || !password) {
        return { success: false, error: 'Token and password are required' };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Reset password with token
      const result = await UserService.resetPasswordWithToken(token, password);

      if (!result) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password.' };
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
