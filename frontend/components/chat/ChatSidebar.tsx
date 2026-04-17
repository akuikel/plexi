'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Plus, MoreVertical, Trash2, Edit, Archive, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Chat } from '@/hooks/chat/useChats';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  loading: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onArchiveChat: (chatId: string) => void;
  onUpdateChat: (chatId: string, updates: { title?: string }) => void;
}

/**
 * Chat sidebar component showing list of user's chats
 */
export function ChatSidebar({
  chats,
  selectedChatId,
  loading,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onArchiveChat,
  onUpdateChat,
}: ChatSidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title || '');
  };

  const handleEditSave = (chatId: string) => {
    if (editTitle.trim()) {
      onUpdateChat(chatId, { title: editTitle.trim() });
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const getChatTitle = (chat: Chat) => {
    if (chat.title) return chat.title;
    if (chat.lastMessage) {
      return chat.lastMessage.textMessage.length > 30
        ? chat.lastMessage.textMessage.substring(0, 30) + '...'
        : chat.lastMessage.textMessage;
    }
    return 'New Chat';
  };

  const getChatPreview = (chat: Chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage.textMessage.length > 50
        ? chat.lastMessage.textMessage.substring(0, 50) + '...'
        : chat.lastMessage.textMessage;
    }
    return 'No messages yet';
  };

  return (
    <Card className="h-full border-r border-border/50 bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Chats</CardTitle>
          <Button onClick={onNewChat} size="sm" className="h-8 w-8 p-0" title="New Chat">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-5rem)]">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border bg-background/50">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : chats.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm mb-3">No chats yet</p>
                <Button onClick={onNewChat} size="sm" variant="outline">
                  Start a new chat
                </Button>
              </div>
            ) : (
              // Chat list
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group relative p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedChatId === chat.id ? 'bg-primary/10 border-primary/50' : 'bg-background/50 border-border/50'
                  )}
                  onClick={() => onChatSelect(chat.id)}
                >
                  {editingChatId === chat.id ? (
                    // Edit mode
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(chat.id);
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      className="w-full bg-transparent border-none outline-none text-sm font-medium"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium line-clamp-1">{getChatTitle(chat)}</h3>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditStart(chat)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchiveChat(chat.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteChat(chat.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{getChatPreview(chat)}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatLastActivity(chat.lastActivity)}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{chat.messageCount}</span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
