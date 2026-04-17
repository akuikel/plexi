'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageCircle, Phone, Mic, Paperclip, X, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAudioRecording } from '@/hooks/dashboard/useAudioRecording';
import { Textarea } from '../ui/textarea';
import { ScheduleCallDialog } from '../dashboard/ScheduleCallDialog';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from '@/hooks/chat/useChats';
import { cn } from '@/lib/utils';

interface EnhancedChatPanelProps {
  chatId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  sendingMessage: boolean;
  onSendMessage: (message: string, voiceMessage?: string, image?: string) => Promise<void>;
  onMakeCall: (message: string, voiceMessage?: string, image?: string) => Promise<void>;
  onScheduleCall: (prompt: string, scheduledTime: Date) => Promise<void>;
}

/**
 * Enhanced chat panel component with persistent chat support
 */
export function EnhancedChatPanel({
  chatId,
  messages,
  loading,
  sendingMessage,
  onSendMessage,
  onMakeCall,
  onScheduleCall,
}: EnhancedChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

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

  const removeImageFile = () => setImageFile(null);

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

  /**
   * Converts File to base64 string
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !voiceMessage && !imageFile) || sendingMessage) return;

    const messageText = inputMessage.trim() || (voiceMessage ? '[Voice Message]' : '') + (imageFile ? '[Image]' : '');
    let voiceData: string | undefined;
    let imageData: string | undefined;

    if (voiceMessage) {
      voiceData = await blobToBase64(voiceMessage);
    }
    if (imageFile) {
      imageData = await fileToBase64(imageFile);
    }

    // Clear inputs
    setInputMessage('');
    setVoiceMessage(null);
    setImageFile(null);
    clearRecording();

    await onSendMessage(messageText, voiceData, imageData);
  };

  const handleMakeCall = async () => {
    if ((!inputMessage.trim() && !voiceMessage && !imageFile) || sendingMessage) return;

    const messageText = inputMessage.trim() || (voiceMessage ? '[Voice Message]' : '') + (imageFile ? '[Image]' : '');
    let voiceData: string | undefined;
    let imageData: string | undefined;

    if (voiceMessage) {
      voiceData = await blobToBase64(voiceMessage);
    }
    if (imageFile) {
      imageData = await fileToBase64(imageFile);
    }

    // Clear inputs
    setInputMessage('');
    setVoiceMessage(null);
    setImageFile(null);
    clearRecording();

    await onMakeCall(messageText, voiceData, imageData);
  };

  const handleScheduleCall = async (scheduledTime: Date) => {
    if (!inputMessage.trim() || sendingMessage) return;

    const prompt = inputMessage.trim();
    setInputMessage('');

    await onScheduleCall(prompt, scheduledTime);
  };

  const handleScheduleCallWrapper = (prompt: string, scheduledTime: Date) => {
    // Set the input message first, then call the schedule function
    setInputMessage(prompt);
    handleScheduleCall(scheduledTime);
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
      <CardHeader className="flex-shrink-0 py-3 border-b">
        <CardTitle className="text-lg">Plexi AI</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-3 min-h-0 px-4 py-3">
        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation with Plexi AI</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn('flex', message.role === 'USER' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 shadow-sm',
                      message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                    )}
                  >
                    <div className="text-sm font-medium mb-1">{message.role === 'USER' ? 'You' : 'Plexi AI'}</div>
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

                    {/* Image indicator */}
                    {message.hasImageData && (
                      <div className="mt-2 p-2 bg-background/20 rounded border">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs">{message.imageName || 'Image attachment'}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-70 mt-1">{formatTimestamp(message.createdAt)}</div>
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {sendingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted border-2 border-dashed border-primary/50 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground italic">Plexi is processing your request...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-2">
          {/* File Attachments Preview */}
          {(voiceMessage || imageFile) && (
            <div className="space-y-1.5">
              {voiceMessage && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">Voice Recording ({Math.round(voiceMessage.size / 1024)}KB)</span>
                  <Button variant="ghost" size="sm" onClick={handleMicClick} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {imageFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
                  <Paperclip className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">File: {imageFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={removeImageFile} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Input Controls */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button
                  variant={isRecording ? 'destructive' : recordedBlob ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleMicClick}
                  disabled={!isSupported || sendingMessage}
                  className="px-2"
                  title={
                    !isSupported
                      ? 'Microphone not supported in this browser'
                      : isRecording
                      ? 'Stop recording'
                      : recordedBlob
                      ? 'Clear recording'
                      : 'Start voice recording'
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2"
                  disabled={sendingMessage}
                  title="Add file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-md border">
                  <div className="animate-pulse w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-sm font-medium">Recording {formatDuration(duration)}</span>
                </div>
              )}

              <Textarea
                placeholder="Type your message here... (e.g., Call Walmart and check if they have iPhone 15 in stock)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isRecording || sendingMessage}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording || sendingMessage}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Chat</span>
              </Button>

              <ScheduleCallDialog
                onScheduleCall={handleScheduleCallWrapper}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording || sendingMessage}
              >
                <Button
                  disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording || sendingMessage}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-3"
                  size="sm"
                  title="Schedule a phone call"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-xs">Schedule</span>
                </Button>
              </ScheduleCallDialog>

              <Button
                onClick={handleMakeCall}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording || sendingMessage}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-3"
                size="sm"
                title="Make a phone call now"
              >
                <Phone className="h-4 w-4 mr-1" />
                <span className="text-xs">Call</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
