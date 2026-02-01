import { useEffect, useState } from 'react';

export interface CallData {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SCHEDULED' | 'DRAFT';
  duration: string;
  date: string;
  scheduledStartTime?: string;
  createdAt: string;
  transcript?: Array<{
    time: string;
    speaker: string;
    text: string;
  }>;
  summary: string;
}

export function useCalls() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const fetchCalls = async () => {
    // Don't keep polling if we've already had an error
    if (hasError) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calls');
      
      if (!response.ok) {
        // API not available, just set empty calls
        setCalls([]);
        setHasError(true);
        return;
      }
      
      const data = await response.json();

      if (Array.isArray(data)) {
        setCalls(data);
      } else {
        setCalls([]);
      }
    } catch (err) {
      // Silently handle errors - API might not be available
      setCalls([]);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh calls data (for real-time updates)
  const refreshCalls = () => {
    setHasError(false);
    fetchCalls();
  };

  useEffect(() => {
    fetchCalls();

    // Set up polling for real-time updates (every 10 seconds)
    // Only poll if we haven't had an error
    const interval = setInterval(() => {
      if (!hasError) {
        fetchCalls();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [hasError]);

  return { calls, loading, error, refreshCalls };
}
