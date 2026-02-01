/**
 * VisionSathi Design System - Sounds
 *
 * Audio feedback for different interactions.
 * All sounds should respect user's sound preference setting.
 */

// Sound file references - placeholder until actual sound files are added
// Sound files can be added later to assets/sounds/
export const sounds = {
  // Capture action
  capture: null,

  // Processing indicator
  processing: null,

  // Success chime
  success: null,

  // Error tone
  error: null,

  // Listening started
  listeningStart: null,

  // Listening ended
  listeningEnd: null,
} as const;

// Note: Sound files need to be created/added
// Placeholder exports until assets are ready
export const soundConfig = {
  capture: {
    volume: 0.5,
    duration: 100, // ms
  },
  processing: {
    volume: 0.3,
    loop: true,
  },
  success: {
    volume: 0.6,
    duration: 300,
  },
  error: {
    volume: 0.7,
    duration: 400,
  },
  listeningStart: {
    volume: 0.5,
    duration: 200,
  },
  listeningEnd: {
    volume: 0.4,
    duration: 150,
  },
} as const;
