/**
 * VisionSathi - Speech-to-Text Hook
 *
 * Uses expo-speech-recognition for real-time speech recognition.
 */

import { useState, useCallback, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useSettingsStore } from '@/stores/settingsStore';
import { triggerHaptic } from '@/constants/haptics';

interface STTOptions {
  onTranscript?: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface STTState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string | null;
  error: string | null;
}

export function useSTT() {
  const [state, setState] = useState<STTState>({
    isListening: false,
    isProcessing: false,
    transcript: null,
    error: null,
  });

  const optionsRef = useRef<STTOptions | undefined>(undefined);
  const transcriptDeliveredRef = useRef(false);
  const lastTranscriptRef = useRef<string | null>(null);
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  // Listen for speech recognition results
  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript || '';
      lastTranscriptRef.current = transcript;
      if (event.isFinal) {
        setState((s) => ({
          ...s,
          isProcessing: false,
          transcript,
        }));
        if (optionsRef.current?.onTranscript) {
          transcriptDeliveredRef.current = true;
          optionsRef.current.onTranscript(transcript);
        }
      } else {
        setState((s) => ({ ...s, transcript }));
      }
    }
  });

  useSpeechRecognitionEvent('start', () => {
    transcriptDeliveredRef.current = false;
    lastTranscriptRef.current = null;
    setState((s) => ({
      ...s,
      isListening: true,
      isProcessing: false,
      transcript: null,
      error: null,
    }));
    optionsRef.current?.onStart?.();
  });

  useSpeechRecognitionEvent('end', () => {
    // Safety net: if onTranscript was never called but we have a transcript, deliver it now
    if (!transcriptDeliveredRef.current && lastTranscriptRef.current && optionsRef.current?.onTranscript) {
      transcriptDeliveredRef.current = true;
      optionsRef.current.onTranscript(lastTranscriptRef.current);
    }
    setState((s) => ({
      ...s,
      isListening: false,
      isProcessing: false,
    }));
    optionsRef.current?.onEnd?.();
  });

  useSpeechRecognitionEvent('error', (event) => {
    const errorMessage = event.error || 'Speech recognition failed';
    setState((s) => ({
      ...s,
      isListening: false,
      isProcessing: false,
      error: errorMessage,
    }));
    optionsRef.current?.onError?.(new Error(errorMessage));
  });

  /**
   * Request speech recognition permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return result.granted;
    } catch (error) {
      console.error('Failed to request speech recognition permission:', error);
      return false;
    }
  }, []);

  /**
   * Start listening for speech
   */
  const startListening = useCallback(
    async (options?: STTOptions) => {
      optionsRef.current = options;

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        const error = new Error('Speech recognition permission denied');
        setState((s) => ({ ...s, error: error.message }));
        options?.onError?.(error);
        return;
      }

      try {
        triggerHaptic('light', hapticEnabled);

        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          continuous: true,
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        const err = error instanceof Error ? error : new Error('Recognition failed');
        setState((s) => ({ ...s, error: err.message, isListening: false }));
        options?.onError?.(err);
      }
    },
    [hapticEnabled, requestPermission]
  );

  /**
   * Stop listening and process speech
   */
  const stopListening = useCallback(
    async (options?: STTOptions) => {
      if (options) {
        optionsRef.current = options;
      }

      try {
        setState((s) => ({ ...s, isProcessing: true }));
        triggerHaptic('success', hapticEnabled);
        ExpoSpeechRecognitionModule.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
        const err = error instanceof Error ? error : new Error('Stop failed');
        setState((s) => ({
          ...s,
          isListening: false,
          isProcessing: false,
          error: err.message,
        }));
        options?.onError?.(err);
      }
    },
    [hapticEnabled]
  );

  /**
   * Cancel listening without processing
   */
  const cancelListening = useCallback(async () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (error) {
      console.error('Failed to cancel speech recognition:', error);
    }

    setState({
      isListening: false,
      isProcessing: false,
      transcript: null,
      error: null,
    });
  }, []);

  /**
   * Clear the current transcript
   */
  const clearTranscript = useCallback(() => {
    setState((s) => ({ ...s, transcript: null, error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    cancelListening,
    clearTranscript,
    requestPermission,
  };
}
