'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, MessageCircle, Phone, Settings, Shield } from 'lucide-react';

export function SidebarCards() {
  return (
    <>
      {/* What Persa Can Do */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            What Persa Can Do
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Navigate IVR Menus</div>
              <div className="text-sm text-muted-foreground">Automatically handles phone trees</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Speak with Humans</div>
              <div className="text-sm text-muted-foreground">Natural conversation abilities</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Follow-up Actions</div>
              <div className="text-sm text-muted-foreground">Sends emails and reports results</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <div className="font-medium">Active Mode (Coming Soon)</div>
              <div className="text-sm text-muted-foreground">Take calls when you're unavailable</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Scam Call Protection</div>
              <div className="text-sm text-muted-foreground">Filters and blocks suspicious calls</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <div className="font-medium">Meeting Attendance</div>
              <div className="text-sm text-muted-foreground">Join meetings and share updates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start hover:bg-muted/50 transition-colors">
            <MessageCircle className="mr-2 h-4 w-4" />
            Voice & Language
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-muted/50 transition-colors">
            <Phone className="mr-2 h-4 w-4" />
            Call Preferences
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-muted/50 transition-colors">
            <Clock className="mr-2 h-4 w-4" />
            Availability Hours
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
