/**
 * VisionSathi - CameraView Component
 *
 * Camera preview with permission handling.
 * Falls back to image picker when camera capture produces black frames
 * (common on Android emulators).
 */

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { Text, Button } from '@/components/ui';
import { useVisionStore } from '@/stores/visionStore';

export interface CameraHandle {
  /** Take a picture — uses camera HAL, falls back to image picker if black */
  takePicture: () => Promise<{ base64: string; width: number; height: number } | null>;
}

interface CameraViewProps {
  onReady?: () => void;
}

// Minimum base64 length for a non-black 1080p JPEG (approx 100KB)
const MIN_VALID_BASE64_LENGTH = 130_000;

export const CameraView = forwardRef<CameraHandle, CameraViewProps>(
  function CameraView({ onReady }, ref) {
    const [permission, requestPermission] = useCameraPermissions();
    const [isReady, setIsReady] = useState(false);
    const setCameraReady = useVisionStore((state) => state.setCameraReady);
    const cameraRef = useRef<ExpoCameraView>(null);

    /** Pick an image from gallery as fallback */
    const pickImage = async (): Promise<{ base64: string; width: number; height: number } | null> => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.9,
          base64: true,
          allowsEditing: false,
        });

        if (result.canceled || !result.assets?.[0]?.base64) return null;

        const asset = result.assets[0];
        console.log(`[VisionSathi] Picked image: ${asset.width}x${asset.height}, base64: ${asset.base64!.length} chars`);
        return {
          base64: asset.base64!,
          width: asset.width,
          height: asset.height,
        };
      } catch (error) {
        console.error('[VisionSathi] Image picker failed:', error);
        return null;
      }
    };

    useImperativeHandle(ref, () => ({
      takePicture: async () => {
        if (!cameraRef.current || !isReady) {
          console.warn('[VisionSathi] Camera not ready, opening image picker');
          return pickImage();
        }
        try {
          // Small delay to ensure camera pipeline is ready
          await new Promise(resolve => setTimeout(resolve, 300));

          const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
            base64: true,
          });

          if (!photo?.base64) {
            console.warn('[VisionSathi] No photo data, opening image picker');
            return pickImage();
          }

          console.log(`[VisionSathi] Captured: ${photo.width}x${photo.height}, base64: ${photo.base64.length} chars`);

          // Detect likely-black emulator frame by checking base64 size
          // Real photos are typically > 100KB base64, emulator black frames are ~30-50KB
          if (photo.base64.length < MIN_VALID_BASE64_LENGTH) {
            console.log('[VisionSathi] Capture likely black (emulator issue), opening image picker');
            return pickImage();
          }

          return { base64: photo.base64, width: photo.width, height: photo.height };
        } catch (error) {
          console.error('[VisionSathi] takePicture failed:', error);
          return pickImage();
        }
      },
    }), [isReady]);

    useEffect(() => {
      if (isReady) {
        setCameraReady(true);
        onReady?.();
      }
      return () => setCameraReady(false);
    }, [isReady, setCameraReady, onReady]);

    if (!permission) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.accent.action} />
          <Text variant="body" color="secondary" style={styles.statusText}>
            Checking camera permission...
          </Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text variant="heading" center style={styles.permissionTitle}>
            Camera Access Needed
          </Text>
          <Text variant="body" color="secondary" center style={styles.permissionText}>
            VisionSathi needs camera access to describe what's around you.
          </Text>
          <Button
            onPress={requestPermission}
            accessibilityLabel="Grant camera permission"
            accessibilityHint="Opens system dialog to allow camera access"
          >
            Enable Camera
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <ExpoCameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setIsReady(true)}
        />
        <View style={styles.overlay} pointerEvents="none" accessible={false} />
        {!isReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent.action} />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.xl,
    backgroundColor: colors.background.elevated,
    borderRadius: layout.borderRadius.lg,
    gap: layout.spacing.lg,
  },
  statusText: {
    marginTop: layout.spacing.md,
  },
  permissionTitle: {
    marginBottom: layout.spacing.sm,
  },
  permissionText: {
    marginBottom: layout.spacing.lg,
    paddingHorizontal: layout.spacing.md,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: layout.borderRadius.lg,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.camera,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
