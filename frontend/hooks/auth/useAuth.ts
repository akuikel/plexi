'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileUrl?: string;
}

export interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Try to get user data from a lightweight endpoint
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        // Add cache headers to reduce unnecessary requests
        cache: 'force-cache',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user data is available from server-side rendering or middleware
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
  };
}
