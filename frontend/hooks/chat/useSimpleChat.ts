import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  textMessage: string;
  role: 'USER' | 'AI';
  createdAt: string;
  hasVoiceData: boolean;
  hasImageData: boolean;
  imageName?: string | null;
  mimeType?: string | null;
}

export interface Chat {
  id: string;
  title: string | null;
  lastActivity: string;
  lastMessage: ChatMessage | null;
  createdAt: string;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

/**
 * Simplified chat hook that manages all chat operations efficiently
 */
export function useSimpleChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all chats for the authenticated user - only called once
   */
  const fetchChats = useCallback(async () => {
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
  }, []);

  /**
   * Fetch messages for a specific chat
   */
  const fetchChatMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedChatMessages(data.chat.messages || []);
      } else {
        setError(data.error || 'Failed to fetch chat messages');
      }
    } catch (err) {
      setError('Failed to fetch chat messages');
      console.error('Error fetching chat messages:', err);
    }
  }, []);

  /**
   * Select a chat and load its messages
   */
  const selectChat = useCallback(
    (chatId: string) => {
      setSelectedChatId(chatId);
      fetchChatMessages(chatId);
    },
    [fetchChatMessages]
  );

  /**
   * Create a new chat
   */
  const createNewChat = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        const newChat = data.chat;
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        setSelectedChatMessages([]);
        return newChat.id;
      } else {
        setError(data.error || 'Failed to create chat');
        return null;
      }
    } catch (err) {
      setError('Failed to create chat');
      console.error('Error creating chat:', err);
      return null;
    }
  }, []);

  /**
   * Send a message to the current chat
   */
  const sendMessage = useCallback(
    async (message: string, voiceMessage?: string, image?: string) => {
      let currentChatId = selectedChatId;

      // Create new chat if none selected
      if (!currentChatId) {
        currentChatId = await createNewChat();
        if (!currentChatId) return;
      }

      // Add user message immediately to UI
      const userMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        textMessage: message,
        role: 'USER',
        createdAt: new Date().toISOString(),
        hasVoiceData: !!voiceMessage,
        hasImageData: !!image,
      };

      setSelectedChatMessages((prev) => [...prev, userMessage]);

      // Add loading message
      const loadingMessage: ChatMessage = {
        id: `loading-${Date.now()}`,
        textMessage: 'Persa is thinking...',
        role: 'AI',
        createdAt: new Date().toISOString(),
        hasVoiceData: false,
        hasImageData: false,
      };

      setSelectedChatMessages((prev) => [...prev, loadingMessage]);

      try {
        setSendingMessage(true);

        // Send user message to backend
        const messageResponse = await fetch(`/api/chats/${currentChatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textMessage: message,
            role: 'USER',
            voiceMessage,
            image,
          }),
        });

        const messageData = await messageResponse.json();

        if (messageData.success) {
          // Update user message with real ID
          setSelectedChatMessages((prev) =>
            prev.map((msg) => (msg.id === userMessage.id ? { ...messageData.message } : msg))
          );
        }

        // Call AI API
        const aiResponse = await fetch('/api/n8n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat: {
              prompt: message,
              ...(voiceMessage && { voiceMessage }),
              ...(image && { image }),
            },
          }),
        });

        const aiData = await aiResponse.json();

        // Remove loading message and add AI response
        const aiMessage =
          aiData.n8n?.summary ||
          aiData.n8n?.message ||
          'I apologize, but I encountered an error while processing your request.';

        // Save AI message to backend
        const aiMessageResponse = await fetch(`/api/chats/${currentChatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textMessage: aiMessage,
            role: 'AI',
          }),
        });

        const aiMessageData = await aiMessageResponse.json();

        // Update messages: remove loading, add real AI message
        setSelectedChatMessages((prev) => [
          ...prev.filter((msg) => msg.id !== loadingMessage.id),
          aiMessageData.success
            ? aiMessageData.message
            : {
                id: `ai-${Date.now()}`,
                textMessage: aiMessage,
                role: 'AI' as const,
                createdAt: new Date().toISOString(),
                hasVoiceData: false,
                hasImageData: false,
              },
        ]);

        // Update chat list with new last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  lastMessage: aiMessageData.success ? aiMessageData.message : null,
                  lastActivity: new Date().toISOString(),
                }
              : chat
          )
        );
      } catch (err) {
        console.error('Error sending message:', err);

        // Remove loading message and add error message
        setSelectedChatMessages((prev) => [
          ...prev.filter((msg) => msg.id !== loadingMessage.id),
          {
            id: `error-${Date.now()}`,
            textMessage: 'I apologize, but I encountered an error. Please try again.',
            role: 'AI' as const,
            createdAt: new Date().toISOString(),
            hasVoiceData: false,
            hasImageData: false,
          },
        ]);
      } finally {
        setSendingMessage(false);
      }
    },
    [selectedChatId, createNewChat]
  );

  /**
   * Delete a chat
   */
  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));
          if (selectedChatId === chatId) {
            setSelectedChatId(null);
            setSelectedChatMessages([]);
          }
        } else {
          setError(data.error || 'Failed to delete chat');
        }
      } catch (err) {
        setError('Failed to delete chat');
        console.error('Error deleting chat:', err);
      }
    },
    [selectedChatId]
  );

  /**
   * Update chat title
   */
  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (data.success) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)));
      } else {
        setError(data.error || 'Failed to update chat title');
      }
    } catch (err) {
      setError('Failed to update chat title');
      console.error('Error updating chat title:', err);
    }
  }, []);

  // Initialize - fetch chats once
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    // State
    chats,
    selectedChatId,
    selectedChatMessages,
    loading,
    sendingMessage,
    error,

    // Actions
    selectChat,
    createNewChat,
    sendMessage,
    deleteChat,
    updateChatTitle,
  };
}
