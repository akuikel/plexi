'use client';

import { useState, useCallback } from 'react';

interface ProfileData {
  name: string;
  phone: string;
  location: string;
  bio: string;
}

interface UseProfileUpdateReturn {
  // Profile data state
  profileData: ProfileData;
  originalData: ProfileData;

  // Form state
  isEditing: boolean;
  isSaving: boolean;
  error: string;
  success: boolean;
  hasChanges: boolean;

  // Actions
  setProfileData: (data: Partial<ProfileData>) => void;
  initializeData: (data: ProfileData) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveProfile: () => Promise<void>;
  resetForm: () => void;
}

export function useProfileUpdate(): UseProfileUpdateReturn {
  // Profile data state
  const [profileData, setProfileDataState] = useState<ProfileData>({
    name: '',
    phone: '',
    location: '',
    bio: '',
  });

  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calculate if there are changes
  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  // Initialize data from parent component
  const initializeData = useCallback((data: ProfileData) => {
    setProfileDataState(data);
    setOriginalData(data);
    setError('');
    setSuccess(false);
  }, []);

  // Update profile data
  const setProfileData = (data: Partial<ProfileData>) => {
    setProfileDataState((prev) => ({ ...prev, ...data }));
    setError('');
    setSuccess(false);
  };

  // Start editing mode
  const startEditing = () => {
    setIsEditing(true);
    setError('');
    setSuccess(false);
  };

  // Cancel editing and revert changes
  const cancelEditing = () => {
    setProfileDataState(originalData);
    setIsEditing(false);
    setError('');
    setSuccess(false);
  };

  // Save profile changes
  const saveProfile = async (): Promise<void> => {
    if (!hasChanges) {
      setError('No changes to save');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalData(profileData);
        setIsEditing(false);
        setSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original state
  const resetForm = () => {
    setProfileDataState(originalData);
    setIsEditing(false);
    setError('');
    setSuccess(false);
  };

  return {
    // Profile data state
    profileData,
    originalData,

    // Form state
    isEditing,
    isSaving,
    error,
    success,
    hasChanges,

    // Actions
    setProfileData,
    initializeData,
    startEditing,
    cancelEditing,
    saveProfile,
    resetForm,
  };
}
