/**
 * VisionSathi - Text Component
 *
 * Semantic text component with predefined variants.
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type TextVariant =
  | 'headingLarge'
  | 'heading'
  | 'headingSmall'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

type TextColor = 'primary' | 'secondary' | 'accent' | 'error' | 'warning';

interface TextProps extends RNTextProps {
  /** Text variant for styling */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** Center align text */
  center?: boolean;
  /** Custom style override */
  style?: TextStyle;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  headingLarge: typography.headingLarge,
  heading: typography.heading,
  headingSmall: typography.headingSmall,
  body: typography.body,
  bodySmall: typography.bodySmall,
  label: typography.label,
  caption: typography.caption,
};

const colorStyles: Record<TextColor, TextStyle> = {
  primary: { color: colors.text.primary },
  secondary: { color: colors.text.secondary },
  accent: { color: colors.accent.action },
  error: { color: colors.accent.error },
  warning: { color: colors.accent.warning },
};

// Accessibility roles for semantic variants
const accessibilityRoles: Partial<Record<TextVariant, 'header' | 'text'>> = {
  headingLarge: 'header',
  heading: 'header',
  headingSmall: 'header',
};

export function Text({
  variant = 'body',
  color = 'primary',
  center = false,
  style,
  children,
  accessibilityRole,
  ...props
}: TextProps) {
  const role = accessibilityRole || accessibilityRoles[variant] || 'text';

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        colorStyles[color],
        center && styles.center,
        style,
      ]}
      accessibilityRole={role}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base styles applied to all text
  },
  center: {
    textAlign: 'center',
  },
});
