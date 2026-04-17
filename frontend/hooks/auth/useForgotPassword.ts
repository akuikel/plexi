/**
 * Hook for forgot password functionality
 */
import { useState } from 'react';

export interface UseForgotPasswordReturn {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  isSubmitted: boolean;
  error: string;
  submitRequest: () => Promise<void>;
  resetForm: () => void;
  clearError: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submitRequest = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setEmail('');
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  return {
    email,
    setEmail,
    isLoading,
    isSubmitted,
    error,
    submitRequest,
    resetForm,
    clearError,
  };
}
