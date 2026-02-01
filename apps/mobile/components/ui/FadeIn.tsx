/**
 * VisionSathi - FadeIn Component
 *
 * Wrapper that fades in its children on mount.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, AccessibilityInfo } from 'react-native';

interface FadeInProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Duration of fade in milliseconds */
  duration?: number;
  /** Delay before starting animation */
  delay?: number;
  /** Optional style */
  style?: ViewStyle;
}

export function FadeIn({
  children,
  duration = 300,
  delay = 0,
  style,
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        // Instant show for reduced motion
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [opacity, translateY, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
