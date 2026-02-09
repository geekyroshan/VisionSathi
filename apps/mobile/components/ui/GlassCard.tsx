/**
 * VisionSathi - GlassCard Component
 *
 * Glassmorphism card with semi-transparent background and border.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';

interface GlassCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  pressable?: boolean;
  intensity?: 'light' | 'medium' | 'strong';
  padding?: 'none' | 'small' | 'medium' | 'large';
  glow?: 'action' | 'listening' | 'warning' | null;
}

export function GlassCard({
  children,
  style,
  pressable = false,
  intensity = 'medium',
  padding = 'medium',
  glow = null,
  onPress,
  ...props
}: GlassCardProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const backgroundColors = {
    light: colors.glass.background,
    medium: colors.glass.backgroundStrong,
    strong: 'rgba(255, 255, 255, 0.12)',
  };

  const paddingSizes = {
    none: 0,
    small: layout.spacing.sm,
    medium: layout.spacing.md,
    large: layout.spacing.lg,
  };

  const cardStyle: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: backgroundColors[intensity],
      padding: paddingSizes[padding],
    },
    glow
      ? {
          shadowColor:
            glow === 'action'
              ? '#00D4AA'
              : glow === 'listening'
              ? '#6366F1'
              : '#F59E0B',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }
      : {},
    style || {},
  ];

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={(e) => {
          triggerHaptic('light', hapticEnabled);
          onPress(e);
        }}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
