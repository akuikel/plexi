'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useSimpleChat } from '@/hooks/chat/useSimpleChat';
import { SimpleChatSidebar } from '@/components/chat/SimpleChatSidebar';
import { SimpleChatPanel } from '@/components/chat/SimpleChatPanel';

function ChatContent() {
  const searchParams = useSearchParams();
  const { authenticated, loading: authLoading } = useAuthStatus();

  const {
    chats,
    selectedChatId,
    selectedChatMessages,
    loading: chatsLoading,
    sendingMessage,
    error,
    selectChat,
    createNewChat,
    sendMessage,
    deleteChat,
    updateChatTitle,
  } = useSimpleChat();

  // Handle pre-filled message from query params
  useEffect(() => {
    const message = searchParams.get('message');
    if (message && authenticated && !selectedChatId && !chatsLoading) {
      // Create a new chat and send the message
      createNewChat().then((newChatId) => {
        if (newChatId) {
          setTimeout(() => {
            sendMessage(decodeURIComponent(message));
          }, 100);
        }
      });
    }
  }, [searchParams, authenticated, selectedChatId, chatsLoading, createNewChat, sendMessage]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 h-[calc(100vh-6rem)]">
        <div className="flex gap-6 h-full">
          {/* Chat Sidebar */}
          <div className="w-80 flex-shrink-0">
            <SimpleChatSidebar
              chats={chats}
              selectedChatId={selectedChatId}
              loading={chatsLoading}
              onChatSelect={selectChat}
              onNewChat={createNewChat}
              onDeleteChat={deleteChat}
              onUpdateChatTitle={updateChatTitle}
            />
          </div>

          {/* Chat Panel */}
          <div className="flex-1 min-w-0">
            <SimpleChatPanel
              chatId={selectedChatId}
              messages={selectedChatMessages}
              sendingMessage={sendingMessage}
              onSendMessage={sendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
