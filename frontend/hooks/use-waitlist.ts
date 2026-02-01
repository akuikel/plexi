import { useState } from 'react';

interface WaitlistSubmission {
  name?: string;
  email: string;
}

interface WaitlistResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    joinedAt: string;
  };
}

interface UseWaitlistReturn {
  isLoading: boolean;
  error: string | null;
  successData: WaitlistResponse | null;
  submitToWaitlist: (data: WaitlistSubmission) => Promise<void>;
  reset: () => void;
}

export function useWaitlist(): UseWaitlistReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<WaitlistResponse | null>(null);

  const submitToWaitlist = async (data: WaitlistSubmission) => {
    setIsLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
          name: data.name?.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setSuccessData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccessData(null);
  };

  return {
    isLoading,
    error,
    successData,
    submitToWaitlist,
    reset,
  };
}
