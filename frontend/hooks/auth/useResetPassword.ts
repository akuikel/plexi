'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseResetPasswordReturn {
  // Form state
  token: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;

  // Status state
  isLoading: boolean;
  isSuccess: boolean;
  error: string;

  // Actions
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
  resetPassword: () => Promise<void>;
}

export function useResetPassword(): UseResetPasswordReturn {
  const searchParams = useSearchParams();

  // Form state
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract token from URL on mount
  useEffect(() => {
    const tokenFromUrl = searchParams?.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('No reset token provided');
    }
  }, [searchParams]);

  // Validation helpers
  const validatePasswords = (): string | null => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    return null;
  };

  // Actions
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const resetPassword = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    // Validate passwords
    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Form state
    token,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,

    // Status state
    isLoading,
    isSuccess,
    error,

    // Actions
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    resetPassword,
  };
}
