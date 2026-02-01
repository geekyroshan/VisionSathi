/**
 * VisionSathi - ResponseCard Component
 *
 * Displays AI response with audio controls.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVisionStore } from '@/stores/visionStore';
import { Text, Card } from '@/components/ui';

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
    <Card variant="elevated" padding="medium" style={styles.card}>
      {/* Header with source indicator */}
      <View style={styles.header}>
        <View style={styles.sourceIndicator}>
          <Ionicons
            name={source === 'cloud' ? 'cloud' : 'phone-portrait'}
            size={16}
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
        {processingMs && (
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
        >
          <Ionicons
            name={isSpeaking ? 'pause' : 'play'}
            size={20}
            color={colors.text.primary}
          />
          <Text variant="caption">{isSpeaking ? 'Pause' : 'Play'}</Text>
        </Pressable>

        <Pressable
          onPress={handleRepeat}
          style={styles.controlButton}
          accessibilityRole="button"
          accessibilityLabel="Repeat response"
        >
          <Ionicons name="refresh" size={20} color={colors.text.primary} />
          <Text variant="caption">Repeat</Text>
        </Pressable>
      </View>

      {/* Follow-up prompt */}
      {onFollowUp && (
        <Pressable
          onPress={handleFollowUp}
          style={styles.followUpButton}
          accessibilityRole="button"
          accessibilityLabel="Ask a follow-up question"
          accessibilityHint="Opens conversation mode"
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={colors.accent.action}
          />
          <Text variant="bodySmall" color="accent">
            Ask follow-up...
          </Text>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.sm,
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
  },
  responseText: {
    marginBottom: layout.spacing.md,
  },
  controls: {
    flexDirection: 'row',
    gap: layout.spacing.md,
    paddingTop: layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    minHeight: 44,
  },
  followUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
    marginTop: layout.spacing.md,
    paddingVertical: layout.spacing.sm,
  },
});
