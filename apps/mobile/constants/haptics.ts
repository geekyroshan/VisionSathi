/**
 * VisionSathi Design System - Haptics
 *
 * Haptic feedback patterns for different interactions.
 * All haptics should respect user's haptic preference setting.
 */

import * as Haptics from 'expo-haptics';

export const hapticPatterns = {
  // Button tap - medium impact
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Light feedback for toggles, selections
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Heavy feedback for important actions
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Success notification
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Error notification
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Warning notification
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Selection changed
  selection: () => Haptics.selectionAsync(),
} as const;

/**
 * Wrapper that respects user's haptic preference
 */
export const triggerHaptic = async (
  pattern: keyof typeof hapticPatterns,
  enabled: boolean = true
) => {
  if (!enabled) return;

  try {
    await hapticPatterns[pattern]();
  } catch (error) {
    // Haptics not available on this device
    console.debug('Haptics not available:', error);
  }
};
