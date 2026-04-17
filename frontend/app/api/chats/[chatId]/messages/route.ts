import { NextRequest, NextResponse } from 'next/server';
import { globalChats } from '../../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const chat = globalChats.get(chatId);

    // Return empty messages if chat not in memory (e.g. after server restart)
    if (!chat) {
      return NextResponse.json({ success: true, messages: [] });
    }

    return NextResponse.json({
      success: true,
      messages: chat.messages || [],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    const { textMessage, role, voiceMessage, image } = body;

    let chat = globalChats.get(chatId);
    // Auto-recreate chat in memory if server restarted and wiped it
    if (!chat) {
      const now = new Date().toISOString();
      chat = { id: chatId, title: 'New Chat', lastActivity: now, createdAt: now, messages: [] };
      globalChats.set(chatId, chat);
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const message = {
      id: messageId,
      textMessage: textMessage || '',
      role: role || 'USER',
      createdAt: now,
      hasVoiceData: !!voiceMessage,
      hasImageData: !!image,
      imageName: image ? 'uploaded-image' : null,
      mimeType: image ? 'image/png' : null,
    };

    if (!chat.messages) {
      chat.messages = [];
    }
    chat.messages.push(message);
    chat.lastActivity = now;

    // Auto-generate title from first message if title is default
    if (chat.title === 'New Chat' && role === 'USER' && textMessage) {
      chat.title = textMessage.slice(0, 30) + (textMessage.length > 30 ? '...' : '');
    }

    globalChats.set(chatId, chat);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
