/**
 * VisionSathi - Onboarding Screen
 *
 * A 3-screen onboarding flow for first-time users.
 * Screen 1: Welcome - app introduction
 * Screen 2: How it works - camera + voice instructions
 * Screen 3: Get Started - server setup + permissions
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';

import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { checkHealth } from '@/services/api';
import { Text, GlassCard, Button, Icon, FadeIn } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  icon: 'eye-outline' | 'camera-outline' | 'rocket-outline';
}

const PAGES: OnboardingPage[] = [
  {
    id: 'welcome',
    title: 'Welcome to VisionSathi',
    description:
      'Your AI-powered visual assistant. VisionSathi helps you see the world through voice descriptions, text reading, and navigation guidance -- all designed for accessibility.',
    icon: 'eye-outline',
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    description:
      'Point your camera at anything and tap to capture. VisionSathi will describe what it sees using AI. Long press to ask follow-up questions with your voice. Swipe to switch between describe, read, and navigate modes.',
    icon: 'camera-outline',
  },
  {
    id: 'get-started',
    title: 'Get Started',
    description:
      'Enter your VisionSathi server address below, then grant camera and microphone access to begin.',
    icon: 'rocket-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [serverUrl, setServerUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'untested' | 'connected' | 'failed'
  >('untested');

  const {
    hapticEnabled,
    setServerUrl: saveServerUrl,
    setHasCompletedOnboarding,
  } = useSettingsStore();

  const isLastPage = currentPage === PAGES.length - 1;

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goToNextPage = useCallback(() => {
    if (currentPage < PAGES.length - 1) {
      triggerHaptic('tap', hapticEnabled);
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    }
  }, [currentPage, hapticEnabled]);

  const handleTestConnection = useCallback(async () => {
    if (!serverUrl.trim()) return;

    setTestingConnection(true);
    setConnectionStatus('untested');
    saveServerUrl(serverUrl.trim());

    try {
      const healthy = await checkHealth();
      setConnectionStatus(healthy ? 'connected' : 'failed');
      triggerHaptic(healthy ? 'success' : 'error', hapticEnabled);
    } catch {
      setConnectionStatus('failed');
      triggerHaptic('error', hapticEnabled);
    }

    setTestingConnection(false);
  }, [serverUrl, hapticEnabled, saveServerUrl]);

  const handleGetStarted = useCallback(async () => {
    triggerHaptic('success', hapticEnabled);

    // Save server URL if provided
    if (serverUrl.trim()) {
      saveServerUrl(serverUrl.trim());
    }

    // Request camera permission
    await Camera.requestCameraPermissionsAsync();

    // Mark onboarding as complete
    setHasCompletedOnboarding(true);

    // Navigate to home
    router.replace('/');
  }, [serverUrl, hapticEnabled, saveServerUrl, setHasCompletedOnboarding, router]);

  const renderPage = useCallback(
    ({ item, index }: { item: OnboardingPage; index: number }) => {
      return (
        <View
          style={[styles.page, { width: SCREEN_WIDTH }]}
          accessibilityLabel={`Onboarding step ${index + 1} of ${PAGES.length}: ${item.title}`}
          accessibilityRole="text"
        >
          <FadeIn delay={100}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon
                  name={item.icon}
                  size="xlarge"
                  color="accent"
                  accessibilityLabel={item.title}
                />
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={200}>
            <Text
              variant="headingLarge"
              center
              style={styles.title}
              accessibilityRole="header"
            >
              {item.title}
            </Text>
          </FadeIn>

          <FadeIn delay={300}>
            <Text
              variant="body"
              color="secondary"
              center
              style={styles.description}
            >
              {item.description}
            </Text>
          </FadeIn>

          {/* Server setup on the last page */}
          {item.id === 'get-started' && (
            <FadeIn delay={400}>
              <View style={styles.serverSection}>
                <GlassCard intensity="medium" padding="medium">
                  <Text variant="bodySmall" color="secondary" style={styles.inputLabel}>
                    Server Address
                  </Text>
                  <TextInput
                    style={styles.urlInput}
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    placeholder="http://192.168.1.28:8000"
                    placeholderTextColor={colors.text.disabled}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                    onSubmitEditing={handleTestConnection}
                    accessibilityLabel="Server URL input"
                    accessibilityHint="Enter your VisionSathi server address"
                  />

                  <View style={styles.testRow}>
                    <Button
                      variant="secondary"
                      size="small"
                      onPress={handleTestConnection}
                      loading={testingConnection}
                      disabled={!serverUrl.trim()}
                      accessibilityLabel="Test server connection"
                      accessibilityHint="Tests if the server is reachable"
                      style={styles.testButton}
                    >
                      Test Connection
                    </Button>

                    {connectionStatus === 'connected' && (
                      <View style={styles.statusRow}>
                        <Icon name="checkmark-circle" size="small" color="success" />
                        <Text variant="caption" color="accent" style={styles.statusText}>
                          Connected
                        </Text>
                      </View>
                    )}

                    {connectionStatus === 'failed' && (
                      <View style={styles.statusRow}>
                        <Icon name="close-circle" size="small" color="error" />
                        <Text variant="caption" color="error" style={styles.statusText}>
                          Failed
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text variant="caption" color="secondary" style={styles.serverNote}>
                    You can change this later in Settings. Leave empty to use the default
                    server.
                  </Text>
                </GlassCard>
              </View>
            </FadeIn>
          )}
        </View>
      );
    },
    [serverUrl, testingConnection, connectionStatus, handleTestConnection]
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        accessibilityRole="adjustable"
        accessibilityLabel="Onboarding pages"
        accessibilityHint="Swipe left or right to navigate between pages"
      />

      {/* Page indicators */}
      <View style={styles.footer}>
        <View
          style={styles.indicators}
          accessibilityLabel={`Page ${currentPage + 1} of ${PAGES.length}`}
          accessibilityRole="text"
        >
          {PAGES.map((page, index) => (
            <View
              key={page.id}
              style={[
                styles.indicator,
                index === currentPage
                  ? styles.indicatorActive
                  : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <View style={styles.actionContainer}>
          {isLastPage ? (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleGetStarted}
              accessibilityLabel="Get Started"
              accessibilityHint="Complete onboarding and start using VisionSathi"
            >
              Get Started
            </Button>
          ) : (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={goToNextPage}
              accessibilityLabel="Next"
              accessibilityHint={`Go to page ${currentPage + 2} of ${PAGES.length}`}
            >
              Next
            </Button>
          )}
        </View>

        {/* Skip button (only on non-last pages) */}
        {!isLastPage && (
          <Button
            variant="ghost"
            size="small"
            onPress={handleGetStarted}
            accessibilityLabel="Skip onboarding"
            accessibilityHint="Skip the tutorial and start using VisionSathi"
            style={styles.skipButton}
          >
            Skip
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.xl,
  },
  iconContainer: {
    marginBottom: layout.spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.glass.backgroundStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: layout.spacing.md,
  },
  description: {
    paddingHorizontal: layout.spacing.md,
    marginBottom: layout.spacing.lg,
  },
  serverSection: {
    width: '100%',
    marginTop: layout.spacing.md,
  },
  inputLabel: {
    marginBottom: layout.spacing.sm,
  },
  urlInput: {
    color: colors.text.primary,
    backgroundColor: colors.glass.background,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    fontSize: 16,
    marginBottom: layout.spacing.sm,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.md,
    marginBottom: layout.spacing.sm,
  },
  testButton: {
    flex: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
  },
  statusText: {
    marginLeft: layout.spacing.xs,
  },
  serverNote: {
    marginTop: layout.spacing.xs,
  },
  footer: {
    paddingHorizontal: layout.spacing.xl,
    paddingBottom: layout.spacing.lg,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
    gap: layout.spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorActive: {
    backgroundColor: colors.accent.action,
    width: 28,
  },
  indicatorInactive: {
    backgroundColor: colors.border.subtle,
  },
  actionContainer: {
    marginBottom: layout.spacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
  },
});
