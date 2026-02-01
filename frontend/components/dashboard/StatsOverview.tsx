'use client';

import { useState, useEffect } from 'react';
import { Phone, Clock, TrendingUp } from 'lucide-react';

interface DashboardStats {
  callsCompleted: number;
  timeSaved: number;
  successRate: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    callsCompleted: 0,
    timeSaved: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 lg:p-6 rounded-lg animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-6 w-6 lg:h-8 lg:w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="md:col-span-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">Failed to load dashboard stats: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 lg:p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-400">Calls Completed</p>
            <p className="text-2xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.callsCompleted}</p>
          </div>
          <Phone className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 lg:p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-green-600 dark:text-green-400">Time Saved</p>
            <p className="text-2xl lg:text-3xl font-bold text-green-700 dark:text-green-300">{stats.timeSaved}h</p>
          </div>
          <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 lg:p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm text-purple-600 dark:text-purple-400">Success Rate</p>
            <p className="text-2xl lg:text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.successRate}%</p>
          </div>
          <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
        </div>
      </div>
    </div>
  );
}
