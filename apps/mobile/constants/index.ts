/**
 * VisionSathi Design System - Constants
 *
 * Central export for all design tokens.
 */

export { colors } from './colors';
export { typography } from './typography';
export { hapticPatterns, triggerHaptic } from './haptics';
export { sounds, soundConfig } from './sounds';

// Layout constants
export const layout = {
  // Minimum touch target size (WCAG AAA)
  minTouchTarget: 64,

  // Standard spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Screen padding
  screenPadding: 16,

  // Header height
  headerHeight: 56,

  // Bottom bar height
  bottomBarHeight: 100,
} as const;

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
