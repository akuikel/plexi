import { NextRequest, NextResponse } from 'next/server';

// In-memory chat storage (temporary - can be connected to Supabase later)
// This is shared across requests in the same process
const globalChats = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const chats = Array.from(globalChats.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    return NextResponse.json({
      success: true,
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        messageCount: chat.messages?.length || 0,
        lastMessage: chat.messages?.[chat.messages.length - 1] || null,
        createdAt: chat.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ success: true, chats: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title } = body;

    const chatId = `chat-${Date.now()}`;
    const now = new Date().toISOString();
    
    const chat = {
      id: chatId,
      title: title || 'New Chat',
      lastActivity: now,
      createdAt: now,
      messages: [],
    };

    globalChats.set(chatId, chat);

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        messageCount: 0,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

// Export for other routes to use
export { globalChats };
