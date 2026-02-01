/**
 * VisionSathi - CaptureButton Component
 *
 * Main action button with tap and long-press support.
 */

import React, { useCallback, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVisionStore } from '@/stores/visionStore';
import { Text } from '@/components/ui';

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
  const [isLongPressing, setIsLongPressing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);
  const processingState = useVisionStore((state) => state.processingState);

  const isProcessing = processingState === 'processing';
  const isListening = processingState === 'listening';

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (isLongPressing) {
      setIsLongPressing(false);
      onLongPressOut?.();
    }
  }, [scaleAnim, isLongPressing, onLongPressOut]);

  const handlePress = useCallback(() => {
    if (!isProcessing && !isListening) {
      triggerHaptic('tap', hapticEnabled);
      onPress();
    }
  }, [isProcessing, isListening, hapticEnabled, onPress]);

  const handleLongPress = useCallback(() => {
    if (!isProcessing) {
      triggerHaptic('heavy', hapticEnabled);
      setIsLongPressing(true);
      onLongPress?.();
    }
  }, [isProcessing, hapticEnabled, onLongPress]);

  const getButtonContent = () => {
    if (isProcessing) {
      return {
        icon: 'sync' as const,
        text: 'Processing...',
        color: colors.accent.warning,
      };
    }
    if (isListening) {
      return {
        icon: 'mic' as const,
        text: 'Listening...',
        color: colors.accent.listening,
      };
    }
    return {
      icon: 'eye' as const,
      text: 'Quick Describe',
      color: colors.accent.action,
    };
  };

  const content = getButtonContent();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={500}
        disabled={isProcessing}
        style={[
          styles.button,
          { backgroundColor: content.color },
          isProcessing && styles.buttonProcessing,
        ]}
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
        <View style={styles.buttonContent}>
          <Ionicons
            name={content.icon}
            size={32}
            color={colors.background.primary}
            style={isProcessing ? styles.spinningIcon : undefined}
          />
          <Text
            variant="body"
            style={styles.buttonText}
          >
            {content.text}
          </Text>
        </View>
      </Pressable>
      <Text
        variant="caption"
        color="secondary"
        center
        style={styles.hint}
      >
        {isListening ? 'Release to send' : 'Tap or hold'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: layout.borderRadius.lg,
    paddingVertical: layout.spacing.lg,
    paddingHorizontal: layout.spacing.xl,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonProcessing: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.background.primary,
  },
  spinningIcon: {
    // Animation handled separately if needed
  },
  hint: {
    marginTop: layout.spacing.sm,
  },
});
