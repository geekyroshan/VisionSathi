/**
 * VisionSathi - Icon Component
 *
 * Wrapper around Ionicons with consistent sizing and colors.
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type IconSize = 'small' | 'medium' | 'large' | 'xlarge';
type IconColor = 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'success';

interface IconProps {
  /** Icon name from Ionicons */
  name: keyof typeof Ionicons.glyphMap;
  /** Icon size */
  size?: IconSize;
  /** Icon color */
  color?: IconColor;
  /** Custom color override */
  customColor?: string;
  /** Accessibility label (required for standalone icons) */
  accessibilityLabel?: string;
}

const sizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
};

const colorMap: Record<IconColor, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  accent: colors.accent.action,
  error: colors.accent.error,
  warning: colors.accent.warning,
  success: colors.accent.success,
};

export function Icon({
  name,
  size = 'medium',
  color = 'primary',
  customColor,
  accessibilityLabel,
}: IconProps) {
  const iconSize = sizeMap[size];
  const iconColor = customColor || colorMap[color];

  return (
    <Ionicons
      name={name}
      size={iconSize}
      color={iconColor}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
    />
  );
}

// Re-export icon names for autocomplete
export type IconName = keyof typeof Ionicons.glyphMap;
