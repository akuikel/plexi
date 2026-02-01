'use client';

import { useState } from 'react';

interface UseSecurityReturn {
  // Password change state
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

  // Status state
  isChangingPassword: boolean;
  passwordError: string;
  passwordSuccess: boolean;

  // Actions
  setCurrentPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  changePassword: () => Promise<void>;
  resetPasswordForm: () => void;
}

export function useSecurity(): UseSecurityReturn {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Validation helpers
  const validatePasswords = (): string | null => {
    if (!currentPassword) {
      return 'Current password is required';
    }

    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters long';
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      return 'New password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return 'New password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return 'New password must contain at least one number';
    }

    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }

    if (currentPassword === newPassword) {
      return 'New password must be different from current password';
    }

    return null;
  };

  // Change password
  const changePassword = async (): Promise<void> => {
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);

    // Validate passwords
    const validationError = validatePasswords();
    if (validationError) {
      setPasswordError(validationError);
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess(true);
        resetPasswordForm();

        // Clear success message after 5 seconds
        setTimeout(() => setPasswordSuccess(false), 5000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset password form
  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return {
    // Password change state
    currentPassword,
    newPassword,
    confirmPassword,

    // Status state
    isChangingPassword,
    passwordError,
    passwordSuccess,

    // Actions
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    changePassword,
    resetPasswordForm,
  };
}
