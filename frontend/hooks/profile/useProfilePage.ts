'use client';

import { usePreferences } from './usePreferences';
import { useSecurity } from './useSecurity';
import { useAdminControls } from './useAdminControls';

export function useProfilePage() {
  // User preferences
  const preferencesHook = usePreferences();

  // Security settings
  const securityHook = useSecurity();

  // Admin controls
  const adminHook = useAdminControls();

  return {
    preferences: preferencesHook,
    security: securityHook,
    admin: adminHook,
  };
}
