/**
 * VisionSathi - Pulsing Indicator Component
 *
 * Animated pulsing dot for processing states.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, AccessibilityInfo } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';

interface PulsingIndicatorProps {
  /** Size of the indicator in pixels */
  size?: number;
  /** Color of the indicator */
  color?: string;
  /** Whether animation is active */
  active?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export function PulsingIndicator({
  size = 12,
  color = colors.accent.action,
  active = true,
  accessibilityLabel = 'Processing',
}: PulsingIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      return;
    }

    // Check if user prefers reduced motion
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        // Simple opacity blink for reduced motion
        const blinkAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.4,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        blinkAnimation.start();
        return () => blinkAnimation.stop();
      }

      // Full pulse animation
      const pulseAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulseAnimation.start();
      return () => pulseAnimation.stop();
    });
  }, [active, scaleAnim, opacityAnim]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    // Base styles applied via inline props
  },
});
