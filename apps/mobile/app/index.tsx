/**
 * VisionSathi - Home Screen
 *
 * Full-bleed camera view with glassmorphism overlays.
 * Premium glassmorphism design with floating glass controls.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { checkHealth } from '@/services/api';

import { Text, GlassCard, StatusBar } from '@/components/ui';
import { CameraView, CaptureButton, ModeSelector } from '@/components/camera';
import { ResponseCard } from '@/components/response';

import type { AppMode } from '../../../packages/shared/types';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);

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

  // Connection health check
  useEffect(() => {
    const check = async () => {
      const healthy = await checkHealth();
      setIsConnected(healthy);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

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
      <RNStatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-bleed Camera Preview (edge-to-edge) */}
      <View style={styles.cameraFullBleed}>
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

      {/* Glass Header Overlay */}
      <View
        style={[
          styles.headerOverlay,
          { paddingTop: insets.top + layout.spacing.xs },
        ]}
      >
        <StatusBar isConnected={isConnected} />

        {/* Settings button */}
        <Pressable
          onPress={handleSettingsPress}
          style={styles.settingsButton}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          accessibilityHint="Opens settings screen"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Processing State Indicator */}
      {processingState !== 'idle' && processingState !== 'listening' && (
        <View
          style={[
            styles.processingIndicator,
            { top: insets.top + 60 },
          ]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <GlassCard intensity="strong" padding="small">
            <View style={styles.processingContent}>
              <View
                style={[
                  styles.processingDot,
                  processingState === 'processing' && styles.processingDotAmber,
                  processingState === 'speaking' && styles.processingDotGreen,
                  processingState === 'capturing' && styles.processingDotTeal,
                ]}
              />
              <Text variant="caption" color="secondary">
                {processingState === 'capturing' && 'Capturing...'}
                {processingState === 'processing' && 'Processing...'}
                {processingState === 'speaking' && 'Speaking...'}
              </Text>
            </View>
          </GlassCard>
        </View>
      )}

      {/* Bottom Glass Overlay */}
      <View
        style={[
          styles.bottomOverlay,
          { paddingBottom: insets.bottom + layout.spacing.sm },
        ]}
      >
        {/* Response Card (floating glass) */}
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

        {/* Instructions (hide when response is visible or listening) */}
        {!currentResponse && processingState === 'idle' && (
          <Text
            variant="bodySmall"
            color="secondary"
            center
            style={styles.instructions}
            accessibilityLabel="Tap to describe what you see. Hold to ask questions."
          >
            Tap to describe  --  Hold to ask
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

  // Full-bleed camera
  cameraFullBleed: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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

  // Header overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 11, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
    zIndex: 10,
  },
  settingsButton: {
    position: 'absolute',
    right: layout.spacing.md,
    top: 0,
    bottom: 0,
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Processing indicator
  processingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
  },
  processingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.action,
  },
  processingDotAmber: {
    backgroundColor: colors.accent.warning,
  },
  processingDotGreen: {
    backgroundColor: colors.accent.success,
  },
  processingDotTeal: {
    backgroundColor: colors.accent.action,
  },

  // Bottom overlay
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 11, 0.6)',
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingTop: layout.spacing.md,
    paddingHorizontal: layout.screenPadding,
    zIndex: 10,
  },
  responseContainer: {
    marginBottom: layout.spacing.md,
  },
  instructions: {
    marginBottom: layout.spacing.md,
  },
  captureButton: {
    marginBottom: layout.spacing.md,
  },
  modeSelector: {
    marginBottom: layout.spacing.xs,
  },
});
