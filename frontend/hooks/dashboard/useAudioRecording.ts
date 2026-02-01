import { useState, useRef, useCallback } from 'react';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for audio recording functionality
 * @returns Audio recording state and control methods
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

  /**
   * Gets optimal MIME type for recording
   */
  const getOptimalMimeType = (): string => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  /**
   * Sets up MediaRecorder event handlers
   */
  const setupMediaRecorder = (mediaRecorder: MediaRecorder): void => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: mediaRecorder.mimeType || 'audio/webm',
      });
      setRecordedBlob(blob);
      cleanupStream();
    };

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };
  };

  /**
   * Starts duration tracking
   */
  const startDurationTracking = (): void => {
    startTimeRef.current = Date.now();
    setDuration(0);

    durationIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  /**
   * Stops duration tracking
   */
  const stopDurationTracking = (): void => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  /**
   * Cleans up media stream
   */
  const cleanupStream = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  /**
   * Starts audio recording
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Audio recording is not supported in this browser');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getOptimalMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      mediaRecorderRef.current = mediaRecorder;
      setupMediaRecorder(mediaRecorder);
      startDurationTracking();

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [isSupported]);

  /**
   * Stops audio recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopDurationTracking();
    }
  }, [isRecording]);

  /**
   * Clears recorded audio and resets state
   */
  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
    stopDurationTracking();
    cleanupStream();
  }, []);

  return {
    isRecording,
    recordedBlob,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    isSupported,
  };
}
