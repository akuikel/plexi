import { useState, useEffect } from 'react';
import { ChatDetails, ChatMessage } from './useChats';

/**
 * Hook for managing individual chat operations
 */
export function useChat(chatId: string | null) {
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  /**
   * Fetch chat details with messages
   */
  const fetchChat = async () => {
    if (!chatId) {
      setChat(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();

      if (data.success) {
        setChat(data.chat);
      } else {
        setError(data.error || 'Failed to fetch chat');
      }
    } catch (err) {
      setError('Failed to fetch chat');
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a message to the chat
   */
  const addMessage = async (
    textMessage: string,
    role: 'USER' | 'AI',
    voiceMessage?: string,
    image?: string
  ): Promise<ChatMessage | null> => {
    if (!chatId) return null;

    try {
      setSendingMessage(true);

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textMessage,
          role,
          voiceMessage,
          image,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessage = data.message;
        setChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMessage],
              }
            : null
        );
        return newMessage;
      } else {
        setError(data.error || 'Failed to send message');
        return null;
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Add a temporary message (for loading states)
   */
  const addTemporaryMessage = (message: ChatMessage) => {
    setChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, message],
          }
        : null
    );
  };

  /**
   * Remove a temporary message
   */
  const removeTemporaryMessage = (messageId: string) => {
    setChat((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.filter((msg) => msg.id !== messageId),
          }
        : null
    );
  };

  /**
   * Update the last message (useful for replacing loading messages)
   */
  const updateLastMessage = (message: ChatMessage) => {
    setChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages.slice(0, -1), message],
          }
        : null
    );
  };

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  return {
    chat,
    loading,
    error,
    sendingMessage,
    fetchChat,
    addMessage,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateLastMessage,
  };
}
