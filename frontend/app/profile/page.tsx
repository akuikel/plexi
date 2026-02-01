'use client';

import React, { useMemo } from 'react';
import { AccountTab } from '@/components/profile/AccountTab';
import { AdminTab } from '@/components/profile/AdminTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { SecurityTab } from '@/components/profile/SecurityTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth/useAuth';
import { useProfilePage } from '@/hooks/profile/useProfilePage';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { preferences, security, admin } = useProfilePage();

  // Memoize the tab layout to prevent re-rendering when isAdmin doesn't change
  const tabsLayout = useMemo(() => {
    return isAdmin ? 'grid-cols-4' : 'grid-cols-3';
  }, [isAdmin]);

  // Memoize the tabs list to prevent re-rendering
  const tabsList = useMemo(
    () => (
      <TabsList className={`grid w-full ${tabsLayout}`}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
      </TabsList>
    ),
    [tabsLayout, isAdmin]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // The middleware should handle redirects, so if we're here, user should exist
  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <ProfileHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar userProfile={user} isLoading={false} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="account" className="space-y-6">
              {tabsList}

              {/* Account Tab */}
              <TabsContent value="account">
                <AccountTab userProfile={user} />
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <PreferencesTab
                  preferences={preferences.preferences}
                  isSaving={preferences.isSaving}
                  error={preferences.error}
                  onUpdatePreference={(key, value) => {
                    preferences.updatePreference(key, value);
                    preferences.savePreferences();
                  }}
                />
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <SecurityTab
                  currentPassword={security.currentPassword}
                  newPassword={security.newPassword}
                  confirmPassword={security.confirmPassword}
                  isChangingPassword={security.isChangingPassword}
                  passwordError={security.passwordError}
                  passwordSuccess={security.passwordSuccess}
                  onCurrentPasswordChange={security.setCurrentPassword}
                  onNewPasswordChange={security.setNewPassword}
                  onConfirmPasswordChange={security.setConfirmPassword}
                  onChangePassword={security.changePassword}
                />
              </TabsContent>

              {/* Admin Tab */}
              {isAdmin && (
                <TabsContent value="admin">
                  <AdminTab
                    backendConnection={admin.backendConnection}
                    isConnecting={admin.isConnecting}
                    systemStats={admin.systemStats}
                    systemLogs={admin.systemLogs}
                    isLoading={admin.isLoading}
                    error={admin.error}
                    onConnectBackend={admin.connectBackend}
                    onExecuteSystemAction={admin.executeSystemAction}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
