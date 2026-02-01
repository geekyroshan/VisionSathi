/**
 * VisionSathi - Expo Configuration
 *
 * Dynamic configuration that supports environment variables
 * for different build profiles (development, preview, production).
 */

import { ExpoConfig, ConfigContext } from 'expo/config';

// Get API URL from environment or use default
const API_URL = process.env.API_URL || 'http://localhost:8000';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'VisionSathi',
  slug: 'visionsathi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'visionsathi',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0B',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.roshankharel.visionsathi',
    infoPlist: {
      NSCameraUsageDescription:
        'VisionSathi needs camera access to describe what\'s around you.',
      NSSpeechRecognitionUsageDescription:
        'VisionSathi uses speech recognition for voice commands.',
      NSMicrophoneUsageDescription:
        'VisionSathi needs microphone access for voice commands.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0B',
    },
    package: 'com.roshankharel.visionsathi',
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
    versionCode: 1,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission:
          'VisionSathi needs camera access to describe what\'s around you.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission:
          'VisionSathi needs microphone access for voice commands.',
      },
    ],
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: API_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
  owner: 'roshankharel',
});
