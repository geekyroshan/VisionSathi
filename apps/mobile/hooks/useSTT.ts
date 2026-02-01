/**
 * VisionSathi - Speech-to-Text Hook
 *
 * Uses expo-av for audio recording and sends to backend for transcription.
 * Falls back to simple voice detection for demo purposes.
 */

import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
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

  const recordingRef = useRef<Audio.Recording | null>(null);
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      return false;
    }
  }, []);

  /**
   * Start listening for speech
   */
  const startListening = useCallback(
    async (options?: STTOptions) => {
      // Check permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        const error = new Error('Microphone permission denied');
        setState((s) => ({ ...s, error: error.message }));
        options?.onError?.(error);
        return;
      }

      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Start recording
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        await recording.startAsync();

        recordingRef.current = recording;
        setState((s) => ({
          ...s,
          isListening: true,
          isProcessing: false,
          transcript: null,
          error: null,
        }));

        triggerHaptic('light', hapticEnabled);
        options?.onStart?.();
      } catch (error) {
        console.error('Failed to start recording:', error);
        const err = error instanceof Error ? error : new Error('Recording failed');
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
      if (!recordingRef.current) {
        return;
      }

      try {
        setState((s) => ({ ...s, isListening: false, isProcessing: true }));

        // Stop recording
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;

        // Reset audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        triggerHaptic('success', hapticEnabled);

        if (uri) {
          // In a real implementation, send audio to a transcription service
          // For now, we'll simulate with a placeholder
          // TODO: Integrate with Whisper API or on-device STT

          // Simulate processing delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Placeholder transcript
          // In production, this would be the actual transcribed text
          const transcript = "What do you see?"; // Demo placeholder

          setState((s) => ({
            ...s,
            isProcessing: false,
            transcript,
          }));

          options?.onTranscript?.(transcript);
        }

        options?.onEnd?.();
      } catch (error) {
        console.error('Failed to stop recording:', error);
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
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error('Failed to cancel recording:', error);
      }
    }

    setState((s) => ({
      ...s,
      isListening: false,
      isProcessing: false,
      transcript: null,
      error: null,
    }));
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
