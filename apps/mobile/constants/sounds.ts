/**
 * VisionSathi Design System - Sounds
 *
 * Audio feedback for different interactions.
 * All sounds should respect user's sound preference setting.
 */

// Sound file references (to be added to assets/sounds/)
export const sounds = {
  // Capture action
  capture: require('../assets/sounds/capture.mp3'),

  // Processing indicator
  processing: require('../assets/sounds/processing.mp3'),

  // Success chime
  success: require('../assets/sounds/success.mp3'),

  // Error tone
  error: require('../assets/sounds/error.mp3'),

  // Listening started
  listeningStart: require('../assets/sounds/listening-start.mp3'),

  // Listening ended
  listeningEnd: require('../assets/sounds/listening-end.mp3'),
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
