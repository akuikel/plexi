import { useState, useCallback } from 'react';
import { useChats } from './useChats';
import { useChat } from './useChat';

/**
 * Enhanced chat hook that manages both chat list and individual chat operations
 */
export function useEnhancedChat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    fetchChats,
    createChat,
    updateChat,
    deleteChat,
    archiveChat,
  } = useChats();

  const {
    chat: selectedChat,
    loading: chatLoading,
    error: chatError,
    sendingMessage,
    addMessage,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateLastMessage,
  } = useChat(selectedChatId);

  /**
   * Create a new chat and select it
   */
  const handleNewChat = useCallback(async () => {
    setIsCreatingChat(true);
    try {
      const newChat = await createChat();
      if (newChat) {
        setSelectedChatId(newChat.id);
      }
    } finally {
      setIsCreatingChat(false);
    }
  }, [createChat]);

  /**
   * Select a chat
   */
  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  /**
   * Delete a chat and clear selection if it was selected
   */
  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      await deleteChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    },
    [deleteChat, selectedChatId]
  );

  /**
   * Archive a chat and clear selection if it was selected
   */
  const handleArchiveChat = useCallback(
    async (chatId: string) => {
      await archiveChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    },
    [archiveChat, selectedChatId]
  );

  /**
   * Send a chat message
   */
  const handleSendMessage = useCallback(
    async (message: string, voiceMessage?: string, image?: string) => {
      let currentChatId = selectedChatId;

      // Create a new chat if none is selected
      if (!currentChatId) {
        setIsCreatingChat(true);
        const newChat = await createChat();
        if (!newChat) {
          setIsCreatingChat(false);
          return;
        }
        currentChatId = newChat.id;
        setSelectedChatId(currentChatId);
        setIsCreatingChat(false);
      }

      // Add user message
      await addMessage(message, 'USER', voiceMessage, image);

      // Add loading message
      const loadingId = `loading-${Date.now()}`;
      addTemporaryMessage({
        id: loadingId,
        textMessage: 'Persa is processing your request...',
        role: 'AI',
        createdAt: new Date().toISOString(),
        hasVoiceData: false,
        hasImageData: false,
      });

      try {
        // Call the n8n API
        const payload: any = {
          chat: {
            prompt: message,
            ...(voiceMessage && { voiceMessage }),
            ...(image && { image }),
          },
        };

        const response = await fetch('/api/n8n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        // Remove loading message
        removeTemporaryMessage(loadingId);

        // Add AI response
        const aiResponse =
          data.n8n?.summary ||
          data.n8n?.message ||
          'I apologize, but I encountered an error while processing your request.';
        await addMessage(aiResponse, 'AI');
      } catch (error) {
        // Remove loading message
        removeTemporaryMessage(loadingId);

        // Add error message
        await addMessage(
          'I apologize, but I encountered an error while processing your request. Please try again later.',
          'AI'
        );
      }
    },
    [selectedChatId, createChat, addMessage, addTemporaryMessage, removeTemporaryMessage]
  );

  /**
   * Make a phone call
   */
  const handleMakeCall = useCallback(
    async (message: string, voiceMessage?: string, image?: string) => {
      let currentChatId = selectedChatId;

      // Create a new chat if none is selected
      if (!currentChatId) {
        setIsCreatingChat(true);
        const newChat = await createChat();
        if (!newChat) {
          setIsCreatingChat(false);
          return;
        }
        currentChatId = newChat.id;
        setSelectedChatId(currentChatId);
        setIsCreatingChat(false);
      }

      // Add user message with call indicator
      await addMessage(`📞 Call: ${message}`, 'USER', voiceMessage, image);

      // Add loading message
      const loadingId = `loading-${Date.now()}`;
      addTemporaryMessage({
        id: loadingId,
        textMessage: 'Persa is making your call...',
        role: 'AI',
        createdAt: new Date().toISOString(),
        hasVoiceData: false,
        hasImageData: false,
      });

      try {
        // Call the n8n API for calls
        const payload: any = {
          call: {
            prompt: message,
            ...(voiceMessage && { voiceMessage }),
            ...(image && { image }),
          },
        };

        const response = await fetch('/api/n8n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        // Remove loading message
        removeTemporaryMessage(loadingId);

        // Add AI response
        const aiResponse =
          data.n8n?.summary ||
          data.n8n?.message ||
          'I apologize, but I encountered an issue making the call. Please try again.';
        await addMessage(aiResponse, 'AI');
      } catch (error) {
        // Remove loading message
        removeTemporaryMessage(loadingId);

        // Add error message
        await addMessage(
          'I apologize, but I encountered an error while making the call. Please try again later.',
          'AI'
        );
      }
    },
    [selectedChatId, createChat, addMessage, addTemporaryMessage, removeTemporaryMessage]
  );

  /**
   * Schedule a phone call
   */
  const handleScheduleCall = useCallback(
    async (prompt: string, scheduledTime: Date) => {
      let currentChatId = selectedChatId;

      // Create a new chat if none is selected
      if (!currentChatId) {
        setIsCreatingChat(true);
        const newChat = await createChat();
        if (!newChat) {
          setIsCreatingChat(false);
          return;
        }
        currentChatId = newChat.id;
        setSelectedChatId(currentChatId);
        setIsCreatingChat(false);
      }

      // Add user message with schedule indicator
      await addMessage(`📅 Schedule: ${prompt} (for ${scheduledTime.toLocaleString()})`, 'USER');

      try {
        const payload = {
          prompt,
          scheduledStartTime: scheduledTime.toISOString(),
        };

        const response = await fetch('/api/calls/scheduled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
          await addMessage(
            `Your call has been scheduled successfully for ${scheduledTime.toLocaleString()}! You can view it in the Call Reports under the Scheduled tab.`,
            'AI'
          );
        } else {
          await addMessage(
            data.error || 'I apologize, but I encountered an error while scheduling the call. Please try again.',
            'AI'
          );
        }
      } catch (error) {
        await addMessage(
          'I apologize, but I encountered an error while scheduling the call. Please try again later.',
          'AI'
        );
      }
    },
    [selectedChatId, createChat, addMessage]
  );

  return {
    // Chat list
    chats,
    chatsLoading,
    chatsError,

    // Selected chat
    selectedChatId,
    selectedChat,
    chatLoading,
    chatError,
    sendingMessage,

    // Creation state
    isCreatingChat,

    // Actions
    handleNewChat,
    handleChatSelect,
    handleDeleteChat,
    handleArchiveChat,
    handleSendMessage,
    handleMakeCall,
    handleScheduleCall,
    updateChat,

    // Utils
    refreshChats: fetchChats,
  };
}
