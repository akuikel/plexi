/**
 * Authentication hook for signup functionality
 */
import { useState } from 'react';
import { validateEmail, validatePassword } from '@/lib/utils/auth-utils';

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface UseSignupReturn {
  isLoading: boolean;
  error: string;
  step: number;
  signup: (signupData: SignupData) => Promise<boolean>;
  setStep: (step: number) => void;
  handleGoogleSignup: () => void;
  clearError: () => void;
  validatePassword: (password: string) => { valid: boolean; errors: string[] };
  validateEmail: (email: string) => boolean;
}

export function useSignup(): UseSignupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const signup = async (signupData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        window.location.href = '/login';
        return true;
      } else {
        setError(data.error || 'Signup failed');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/oauth/google/start';
  };

  const clearError = () => {
    setError('');
  };

  return {
    isLoading,
    error,
    step,
    signup,
    setStep,
    handleGoogleSignup,
    clearError,
    validatePassword,
    validateEmail,
  };
}
