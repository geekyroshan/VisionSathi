/**
 * VisionSathi - CaptureButton Component
 *
 * Circular glassmorphism action button with animated glow ring.
 * Uses react-native-reanimated for smooth glow and spin animations.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVisionStore } from '@/stores/visionStore';

interface CaptureButtonProps {
  /** Called on single tap */
  onPress: () => void;
  /** Called on long press (conversation mode) */
  onLongPress?: () => void;
  /** Called when long press ends */
  onLongPressOut?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

export function CaptureButton({
  onPress,
  onLongPress,
  onLongPressOut,
  style,
}: CaptureButtonProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);
  const processingState = useVisionStore((state) => state.processingState);

  const isProcessing = processingState === 'processing';
  const isListening = processingState === 'listening';

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const rotation = useSharedValue(0);

  // Pulsing glow animation based on state
  useEffect(() => {
    if (isProcessing) {
      // Spinning + fast pulse for processing
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.3, { duration: 600 })
        ),
        -1,
        true
      );
    } else if (isListening) {
      // Fast pulse for listening, no spin
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      );
      rotation.value = withTiming(0, { duration: 200 });
    } else {
      // Gentle breathing glow when idle
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 })
        ),
        -1,
        true
      );
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [isProcessing, isListening, rotation, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.3 }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Determine active colors based on state
  const activeColor = isProcessing
    ? colors.accent.warning
    : isListening
    ? colors.accent.listening
    : colors.accent.action;

  const activeGlow = isProcessing
    ? colors.glow.warning
    : isListening
    ? colors.glow.listening
    : colors.glow.action;

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    if (isListening) {
      onLongPressOut?.();
    }
  };

  const handlePress = () => {
    if (!isProcessing && !isListening) {
      triggerHaptic('tap', hapticEnabled);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!isProcessing) {
      triggerHaptic('heavy', hapticEnabled);
      onLongPress?.();
    }
  };

  return (
    <Animated.View style={[styles.wrapper, buttonAnimatedStyle, style]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          glowStyle,
          { backgroundColor: activeGlow, borderColor: activeColor },
        ]}
      />

      {/* Main button */}
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={500}
        disabled={isProcessing}
        style={[styles.button, { backgroundColor: activeColor }]}
        accessibilityRole="button"
        accessibilityLabel={
          isProcessing
            ? 'Processing image, please wait'
            : isListening
            ? 'Listening for your question'
            : 'Describe what you see'
        }
        accessibilityHint={
          isProcessing || isListening
            ? undefined
            : 'Tap to get a description. Hold to ask questions.'
        }
        accessibilityState={{
          busy: isProcessing || isListening,
        }}
      >
        {isProcessing ? (
          <Animated.View style={spinStyle}>
            <Ionicons
              name="sync"
              size={32}
              color={colors.background.primary}
            />
          </Animated.View>
        ) : (
          <Ionicons
            name={isListening ? 'mic' : 'eye'}
            size={32}
            color={colors.background.primary}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const BUTTON_SIZE = 80;
const GLOW_SIZE = BUTTON_SIZE + 24;

const styles = StyleSheet.create({
  wrapper: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    borderWidth: 2,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
