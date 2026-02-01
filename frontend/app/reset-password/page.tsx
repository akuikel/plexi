'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { Card } from '@/components/ui/card';

function ResetPasswordPageInner() {
  const {
    token,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    isLoading,
    isSuccess,
    error,
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    resetPassword,
  } = useResetPassword();

  return (
    <AuthLayout title="" description="" showBackButton={!isSuccess} backHref="/login">
      <Card className="border-0 shadow-xl">
        <ResetPasswordForm
          password={password}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          isLoading={isLoading}
          isSuccess={isSuccess}
          error={error}
          token={token}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onToggleShowPassword={toggleShowPassword}
          onToggleShowConfirmPassword={toggleShowConfirmPassword}
          onSubmit={resetPassword}
        />
      </Card>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
