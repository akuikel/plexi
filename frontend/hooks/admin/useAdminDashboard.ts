/**
 * Hook for admin dashboard functionality
 */
import { useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  lastLogin?: Date;
  googleId?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  adminUsers: number; // alias for totalAdmins
  activeUsers: number;
  activeUsersToday: number; // alias for activeUsers
  pendingRequests: number;
  totalCalls: number;
  newUsersThisMonth: number;
}

export interface AdminRequest {
  id: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

export interface RequestStatus {
  requests: AdminRequest[];
}

export interface UseAdminDashboardReturn {
  users: AdminUser[];
  stats: AdminStats | null;
  requestStatus: RequestStatus | null;
  loading: boolean;
  error: string | null;
  requestingAdmin: boolean;
  fetchUsers: () => Promise<void>;
  requestAdminAccess: () => Promise<void>;
  updateUserRole: (userId: string, newRole: 'USER' | 'ADMIN') => Promise<void>;
  checkRequestStatus: () => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingAdmin, setRequestingAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to fetch users');
        return;
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Network error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');

      if (response.ok) {
        const data = await response.json();
        const statsData = data.stats;

        // Add aliases for compatibility
        const enhancedStats = {
          ...statsData,
          adminUsers: statsData.totalAdmins || 0,
          activeUsers: statsData.activeUsersToday || 0,
        };

        setStats(enhancedStats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const requestAdminAccess = async () => {
    try {
      setRequestingAdmin(true);

      // Note: This would need to be implemented in AdminService
      const response = await fetch('/api/admin/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Admin access request sent! You'll receive an email when your request is reviewed.");
      } else {
        alert(data.error || 'Failed to send admin request');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setRequestingAdmin(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      const endpoint =
        newRole === 'ADMIN' ? `/api/admin/users/${userId}/make-admin` : `/api/admin/users/${userId}/remove-admin`;

      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('User role updated successfully');
        await fetchUsers(); // Refresh the data
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const checkRequestStatus = async () => {
    try {
      const response = await fetch('/api/admin/request-status');
      if (response.ok) {
        const data = await response.json();
        setRequestStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch request status:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    checkRequestStatus();
  }, []);

  return {
    users,
    stats,
    requestStatus,
    loading,
    error,
    requestingAdmin,
    fetchUsers,
    requestAdminAccess,
    updateUserRole,
    checkRequestStatus,
  };
}
