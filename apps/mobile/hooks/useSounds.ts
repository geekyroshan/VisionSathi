/**
 * VisionSathi - Sounds Hook
 *
 * Provides easy access to sound effects throughout the app.
 */

import { useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  initSounds,
  playCaptureSound,
  playSuccessSound,
  playErrorSound,
  playListeningSound,
  unloadSounds,
} from '@/services/sounds';

export function useSounds() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const playCapture = useCallback(() => {
    if (soundEnabled) {
      playCaptureSound();
    }
  }, [soundEnabled]);

  const playSuccess = useCallback(() => {
    if (soundEnabled) {
      playSuccessSound();
    }
  }, [soundEnabled]);

  const playError = useCallback(() => {
    if (soundEnabled) {
      playErrorSound();
    }
  }, [soundEnabled]);

  const playListening = useCallback(() => {
    if (soundEnabled) {
      playListeningSound();
    }
  }, [soundEnabled]);

  return {
    playCapture,
    playSuccess,
    playError,
    playListening,
    soundEnabled,
  };
}
