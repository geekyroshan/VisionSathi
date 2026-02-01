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
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useVisionStore } from '@/stores/visionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from '@/hooks/useTTS';
import { useVision } from '@/hooks/useVision';

import { Text } from '@/components/ui';
import { CameraView, CaptureButton, ModeSelector } from '@/components/camera';
import { ResponseCard } from '@/components/response';

import type { AppMode } from '../../../packages/shared/types';

export default function HomeScreen() {
  const router = useRouter();
  const cameraRef = useRef<ExpoCameraView>(null);

  // Store state
  const {
    currentMode,
    currentResponse,
    lastProcessingSource,
    setCurrentMode,
    clearResponse,
  } = useVisionStore();

  const { hapticEnabled } = useSettingsStore();

  // TTS hook for audio controls
  const { pause, resume, repeat, isSpeaking, isPaused } = useTTS();

  // Vision hook for capture/conversation
  const {
    processingState,
    captureAndAnalyze,
    enterConversationMode,
    exitConversationMode,
  } = useVision(cameraRef);

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
    enterConversationMode();
  }, [enterConversationMode]);

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

      {/* Processing State Indicator */}
      {processingState !== 'idle' && (
        <View style={styles.stateIndicator}>
          <View
            style={[
              styles.stateIndicatorDot,
              processingState === 'listening' && styles.stateIndicatorListening,
              processingState === 'processing' && styles.stateIndicatorProcessing,
              processingState === 'speaking' && styles.stateIndicatorSpeaking,
            ]}
          />
          <Text variant="caption" color="secondary">
            {processingState === 'capturing' && 'Capturing...'}
            {processingState === 'listening' && 'Listening...'}
            {processingState === 'processing' && 'Processing...'}
            {processingState === 'speaking' && 'Speaking...'}
          </Text>
        </View>
      )}

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView cameraRef={cameraRef} />

        {/* Listening Overlay */}
        {processingState === 'listening' && (
          <View style={styles.listeningOverlay}>
            <View style={styles.listeningIndicator}>
              <Ionicons
                name="mic"
                size={48}
                color={colors.accent.listening}
              />
              <Text variant="heading" center style={styles.listeningText}>
                Listening...
              </Text>
              <Text variant="bodySmall" color="secondary" center>
                Release to send your question
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Response Card */}
      {currentResponse && processingState !== 'listening' && (
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
        {/* Instructions (hide when response is visible or listening) */}
        {!currentResponse && processingState === 'idle' && (
          <Text
            variant="bodySmall"
            color="secondary"
            center
            style={styles.instructions}
            accessibilityLabel="Tap to describe what you see. Hold to ask questions."
          >
            Tap to describe • Hold to ask
          </Text>
        )}

        {/* Main Capture Button */}
        <CaptureButton
          onPress={captureAndAnalyze}
          onLongPress={enterConversationMode}
          onLongPressOut={exitConversationMode}
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
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.spacing.sm,
    paddingVertical: layout.spacing.sm,
  },
  stateIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.action,
  },
  stateIndicatorListening: {
    backgroundColor: colors.accent.listening,
  },
  stateIndicatorProcessing: {
    backgroundColor: colors.accent.warning,
  },
  stateIndicatorSpeaking: {
    backgroundColor: colors.accent.success,
  },
  cameraContainer: {
    flex: 1,
    margin: layout.screenPadding,
    borderRadius: layout.borderRadius.lg,
    overflow: 'hidden',
  },
  listeningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningIndicator: {
    alignItems: 'center',
    gap: layout.spacing.md,
  },
  listeningText: {
    color: colors.accent.listening,
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
