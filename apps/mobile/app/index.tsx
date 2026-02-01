/**
 * VisionSathi - Home Screen
 *
 * Main camera view with capture button and mode selector.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useVisionStore } from '@/stores/visionStore';
import { useSettingsStore } from '@/stores/settingsStore';

// TODO: Import actual components
// import { CameraView } from '@/components/camera/CameraView';
// import { CaptureButton } from '@/components/camera/CaptureButton';
// import { ModeSelector } from '@/components/camera/ModeSelector';
// import { ResponseCard } from '@/components/response/ResponseCard';

export default function HomeScreen() {
  const router = useRouter();
  const { processingState, currentMode, currentResponse } = useVisionStore();
  const { hapticEnabled } = useSettingsStore();

  const handleCapture = useCallback(async () => {
    triggerHaptic('tap', hapticEnabled);
    // TODO: Implement capture logic
    console.log('Capture pressed');
  }, [hapticEnabled]);

  const handleLongPress = useCallback(async () => {
    triggerHaptic('heavy', hapticEnabled);
    // TODO: Enter conversation mode
    console.log('Long press - conversation mode');
  }, [hapticEnabled]);

  const handleModeChange = useCallback((mode: 'read' | 'navigate' | 'history') => {
    triggerHaptic('selection', hapticEnabled);
    if (mode === 'history') {
      router.push('/history');
    } else {
      useVisionStore.getState().setCurrentMode(mode);
    }
  }, [hapticEnabled, router]);

  const handleSettingsPress = useCallback(() => {
    triggerHaptic('light', hapticEnabled);
    router.push('/settings');
  }, [hapticEnabled, router]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text
          style={styles.headerTitle}
          accessibilityRole="header"
        >
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

      {/* Camera Preview (Placeholder) */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons
            name="camera-outline"
            size={64}
            color={colors.text.secondary}
          />
          <Text style={styles.placeholderText}>
            Camera Preview
          </Text>
        </View>
      </View>

      {/* Response Card (if response exists) */}
      {currentResponse && (
        <View style={styles.responseContainer}>
          <View style={styles.responseCard}>
            <Text style={styles.responseText}>
              {currentResponse.description}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Instructions */}
        <Text
          style={styles.instructions}
          accessibilityLabel="Tap anywhere to describe. Hold for conversation."
        >
          Tap anywhere to describe{'\n'}Hold for conversation
        </Text>

        {/* Main Capture Button */}
        <Pressable
          onPress={handleCapture}
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.captureButtonPressed,
          ]}
          accessibilityLabel={
            processingState === 'processing'
              ? 'Processing image'
              : 'Describe what you see'
          }
          accessibilityRole="button"
          accessibilityHint="Tap to get a description of what the camera sees. Hold to ask questions."
          accessibilityState={{
            busy: processingState === 'processing',
          }}
        >
          <View style={styles.captureButtonInner}>
            <Ionicons
              name={processingState === 'processing' ? 'sync' : 'eye'}
              size={32}
              color={colors.background.primary}
            />
            <Text style={styles.captureButtonText}>
              {processingState === 'processing' ? 'Processing...' : 'Quick Describe'}
            </Text>
          </View>
        </Pressable>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <Pressable
            onPress={() => handleModeChange('read')}
            style={[
              styles.modeButton,
              currentMode === 'read' && styles.modeButtonActive,
            ]}
            accessibilityLabel="Read text mode"
            accessibilityRole="button"
            accessibilityState={{ selected: currentMode === 'read' }}
          >
            <Ionicons
              name="text"
              size={24}
              color={
                currentMode === 'read'
                  ? colors.accent.action
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.modeButtonText,
                currentMode === 'read' && styles.modeButtonTextActive,
              ]}
            >
              Read
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeChange('navigate')}
            style={[
              styles.modeButton,
              currentMode === 'navigate' && styles.modeButtonActive,
            ]}
            accessibilityLabel="Navigate mode"
            accessibilityRole="button"
            accessibilityState={{ selected: currentMode === 'navigate' }}
          >
            <Ionicons
              name="walk"
              size={24}
              color={
                currentMode === 'navigate'
                  ? colors.accent.action
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.modeButtonText,
                currentMode === 'navigate' && styles.modeButtonTextActive,
              ]}
            >
              Nav
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeChange('history')}
            style={styles.modeButton}
            accessibilityLabel="Conversation history"
            accessibilityRole="button"
          >
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={colors.text.secondary}
            />
            <Text style={styles.modeButtonText}>Chat</Text>
          </Pressable>
        </View>
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
  headerTitle: {
    ...typography.heading,
    color: colors.text.primary,
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
    backgroundColor: colors.background.elevated,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  placeholderText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: layout.spacing.md,
  },
  responseContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.spacing.md,
  },
  responseCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: layout.borderRadius.md,
    padding: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  responseText: {
    ...typography.body,
    color: colors.text.primary,
  },
  bottomControls: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.spacing.xl,
  },
  instructions: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: layout.spacing.md,
  },
  captureButton: {
    backgroundColor: colors.accent.action,
    borderRadius: layout.borderRadius.lg,
    paddingVertical: layout.spacing.lg,
    marginBottom: layout.spacing.lg,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  captureButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
  },
  captureButtonText: {
    ...typography.button,
    color: colors.background.primary,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeButton: {
    alignItems: 'center',
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
  },
  modeButtonActive: {
    backgroundColor: colors.background.surface,
  },
  modeButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: layout.spacing.xs,
  },
  modeButtonTextActive: {
    color: colors.accent.action,
  },
});
