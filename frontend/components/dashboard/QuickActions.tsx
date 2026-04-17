'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Phone, Zap } from 'lucide-react';

interface QuickActionsProps {
  onSetMessage: (message: string) => void;
  isMobileSticky?: boolean;
}

export function QuickActions({ onSetMessage, isMobileSticky = false }: QuickActionsProps) {
  if (isMobileSticky) {
    // Mobile sticky version - horizontal layout with compact buttons
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          onClick={() => onSetMessage("Schedule a doctor's appointment for next week")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          onClick={() => onSetMessage('Call my internet provider and negotiate a better rate')}
        >
          <Phone className="mr-2 h-4 w-4" />
          Negotiate
        </Button>
      </div>
    );
  }

  // Desktop version - full card layout
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks Plexi can handle for you</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1  gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 border-blue-200 hover:border-blue-300 transition-all"
            onClick={() => onSetMessage("Schedule a doctor's appointment for next week")}
          >
            <Calendar className="mr-3 h-5 w-5 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Schedule Appointment</div>
              <div className="text-sm text-muted-foreground">We'll call and book it</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 justify-start bg-gradient-to-r from-green-50 to-transparent hover:from-green-100 border-green-200 hover:border-green-300 transition-all"
            onClick={() => onSetMessage('Call my internet provider and negotiate a better rate')}
          >
            <Phone className="mr-3 h-5 w-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Negotiate Bills</div>
              <div className="text-sm text-muted-foreground">Save money on services</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
