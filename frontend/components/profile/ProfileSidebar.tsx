'use client';

import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface ProfileSidebarProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
}

export function ProfileSidebar({ userProfile, isLoading }: ProfileSidebarProps) {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-6 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 overflow-hidden">
          {userProfile.profileUrl && !imageError ? (
            <Image
              src={userProfile.profileUrl}
              alt={`${userProfile.name}'s profile`}
              className="h-full w-full object-cover rounded-full"
              width={96}
              height={96}
              onError={() => {
                console.error('Failed to load profile image:', userProfile.profileUrl);
                setImageError(true);
              }}
            />
          ) : (
            <User className="h-12 w-12 text-primary-foreground" />
          )}
        </div>
        <CardTitle className="text-xl">{userProfile.name}</CardTitle>
        <CardDescription>{userProfile.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userProfile.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {userProfile.phone}
          </div>
        )}
        {userProfile.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {userProfile.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Member since January 2024
        </div>
        {userProfile.bio && <p className="text-sm text-muted-foreground">{userProfile.bio}</p>}
      </CardContent>
    </Card>
  );
}
