'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Shield, Activity, LogOut, Crown, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboard() {
  const router = useRouter();
  const { authenticated, isAdmin, user, loading: authLoading, error: authError } = useAuthStatus();
  const {
    users,
    stats,
    requestStatus,
    loading: dashboardLoading,
    error: dashboardError,
    requestingAdmin,
    fetchUsers,
    requestAdminAccess,
    updateUserRole,
    checkRequestStatus,
  } = useAdminDashboard();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, authLoading, router]);

  useEffect(() => {
    if (authenticated && isAdmin) {
      fetchUsers();
    }
  }, [authenticated, isAdmin]);

  const loading = authLoading || dashboardLoading;
  const error = authError || dashboardError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authenticated) {
    return null;
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>{error || 'Admin privileges required'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error || 'You need admin privileges to continue.'}</p>

            {/* Show user info if logged in */}
            {user && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Logged in as:</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}

            {/* Show Request Admin Access button if logged in but not admin */}
            {!isAdmin && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🔐 Admin Access Required</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    This application uses an enterprise-grade authorization system similar to Facebook, ChatGPT, and
                    other major platforms. To gain admin access, submit a request that will be reviewed by the super
                    administrator.
                  </p>

                  {/* Show current request status */}
                  {requestStatus?.requests && requestStatus.requests.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Recent Requests:</h4>
                      {requestStatus.requests.slice(0, 3).map((req) => (
                        <div key={req.id} className="flex justify-between items-center text-xs text-blue-700 mb-1">
                          <span>
                            {new Date(req.createdAt).toLocaleDateString()} -
                            <span
                              className={`ml-1 px-2 py-0.5 rounded ${
                                req.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : req.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : req.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </span>
                          {req.processedAt && <span>{new Date(req.processedAt).toLocaleDateString()}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Check if user has pending request */}
                  {requestStatus?.requests?.some((req) => req.status === 'PENDING') ? (
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                        ⏳ Request Pending - Awaiting Super Admin Review
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        You'll receive an email notification when your request is processed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={requestAdminAccess}
                        disabled={requestingAdmin}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        {requestingAdmin ? 'Sending Request...' : 'Request Admin Access'}
                      </Button>
                      <p className="text-xs text-blue-600">
                        An email will be sent to the super admin for review. You'll be notified via email.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and system settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <LogOut className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.adminUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Admin accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">New registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.name || '—'}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {user.role === 'USER' ? (
                            <Button variant="outline" size="sm" onClick={() => updateUserRole(user.id, 'ADMIN')}>
                              Make Admin
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => updateUserRole(user.id, 'USER')}>
                              Remove Admin
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
