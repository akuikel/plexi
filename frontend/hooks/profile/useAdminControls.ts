'use client';

import { useState, useEffect, useCallback } from 'react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCalls: number;
  successRate: number;
  avgDuration: number;
  cpu: number;
  memory: number;
  storage: number;
}

interface SystemLog {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

interface BackendConnection {
  url: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface UseAdminControlsReturn {
  // Backend connection state
  backendConnection: BackendConnection;
  isConnecting: boolean;

  // System monitoring state
  systemStats: SystemStats | null;
  systemLogs: SystemLog[];

  // Status state
  isLoading: boolean;
  error: string;

  // Actions
  connectBackend: (url: string) => Promise<void>;
  refreshSystemStats: () => Promise<void>;
  refreshSystemLogs: () => Promise<void>;
  executeSystemAction: (action: string) => Promise<void>;
  addLogEntry: (log: SystemLog) => void;
}

export function useAdminControls(): UseAdminControlsReturn {
  // Backend connection state
  const [backendConnection, setBackendConnection] = useState<BackendConnection>({
    url: '',
    status: 'disconnected',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // System monitoring state
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Add new log entry
  const addLogEntry = useCallback((log: SystemLog) => {
    setSystemLogs((prev) => [log, ...prev.slice(0, 9)]); // Keep only last 10 logs
  }, []);

  // Refresh system statistics
  const refreshSystemStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/stats');

      if (response.ok) {
        const data = await response.json();

        // Transform admin stats to system stats format
        setSystemStats({
          totalUsers: data.stats?.totalUsers || 0,
          activeUsers: data.stats?.activeUsersToday || 0,
          totalCalls: data.stats?.totalCalls || 0,
          successRate: 85, // Default value
          avgDuration: 180, // Default value in seconds
          cpu: Math.random() * 100, // Mock data
          memory: Math.random() * 100, // Mock data
          storage: Math.random() * 100, // Mock data
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh system logs
  const refreshSystemLogs = useCallback(async (): Promise<void> => {
    try {
      // Mock log data for now - this would need to be implemented in the backend
      const mockLogs: SystemLog[] = [
        {
          time: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: 'System started successfully',
        },
        {
          time: new Date(Date.now() - 60000).toLocaleTimeString(),
          level: 'INFO',
          message: 'Database connection established',
        },
      ];

      setSystemLogs(mockLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system logs');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    // Only load data once when component mounts
    let mounted = true;

    const loadInitialData = async () => {
      if (mounted) {
        await refreshSystemStats();
        await refreshSystemLogs();
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [refreshSystemStats, refreshSystemLogs]);

  // Connect to backend
  const connectBackend = async (url: string): Promise<void> => {
    if (!url) return;

    setIsConnecting(true);
    setError('');

    try {
      // Simple connectivity test
      const response = await fetch(`${url}/health`);

      if (response.ok) {
        setBackendConnection({
          url,
          status: 'connected',
        });

        addLogEntry({
          time: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: `Backend connected to ${url}`,
        });
      } else {
        throw new Error('Backend not responding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      setBackendConnection({
        url,
        status: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Execute system action
  const executeSystemAction = async (action: string): Promise<void> => {
    try {
      // Mock implementation - this would need proper backend endpoints
      addLogEntry({
        time: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: `Executed action: ${action}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);

      addLogEntry({
        time: new Date().toLocaleTimeString(),
        level: 'ERROR',
        message: errorMessage,
      });
    }
  };

  return {
    // Backend connection state
    backendConnection,
    isConnecting,

    // System monitoring state
    systemStats,
    systemLogs,

    // Status state
    isLoading,
    error,

    // Actions
    connectBackend,
    refreshSystemStats,
    refreshSystemLogs,
    executeSystemAction,
    addLogEntry,
  };
}
