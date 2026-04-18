/**
 * Hook for managing auth status across the application
 */
import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profileUrl: string | null;
}

export interface AuthStatus {
  authenticated: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
}

export interface UseAuthStatusReturn extends AuthStatus {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAuthStatus(): UseAuthStatusReturn {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    isAdmin: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('/api/auth/status', { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeout);
      const data = await response.json();

      setAuthStatus({
        authenticated: data.authenticated || false,
        isAdmin: data.isAdmin || false,
        user: data.user || null,
      });
    } catch (err) {
      console.error('Auth status check failed:', err);
      setError('Failed to check authentication status');
      setAuthStatus({
        authenticated: false,
        isAdmin: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  return {
    ...authStatus,
    loading,
    error,
    refetch: fetchAuthStatus,
  };
}
