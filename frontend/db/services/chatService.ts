import { prisma } from '../client';
import { Prisma } from '@prisma/client';

export interface CreateChatData {
  userId: string;
  title?: string;
}

export interface CreateChatMessageData {
  chatId: string;
  textMessage: string;
  role: 'USER' | 'AI';
  userId?: string;
  voiceData?: Buffer;
  imageData?: Buffer;
  imageName?: string;
  mimeType?: string;
}

export interface UpdateChatData {
  title?: string;
  lastActivity?: Date;
  isArchived?: boolean;
}

/**
 * Chat service for managing chat conversations
 */
export class ChatService {
  /**
   * Create a new chat conversation
   */
  static async createChat(data: CreateChatData) {
    return await prisma.chat.create({
      data: {
        userId: data.userId,
        title: data.title,
        lastActivity: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  /**
   * Get all chats for a user
   */
  static async getUserChats(userId: string) {
    return await prisma.chat.findMany({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });
  }

  /**
   * Get a specific chat with messages
   */
  static async getChatById(chatId: string, userId: string) {
    return await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Update chat details
   */
  static async updateChat(chatId: string, userId: string, data: UpdateChatData) {
    return await prisma.chat.update({
      where: {
        id: chatId,
        userId,
      },
      data,
    });
  }

  /**
   * Delete a chat
   */
  static async deleteChat(chatId: string, userId: string) {
    return await prisma.chat.delete({
      where: {
        id: chatId,
        userId,
      },
    });
  }

  /**
   * Archive a chat
   */
  static async archiveChat(chatId: string, userId: string) {
    return await this.updateChat(chatId, userId, { isArchived: true });
  }

  /**
   * Add a message to a chat
   */
  static async addMessage(data: CreateChatMessageData) {
    const message = await prisma.chatMessage.create({
      data: {
        chatId: data.chatId,
        textMessage: data.textMessage,
        role: data.role,
        userId: data.userId,
        voiceData: data.voiceData,
        imageData: data.imageData,
        imageName: data.imageName,
        mimeType: data.mimeType,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Update chat's last activity
    await prisma.chat.update({
      where: { id: data.chatId },
      data: { lastActivity: new Date() },
    });

    // If this is the first user message and chat has no title, generate one
    if (data.role === 'USER') {
      const chat = await prisma.chat.findUnique({
        where: { id: data.chatId },
        select: { title: true, _count: { select: { messages: true } } },
      });

      if (!chat?.title && chat?._count.messages === 1) {
        // This is the first message, generate a title
        await this.generateChatTitle(data.chatId, data.textMessage);
      }
    }

    return message;
  }

  /**
   * Generate a title for a chat based on the first message
   */
  static async generateChatTitle(chatId: string, firstMessage: string): Promise<string> {
    // Simple title generation - take first 50 chars or use a more sophisticated approach
    let title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;

    // Remove common chat prefixes
    title = title.replace(/^(hey|hi|hello|chat|call|schedule|make)/i, '').trim();

    if (!title) {
      title = 'New Chat';
    }

    // Update the chat title
    await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });

    return title;
  }

  /**
   * Update chat activity timestamp
   */
  static async updateLastActivity(chatId: string) {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { lastActivity: new Date() },
    });
  }

  /**
   * Get chat messages with pagination
   */
  static async getChatMessages(chatId: string, userId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // Verify user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: { id: true },
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return await prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }
}
