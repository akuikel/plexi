/**
 * Admin service - handles admin-related business logic
 * This service operates at the database layer and should only be used in API routes
 */
import { UserService } from './user.service';
import { AdminRequestService } from './admin-request.service';
import { UserRole } from '../types';

export interface AdminDashboardStats {
  totalUsers: number;
  adminUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export interface AdminRequestInfo {
  id: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  expiresAt: string;
  userEmail: string;
  userName: string;
}

export interface RequestStatusInfo {
  isAdmin: boolean;
  requests: AdminRequestInfo[];
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const usersData = await UserService.findMany({ limit: 1000 }); // Get all users for stats
      const users = usersData.users;

      const totalUsers = users.length;
      const adminUsers = users.filter((user) => user.role === 'ADMIN').length;
      const activeUsers = totalUsers; // Simplified - could add actual activity tracking

      // Calculate new users this month (simplified)
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newUsersThisMonth = users.filter((user) => new Date(user.createdAt) >= firstDayOfMonth).length;

      return {
        totalUsers,
        adminUsers,
        activeUsers,
        newUsersThisMonth,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  /**
   * Get all users for admin dashboard
   */
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const result = await UserService.findMany({ limit: 1000 });
      return result.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Verify the target user exists
      const targetUser = await UserService.findById(userId);
      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      // Verify the admin user exists and is an admin
      const adminUser = await UserService.findById(adminUserId);
      if (!adminUser || adminUser.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Admin privileges required' };
      }

      // Update the user role
      await UserService.update(userId, { role: newRole });

      return {
        success: true,
        message: `User role updated to ${newRole} successfully`,
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: 'Failed to update user role' };
    }
  }

  /**
   * Request admin access
   */
  static async requestAdminAccess(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.role === 'ADMIN') {
        return { success: false, error: 'User is already an admin' };
      }

      // Check if there's already a pending request
      const existingRequests = await AdminRequestService.findByUserId(userId);
      const pendingRequest = existingRequests.find(
        (req) => req.status === 'PENDING' && new Date(req.expiresAt) > new Date()
      );

      if (pendingRequest) {
        return { success: false, error: 'You already have a pending admin request' };
      }

      // Create new admin request
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

      const authToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      await AdminRequestService.create({
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.username,
        authToken,
        expiresAt,
      });

      return {
        success: true,
        message: 'Admin access request submitted successfully',
      };
    } catch (error) {
      console.error('Error requesting admin access:', error);
      return { success: false, error: 'Failed to submit admin request' };
    }
  }

  /**
   * Check user's admin request status
   */
  static async checkRequestStatus(userId: string): Promise<RequestStatusInfo> {
    try {
      const user = await UserService.findById(userId);
      const isAdmin = user?.role === 'ADMIN' || false;

      const requests = await AdminRequestService.findByUserId(userId);
      const requestInfo: AdminRequestInfo[] = requests.map((req) => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        processedAt: req.approvedAt?.toISOString() || null,
        expiresAt: req.expiresAt.toISOString(),
        userEmail: req.userEmail,
        userName: req.userName,
      }));

      return {
        isAdmin,
        requests: requestInfo,
      };
    } catch (error) {
      console.error('Error checking request status:', error);
      return {
        isAdmin: false,
        requests: [],
      };
    }
  }

  /**
   * Get pending admin requests (for super admin)
   */
  static async getPendingRequests(): Promise<AdminRequestInfo[]> {
    try {
      const pendingRequests = await AdminRequestService.getPendingRequests();
      return pendingRequests.map((req) => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        processedAt: req.approvedAt?.toISOString() || null,
        expiresAt: req.expiresAt.toISOString(),
        userEmail: req.userEmail,
        userName: req.userName,
      }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw new Error('Failed to get pending requests');
    }
  }

  /**
   * Approve or reject admin request
   */
  static async processAdminRequest(
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Update request status
      await AdminRequestService.updateStatus(requestId, status, approvedBy);

      // If approved, update user role
      if (status === 'APPROVED') {
        const request = await AdminRequestService.findByUserId(requestId);
        if (request.length > 0) {
          await UserService.update(request[0].userId, { role: 'ADMIN' });
        }
      }

      return {
        success: true,
        message: `Admin request ${status.toLowerCase()} successfully`,
      };
    } catch (error) {
      console.error('Error processing admin request:', error);
      return { success: false, error: 'Failed to process admin request' };
    }
  }
}
