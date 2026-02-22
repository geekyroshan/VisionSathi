/**
 * VisionSathi - ResponseCard Component
 *
 * Displays AI response with glassmorphism styling,
 * slide-up entrance animation, and audio controls.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { Text, GlassCard } from '@/components/ui';

interface ResponseCardProps {
  /** Response text */
  text: string;
  /** Processing time in ms */
  processingMs?: number;
  /** Source of response */
  source?: 'cloud' | 'local';
  /** Is TTS currently speaking */
  isSpeaking?: boolean;
  /** Pause/resume handler */
  onToggleSpeech?: () => void;
  /** Repeat handler */
  onRepeat?: () => void;
  /** Follow-up handler */
  onFollowUp?: () => void;
}

export function ResponseCard({
  text,
  processingMs,
  source = 'cloud',
  isSpeaking = false,
  onToggleSpeech,
  onRepeat,
  onFollowUp,
}: ResponseCardProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handleToggle = () => {
    triggerHaptic('light', hapticEnabled);
    onToggleSpeech?.();
  };

  const handleRepeat = () => {
    triggerHaptic('light', hapticEnabled);
    onRepeat?.();
  };

  const handleFollowUp = () => {
    triggerHaptic('tap', hapticEnabled);
    onFollowUp?.();
  };

  return (
    <Animated.View entering={FadeInDown.duration(350).springify()}>
      <GlassCard intensity="strong" padding="medium">
        {/* Accent top border line */}
        <View style={styles.accentLine} />

        {/* Header with source indicator */}
        <View style={styles.header}>
          <View style={styles.sourcePill}>
            <Ionicons
              name={source === 'cloud' ? 'cloud' : 'phone-portrait'}
              size={12}
              color={
                source === 'cloud'
                  ? colors.semantic.online
                  : colors.semantic.offline
              }
            />
            <Text variant="caption" color="secondary">
              {source === 'cloud' ? 'Cloud' : 'On-device'}
            </Text>
          </View>
          {processingMs !== undefined && processingMs > 0 && (
            <Text variant="caption" color="secondary">
              {(processingMs / 1000).toFixed(1)}s
            </Text>
          )}
        </View>

        {/* Response text */}
        <Text
          variant="body"
          style={styles.responseText}
          accessibilityLabel={`Response: ${text}`}
        >
          {text}
        </Text>

        {/* Audio controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={handleToggle}
            style={styles.controlButton}
            accessibilityRole="button"
            accessibilityLabel={isSpeaking ? 'Pause speech' : 'Resume speech'}
            accessibilityHint={isSpeaking ? 'Double tap to pause' : 'Double tap to resume speaking'}
          >
            <View style={styles.controlIconCircle}>
              <Ionicons
                name={isSpeaking ? 'pause' : 'play'}
                size={16}
                color={colors.text.primary}
              />
            </View>
            <Text variant="caption">{isSpeaking ? 'Pause' : 'Play'}</Text>
          </Pressable>

          <Pressable
            onPress={handleRepeat}
            style={styles.controlButton}
            accessibilityRole="button"
            accessibilityLabel="Repeat response"
            accessibilityHint="Double tap to hear the response again"
          >
            <View style={styles.controlIconCircle}>
              <Ionicons name="refresh" size={16} color={colors.text.primary} />
            </View>
            <Text variant="caption">Repeat</Text>
          </Pressable>

          {onFollowUp && (
            <Pressable
              onPress={handleFollowUp}
              style={styles.controlButton}
              accessibilityRole="button"
              accessibilityLabel="Ask a follow-up question"
              accessibilityHint="Opens conversation mode"
            >
              <View style={[styles.controlIconCircle, styles.controlIconAccent]}>
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={colors.accent.action}
                />
              </View>
              <Text variant="caption" color="accent">
                Follow-up
              </Text>
            </Pressable>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent.action,
    borderTopLeftRadius: layout.borderRadius.md,
    borderTopRightRadius: layout.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.sm,
    marginTop: layout.spacing.xs,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: layout.borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  responseText: {
    marginBottom: layout.spacing.md,
  },
  controls: {
    flexDirection: 'row',
    gap: layout.spacing.md,
    paddingTop: layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.sm,
    minHeight: 44,
  },
  controlIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.backgroundStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconAccent: {
    borderColor: colors.glow.action,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
});
