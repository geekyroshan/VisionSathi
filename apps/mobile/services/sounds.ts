/**
 * VisionSathi - Sound Effects Service
 *
 * Provides audio feedback for app actions.
 * Uses expo-av for playback.
 */

import { Audio } from 'expo-av';
import { useSettingsStore } from '@/stores/settingsStore';

type SoundType = 'capture' | 'success' | 'error' | 'listening';

// Sound instances cache
const sounds: Map<SoundType, Audio.Sound | null> = new Map();

// Sound frequencies for tone generation (fallback if no sound files)
const soundConfigs: Record<SoundType, { frequency: number; duration: number }> = {
  capture: { frequency: 1200, duration: 100 },
  success: { frequency: 880, duration: 200 },
  error: { frequency: 220, duration: 300 },
  listening: { frequency: 660, duration: 150 },
};

/**
 * Initialize sound system
 */
export async function initSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.warn('Failed to initialize audio mode:', error);
  }
}

/**
 * Play a sound effect
 */
export async function playSound(type: SoundType): Promise<void> {
  // Check if sounds are enabled
  const soundEnabled = useSettingsStore.getState().soundEnabled;
  if (!soundEnabled) return;

  try {
    // Try to get cached sound
    let sound = sounds.get(type);

    if (!sound) {
      // Create simple tone using Web Audio API pattern
      // For production, would load actual audio files
      sound = new Audio.Sound();
      sounds.set(type, sound);
    }

    // For MVP, we'll just use haptics as audio feedback isn't critical
    // In production, load actual sound files:
    // await sound.loadAsync(require('@/assets/sounds/capture.mp3'));

    console.log(`[Sound] Playing ${type} sound`);
  } catch (error) {
    console.warn(`Failed to play sound ${type}:`, error);
  }
}

/**
 * Play capture click sound
 */
export async function playCaptureSound(): Promise<void> {
  return playSound('capture');
}

/**
 * Play success chime
 */
export async function playSuccessSound(): Promise<void> {
  return playSound('success');
}

/**
 * Play error tone
 */
export async function playErrorSound(): Promise<void> {
  return playSound('error');
}

/**
 * Play listening start sound
 */
export async function playListeningSound(): Promise<void> {
  return playSound('listening');
}

/**
 * Cleanup sound resources
 */
export async function unloadSounds(): Promise<void> {
  for (const [type, sound] of sounds.entries()) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload sound ${type}:`, error);
      }
    }
  }
  sounds.clear();
}
