import { NextResponse } from 'next/server';

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_BASE = 'https://api.vapi.ai';

function formatDuration(startedAt?: string, endedAt?: string): string {
  if (!startedAt || !endedAt) return '0:00';
  const secs = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function mapStatus(vapiStatus: string, endedReason?: string): 'ACTIVE' | 'COMPLETED' | 'SCHEDULED' | 'DRAFT' {
  if (vapiStatus === 'ended') {
    if (endedReason === 'assistant-error' || endedReason === 'pipeline-error' || endedReason === 'voicemail') {
      return 'DRAFT'; // show as cancelled/failed
    }
    return 'COMPLETED';
  }
  if (vapiStatus === 'in-progress') return 'ACTIVE';
  if (vapiStatus === 'queued' || vapiStatus === 'ringing') return 'SCHEDULED';
  return 'DRAFT';
}

function extractTitle(call: any): string {
  // Try to pull the goal out of the system message
  const systemMsg = call.messages?.find((m: any) => m.role === 'system')?.message || '';
  const goalMatch = systemMsg.match(/goal for this call is:?\s*(.+?)(?:\.|$)/i);
  if (goalMatch) return goalMatch[1].trim();

  // Fall back to assistant first message
  const firstBot = call.messages?.find((m: any) => m.role === 'bot')?.message;
  if (firstBot) return firstBot.slice(0, 50) + (firstBot.length > 50 ? '...' : '');

  return `Call to ${call.customer?.number || 'unknown'}`;
}

function buildTranscript(call: any): Array<{ time: string; speaker: string; text: string }> {
  const msgs = call.messages || [];
  const started = call.startedAt ? new Date(call.startedAt).getTime() : 0;

  return msgs
    .filter((m: any) => m.role === 'bot' || m.role === 'user')
    .map((m: any) => {
      const elapsed = started ? Math.round(m.secondsFromStart ?? 0) : 0;
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      return {
        time: timeStr,
        speaker: m.role === 'bot' ? 'Plexi AI' : 'Caller',
        text: m.message || '',
      };
    });
}

export async function GET() {
  if (!VAPI_PRIVATE_KEY) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(`${VAPI_BASE}/call?limit=50&sortOrder=DESC`, {
      headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` },
      next: { revalidate: 0 },
    });

    if (!res.ok) return NextResponse.json([]);

    const vapiCalls: any[] = await res.json();

    const calls = vapiCalls.map((call) => ({
      id: call.id,
      title: extractTitle(call),
      status: mapStatus(call.status, call.endedReason),
      duration: formatDuration(call.startedAt, call.endedAt),
      date: call.startedAt || call.createdAt,
      createdAt: call.createdAt,
      scheduledStartTime: null,
      summary: call.summary || '',
      transcript: buildTranscript(call),
      recordingUrl: call.recordingUrl || null,
      phoneNumber: call.customer?.number || '',
      endedReason: call.endedReason || '',
    }));

    return NextResponse.json(calls);
  } catch {
    return NextResponse.json([]);
  }
}

// Keep POST for any legacy callers
export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  return NextResponse.json({ success: true });
}
