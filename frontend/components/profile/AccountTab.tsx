'use client';

import React, { useEffect, memo } from 'react';
import { Edit3, Save, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfileUpdate } from '@/hooks/profile/useProfileUpdate';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface AccountTabProps {
  userProfile: UserProfile | null;
  error?: string | null;
}

export const AccountTab = memo(function AccountTab({ userProfile, error: externalError }: AccountTabProps) {
  const {
    profileData,
    isEditing,
    isSaving,
    error,
    success,
    hasChanges,
    setProfileData,
    initializeData,
    startEditing,
    cancelEditing,
    saveProfile,
  } = useProfileUpdate();

  // Initialize profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      initializeData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile, initializeData]);

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading account information...</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    await saveProfile();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(error || externalError) && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error || externalError}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userProfile.email}
              disabled={true}
              className="bg-muted"
              title="Email address cannot be changed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ phone: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData({ location: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your location"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => setProfileData({ bio: e.target.value })}
            disabled={!isEditing}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>

        {isEditing && hasChanges && (
          <div className="p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
            You have unsaved changes. Don't forget to save your updates!
          </div>
        )}
      </CardContent>
    </Card>
  );
});
