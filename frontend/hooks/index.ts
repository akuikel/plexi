/**
 * Main hooks barrel export
 * Provides easy access to all custom hooks
 */

// Auth hooks
export * from './auth';

// Profile hooks
export { useSecurity } from './profile/useSecurity';
export { usePreferences } from './profile/usePreferences';
export { useAdminControls } from './profile/useAdminControls';

// Dashboard hooks
export { useCalls } from './dashboard/useCalls';
export { useChat } from './dashboard/useChat';
export { useAudioRecording } from './dashboard/useAudioRecording';
export { useTranscript } from './dashboard/useTranscript';
export { useAnimatedStats } from './dashboard/useAnimatedStats';

// Chat hooks
export { useChats } from './chat/useChats';
export { useChat as useChatDetails } from './chat/useChat';
export { useEnhancedChat } from './chat/useEnhancedChat';

// Admin hooks
export * from './admin';

// Utility hooks
export { useToast } from './use-toast';
export { useIsMobile } from './use-mobile';

// Type exports
export type * from './auth';
export type * from './admin';
export type * from './chat/useChats';
