/**
 * VisionSathi - Text-to-Speech Hook
 *
 * Wrapper around expo-speech with settings integration.
 */

import { useCallback, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVisionStore } from '@/stores/visionStore';

interface TTSOptions {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const { speechSpeed, voiceId } = useSettingsStore();
  const setSpeakingState = useVisionStore((state) => state.setSpeaking);

  // Sync speaking state with store
  useEffect(() => {
    setSpeakingState(isSpeaking);
  }, [isSpeaking, setSpeakingState]);

  const speak = useCallback(
    async (text: string, options?: TTSOptions) => {
      // Stop any current speech
      await Speech.stop();

      setCurrentText(text);
      setIsSpeaking(true);
      setIsPaused(false);

      options?.onStart?.();

      await Speech.speak(text, {
        rate: speechSpeed,
        voice: voiceId !== 'default' ? voiceId : undefined,
        onDone: () => {
          setIsSpeaking(false);
          setCurrentText(null);
          options?.onDone?.();
        },
        onError: (error) => {
          setIsSpeaking(false);
          setCurrentText(null);
          options?.onError?.(new Error(String(error)));
        },
      });
    },
    [speechSpeed, voiceId]
  );

  const stop = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText(null);
  }, []);

  const pause = useCallback(async () => {
    if (isSpeaking && !isPaused) {
      await Speech.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(async () => {
    if (isPaused) {
      await Speech.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const repeat = useCallback(async () => {
    if (currentText) {
      await speak(currentText);
    }
  }, [currentText, speak]);

  // Get available voices
  const getVoices = useCallback(async () => {
    return await Speech.getAvailableVoicesAsync();
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    repeat,
    getVoices,
    isSpeaking,
    isPaused,
    currentText,
  };
}
