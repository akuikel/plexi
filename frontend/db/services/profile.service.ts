/**
 * Profile service - handles user profile related business logic
 * This service operates at the database layer and should only be used in API routes
 */
import { UserService } from './user.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileUrl?: string;
}

export interface BackendConnection {
  url: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCalls: number;
  successRate: number;
  avgDuration: number;
  cpu: number;
  memory: number;
  storage: number;
}

export interface SystemLog {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export class ProfileService {
  /**
   * Get user profile information
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await UserService.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        username: user.username,
        role: user.role,
        profileUrl: user.profileUrl || undefined,
        // These fields don't exist in the current User model
        // In a real app, you might add these to the schema or store in a separate Profile table
        phone: undefined,
        location: undefined,
        bio: undefined,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user profile information
   */
  static async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updateData: any = {};

      if (profileData.name) updateData.name = profileData.name;
      if (profileData.username) updateData.username = profileData.username;
      if (profileData.profileUrl !== undefined) updateData.profileUrl = profileData.profileUrl;
      // Note: phone, location, bio fields don't exist in current User model
      // These updates will be ignored until the schema is updated

      const updatedUser = await UserService.update(userId, updateData);

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return {
        id: updatedUser.id,
        name: updatedUser.name || updatedUser.username,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        profileUrl: updatedUser.profileUrl || undefined,
        phone: undefined, // Not in current User model
        location: undefined, // Not in current User model
        bio: undefined, // Not in current User model
      };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await UserService.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await UserService.updatePassword(userId, newPassword);
    } catch (error) {
      throw new Error(`Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test backend connection
   */
  static async testBackendConnection(url: string): Promise<BackendConnection> {
    try {
      // Simulate backend connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would make an actual HTTP request
      const isValidUrl = url.startsWith('http://') || url.startsWith('https://');

      return {
        url,
        status: isValidUrl ? 'connected' : 'error',
      };
    } catch (error) {
      return {
        url,
        status: 'error',
      };
    }
  }

  /**
   * Get system statistics for admin dashboard
   */
  static async getSystemStats(): Promise<SystemStats> {
    try {
      // Get real user count from database
      const userStats = await UserService.findMany({ limit: 1 });
      const totalUsers = userStats.total;

      // In a real implementation, these would come from actual system monitoring
      return {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.3), // Assume 30% are active
        totalCalls: 15847, // Mock data - would come from CallService
        successRate: 94.2,
        avgDuration: 3.4,
        cpu: Math.floor(Math.random() * 40) + 40, // Random between 40-80
        memory: Math.floor(Math.random() * 30) + 30, // Random between 30-60
        storage: Math.floor(Math.random() * 20) + 10, // Random between 10-30
      };
    } catch (error) {
      throw new Error(`Failed to fetch system stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent system logs
   */
  static async getSystemLogs(): Promise<SystemLog[]> {
    try {
      // In a real implementation, these would come from actual log files
      const mockLogs: SystemLog[] = [
        { time: new Date().toLocaleTimeString(), level: 'INFO', message: 'System initialized successfully' },
        {
          time: new Date(Date.now() - 30000).toLocaleTimeString(),
          level: 'WARN',
          message: 'High memory usage detected',
        },
        {
          time: new Date(Date.now() - 120000).toLocaleTimeString(),
          level: 'INFO',
          message: 'Database connection established',
        },
      ];

      return mockLogs;
    } catch (error) {
      throw new Error(`Failed to fetch system logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute system action
   */
  static async executeSystemAction(action: string): Promise<string> {
    try {
      // Simulate system action execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return `${action} executed successfully`;
    } catch (error) {
      throw new Error(`Failed to execute system action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: Record<string, boolean>): Promise<void> {
    try {
      // In a real implementation, this would update user preferences in the database
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
