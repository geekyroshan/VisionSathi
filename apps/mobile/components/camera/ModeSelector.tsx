/**
 * VisionSathi - ModeSelector Component
 *
 * Mode shortcuts: Read, Navigate, History.
 */

import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVisionStore } from '@/stores/visionStore';
import { Text } from '@/components/ui';
import type { AppMode } from '../../../../packages/shared/types';

interface ModeSelectorProps {
  /** Called when a mode is selected */
  onModeChange: (mode: AppMode | 'history') => void;
  /** Custom style */
  style?: ViewStyle;
}

interface ModeOption {
  mode: AppMode | 'history';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
}

const modes: ModeOption[] = [
  {
    mode: 'read',
    icon: 'text',
    label: 'Read',
    hint: 'Read text from signs, labels, and documents',
  },
  {
    mode: 'navigate',
    icon: 'walk',
    label: 'Nav',
    hint: 'Get navigation help and obstacle warnings',
  },
  {
    mode: 'history',
    icon: 'chatbubbles-outline',
    label: 'Chat',
    hint: 'View conversation history',
  },
];

export function ModeSelector({ onModeChange, style }: ModeSelectorProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);
  const currentMode = useVisionStore((state) => state.currentMode);

  const handleModePress = useCallback(
    (mode: AppMode | 'history') => {
      triggerHaptic('selection', hapticEnabled);
      onModeChange(mode);
    },
    [hapticEnabled, onModeChange]
  );

  return (
    <View style={[styles.container, style]}>
      {modes.map((option) => {
        const isActive = option.mode !== 'history' && option.mode === currentMode;

        return (
          <Pressable
            key={option.mode}
            onPress={() => handleModePress(option.mode)}
            style={[styles.modeButton, isActive && styles.modeButtonActive]}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} mode`}
            accessibilityHint={option.hint}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={option.icon}
              size={24}
              color={isActive ? colors.accent.action : colors.text.secondary}
            />
            <Text
              variant="caption"
              color={isActive ? 'accent' : 'secondary'}
              style={styles.modeLabel}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.background.surface,
  },
  modeLabel: {
    marginTop: layout.spacing.xs,
  },
});
