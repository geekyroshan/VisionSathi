/**
 * VisionSathi - CameraView Component
 *
 * Camera preview with permission handling and overlay.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { Text, Button } from '@/components/ui';
import { useVisionStore } from '@/stores/visionStore';

interface CameraViewProps {
  /** Reference to camera for capture */
  cameraRef: React.RefObject<ExpoCameraView>;
  /** Called when camera is ready */
  onReady?: () => void;
}

export function CameraView({ cameraRef, onReady }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const setCameraReady = useVisionStore((state) => state.setCameraReady);

  useEffect(() => {
    if (isReady) {
      setCameraReady(true);
      onReady?.();
    }
    return () => setCameraReady(false);
  }, [isReady, setCameraReady, onReady]);

  // Permission not determined yet
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

  // Permission denied
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

  // Camera ready
  return (
    <View style={styles.cameraContainer}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />
      {/* Dimming overlay - 40% opacity as per design */}
      <View
        style={styles.overlay}
        pointerEvents="none"
        accessible={false}
      />
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent.action} />
        </View>
      )}
    </View>
  );
}

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
