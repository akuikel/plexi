'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageCircle, Phone, Send, Mic, Paperclip, X, Square, Play, Pause } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudioRecording } from '@/hooks/dashboard/useAudioRecording';
import { Textarea } from '../ui/textarea';
import { ScheduleCallDialog } from './ScheduleCallDialog';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'loading';
  content: string;
  timestamp: Date;
  voiceMessage?: Blob;
  image?: File;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (message: string) => void;
  onSendMessage: () => void;
  onMakeCall: () => void;
  onScheduleCall: (prompt: string, scheduledTime: Date) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  voiceMessage?: Blob | null;
  setVoiceMessage?: (blob: Blob | null) => void;
  imageFile?: File | null;
  setImageFile?: (file: File | null) => void;
}

/**
 * Chat panel component with voice recording and file upload capabilities
 * @param props - Component props including message handling and file management
 */
export function ChatPanel({
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  onMakeCall,
  onScheduleCall,
  onKeyPress,
  voiceMessage,
  setVoiceMessage,
  imageFile,
  setImageFile,
}: ChatPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, recordedBlob, duration, startRecording, stopRecording, clearRecording, isSupported } =
    useAudioRecording();

  // Update voiceMessage when recording is complete
  useEffect(() => {
    if (recordedBlob && setVoiceMessage) {
      setVoiceMessage(recordedBlob);
    }
  }, [recordedBlob, setVoiceMessage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && setImageFile) {
      setImageFile(file);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else if (recordedBlob) {
      clearRecording();
      setVoiceMessage?.(null);
    } else {
      try {
        await startRecording();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to access microphone: ${message}`);
      }
    }
  };

  const removeImageFile = () => setImageFile?.(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80 h-full flex flex-col">
      {/* <CardHeader className="flex-shrink-0 py-0 h-3">
        <CardTitle className="text-lg">Persa AI</CardTitle>
      </CardHeader> */}
      <CardContent className="flex-1 flex flex-col space-y-3 min-h-0 px-4 py-1">
        {/* Chat Messages Area */}
        <div className="bg-gradient-to-r from-muted/30 to-muted/50 p-3 rounded-lg border flex-1 overflow-y-auto space-y-2 min-h-0">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-2.5 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.type === 'loading'
                    ? 'bg-muted border-2 border-dashed border-primary/50'
                    : 'bg-card border shadow-sm'
                }`}
              >
                {message.type === 'loading' ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground italic">{message.content}</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium mb-1">{message.type === 'user' ? 'You' : 'Persa AI'}</div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.voiceMessage && (
                      <div className="mt-2 p-2 bg-background/20 rounded border">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span className="text-xs">
                            Voice Message ({Math.round(message.voiceMessage.size / 1024)}KB)
                          </span>
                        </div>
                      </div>
                    )}
                    {message.image && (
                      <div className="mt-2 p-2 bg-background/20 rounded border">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs">File: {message.image.name}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div />
        </div>

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

          {/* Chat Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex gap-1">
                {!isSupported && (
                  <div className="text-xs text-muted-foreground px-2 py-1">Microphone not supported</div>
                )}
                <Button
                  variant={isRecording ? 'destructive' : recordedBlob ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleMicClick}
                  disabled={!isSupported}
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
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                className="flex-1"
                disabled={isRecording}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={onSendMessage}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Chat</span>
              </Button>
              <ScheduleCallDialog
                onScheduleCall={onScheduleCall}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording}
              >
                <Button
                  disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-3"
                  size="sm"
                  title="Schedule a phone call"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-xs">Schedule</span>
                </Button>
              </ScheduleCallDialog>
              <Button
                onClick={onMakeCall}
                disabled={(!inputMessage.trim() && !voiceMessage && !imageFile) || isRecording}
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
