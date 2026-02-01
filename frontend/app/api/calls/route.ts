import { NextResponse } from 'next/server';

// In-memory storage for calls (can be connected to Supabase later)
let calls: any[] = [];

export async function GET() {
  try {
    // Return empty array for now
    return NextResponse.json(calls);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, status, duration, transcript, createdBy } = body;

    const call = {
      id: `call-${Date.now()}`,
      title: title || 'Untitled Call',
      summary: summary || '',
      status: status || 'DRAFT',
      duration: duration || '0:00',
      date: new Date().toISOString(),
      scheduledStartTime: null,
      createdAt: new Date().toISOString(),
      transcript: transcript || [],
    };

    calls.unshift(call);
    return NextResponse.json(call);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, duration, summary, transcript } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Call ID is required' }, { status: 400 });
    }

    const index = calls.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Call not found' }, { status: 404 });
    }

    calls[index] = {
      ...calls[index],
      ...(status && { status }),
      ...(duration && { duration }),
      ...(summary && { summary }),
      ...(transcript && { transcript }),
    };

    return NextResponse.json(calls[index]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
