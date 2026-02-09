/**
 * VisionSathi - ModeSelector Component
 *
 * Frosted glass pill mode selector with icons.
 * Active state uses teal background, inactive uses glass border.
 */

import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
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
        const isActive =
          option.mode !== 'history' && option.mode === currentMode;

        return (
          <Pressable
            key={option.mode}
            onPress={() => handleModePress(option.mode)}
            style={[
              styles.modePill,
              isActive ? styles.modePillActive : styles.modePillInactive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} mode`}
            accessibilityHint={option.hint}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={
                isActive ? colors.background.primary : colors.text.secondary
              }
            />
            <Text
              variant="caption"
              style={
                isActive ? styles.modeLabelActive : styles.modeLabelInactive
              }
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
    justifyContent: 'center',
    gap: layout.spacing.sm,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderRadius: layout.borderRadius.full,
    minWidth: layout.minTouchTarget,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
  },
  modePillActive: {
    backgroundColor: colors.accent.action,
    borderColor: colors.accent.action,
  },
  modePillInactive: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
  },
  modeLabelActive: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  modeLabelInactive: {
    color: colors.text.secondary,
  },
});
