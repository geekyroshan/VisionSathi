/**
 * VisionSathi - Settings Store
 *
 * Zustand store for user preferences with persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences } from '../../../packages/shared/types';

interface SettingsState extends UserPreferences {
  // Actions
  setSpeechSpeed: (speed: 0.75 | 1.0 | 1.25) => void;
  setVerbosity: (verbosity: 'brief' | 'normal' | 'detailed') => void;
  setVoiceId: (voiceId: string) => void;
  setPreferOffline: (prefer: boolean) => void;
  setCloudFallback: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: UserPreferences = {
  speechSpeed: 1.0,
  verbosity: 'normal',
  voiceId: 'default',
  preferOffline: false,
  cloudFallback: true,
  hapticEnabled: true,
  soundEnabled: true,
  highContrast: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
      setVerbosity: (verbosity) => set({ verbosity }),
      setVoiceId: (voiceId) => set({ voiceId }),
      setPreferOffline: (prefer) => set({ preferOffline: prefer }),
      setCloudFallback: (enabled) => set({ cloudFallback: enabled }),
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'visionsathi-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
