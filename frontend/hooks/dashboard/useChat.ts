import { useState } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'loading';
  content: string;
  timestamp: Date;
  voiceMessage?: Blob;
  image?: File;
}

interface RequestPayload {
  chat?: {
    prompt: string;
    voiceMessage?: string;
    image?: string;
  };
  call?: {
    prompt: string;
    voiceMessage?: string;
    image?: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

/**
 * Custom hook for managing chat functionality with voice and file support
 * @param refreshCalls - Function to refresh calls data after making a call
 * @returns Chat state and handlers for message management
 */
export function useChat(refreshCalls?: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content:
        "Hello! I'm Persa AI. I can help you make phone calls and handle various tasks. What would you like me to do for you today?",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  /**
   * Creates user message object
   */
  const createUserMessage = (message: string, audioBlob?: Blob, image?: File): ChatMessage => ({
    id: Date.now().toString(),
    type: 'user',
    content: message || (audioBlob ? '[Voice Message]' : '') + (image ? '[Image]' : ''),
    timestamp: new Date(),
    voiceMessage: audioBlob,
    image,
  });

  /**
   * Creates loading message object
   */
  const createLoadingMessage = (isCall = false): ChatMessage => ({
    id: (Date.now() + 1).toString(),
    type: 'loading',
    content: isCall ? 'Persa is making your call...' : 'Persa is processing your request...',
    timestamp: new Date(),
  });

  /**
   * Creates AI response message object
   */
  const createAIMessage = (content: string): ChatMessage => ({
    id: (Date.now() + 2).toString(),
    type: 'ai',
    content,
    timestamp: new Date(),
  });

  /**
   * Builds request payload with base64 encoded files
   */
  const buildRequestPayload = async (
    message: string,
    audioBlob?: Blob,
    image?: File,
    isCall = false
  ): Promise<RequestPayload> => {
    const payload: RequestPayload = {};

    if (isCall) {
      payload.call = { prompt: message };
      if (audioBlob) {
        payload.call.voiceMessage = await blobToBase64(audioBlob);
      }
      if (image) {
        payload.call.image = await fileToBase64(image);
      }
    } else {
      payload.chat = { prompt: message };
      if (audioBlob) {
        payload.chat.voiceMessage = await blobToBase64(audioBlob);
      }
      if (image) {
        payload.chat.image = await fileToBase64(image);
      }
    }

    return payload;
  };

  /**
   * Sends message to API and handles response
   */
  const sendMessage = async (message: string, audioBlob?: Blob, image?: File) => {
    if (!message.trim() && !audioBlob && !image) return;

    const userMessage = createUserMessage(message, audioBlob, image);
    const loadingMessage = createLoadingMessage();

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setVoiceMessage(null);
    setImageFile(null);

    try {
      const payload = await buildRequestPayload(message, audioBlob, image, false);

      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const aiResponse = createAIMessage(data.n8n?.summary || data.n8n?.message);

      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(aiResponse));
    } catch (error) {
      const errorResponse = createAIMessage(
        error instanceof Error
          ? error.message
          : 'I apologize, but I encountered an error while processing your request. Please try again later.'
      );
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(errorResponse));
    }
  };

  /**
   * Makes a phone call via API
   */
  const makeCall = async (message: string, audioBlob?: Blob, image?: File) => {
    if (!message.trim() && !audioBlob && !image) return;

    const userMessage = createUserMessage(`📞 Call: ${message}`, audioBlob, image);
    const loadingMessage = createLoadingMessage(true);

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setVoiceMessage(null);
    setImageFile(null);

    try {
      const payload = await buildRequestPayload(message, audioBlob, image, true);

      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const aiResponse = createAIMessage(
        data.n8n?.summary ||
          data.n8n?.message ||
          'I apologize, but I encountered an issue making the call. Please try again.'
      );

      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(aiResponse));

      // Refresh calls data after making a call to show real-time updates
      if (refreshCalls) {
        // Wait a moment for the call to be processed, then refresh
        setTimeout(() => {
          refreshCalls();
        }, 1000);
      }
    } catch (error) {
      const errorResponse = createAIMessage(
        'I apologize, but I encountered an error while making the call. Please try again later.'
      );
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(errorResponse));
    }
  };

  /**
   * Schedules a phone call via API with specified date/time
   */
  const scheduleCall = async (message: string, scheduledTime: Date, audioBlob?: Blob, image?: File) => {
    if (!message.trim() && !audioBlob && !image) return;

    const userMessage = createUserMessage(
      `📅 Schedule: ${message} (for ${scheduledTime.toLocaleString()})`,
      audioBlob,
      image
    );
    const loadingMessage = createLoadingMessage(false);

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    try {
      const payload = {
        prompt: message,
        scheduledStartTime: scheduledTime.toISOString(),
        ...(audioBlob && { voiceMessage: await blobToBase64(audioBlob) }),
        ...(image && { image: await fileToBase64(image) }),
      };

      const response = await fetch('/api/calls/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const aiResponse = createAIMessage(
          `Your call has been scheduled successfully for ${scheduledTime.toLocaleString()}! You can view it in the Call Reports under the Scheduled tab.`
        );
        setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(aiResponse));
      } else {
        const errorResponse = createAIMessage(
          data.error || 'I apologize, but I encountered an error while scheduling the call. Please try again.'
        );
        setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(errorResponse));
      }

      // Refresh calls data after scheduling a call
      if (refreshCalls) {
        setTimeout(() => {
          refreshCalls();
        }, 1000);
      }
    } catch (error) {
      const errorResponse = createAIMessage(
        'I apologize, but I encountered an error while scheduling the call. Please try again later.'
      );
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading').concat(errorResponse));
    }
  };

  /**
   * Handles Enter key press for sending messages
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage, voiceMessage || undefined, imageFile || undefined);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    voiceMessage,
    setVoiceMessage,
    imageFile,
    setImageFile,
    sendMessage: () => sendMessage(inputMessage, voiceMessage || undefined, imageFile || undefined),
    makeCall: () => makeCall(inputMessage, voiceMessage || undefined, imageFile || undefined),
    scheduleCall: (scheduledTime: Date) =>
      scheduleCall(inputMessage, scheduledTime, voiceMessage || undefined, imageFile || undefined),
    scheduleCallWithPrompt: (prompt: string, scheduledTime: Date) => scheduleCall(prompt, scheduledTime),
    handleKeyPress,
  };
}
