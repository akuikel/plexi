'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  callsCompleted: number;
  timeSaved: number;
  successRate: number;
}

export function StatsCard({ callsCompleted, timeSaved, successRate }: StatsCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Calls Completed</span>
            <span className="text-3xl font-bold text-primary">{callsCompleted}</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Time Saved</span>
            <span className="text-3xl font-bold text-green-600">{timeSaved} hours</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-3xl font-bold text-emerald-600">{successRate}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
