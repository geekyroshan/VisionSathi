/**
 * VisionSathi - Button Component
 *
 * Accessible button with haptic feedback and multiple variants.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button text */
  children: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Custom style override */
  style?: ViewStyle;
  /** Custom text style override */
  textStyle?: TextStyle;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: colors.accent.action,
    },
    text: {
      color: colors.background.primary,
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    text: {
      color: colors.text.primary,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: colors.accent.action,
    },
  },
  danger: {
    container: {
      backgroundColor: colors.accent.error,
    },
    text: {
      color: colors.text.primary,
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  small: {
    container: {
      paddingVertical: layout.spacing.sm,
      paddingHorizontal: layout.spacing.md,
      minHeight: 44,
    },
    text: {
      ...typography.buttonSmall,
    },
  },
  medium: {
    container: {
      paddingVertical: layout.spacing.md,
      paddingHorizontal: layout.spacing.lg,
      minHeight: layout.minTouchTarget,
    },
    text: {
      ...typography.button,
    },
  },
  large: {
    container: {
      paddingVertical: layout.spacing.lg,
      paddingHorizontal: layout.spacing.xl,
      minHeight: 72,
    },
    text: {
      ...typography.button,
      fontSize: 20,
    },
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: ButtonProps) {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handlePress = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        triggerHaptic('tap', hapticEnabled);
        onPress?.(event);
      }
    },
    [disabled, loading, hapticEnabled, onPress]
  );

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        sizeStyles[size].container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles[variant].text.color}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              variantStyles[variant].text,
              sizeStyles[size].text,
              leftIcon ? styles.textWithLeftIcon : undefined,
              rightIcon ? styles.textWithRightIcon : undefined,
              isDisabled ? styles.disabledText : undefined,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.borderRadius.md,
    gap: layout.spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: layout.spacing.xs,
  },
  textWithRightIcon: {
    marginRight: layout.spacing.xs,
  },
  disabledText: {
    color: colors.text.disabled,
  },
});
