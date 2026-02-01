/**
 * VisionSathi - Camera Hook
 *
 * Camera permission, capture, and frame processing.
 */

import { useCallback, useRef, useState } from 'react';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useVisionStore } from '@/stores/visionStore';

interface CaptureOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const DEFAULT_OPTIONS: CaptureOptions = {
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
};

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  const { setCameraReady, captureFrame } = useVisionStore();

  const requestPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const onCameraReady = useCallback(() => {
    setIsReady(true);
    setCameraReady(true);
  }, [setCameraReady]);

  const capture = useCallback(
    async (options: CaptureOptions = {}) => {
      if (!cameraRef.current || !isReady) {
        throw new Error('Camera not ready');
      }

      const opts = { ...DEFAULT_OPTIONS, ...options };

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: opts.quality,
        base64: true,
        exif: false,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      // Resize if needed
      let base64 = photo.base64;

      if (photo.width > opts.maxWidth! || photo.height > opts.maxHeight!) {
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [
            {
              resize: {
                width: opts.maxWidth,
                height: opts.maxHeight,
              },
            },
          ],
          {
            compress: opts.quality,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
        base64 = manipulated.base64 || base64;
      }

      // Store in state
      captureFrame(base64);

      return base64;
    },
    [isReady, captureFrame]
  );

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  return {
    cameraRef,
    hasPermission,
    isReady,
    facing,
    requestPermission,
    onCameraReady,
    capture,
    toggleFacing,
  };
}
