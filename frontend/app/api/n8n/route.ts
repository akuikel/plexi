import { NextResponse } from 'next/server';

const PERSA_BACKEND_URL = process.env.PERSA_BACKEND_URL || 'http://localhost:8787';

// Extract phone number from text
function extractPhoneNumber(text: string): string | null {
  // Simple regex to find sequences of digits that look like phone numbers
  // Matches:
  // +12345678901
  // 1234567890
  // (123) 456-7890
  // 123-456-7890
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
  
  const matches = text.match(phoneRegex);
  if (matches) {
    for (const match of matches) {
      // Strip all non-digits
      const digits = match.replace(/\D/g, '');
      
      // If 10 digits, assume US and add +1
      if (digits.length === 10) {
        return `+1${digits}`;
      }
      
      // If 11 digits and starts with 1, add +
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
      }
      
      // If valid E.164 length (>10), return with +
      if (digits.length > 10) {
        return `+${digits}`;
      }
    }
  }
  return null;
}

// Check if AI response indicates it will make a call
function shouldInitiateCall(aiResponse: string, userMessage: string): boolean {
  const lower = aiResponse.toLowerCase();
  return (
    (lower.includes('calling now') || 
     lower.includes('dialing now') ||
     lower.includes('making the call') ||
     lower.includes("i'll call") ||
     lower.includes('i can call')) &&
    extractPhoneNumber(userMessage) !== null
  );
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Extract the prompt from the request
    const prompt = data.call?.prompt || data.chat?.prompt || '';
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'No prompt provided',
      });
    }

    // Check if we should initiate a real call
    const phoneNumber = extractPhoneNumber(prompt);
    
    // ALWAYS initiate call if phone number is present, regardless of AI response
    // This bypasses the need for the chat endpoint to be active/intelligent
    if (phoneNumber) {
      console.log(`Initiating call to ${phoneNumber}`);
      
      // Extract what user wants to accomplish
      // Simple extraction: everything after the phone number or "ask"
      let task = 'assist with your request';
      const taskMatch = prompt.match(/(?:ask|tell|say|check|inquire|find out)\s+(.+?)(?:\.|$)/i);
      if (taskMatch) {
        task = taskMatch[1];
      } else {
        // Fallback: use the whole prompt as context
        task = prompt;
      }
      
      try {
        const callResponse = await fetch(`${PERSA_BACKEND_URL}/call/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: phoneNumber,
            instructions: task,
            user_id: data.user?.email || 'anonymous',
          }),
        });
        
        if (callResponse.ok) {
          const callResult = await callResponse.json();
          return NextResponse.json({
            success: true,
            n8n: {
              summary: `I'm calling ${phoneNumber} now to ${task}. \n\n📞 Call initiated! Call SID: ${callResult.call_sid}`,
              message: `I'm calling ${phoneNumber} now to ${task}.`,
            },
            call_initiated: true,
            call_sid: callResult.call_sid,
            message: 'Call initiated successfully',
          });
        } else {
          const errText = await callResponse.text();
          console.error('Call initiation failed:', errText);
          return NextResponse.json({
             success: false,
             error: `Failed to initiate call: ${errText}`
          });
        }
      } catch (callError) {
        console.error('Error initiating call:', callError);
        return NextResponse.json({
             success: false,
             error: `Error initiating call: ${callError}`
        });
      }
    }


    // Fallback response when backend is not running or no phone number
    const fallbackResponse = generateFallbackResponse(prompt);
    
    return NextResponse.json({
      success: true,
      n8n: {
        summary: fallbackResponse,
        message: fallbackResponse,
      },
      message: 'Request processed (fallback)',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API Error:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

function generateFallbackResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('call') || lower.includes('phone')) {
    if (lower.includes('walmart') || lower.includes('target') || lower.includes('store')) {
      return "I'll help you make that call. To proceed, I'll need the phone number or I can look it up for you. What specific information do you need from them?";
    }
    return "I can help you make a phone call. Please provide the phone number and let me know what you'd like me to accomplish during the call.";
  }
  
  if (lower.includes('schedule') || lower.includes('appointment')) {
    return "I can help you schedule an appointment. Please tell me the business name, preferred date/time, and what the appointment is for.";
  }
  
  if (lower.includes('check') && (lower.includes('stock') || lower.includes('availability'))) {
    return "I can call the store to check stock availability for you. Which store and what item are you looking for?";
  }
  
  if (lower.includes('help')) {
    return "I'm Persa, your AI voice assistant. I can make phone calls on your behalf, navigate IVR menus, schedule appointments, and handle customer service calls. What would you like me to help you with?";
  }
  
  return `I understand you want help with: "${prompt}". As your AI voice assistant, I can make calls, navigate phone menus, and handle conversations. How would you like me to proceed?`;
}
