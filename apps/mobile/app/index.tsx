/**
 * VisionSathi - Home Screen
 *
 * Main camera view with capture button and mode selector.
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useVisionStore } from '@/stores/visionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from '@/hooks/useTTS';

import { Text } from '@/components/ui';
import { CameraView, CaptureButton, ModeSelector } from '@/components/camera';
import { ResponseCard } from '@/components/response';
import { analyzeImage } from '@/services/api';

import type { AppMode } from '../../../packages/shared/types';

export default function HomeScreen() {
  const router = useRouter();
  const cameraRef = useRef<ExpoCameraView>(null);

  // Store state
  const {
    processingState,
    currentMode,
    currentResponse,
    lastProcessingSource,
    setProcessingState,
    setCurrentMode,
    setResponse,
    clearResponse,
    captureFrame,
  } = useVisionStore();

  const { hapticEnabled, verbosity } = useSettingsStore();

  // TTS hook
  const { speak, stop, pause, resume, repeat, isSpeaking, isPaused } = useTTS();

  // Capture and analyze image
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || processingState !== 'idle') return;

    try {
      setProcessingState('capturing');

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      captureFrame(photo.base64);
      setProcessingState('processing');

      // Analyze image
      const response = await analyzeImage({
        image: photo.base64,
        mode: currentMode === 'conversation' ? 'describe' : currentMode,
        verbosity,
        language: 'en',
      });

      setResponse(response);
      setProcessingState('speaking');

      // Speak the response
      await speak(response.description, {
        onDone: () => setProcessingState('idle'),
        onError: () => setProcessingState('idle'),
      });
    } catch (error) {
      console.error('Capture error:', error);
      setProcessingState('idle');

      // Speak error message
      speak('Sorry, I could not analyze the image. Please try again.');
    }
  }, [
    processingState,
    currentMode,
    verbosity,
    setProcessingState,
    captureFrame,
    setResponse,
    speak,
  ]);

  // Handle long press for conversation mode
  const handleLongPress = useCallback(() => {
    setProcessingState('listening');
    // TODO: Implement speech-to-text for conversation mode
  }, [setProcessingState]);

  const handleLongPressOut = useCallback(() => {
    if (processingState === 'listening') {
      setProcessingState('idle');
      // TODO: Process voice input
    }
  }, [processingState, setProcessingState]);

  // Mode change handler
  const handleModeChange = useCallback(
    (mode: AppMode | 'history') => {
      triggerHaptic('selection', hapticEnabled);
      if (mode === 'history') {
        router.push('/history');
      } else {
        setCurrentMode(mode);
        clearResponse();
      }
    },
    [hapticEnabled, router, setCurrentMode, clearResponse]
  );

  // Settings navigation
  const handleSettingsPress = useCallback(() => {
    triggerHaptic('light', hapticEnabled);
    router.push('/settings');
  }, [hapticEnabled, router]);

  // TTS controls
  const handleToggleSpeech = useCallback(() => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    }
  }, [isSpeaking, isPaused, pause, resume]);

  const handleRepeat = useCallback(() => {
    repeat();
  }, [repeat]);

  const handleFollowUp = useCallback(() => {
    setProcessingState('listening');
    // TODO: Implement follow-up question flow
  }, [setProcessingState]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text variant="heading" accessibilityRole="header">
          VisionSathi
        </Text>
        <Pressable
          onPress={handleSettingsPress}
          style={styles.headerButton}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          accessibilityHint="Opens settings screen"
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView cameraRef={cameraRef} />
      </View>

      {/* Response Card */}
      {currentResponse && (
        <View style={styles.responseContainer}>
          <ResponseCard
            text={currentResponse.description}
            processingMs={currentResponse.processingMs}
            source={lastProcessingSource || 'cloud'}
            isSpeaking={isSpeaking && !isPaused}
            onToggleSpeech={handleToggleSpeech}
            onRepeat={handleRepeat}
            onFollowUp={handleFollowUp}
          />
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Instructions (hide when response is visible) */}
        {!currentResponse && (
          <Text
            variant="bodySmall"
            color="secondary"
            center
            style={styles.instructions}
            accessibilityLabel="Tap anywhere to describe. Hold for conversation."
          >
            Tap to describe • Hold to ask
          </Text>
        )}

        {/* Main Capture Button */}
        <CaptureButton
          onPress={handleCapture}
          onLongPress={handleLongPress}
          onLongPressOut={handleLongPressOut}
          style={styles.captureButton}
        />

        {/* Mode Selector */}
        <ModeSelector onModeChange={handleModeChange} style={styles.modeSelector} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: layout.spacing.sm,
    height: layout.headerHeight,
  },
  headerSpacer: {
    width: 40,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    margin: layout.screenPadding,
    borderRadius: layout.borderRadius.lg,
    overflow: 'hidden',
  },
  responseContainer: {
    paddingHorizontal: layout.screenPadding,
  },
  bottomControls: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.spacing.xl,
    paddingTop: layout.spacing.md,
  },
  instructions: {
    marginBottom: layout.spacing.md,
  },
  captureButton: {
    marginBottom: layout.spacing.lg,
  },
  modeSelector: {
    // Uses default styling
  },
});
