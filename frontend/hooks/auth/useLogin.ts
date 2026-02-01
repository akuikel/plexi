/**
 * Authentication hook for login functionality
 */
import { useState } from 'react';

export interface LoginData {
  email: string;
  password: string;
}

export interface UseLoginReturn {
  isLoading: boolean;
  error: string;
  login: (credentials: LoginData) => Promise<boolean>;
  handleGoogleLogin: () => void;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (credentials: LoginData): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log('Login response data:', data, response);

      if (response.ok) {
        window.location.href = '/dashboard';
        return true;
      } else {
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/oauth/google/start';
  };

  const clearError = () => {
    setError('');
  };

  return {
    isLoading,
    error,
    login,
    handleGoogleLogin,
    clearError,
  };
}
