'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, Clock, Download, MessageCircle, Phone, XCircle } from 'lucide-react';
import { CallData } from '@/hooks/dashboard/useCalls';
import { useMemo } from 'react';

interface CallReportsProps {
  calls: CallData[];
  selectedTranscript: CallData | null;
  isTranscriptOpen: boolean;
  onViewTranscript: (call: CallData) => void;
  onDownloadReport: (call: CallData) => void;
  onCloseTranscript: () => void;
}

export function CallReports({
  calls,
  selectedTranscript,
  isTranscriptOpen,
  onViewTranscript,
  onDownloadReport,
  onCloseTranscript,
}: CallReportsProps) {
  // Filter calls by status
  const filteredCalls = useMemo(() => {
    return {
      active: calls.filter((call) => call.status === 'ACTIVE'),
      completed: calls.filter((call) => call.status === 'COMPLETED'),
      scheduled: calls.filter((call) => call.status === 'SCHEDULED'),
      draft: calls.filter((call) => call.status === 'DRAFT'),
    };
  }, [calls]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-800 text-xs animate-pulse">Live</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 text-xs">Done</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Scheduled</Badge>;
      case 'DRAFT':
        return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Phone className="h-3 w-3 text-blue-600 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'SCHEDULED':
        return <Clock className="h-3 w-3 text-orange-600" />;
      case 'DRAFT':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Phone className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-gradient-to-r from-blue-50/50 to-transparent';
      case 'COMPLETED':
        return 'bg-gradient-to-r from-green-50/50 to-transparent';
      case 'SCHEDULED':
        return 'bg-gradient-to-r from-orange-50/50 to-transparent';
      case 'DRAFT':
        return 'bg-gradient-to-r from-red-50/50 to-transparent';
      default:
        return 'bg-gradient-to-r from-gray-50/50 to-transparent';
    }
  };

  const renderCallCard = (call: CallData) => (
    <div key={call.id} className={`border rounded-lg p-2.5 ${getStatusGradient(call.status || 'DRAFT')}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`p-1.5 rounded-full ${
              call.status === 'ACTIVE'
                ? 'bg-blue-100'
                : call.status === 'COMPLETED'
                ? 'bg-green-100'
                : call.status === 'SCHEDULED'
                ? 'bg-orange-100'
                : 'bg-red-100'
            }`}
          >
            {getStatusIcon(call.status || 'DRAFT')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{call.title}</div>
            <div className="text-xs text-muted-foreground">
              {call.status === 'SCHEDULED' && call.scheduledStartTime
                ? `Scheduled: ${new Date(call.scheduledStartTime).toLocaleString()}`
                : `${new Date(call.date).toLocaleDateString()} • ${call.duration}`}
            </div>
          </div>
        </div>
        {getStatusBadge(call.status || 'DRAFT')}
      </div>
      {call.summary && (
        <div className="text-xs text-gray-600 bg-white/70 p-2 rounded border mb-2 line-clamp-2">{call.summary}</div>
      )}
      {call.status === 'COMPLETED' && (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => onViewTranscript(call)}>
            <MessageCircle className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => onDownloadReport(call)}>
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      )}
    </div>
  );

  const renderEmptyState = (status: string) => {
    const emptyMessages = {
      active: 'No active calls',
      completed: 'No completed calls yet',
      scheduled: 'No scheduled calls',
      draft: 'No draft calls',
    };

    return (
      <div className="text-center py-4 text-muted-foreground">
        <Phone className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">{emptyMessages[status as keyof typeof emptyMessages]}</p>
      </div>
    );
  };
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Call Reports
        </CardTitle>
        <p className="text-xs text-muted-foreground">Recent call summaries and transcripts</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {/* Tabs for different call statuses */}
        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9 p-1">
            <TabsTrigger value="scheduled" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Scheduled
              <span className="text-[10px] opacity-70">({filteredCalls.scheduled.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Active
              <span className="text-[10px] opacity-70">({filteredCalls.active.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Done
              <span className="text-[10px] opacity-70">({filteredCalls.completed.length})</span>
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Rejected
              <span className="text-[10px] opacity-70">({filteredCalls.draft.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.scheduled.length === 0
              ? renderEmptyState('scheduled')
              : filteredCalls.scheduled.map(renderCallCard)}
          </TabsContent>

          <TabsContent value="active" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredCalls.active.length === 0
                ? renderEmptyState('active')
                : filteredCalls.active.map(renderCallCard)}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.completed.length === 0
              ? renderEmptyState('completed')
              : filteredCalls.completed.map(renderCallCard)}
          </TabsContent>

          <TabsContent value="draft" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.draft.length === 0 ? renderEmptyState('draft') : filteredCalls.draft.map(renderCallCard)}
          </TabsContent>
        </Tabs>

        {/* Transcript Modal */}
        <Dialog open={isTranscriptOpen} onOpenChange={onCloseTranscript}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{selectedTranscript?.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedTranscript?.date ? new Date(selectedTranscript.date).toLocaleString() : ''} •{' '}
                {selectedTranscript?.duration}
              </p>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {selectedTranscript?.transcript && Array.isArray(selectedTranscript.transcript) ? (
                  selectedTranscript.transcript.map((entry, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground min-w-[50px] mt-1">{entry.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-medium ${
                              entry.speaker === 'Persa AI'
                                ? 'text-primary'
                                : entry.speaker === 'System'
                                ? 'text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {entry.speaker}
                          </span>
                          {entry.speaker === 'Persa AI' && (
                            <Badge variant="secondary" className="text-xs">
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-center py-4">No transcript available</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total exchanges: {selectedTranscript?.transcript?.length || 0}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedTranscript) {
                      onDownloadReport(selectedTranscript);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
