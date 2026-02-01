'use client';

import { useLogin } from '@/hooks/auth/useLogin';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { isLoading, error, login, handleGoogleLogin } = useLogin();

  return (
    <AuthLayout title="Welcome Back" description="Sign in to your Persa account to continue">
      <LoginForm onSubmit={login} onGoogleLogin={handleGoogleLogin} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}
