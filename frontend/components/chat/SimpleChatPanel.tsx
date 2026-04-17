'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Mic, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAudioRecording } from '@/hooks/dashboard/useAudioRecording';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from '@/hooks/chat/useSimpleChat';
import { cn } from '@/lib/utils';

interface SimpleChatPanelProps {
  chatId: string | null;
  messages: ChatMessage[];
  sendingMessage: boolean;
  onSendMessage: (message: string, voiceMessage?: string, image?: string) => Promise<void>;
}

/**
 * Simplified chat panel component focused on messaging
 */
export function SimpleChatPanel({ chatId, messages, sendingMessage, onSendMessage }: SimpleChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isRecording, recordedBlob, duration, startRecording, stopRecording, clearRecording, isSupported } =
    useAudioRecording();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update voiceMessage when recording is complete
  useEffect(() => {
    if (recordedBlob) {
      setVoiceMessage(recordedBlob);
    }
  }, [recordedBlob]);

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else if (recordedBlob) {
      clearRecording();
      setVoiceMessage(null);
    } else {
      try {
        await startRecording();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to access microphone: ${message}`);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Converts Blob to base64 string
   */
  const blobToBase64 = async (blob: Blob): Promise<string> => {
    const arrayBuffer = await blob.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !voiceMessage) || sendingMessage) return;

    const messageText = inputMessage.trim() || (voiceMessage ? '[Voice Message]' : '');
    let voiceData: string | undefined;

    if (voiceMessage) {
      voiceData = await blobToBase64(voiceMessage);
    }

    // Clear inputs
    setInputMessage('');
    setVoiceMessage(null);
    clearRecording();

    await onSendMessage(messageText, voiceData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!chatId) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No chat selected</p>
          <p className="text-sm">Select a chat from the sidebar or start a new conversation</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-4 border-b">
        <CardTitle className="text-lg">Chat with Plexi AI</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0 px-4 py-4">
        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation with Plexi AI</p>
                <p className="text-sm mt-1">Ask me anything or request a phone call!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn('flex', message.role === 'USER' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 shadow-sm',
                      message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-muted border'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.textMessage}</div>

                    {/* Voice message indicator */}
                    {message.hasVoiceData && (
                      <div className="mt-2 p-2 bg-background/20 rounded border">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span className="text-xs">Voice Message</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-70 mt-2">{formatTimestamp(message.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-3">
          {/* Voice Recording Preview */}
          {voiceMessage && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
              <Mic className="h-4 w-4 text-primary" />
              <span className="text-sm flex-1">Voice Recording ({Math.round(voiceMessage.size / 1024)}KB)</span>
              <Button variant="ghost" size="sm" onClick={handleMicClick} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <div className="animate-pulse w-3 h-3 bg-destructive rounded-full"></div>
              <span className="text-sm font-medium">Recording... {formatDuration(duration)}</span>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex gap-2">
            <Button
              variant={isRecording ? 'destructive' : recordedBlob ? 'default' : 'outline'}
              size="sm"
              onClick={handleMicClick}
              disabled={!isSupported || sendingMessage}
              className="px-3"
              title={
                !isSupported
                  ? 'Microphone not supported'
                  : isRecording
                  ? 'Stop recording'
                  : recordedBlob
                  ? 'Clear recording'
                  : 'Voice message'
              }
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : recordedBlob ? (
                <X className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <Textarea
              placeholder="Type your message... (e.g., 'Call Walmart and check iPhone 15 stock')"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[40px] max-h-[120px]"
              disabled={isRecording || sendingMessage}
            />

            <Button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !voiceMessage) || isRecording || sendingMessage}
              className="px-4"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
