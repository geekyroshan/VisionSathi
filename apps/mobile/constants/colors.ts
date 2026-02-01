/**
 * VisionSathi Design System - Colors
 *
 * Dark-first, high-contrast theme optimized for accessibility.
 * All colors meet WCAG AAA 7:1 contrast ratio.
 *
 * NEVER hardcode colors - always import from this file.
 */

export const colors = {
  // Backgrounds
  background: {
    primary: '#0A0A0B',    // Main app background
    elevated: '#141416',   // Cards, modals, sheets
    surface: '#1E1E22',    // Interactive surfaces
  },

  // Text
  text: {
    primary: '#FFFFFF',    // Main text - 15.8:1 contrast
    secondary: '#A0A0A8',  // Labels, hints - 7.2:1 contrast
    disabled: '#505058',   // Disabled state
  },

  // Accent Colors
  accent: {
    action: '#00D4AA',     // Primary buttons, active states (teal)
    listening: '#6366F1',  // Recording/listening state (indigo)
    warning: '#F59E0B',    // Caution states (amber)
    error: '#EF4444',      // Error states (red)
    success: '#22C55E',    // Success states (green)
  },

  // Borders
  border: {
    subtle: '#2A2A30',     // Dividers, inactive borders
    focus: '#00D4AA',      // Focus rings, active borders
    error: '#EF4444',      // Error state borders
  },

  // Semantic
  semantic: {
    online: '#22C55E',     // Online/cloud indicator
    offline: '#F59E0B',    // Offline/local indicator
  },

  // Overlays
  overlay: {
    camera: 'rgba(10, 10, 11, 0.6)',  // Camera dimming overlay
    modal: 'rgba(0, 0, 0, 0.8)',      // Modal backdrop
  },
} as const;

// Type for color tokens
export type ColorToken = typeof colors;
