'use client';

import { useSignup } from '@/hooks/auth/useSignup';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  const { isLoading, error, signup, handleGoogleSignup, validatePassword, validateEmail } = useSignup();

  return (
    <AuthLayout title="Create Your Account" description="Start your journey with Plexi AI voice assistant">
      <SignupForm
        onSubmit={signup}
        onGoogleSignup={handleGoogleSignup}
        isLoading={isLoading}
        error={error}
        validatePassword={validatePassword}
        validateEmail={validateEmail}
      />
    </AuthLayout>
  );
}
