import { useState, useEffect } from 'react';

export interface Chat {
  id: string;
  title: string | null;
  lastActivity: string;
  messageCount: number;
  lastMessage: {
    id: string;
    textMessage: string;
    role: 'USER' | 'AI';
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  textMessage: string;
  role: 'USER' | 'AI';
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    username: string;
  } | null;
  hasVoiceData: boolean;
  hasImageData: boolean;
  imageName?: string | null;
  mimeType?: string | null;
}

export interface ChatDetails {
  id: string;
  title: string | null;
  lastActivity: string;
  createdAt: string;
  messages: ChatMessage[];
}

/**
 * Hook for managing chat list operations
 */
export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all chats for the user
   */
  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chats');
      const data = await response.json();

      if (data.success) {
        setChats(data.chats);
      } else {
        setError(data.error || 'Failed to fetch chats');
      }
    } catch (err) {
      setError('Failed to fetch chats');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new chat
   */
  const createChat = async (title?: string): Promise<Chat | null> => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (data.success) {
        const newChat = data.chat;
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      } else {
        setError(data.error || 'Failed to create chat');
        return null;
      }
    } catch (err) {
      setError('Failed to create chat');
      console.error('Error creating chat:', err);
      return null;
    }
  };

  /**
   * Update a chat
   */
  const updateChat = async (chatId: string, updates: { title?: string; isArchived?: boolean }) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)));
      } else {
        setError(data.error || 'Failed to update chat');
      }
    } catch (err) {
      setError('Failed to update chat');
      console.error('Error updating chat:', err);
    }
  };

  /**
   * Delete a chat
   */
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      } else {
        setError(data.error || 'Failed to delete chat');
      }
    } catch (err) {
      setError('Failed to delete chat');
      console.error('Error deleting chat:', err);
    }
  };

  /**
   * Archive a chat
   */
  const archiveChat = async (chatId: string) => {
    await updateChat(chatId, { isArchived: true });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return {
    chats,
    loading,
    error,
    fetchChats,
    createChat,
    updateChat,
    deleteChat,
    archiveChat,
  };
}
