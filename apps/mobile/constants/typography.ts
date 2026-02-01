/**
 * VisionSathi Design System - Typography
 *
 * Uses system fonts for best accessibility and screen reader compatibility.
 * Sizes are larger than standard for low-vision users.
 */

import { Platform, TextStyle } from 'react-native';

// System font family
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headings
  headingLarge: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 40,
  } as TextStyle,

  heading: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.25,
    lineHeight: 32,
  } as TextStyle,

  headingSmall: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: 28,
  } as TextStyle,

  // Body text (larger than standard for accessibility)
  body: {
    fontFamily,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 26,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 24,
  } as TextStyle,

  // Labels and captions
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  } as TextStyle,

  // Button text
  button: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: 24,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.25,
    lineHeight: 20,
  } as TextStyle,
} as const;

export type TypographyToken = typeof typography;
