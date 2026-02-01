/**
 * VisionSathi - Main Vision Store
 *
 * Zustand store for core app state.
 */

import { create } from 'zustand';
import type {
  AppMode,
  ProcessingState,
  ConnectionState,
  ConversationMessage,
  AnalyzeResponse,
} from '../../packages/shared/types';

interface VisionState {
  // Camera state
  cameraReady: boolean;
  currentFrame: string | null;

  // Processing state
  processingState: ProcessingState;
  currentMode: AppMode;

  // Response state
  currentResponse: AnalyzeResponse | null;
  isSpeaking: boolean;

  // Conversation state
  conversationId: string | null;
  conversationHistory: ConversationMessage[];

  // Connection state
  connectionState: ConnectionState;
  lastProcessingSource: 'cloud' | 'local' | null;

  // Actions
  setCameraReady: (ready: boolean) => void;
  captureFrame: (frame: string) => void;
  clearFrame: () => void;

  setProcessingState: (state: ProcessingState) => void;
  setCurrentMode: (mode: AppMode) => void;

  setResponse: (response: AnalyzeResponse) => void;
  clearResponse: () => void;
  setSpeaking: (speaking: boolean) => void;

  startConversation: (id: string) => void;
  addMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;

  setConnectionState: (state: ConnectionState) => void;
  setProcessingSource: (source: 'cloud' | 'local') => void;

  reset: () => void;
}

const initialState = {
  cameraReady: false,
  currentFrame: null,
  processingState: 'idle' as ProcessingState,
  currentMode: 'describe' as AppMode,
  currentResponse: null,
  isSpeaking: false,
  conversationId: null,
  conversationHistory: [],
  connectionState: 'checking' as ConnectionState,
  lastProcessingSource: null,
};

export const useVisionStore = create<VisionState>((set) => ({
  ...initialState,

  // Camera actions
  setCameraReady: (ready) => set({ cameraReady: ready }),
  captureFrame: (frame) => set({ currentFrame: frame }),
  clearFrame: () => set({ currentFrame: null }),

  // Processing actions
  setProcessingState: (state) => set({ processingState: state }),
  setCurrentMode: (mode) => set({ currentMode: mode }),

  // Response actions
  setResponse: (response) => set({ currentResponse: response }),
  clearResponse: () => set({ currentResponse: null }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),

  // Conversation actions
  startConversation: (id) =>
    set({
      conversationId: id,
      conversationHistory: [],
    }),
  addMessage: (message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, message],
    })),
  clearConversation: () =>
    set({
      conversationId: null,
      conversationHistory: [],
    }),

  // Connection actions
  setConnectionState: (state) => set({ connectionState: state }),
  setProcessingSource: (source) => set({ lastProcessingSource: source }),

  // Reset
  reset: () => set(initialState),
}));
