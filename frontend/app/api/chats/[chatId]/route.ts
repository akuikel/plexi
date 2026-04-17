import { NextRequest, NextResponse } from 'next/server';
import { globalChats } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const chat = globalChats.get(chatId);

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
        messages: chat.messages || [],
      },
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    const { title } = body;

    const chat = globalChats.get(chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    chat.title = title || chat.title;
    chat.lastActivity = new Date().toISOString();
    globalChats.set(chatId, chat);

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
    if (!globalChats.has(chatId)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    globalChats.delete(chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
