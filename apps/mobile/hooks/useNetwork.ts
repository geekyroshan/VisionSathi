/**
 * VisionSathi - Network Hook
 *
 * Monitors network connectivity and API availability.
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { checkHealth } from '@/services/api';
import { useVisionStore } from '@/stores/visionStore';
import type { ConnectionState } from '../../../packages/shared/types';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(false);
  const setConnectionState = useVisionStore((state) => state.setConnectionState);

  const checkApiHealth = useCallback(async () => {
    if (!isConnected) {
      setIsApiAvailable(false);
      setConnectionState('offline');
      return;
    }

    setConnectionState('checking');
    const available = await checkHealth();
    setIsApiAvailable(available);
    setConnectionState(available ? 'online' : 'offline');
  }, [isConnected, setConnectionState]);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check API health when network state changes
    if (isConnected !== null) {
      checkApiHealth();
    }
  }, [isConnected, checkApiHealth]);

  const refresh = useCallback(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  return {
    isConnected,
    isApiAvailable,
    connectionState: useVisionStore((state) => state.connectionState),
    refresh,
  };
}
