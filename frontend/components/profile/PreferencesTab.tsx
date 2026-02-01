'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoRetryFailedCalls: boolean;
  activeMode: boolean;
}

interface PreferencesTabProps {
  preferences: UserPreferences;
  isSaving: boolean;
  error: string;
  onUpdatePreference: (key: keyof UserPreferences, value: boolean) => void;
}

export function PreferencesTab({ preferences, isSaving, error, onUpdatePreference }: PreferencesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your Persa experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive email updates about your calls</p>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(value) => onUpdatePreference('emailNotifications', value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">Get SMS alerts for important updates</p>
          </div>
          <Switch
            checked={preferences.smsNotifications}
            onCheckedChange={(value) => onUpdatePreference('smsNotifications', value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-retry Failed Calls</Label>
            <p className="text-sm text-muted-foreground">Automatically retry calls that fail</p>
          </div>
          <Switch
            checked={preferences.autoRetryFailedCalls}
            onCheckedChange={(value) => onUpdatePreference('autoRetryFailedCalls', value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Active Mode</Label>
            <p className="text-sm text-muted-foreground">Handle incoming calls when unavailable</p>
          </div>
          <Switch
            checked={preferences.activeMode}
            onCheckedChange={(value) => onUpdatePreference('activeMode', value)}
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
