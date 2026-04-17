import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Creating scheduled call for user:', user.id);

    // Validate required fields
    if (!data.prompt || !data.prompt.trim()) {
      return NextResponse.json({ error: 'Call prompt is required' }, { status: 400 });
    }

    if (!data.scheduledStartTime) {
      return NextResponse.json({ error: 'Scheduled start time is required' }, { status: 400 });
    }

    const scheduledDate = new Date(data.scheduledStartTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled start time' }, { status: 400 });
    }

    // Check if the scheduled time is in the future (in UTC)
    const nowUtc = new Date();
    if (scheduledDate <= nowUtc) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
    }

    // Create scheduled call record
    const call = await prisma.call.create({
      data: {
        title: data.prompt.substring(0, 100),
        date: new Date(),
        scheduledStartTime: scheduledDate,
        duration: '0:00',
        summary: 'Call scheduled and waiting for execution',
        transcript: {},
        status: 'SCHEDULED',
        createdBy: user.id,
      },
    });

    console.log('Created scheduled call with ID:', call.id);

    // Create user ChatMessage for scheduled call
    await prisma.chatMessage.create({
      data: {
        textMessage: data.prompt,
        role: 'USER',
        callId: call.id,
        userId: user.id,
      },
    });

    // Create AI response ChatMessage confirming the schedule
    await prisma.chatMessage.create({
      data: {
        textMessage: `Your call has been scheduled successfully for ${scheduledDate.toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })}! I'll handle this for you when the time comes.`,
        role: 'AI',
        callId: call.id,
        userId: user.id,
      },
    });

    console.log('Created chat messages for scheduled call');

    return NextResponse.json({
      success: true,
      callId: call.id,
      message: 'Call scheduled successfully',
      call: {
        id: call.id,
        title: call.title,
        status: call.status,
        date: call.date,
        scheduledStartTime: call.scheduledStartTime,
        duration: call.duration,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Scheduled Call API Error:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
