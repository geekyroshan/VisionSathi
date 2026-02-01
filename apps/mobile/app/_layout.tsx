/**
 * VisionSathi - Root Layout
 *
 * App-wide providers and navigation setup.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app is ready
    const prepare = async () => {
      // TODO: Load any required resources here
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

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
            headerShown: true,
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
