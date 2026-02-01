'use client';

import { useState } from 'react';

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoRetryFailedCalls: boolean;
  activeMode: boolean;
}

interface UsePreferencesReturn {
  // Preferences state
  preferences: UserPreferences;

  // Status state
  isSaving: boolean;
  error: string;

  // Actions
  updatePreference: (key: keyof UserPreferences, value: boolean) => void;
  savePreferences: () => Promise<void>;
}

export function usePreferences(): UsePreferencesReturn {
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    autoRetryFailedCalls: true,
    activeMode: false,
  });

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Update a single preference
  const updatePreference = (key: keyof UserPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save preferences to backend
  const savePreferences = async (): Promise<void> => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: preferences.emailNotifications,
          smsNotifications: preferences.smsNotifications,
          autoRetryFailedCalls: preferences.autoRetryFailedCalls,
          activeMode: preferences.activeMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Preferences state
    preferences,

    // Status state
    isSaving,
    error,

    // Actions
    updatePreference,
    savePreferences,
  };
}
