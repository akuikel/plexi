'use client';

import React from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface ResetPasswordFormProps {
  // Form state
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;

  // Status state
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  token: string;

  // Actions
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSubmit: () => Promise<void>;
}

export function ResetPasswordForm({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  isLoading,
  isSuccess,
  error,
  token,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  // Success state
  if (isSuccess) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-serif">Password Reset!</CardTitle>
          <CardDescription>Your password has been successfully reset.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">You can now sign in with your new password.</p>

          <Button asChild className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardContent>
      </>
    );
  }

  // Form state
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={onToggleShowConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Password must be at least 8 characters long.</p>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading || !token}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
