/**
 * VisionSathi - Card Component
 *
 * Container card with optional press handling.
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends Omit<PressableProps, 'style'> {
  /** Card variant */
  variant?: CardVariant;
  /** Make card pressable */
  pressable?: boolean;
  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Custom style override */
  style?: ViewStyle;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, ViewStyle> = {
  elevated: {
    backgroundColor: colors.background.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  outlined: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filled: {
    backgroundColor: colors.background.surface,
  },
};

const paddingStyles: Record<string, ViewStyle> = {
  none: { padding: 0 },
  small: { padding: layout.spacing.sm },
  medium: { padding: layout.spacing.md },
  large: { padding: layout.spacing.lg },
};

export function Card({
  variant = 'elevated',
  pressable = false,
  padding = 'medium',
  style,
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: CardProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handlePress = (event: any) => {
    if (pressable && onPress) {
      triggerHaptic('light', hapticEnabled);
      onPress(event);
    }
  };

  const cardStyle = [
    styles.base,
    variantStyles[variant],
    paddingStyles[padding],
    style,
  ];

  if (pressable) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} accessible accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
