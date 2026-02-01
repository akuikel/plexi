'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const { email, setEmail, isLoading, isSubmitted, error, submitRequest, resetForm } = useForgotPassword();

  return (
    <AuthLayout title="" description="" showBackButton={true} backHref="/login">
      <Card className="border-0 shadow-xl">
        <ForgotPasswordForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={submitRequest}
          onReset={resetForm}
          isLoading={isLoading}
          isSubmitted={isSubmitted}
          error={error}
        />
      </Card>
    </AuthLayout>
  );
}
