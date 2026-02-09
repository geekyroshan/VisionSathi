/**
 * VisionSathi - Vision Hook
 *
 * Combines camera, API, and TTS for the complete vision flow.
 */

import { useCallback, useRef } from 'react';
import { CameraView } from 'expo-camera';

import { useVisionStore } from '@/stores/visionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from './useTTS';
import { useSTT } from './useSTT';
import { analyzeImage, sendConversation, ApiError } from '@/services/api';
import { triggerHaptic } from '@/constants/haptics';

import type { AppMode } from '../../../packages/shared/types';

/**
 * Returns a user-friendly error message based on the error type.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Timeout (AbortError from fetchWithTimeout)
    if (error.message === 'Request timeout') {
      return 'Analysis timed out. The server may be busy.';
    }

    // HTTP status-based messages
    if (error.statusCode === 503) {
      return 'The AI model is still loading. Please try again in a moment.';
    }

    if (error.statusCode !== undefined && error.statusCode >= 500) {
      return 'The server encountered an error. Please try again.';
    }

    if (error.statusCode === 404) {
      return 'Cannot reach VisionSathi server. Check your server URL in Settings.';
    }

    if (error.statusCode !== undefined && error.statusCode >= 400) {
      return 'Something went wrong with the request. Please try again.';
    }

    // Network-level errors (no status code means the request never reached the server)
    if (error.statusCode === undefined) {
      return 'Cannot reach VisionSathi server. Check your connection.';
    }
  }

  // Non-API errors (e.g., camera failure)
  if (error instanceof Error) {
    if (error.message === 'Failed to capture photo') {
      return 'Could not capture a photo. Please try again.';
    }

    // Network errors from fetch (TypeError: Network request failed)
    if (
      error.message.includes('Network request failed') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return 'Cannot reach VisionSathi server. Check your connection.';
    }
  }

  return 'Something went wrong. Please try again.';
}

export function useVision(cameraRef: React.RefObject<CameraView | null>) {
  const {
    processingState,
    currentMode,
    conversationId,
    conversationHistory,
    setProcessingState,
    setResponse,
    captureFrame,
    setProcessingSource,
    startConversation,
    addMessage,
    clearConversation,
  } = useVisionStore();

  const { verbosity, hapticEnabled } = useSettingsStore();
  const { speak, stop: stopSpeaking } = useTTS();
  const { startListening, stopListening, cancelListening, isListening, transcript } = useSTT();

  const lastFrameRef = useRef<string | null>(null);

  /**
   * Capture frame and analyze (quick tap flow)
   */
  const captureAndAnalyze = useCallback(async () => {
    if (!cameraRef.current || processingState !== 'idle') return;

    try {
      setProcessingState('capturing');
      triggerHaptic('tap', hapticEnabled);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      captureFrame(photo.base64);
      lastFrameRef.current = photo.base64;
      setProcessingState('processing');

      // Clear any previous conversation when taking new photo
      clearConversation();

      // Analyze image
      const response = await analyzeImage({
        image: photo.base64,
        mode: currentMode === 'conversation' ? 'describe' : currentMode,
        verbosity,
        language: 'en',
      });

      setResponse(response);
      setProcessingSource(response.source);
      setProcessingState('speaking');

      // Start a new conversation with this image
      const convId = `conv_${Date.now()}`;
      startConversation(convId);
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.description,
        timestamp: Date.now(),
      });

      // Speak the response
      await speak(response.description, {
        onDone: () => setProcessingState('idle'),
        onError: () => setProcessingState('idle'),
      });
    } catch (error) {
      console.error('Capture error:', error);
      setProcessingState('idle');

      const errorMessage = getErrorMessage(error);
      speak(errorMessage);
    }
  }, [
    cameraRef,
    processingState,
    currentMode,
    verbosity,
    hapticEnabled,
    setProcessingState,
    captureFrame,
    clearConversation,
    setResponse,
    setProcessingSource,
    startConversation,
    addMessage,
    speak,
  ]);

  /**
   * Enter conversation mode (long press)
   */
  const enterConversationMode = useCallback(async () => {
    if (processingState === 'processing' || processingState === 'speaking') return;

    // Stop any ongoing speech
    stopSpeaking();

    // If no image captured yet, capture one first
    if (!lastFrameRef.current && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (photo?.base64) {
          captureFrame(photo.base64);
          lastFrameRef.current = photo.base64;
        }
      } catch (error) {
        console.error('Failed to capture frame for conversation:', error);
      }
    }

    setProcessingState('listening');
    triggerHaptic('heavy', hapticEnabled);

    // Start listening for voice input
    await startListening({
      onStart: () => {
        console.log('Listening started');
      },
      onError: (error) => {
        console.error('Listening error:', error);
        setProcessingState('idle');
      },
    });
  }, [
    cameraRef,
    processingState,
    hapticEnabled,
    stopSpeaking,
    captureFrame,
    setProcessingState,
    startListening,
  ]);

  /**
   * Exit conversation mode and process question
   */
  const exitConversationMode = useCallback(async () => {
    if (processingState !== 'listening') return;

    try {
      // Stop listening and get transcript
      await stopListening({
        onTranscript: async (question) => {
          if (!question || !lastFrameRef.current) {
            setProcessingState('idle');
            return;
          }

          setProcessingState('processing');

          // Add user message to history
          addMessage({
            id: `msg_${Date.now()}`,
            role: 'user',
            content: question,
            timestamp: Date.now(),
          });

          try {
            // Send conversation request
            const response = await sendConversation({
              conversationId,
              image: lastFrameRef.current,
              message: question,
              history: conversationHistory,
              verbosity,
            });

            // Add assistant response
            addMessage({
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: response.response,
              timestamp: Date.now(),
            });

            setProcessingState('speaking');

            // Speak the response
            await speak(response.response, {
              onDone: () => setProcessingState('idle'),
              onError: () => setProcessingState('idle'),
            });
          } catch (error) {
            console.error('Conversation error:', error);
            setProcessingState('idle');

            const errorMessage = getErrorMessage(error);
            speak(errorMessage);
          }
        },
        onEnd: () => {
          // Handled in onTranscript
        },
        onError: () => {
          setProcessingState('idle');
        },
      });
    } catch (error) {
      console.error('Exit conversation error:', error);
      setProcessingState('idle');
    }
  }, [
    processingState,
    conversationId,
    conversationHistory,
    verbosity,
    stopListening,
    addMessage,
    setProcessingState,
    speak,
  ]);

  /**
   * Cancel conversation mode
   */
  const cancelConversation = useCallback(async () => {
    await cancelListening();
    setProcessingState('idle');
  }, [cancelListening, setProcessingState]);

  return {
    // State
    processingState,
    isListening,
    transcript,

    // Actions
    captureAndAnalyze,
    enterConversationMode,
    exitConversationMode,
    cancelConversation,
  };
}
