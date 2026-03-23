/**
 * VisionSathi - Root Layout
 *
 * App-wide providers and navigation setup.
 * Conditionally routes to onboarding for first-time users.
 */

import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/stores/settingsStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);
  const hasCompletedOnboarding = useSettingsStore(
    (state) => state.hasCompletedOnboarding
  );

  // Track when the navigation is ready
  useEffect(() => {
    if (navigationState?.key) {
      setIsLayoutMounted(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    // Hide splash screen after app is ready
    const prepare = async () => {
      // TODO: Load any required resources here
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  useEffect(() => {
    // Don't navigate until the root layout is mounted
    if (!isLayoutMounted) return;

    // Redirect to onboarding if not completed, or away from it if completed
    const currentSegment = segments[0];

    if (!hasCompletedOnboarding && (currentSegment as string) !== 'onboarding') {
      router.replace('/onboarding' as any);
    } else if (hasCompletedOnboarding && (currentSegment as string) === 'onboarding') {
      router.replace('/');
    }
  }, [hasCompletedOnboarding, segments, router, isLayoutMounted]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'VisionSathi',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            title: 'Welcome',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'History',
          }}
        />
      </Stack>
    </>
  );
}
