import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    // Simple authentication
    const authToken = request.headers.get('authorization');
    const expectedToken = process.env.SCHEDULER_SECRET_TOKEN;

    if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
      console.log('Unauthorized scheduler request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log('🕐 Processing scheduled calls at:', now.toISOString());

    // Find calls that are due (scheduled time has passed)
    // We stored scheduledStartTime in UTC, so we compare directly with current UTC time
    const scheduledCalls = await prisma.call.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledStartTime: {
          lte: now, // Due now or overdue
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chatMessages: {
          where: { role: 'USER' },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    console.log(`📋 Found ${scheduledCalls.length} scheduled calls to process`);

    if (scheduledCalls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled calls to process',
        processed: 0,
        timestamp: now.toISOString(),
      });
    }

    const results = [];

    for (const call of scheduledCalls) {
      try {
        const scheduledTime = new Date(call.scheduledStartTime!);
        const delayMinutes = Math.round((now.getTime() - scheduledTime.getTime()) / 60000);

        console.log(`📞 Processing call ${call.id}:`);
        console.log(`   Scheduled: ${scheduledTime.toISOString()}`);
        console.log(`   Processing: ${now.toISOString()}`);
        console.log(`   Delay: ${delayMinutes} minutes`);

        // Update call status to ACTIVE and set actual start time
        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: 'ACTIVE',
            startTime: now, // Actual start time when processing began
          },
        });

        // Get the original user prompt from the chat message
        const userPrompt = call.chatMessages[0]?.textMessage || call.title;

        // Prepare payload for n8n (matching the structure from /api/n8n route)
        const payload = {
          call: {
            prompt: userPrompt,
          },
          user: {
            name: call.creator?.name || '',
            email: call.creator?.email || '',
          },
          // Add metadata for tracking
          scheduledCall: {
            callId: call.id,
            originalScheduledTime: call.scheduledStartTime,
            actualProcessingTime: now.toISOString(),
            delayMinutes,
          },
        };

        let n8nResult = null;
        let success = false;

        // Send to n8n if webhook URL is configured
        if (N8N_WEBHOOK_URL) {
          console.log(`🚀 Sending call ${call.id} to n8n...`);

          try {
            const response = await fetch(N8N_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            n8nResult = await response.json();
            success = response.ok;

            console.log(`📡 N8N response for call ${call.id}:`, { success, hasOutput: !!n8nResult?.summary });

            if (!success) {
              throw new Error(`N8N request failed: ${response.status} ${response.statusText}`);
            }
          } catch (fetchError) {
            console.error(`❌ N8N request failed for call ${call.id}:`, fetchError);
            throw fetchError;
          }
        } else {
          // For development without n8n configured
          console.log(`⚠️ N8N URL not configured for call: ${call.id} - simulating success`);
          success = true;
          n8nResult = {
            output: 'Scheduled call executed successfully (N8N not configured)',
            summary: 'Call processed locally - N8N webhook not configured',
          };
        }

        // Create AI response message using createdBy as userId
        const aiResponseText = n8nResult?.summary || n8nResult?.output || 'Scheduled call processed successfully.';

        await prisma.chatMessage.create({
          data: {
            textMessage: aiResponseText,
            role: 'AI',
            callId: call.id,
            userId: call.createdBy, // Using createdBy from call record
          },
        });

        // Calculate call duration from start time to now
        const durationMs = new Date().getTime() - now.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);
        const durationSeconds = Math.floor((durationMs % 60000) / 1000);
        const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

        // Update call with results and mark as completed
        await prisma.call.update({
          where: { id: call.id },
          data: {
            title: n8nResult?.summary ? n8nResult.summary.substring(0, 100) : call.title,
            status: success ? 'COMPLETED' : 'DRAFT',
            summary: success ? aiResponseText : 'Scheduled call failed to complete',
            duration: formattedDuration,
            endTime: new Date(),
            ...(n8nResult?.transcript && { transcript: n8nResult.transcript }),
          },
        });

        const result = {
          callId: call.id,
          status: success ? 'success' : 'failed',
          scheduledTime: call.scheduledStartTime,
          processedTime: now.toISOString(),
          delayMinutes,
          userPrompt: userPrompt.substring(0, 100) + (userPrompt.length > 100 ? '...' : ''),
          createdBy: call.createdBy,
          n8nConfigured: !!N8N_WEBHOOK_URL,
        };

        results.push(result);
        console.log(`✅ Successfully processed call ${call.id}`);
      } catch (error) {
        console.error(`❌ Error processing call ${call.id}:`, error);

        // Mark call as failed and add error message
        try {
          await prisma.call.update({
            where: { id: call.id },
            data: {
              status: 'DRAFT', // Using DRAFT to indicate failure (could add FAILED status later)
              summary: `Failed to execute scheduled call: ${error instanceof Error ? error.message : 'Unknown error'}`,
              endTime: new Date(),
            },
          });

          // Create error message for user
          await prisma.chatMessage.create({
            data: {
              textMessage: `Sorry, your scheduled call failed to execute. Error: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
              role: 'AI',
              callId: call.id,
              userId: call.createdBy, // Using createdBy
            },
          });
        } catch (updateError) {
          console.error(`Failed to update failed call ${call.id}:`, updateError);
        }

        results.push({
          callId: call.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          scheduledTime: call.scheduledStartTime,
          processedTime: now.toISOString(),
          createdBy: call.createdBy,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error' || r.status === 'failed').length;

    console.log(`🎯 Scheduler completed: ${successCount} successful, ${errorCount} failed`);

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successCount,
      failed: errorCount,
      results,
      timestamp: now.toISOString(),
      n8nConfigured: !!N8N_WEBHOOK_URL,
    });
  } catch (error) {
    console.error('💥 Scheduler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scheduler error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing and health checks
export async function GET() {
  const now = new Date();

  try {
    // Check how many scheduled calls are pending
    const pendingCalls = await prisma.call.count({
      where: {
        status: 'SCHEDULED',
        scheduledStartTime: {
          lte: now,
        },
      },
    });

    const upcomingCalls = await prisma.call.count({
      where: {
        status: 'SCHEDULED',
        scheduledStartTime: {
          gt: now,
        },
      },
    });

    return NextResponse.json({
      message: 'Scheduler endpoint is active',
      timestamp: now.toISOString(),
      pendingCalls,
      upcomingCalls,
      n8nConfigured: !!N8N_WEBHOOK_URL,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Scheduler endpoint is active but database check failed',
        timestamp: now.toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
