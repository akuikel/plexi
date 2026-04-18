'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useSimpleChat } from '@/hooks/chat/useSimpleChat';
import { SimpleChatSidebar } from '@/components/chat/SimpleChatSidebar';
import { SimpleChatPanel } from '@/components/chat/SimpleChatPanel';

function ChatContent() {
  const searchParams = useSearchParams();

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
    if (message && !selectedChatId && !chatsLoading) {
      createNewChat().then((newChatId) => {
        if (newChatId) {
          setTimeout(() => sendMessage(decodeURIComponent(message)), 100);
        }
      });
    }
  }, [searchParams, selectedChatId, chatsLoading]);

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
