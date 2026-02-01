'use client';

import React, { useState } from 'react';
import {
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity,
  Terminal,
  Upload,
  Download,
  Bell,
  Database,
  Mail,
  Settings,
  Users,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface BackendConnection {
  url: string;
  status: 'connected' | 'disconnected' | 'error';
}

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

interface AdminTabProps {
  backendConnection: BackendConnection;
  isConnecting: boolean;
  systemStats: SystemStats | null;
  systemLogs: SystemLog[];
  isLoading: boolean;
  error: string;
  onConnectBackend: (url: string) => Promise<void>;
  onExecuteSystemAction: (action: string) => Promise<void>;
}

export function AdminTab({
  backendConnection,
  isConnecting,
  systemStats,
  systemLogs,
  isLoading,
  error,
  onConnectBackend,
  onExecuteSystemAction,
}: AdminTabProps) {
  const [backendUrl, setBackendUrl] = useState('');

  const handleBackendConnect = async () => {
    if (!backendUrl) return;
    await onConnectBackend(backendUrl);
  };

  const handleSystemAction = async (action: string) => {
    await onExecuteSystemAction(action);
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      {/* Backend Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Backend Connection
          </CardTitle>
          <CardDescription>Connect and manage your backend services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                backendConnection.status === 'connected'
                  ? 'default'
                  : backendConnection.status === 'error'
                  ? 'destructive'
                  : 'secondary'
              }
              className={backendConnection.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
            >
              {backendConnection.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
              {backendConnection.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {backendConnection.status === 'disconnected' && <Activity className="h-3 w-3 mr-1" />}
              {backendConnection.status.charAt(0).toUpperCase() + backendConnection.status.slice(1)}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter backend URL (e.g., https://api.persa.com)"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleBackendConnect} disabled={isConnecting || !backendUrl}>
              {isConnecting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Server className="h-4 w-4 mr-2" />}
              Connect
            </Button>
          </div>

          {backendConnection.status === 'connected' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSystemAction('Backend Health Check')}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <Activity className="h-4 w-4" />
                <span className="text-xs">Health Check</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSystemAction('Sync Data')}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs">Sync Data</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSystemAction('Deploy Update')}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <Upload className="h-4 w-4" />
                <span className="text-xs">Deploy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSystemAction('Download Logs')}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">Logs</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            System Monitoring
          </CardTitle>
          <CardDescription>Real-time system status and logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{systemStats.cpu}%</span>
                </div>
                <Progress value={systemStats.cpu} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory</span>
                  <span>{systemStats.memory}%</span>
                </div>
                <Progress value={systemStats.memory} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span>{systemStats.storage}%</span>
                </div>
                <Progress value={systemStats.storage} className="h-2" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>System Logs</Label>
            <div className="bg-muted/50 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs space-y-1">
              {systemLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-muted-foreground">{log.time}</span>
                  <span
                    className={
                      log.level === 'WARN'
                        ? 'text-yellow-600'
                        : log.level === 'ERROR'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    [{log.level}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Controls
          </CardTitle>
          <CardDescription>Administrative actions and system management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h3>
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-primary">{systemStats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Active Today</p>
                      <p className="text-2xl font-bold text-green-600">{systemStats.activeUsers.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => handleSystemAction('View All Users')}>
                View All Users
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSystemAction('Export Data')}>
                Export Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSystemAction('Send Notification')}>
                <Bell className="h-4 w-4 mr-2" />
                Notify Users
              </Button>
            </div>
          </div>

          {/* System Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Analytics
            </h3>
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-xl font-bold">{systemStats.totalCalls.toLocaleString()}</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-xl font-bold text-green-600">{systemStats.successRate}%</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-xl font-bold">{systemStats.avgDuration} min</p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col gap-1 bg-transparent"
                onClick={() => handleSystemAction('Send System Alert')}
              >
                <Bell className="h-4 w-4" />
                <span className="text-xs">Send Alert</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col gap-1 bg-transparent"
                onClick={() => handleSystemAction('Database Backup')}
              >
                <Database className="h-4 w-4" />
                <span className="text-xs">Backup DB</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col gap-1 bg-transparent"
                onClick={() => handleSystemAction('Bulk Email Campaign')}
              >
                <Mail className="h-4 w-4" />
                <span className="text-xs">Bulk Email</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col gap-1 bg-transparent"
                onClick={() => handleSystemAction('System Configuration')}
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">System Config</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
