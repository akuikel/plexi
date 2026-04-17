'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  Clock,
  Download,
  MessageCircle,
  Phone,
  XCircle,
  Headphones,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useManualCalls, CallData } from '@/hooks/dashboard/useManualCalls';
import { useMemo, useState } from 'react';

const STATUSES = ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'DRAFT'] as const;

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  ACTIVE: 'Active',
  COMPLETED: 'Done',
  DRAFT: 'Rejected',
};

export function CallReports() {
  const { calls, addCall, updateStatus, updateCall, deleteCall, addTranscriptEntry, deleteTranscriptEntry } =
    useManualCalls();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallData | null>(null);
  const [transcriptCall, setTranscriptCall] = useState<CallData | null>(null);
  const [showRecording, setShowRecording] = useState(true);

  // Add call form state
  const [form, setForm] = useState({
    title: '',
    phoneNumber: '',
    status: 'SCHEDULED' as CallData['status'],
    date: new Date().toISOString().slice(0, 16),
    duration: '0:00',
    summary: '',
  });

  // Transcript entry form state
  const [txForm, setTxForm] = useState({ speaker: 'Plexi AI', text: '' });

  const filteredCalls = useMemo(
    () => ({
      active: calls.filter((c) => c.status === 'ACTIVE'),
      completed: calls.filter((c) => c.status === 'COMPLETED'),
      scheduled: calls.filter((c) => c.status === 'SCHEDULED'),
      draft: calls.filter((c) => c.status === 'DRAFT'),
    }),
    [calls]
  );

  // Keep transcriptCall in sync with latest data
  const liveTranscriptCall = transcriptCall ? calls.find((c) => c.id === transcriptCall.id) ?? null : null;

  const handleAddCall = () => {
    if (!form.title.trim()) return;
    addCall({
      title: form.title.trim(),
      phoneNumber: form.phoneNumber.trim(),
      status: form.status,
      date: new Date(form.date).toISOString(),
      duration: form.duration,
      summary: form.summary.trim(),
    });
    setForm({ title: '', phoneNumber: '', status: 'SCHEDULED', date: new Date().toISOString().slice(0, 16), duration: '0:00', summary: '' });
    setIsAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingCall) return;
    updateCall(editingCall.id, {
      title: editingCall.title,
      phoneNumber: editingCall.phoneNumber,
      status: editingCall.status,
      date: editingCall.date,
      duration: editingCall.duration,
      summary: editingCall.summary,
    });
    setEditingCall(null);
  };

  const handleAddTranscript = () => {
    if (!liveTranscriptCall || !txForm.text.trim()) return;
    addTranscriptEntry(liveTranscriptCall.id, txForm.speaker, txForm.text.trim());
    setTxForm((p) => ({ ...p, text: '' }));
  };

  const handleDownload = (call: CallData) => {
    const lines = [
      `Call Report: ${call.title}`,
      `Date: ${new Date(call.date).toLocaleString()}`,
      `Duration: ${call.duration}`,
      `Status: ${STATUS_LABELS[call.status]}`,
      call.phoneNumber ? `Phone: ${call.phoneNumber}` : '',
      '',
      call.summary ? `Summary:\n${call.summary}` : '',
      '',
      'Transcript:',
      ...(call.transcript || []).map((e) => `[${e.time}] ${e.speaker}: ${e.text}`),
    ]
      .filter((l) => l !== undefined)
      .join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${call.title.replace(/\s+/g, '_')}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-800 text-xs animate-pulse">Live</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 text-xs">Done</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Scheduled</Badge>;
      case 'DRAFT':
        return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
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
      default:
        return <XCircle className="h-3 w-3 text-red-600" />;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-gradient-to-r from-blue-50/50 to-transparent';
      case 'COMPLETED': return 'bg-gradient-to-r from-green-50/50 to-transparent';
      case 'SCHEDULED': return 'bg-gradient-to-r from-orange-50/50 to-transparent';
      default: return 'bg-gradient-to-r from-red-50/50 to-transparent';
    }
  };

  const renderCallCard = (call: CallData) => (
    <div key={call.id} className={`border rounded-lg p-2.5 ${getStatusGradient(call.status)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`p-1.5 rounded-full ${
              call.status === 'ACTIVE' ? 'bg-blue-100' :
              call.status === 'COMPLETED' ? 'bg-green-100' :
              call.status === 'SCHEDULED' ? 'bg-orange-100' : 'bg-red-100'
            }`}
          >
            {getStatusIcon(call.status)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{call.title}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(call.date).toLocaleDateString()} • {call.duration}
              {call.phoneNumber && ` • ${call.phoneNumber}`}
            </div>
          </div>
        </div>
        {getStatusBadge(call.status)}
      </div>

      {call.summary && (
        <div className="text-xs text-gray-600 bg-white/70 p-2 rounded border mb-2 line-clamp-2">{call.summary}</div>
      )}

      {/* Status quick-change */}
      <div className="flex flex-wrap gap-1 mb-2">
        {STATUSES.filter((s) => s !== call.status).map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(call.id, s)}
            className="text-[10px] px-1.5 py-0.5 rounded border border-dashed hover:bg-muted transition-colors text-muted-foreground"
          >
            → {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          onClick={() => setTranscriptCall(call)}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Transcript
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          onClick={() => setEditingCall({ ...call })}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          onClick={() => handleDownload(call)}
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => deleteCall(call.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = (label: string) => (
    <div className="text-center py-6 text-muted-foreground">
      <Phone className="h-6 w-6 mx-auto mb-2 opacity-50" />
      <p className="text-xs">No {label} calls</p>
      <p className="text-[10px] mt-1 opacity-60">Use the + button above to add one</p>
    </div>
  );

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            Call Reports
          </CardTitle>
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Call
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Manage calls and transcripts</p>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9 p-1">
            <TabsTrigger value="scheduled" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Scheduled <span className="text-[10px] opacity-70">({filteredCalls.scheduled.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Active <span className="text-[10px] opacity-70">({filteredCalls.active.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Done <span className="text-[10px] opacity-70">({filteredCalls.completed.length})</span>
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs px-2 py-1 data-[state=active]:bg-background">
              Rejected <span className="text-[10px] opacity-70">({filteredCalls.draft.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.scheduled.length === 0 ? renderEmptyState('scheduled') : filteredCalls.scheduled.map(renderCallCard)}
          </TabsContent>
          <TabsContent value="active" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.active.length === 0 ? renderEmptyState('active') : filteredCalls.active.map(renderCallCard)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.completed.length === 0 ? renderEmptyState('done') : filteredCalls.completed.map(renderCallCard)}
          </TabsContent>
          <TabsContent value="draft" className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {filteredCalls.draft.length === 0 ? renderEmptyState('rejected') : filteredCalls.draft.map(renderCallCard)}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* ── Add Call Modal ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title *</label>
              <input
                className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Follow-up with client"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Phone Number</label>
              <input
                className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+1 555 000 0000"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Status</label>
                <select
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CallData['status'] }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Duration</label>
                <input
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="3:42"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Summary</label>
              <textarea
                className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={3}
                placeholder="Brief summary of the call..."
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleAddCall} disabled={!form.title.trim()}>
              Add Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Call Modal ── */}
      <Dialog open={!!editingCall} onOpenChange={(o) => !o && setEditingCall(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Call</DialogTitle>
          </DialogHeader>
          {editingCall && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Title</label>
                <input
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingCall.title}
                  onChange={(e) => setEditingCall((p) => p ? { ...p, title: e.target.value } : p)}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Phone Number</label>
                <input
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingCall.phoneNumber || ''}
                  onChange={(e) => setEditingCall((p) => p ? { ...p, phoneNumber: e.target.value } : p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Status</label>
                  <select
                    className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    value={editingCall.status}
                    onChange={(e) => setEditingCall((p) => p ? { ...p, status: e.target.value as CallData['status'] } : p)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Duration</label>
                  <input
                    className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingCall.duration}
                    onChange={(e) => setEditingCall((p) => p ? { ...p, duration: e.target.value } : p)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Summary</label>
                <textarea
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  rows={3}
                  value={editingCall.summary}
                  onChange={(e) => setEditingCall((p) => p ? { ...p, summary: e.target.value } : p)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingCall(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Transcript Modal ── */}
      <Dialog open={!!transcriptCall} onOpenChange={(o) => !o && setTranscriptCall(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{liveTranscriptCall?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {liveTranscriptCall?.date ? new Date(liveTranscriptCall.date).toLocaleString() : ''} • {liveTranscriptCall?.duration}
            </p>
          </DialogHeader>

          {/* Recording player */}
          {liveTranscriptCall?.recordingUrl && (
            <div className="border rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setShowRecording((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-primary" />
                  Call Recording
                </span>
                <span className="text-xs text-muted-foreground">{showRecording ? 'Hide' : 'Show'}</span>
              </button>
              {showRecording && (
                <div className="px-3 py-2">
                  <audio controls className="w-full" src={liveTranscriptCall.recordingUrl} />
                </div>
              )}
            </div>
          )}

          {/* Transcript entries */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {liveTranscriptCall?.transcript && liveTranscriptCall.transcript.length > 0 ? (
              liveTranscriptCall.transcript.map((entry, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30 group">
                  <div className="text-xs text-muted-foreground min-w-[44px] mt-0.5">{entry.time}</div>
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        entry.speaker === 'Plexi AI' ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {entry.speaker}
                    </span>
                    {entry.speaker === 'Plexi AI' && (
                      <Badge variant="secondary" className="text-xs ml-2">AI</Badge>
                    )}
                    <p className="text-sm leading-relaxed mt-0.5">{entry.text}</p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all shrink-0"
                    onClick={() => liveTranscriptCall && deleteTranscriptEntry(liveTranscriptCall.id, idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-6 text-sm">
                No transcript yet — add entries below
              </div>
            )}
          </div>

          {/* Add transcript entry */}
          <div className="border-t pt-3 space-y-2 shrink-0">
            <p className="text-xs font-medium text-muted-foreground">Add transcript entry</p>
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background shrink-0"
                value={txForm.speaker}
                onChange={(e) => setTxForm((p) => ({ ...p, speaker: e.target.value }))}
              >
                <option value="Plexi AI">Plexi AI</option>
                <option value="Caller">Caller</option>
                <option value="Customer">Customer</option>
                <option value="Agent">Agent</option>
              </select>
              <input
                className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="What was said..."
                value={txForm.text}
                onChange={(e) => setTxForm((p) => ({ ...p, text: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTranscript()}
              />
              <Button size="sm" onClick={handleAddTranscript} disabled={!txForm.text.trim()}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t shrink-0">
            <span className="text-sm text-muted-foreground">
              {liveTranscriptCall?.transcript?.length || 0} exchanges
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => liveTranscriptCall && handleDownload(liveTranscriptCall)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
