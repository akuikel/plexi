import { useEffect, useRef, useState } from 'react';

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
  recordingUrl?: string | null;
  phoneNumber?: string;
  endedReason?: string;
}

export function useCalls() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callsRef = useRef<CallData[]>([]);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls');

      if (!response.ok) {
        setError('Failed to load calls');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const next = Array.isArray(data) ? data : [];
      callsRef.current = next;
      setCalls(next);
      setError(null);
    } catch {
      setError('Could not reach calls API');
    } finally {
      setLoading(false);
    }
  };

  const refreshCalls = () => fetchCalls();

  useEffect(() => {
    fetchCalls();

    const getInterval = () => {
      const hasActive = callsRef.current.some((c) => c.status === 'ACTIVE');
      return hasActive ? 5000 : 10000;
    };

    // Adaptive polling: 5s when there are active calls, 10s otherwise
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        fetchCalls().then(() => schedule());
      }, getInterval());
    };

    schedule();
    return () => clearTimeout(timer);
  }, []);

  return { calls, loading, error, refreshCalls };
}
