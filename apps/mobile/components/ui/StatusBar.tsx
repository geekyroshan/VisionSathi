/**
 * VisionSathi - StatusBar Component
 *
 * Shows connection status and current mode overlaying the camera view.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { Text } from '@/components/ui/Text';
import { useVisionStore } from '@/stores/visionStore';

interface StatusBarProps {
  isConnected: boolean;
}

export function StatusBar({ isConnected }: StatusBarProps) {
  const currentMode = useVisionStore((state) => state.currentMode);

  const getModeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (currentMode) {
      case 'read':
        return 'text';
      case 'navigate':
        return 'walk';
      default:
        return 'eye';
    }
  };

  const getModeLabel = (): string => {
    switch (currentMode) {
      case 'describe':
        return 'Describe';
      case 'read':
        return 'Read';
      case 'navigate':
        return 'Navigate';
      default:
        return 'Chat';
    }
  };

  return (
    <View style={styles.container}>
      {/* Connection Status Pill */}
      <View
        style={[
          styles.pill,
          isConnected ? styles.pillConnected : styles.pillOffline,
        ]}
        accessibilityLabel={isConnected ? 'Connected to server' : 'Working offline'}
        accessibilityRole="text"
      >
        <View
          style={[
            styles.dot,
            isConnected ? styles.dotConnected : styles.dotOffline,
          ]}
        />
        <Text variant="caption" style={styles.pillText}>
          {isConnected ? 'Connected' : 'Offline'}
        </Text>
      </View>

      {/* Mode Indicator */}
      <View
        style={styles.modePill}
        accessibilityLabel={`Current mode: ${getModeLabel()}`}
        accessibilityRole="text"
      >
        <Ionicons
          name={getModeIcon()}
          size={14}
          color={colors.accent.action}
        />
        <Text variant="caption" style={styles.pillText}>
          {getModeLabel()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: layout.borderRadius.full,
    borderWidth: 1,
  },
  pillConnected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  pillOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotConnected: {
    backgroundColor: colors.accent.success,
  },
  dotOffline: {
    backgroundColor: colors.accent.warning,
  },
  pillText: {
    color: colors.text.primary,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: layout.borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});
