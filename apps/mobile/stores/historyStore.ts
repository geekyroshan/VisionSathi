/**
 * VisionSathi - History Store
 *
 * Persists conversation history using AsyncStorage.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConversationMessage } from '../../../packages/shared/types';

interface HistorySession {
  id: string;
  timestamp: number;
  mode: string;
  messages: ConversationMessage[];
  thumbnailBase64?: string;
}

interface HistoryState {
  sessions: HistorySession[];

  // Actions
  addSession: (session: HistorySession) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
  getSession: (id: string) => HistorySession | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50), // Keep last 50
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      clearHistory: () => set({ sessions: [] }),

      getSession: (id) => get().sessions.find((s) => s.id === id),
    }),
    {
      name: 'visionsathi-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
