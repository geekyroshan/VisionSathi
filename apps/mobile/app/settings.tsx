/**
 * VisionSathi - Settings Screen
 *
 * User preferences for server, voice, processing, and accessibility.
 * Glassmorphism design with GlassCard sections.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';
import { checkHealth } from '@/services/api';
import { Text, GlassCard } from '@/components/ui';

type SpeedOption = 0.75 | 1.0 | 1.25;
type VerbosityOption = 'brief' | 'normal' | 'detailed';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore();

  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'untested' | 'connected' | 'failed'
  >('untested');

  const speedOptions: { value: SpeedOption; label: string }[] = [
    { value: 0.75, label: 'Slow' },
    { value: 1.0, label: 'Normal' },
    { value: 1.25, label: 'Fast' },
  ];

  const verbosityOptions: { value: VerbosityOption; label: string }[] = [
    { value: 'brief', label: 'Brief' },
    { value: 'normal', label: 'Normal' },
    { value: 'detailed', label: 'Detailed' },
  ];

  const handleSpeedChange = (speed: SpeedOption) => {
    triggerHaptic('selection', settings.hapticEnabled);
    settings.setSpeechSpeed(speed);
  };

  const handleVerbosityChange = (verbosity: VerbosityOption) => {
    triggerHaptic('selection', settings.hapticEnabled);
    settings.setVerbosity(verbosity);
  };

  const handleToggle = (
    setter: (value: boolean) => void,
    currentValue: boolean
  ) => {
    triggerHaptic('light', settings.hapticEnabled);
    setter(!currentValue);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('untested');
    try {
      const healthy = await checkHealth();
      setConnectionStatus(healthy ? 'connected' : 'failed');
    } catch {
      setConnectionStatus('failed');
    }
    setTesting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + layout.spacing.xl },
      ]}
    >
      {/* Server Section */}
      <View style={styles.section}>
        <Text variant="caption" color="secondary" style={styles.sectionTitle} accessibilityRole="header">
          SERVER
        </Text>

        <GlassCard intensity="medium" padding="medium">
          <View style={styles.settingItem}>
            <Text variant="body" style={styles.settingLabel}>
              Server URL
            </Text>
            <Text variant="caption" color="secondary" style={styles.settingDescription}>
              Your VisionSathi server address
            </Text>
            <TextInput
              style={styles.urlInput}
              value={settings.serverUrl || 'http://192.168.1.28:8000'}
              onChangeText={(url) => settings.setServerUrl(url)}
              placeholder="http://192.168.1.28:8000"
              placeholderTextColor={colors.text.disabled}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              accessibilityLabel="Server URL"
            />
          </View>

          <Pressable
            onPress={handleTestConnection}
            style={styles.testButton}
            accessibilityLabel="Test server connection"
            accessibilityRole="button"
          >
            {testing ? (
              <ActivityIndicator size="small" color={colors.accent.action} />
            ) : (
              <>
                <Ionicons
                  name={
                    connectionStatus === 'connected'
                      ? 'checkmark-circle'
                      : connectionStatus === 'failed'
                      ? 'close-circle'
                      : 'wifi'
                  }
                  size={20}
                  color={
                    connectionStatus === 'connected'
                      ? colors.accent.success
                      : connectionStatus === 'failed'
                      ? colors.accent.error
                      : colors.accent.action
                  }
                />
                <Text variant="body" style={styles.settingLabel}>
                  {connectionStatus === 'connected'
                    ? 'Connected'
                    : connectionStatus === 'failed'
                    ? 'Connection Failed'
                    : 'Test Connection'}
                </Text>
              </>
            )}
          </Pressable>
        </GlassCard>
      </View>

      {/* Voice Section */}
      <View style={styles.section}>
        <Text variant="caption" color="secondary" style={styles.sectionTitle} accessibilityRole="header">
          VOICE
        </Text>

        <GlassCard intensity="medium" padding="medium">
          <View style={styles.settingItem}>
            <Text variant="body" style={styles.settingLabel}>
              Speed
            </Text>
            <View style={styles.segmentedControl}>
              {speedOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSpeedChange(option.value)}
                  style={[
                    styles.segment,
                    settings.speechSpeed === option.value &&
                      styles.segmentActive,
                  ]}
                  accessibilityLabel={`${option.label} speed`}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: settings.speechSpeed === option.value,
                  }}
                >
                  <Text
                    variant="caption"
                    style={
                      settings.speechSpeed === option.value
                        ? styles.segmentTextActive
                        : styles.segmentText
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <Text variant="body" style={styles.settingLabel}>
              Verbosity
            </Text>
            <View style={styles.segmentedControl}>
              {verbosityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleVerbosityChange(option.value)}
                  style={[
                    styles.segment,
                    settings.verbosity === option.value &&
                      styles.segmentActive,
                  ]}
                  accessibilityLabel={`${option.label} verbosity`}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: settings.verbosity === option.value,
                  }}
                >
                  <Text
                    variant="caption"
                    style={
                      settings.verbosity === option.value
                        ? styles.segmentTextActive
                        : styles.segmentText
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Processing Section */}
      <View style={styles.section}>
        <Text variant="caption" color="secondary" style={styles.sectionTitle} accessibilityRole="header">
          PROCESSING
        </Text>

        <GlassCard intensity="medium" padding="none">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingLabel}>
                Prefer Offline
              </Text>
              <Text variant="caption" color="secondary" style={styles.settingDescription}>
                Use on-device AI even when online
              </Text>
            </View>
            <Switch
              value={settings.preferOffline}
              onValueChange={() =>
                handleToggle(settings.setPreferOffline, settings.preferOffline)
              }
              trackColor={{
                false: colors.border.subtle,
                true: colors.accent.action,
              }}
              thumbColor={colors.text.primary}
              accessibilityLabel="Prefer offline processing"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingLabel}>
                Cloud Fallback
              </Text>
              <Text variant="caption" color="secondary" style={styles.settingDescription}>
                Use cloud when offline mode fails
              </Text>
            </View>
            <Switch
              value={settings.cloudFallback}
              onValueChange={() =>
                handleToggle(settings.setCloudFallback, settings.cloudFallback)
              }
              trackColor={{
                false: colors.border.subtle,
                true: colors.accent.action,
              }}
              thumbColor={colors.text.primary}
              accessibilityLabel="Cloud fallback"
              accessibilityRole="switch"
            />
          </View>
        </GlassCard>
      </View>

      {/* Accessibility Section */}
      <View style={styles.section}>
        <Text variant="caption" color="secondary" style={styles.sectionTitle} accessibilityRole="header">
          ACCESSIBILITY
        </Text>

        <GlassCard intensity="medium" padding="none">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingLabel}>
                Haptic Feedback
              </Text>
              <Text variant="caption" color="secondary" style={styles.settingDescription}>
                Vibration on interactions
              </Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={() =>
                handleToggle(settings.setHapticEnabled, settings.hapticEnabled)
              }
              trackColor={{
                false: colors.border.subtle,
                true: colors.accent.action,
              }}
              thumbColor={colors.text.primary}
              accessibilityLabel="Haptic feedback"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingLabel}>
                Sound Effects
              </Text>
              <Text variant="caption" color="secondary" style={styles.settingDescription}>
                Audio cues for actions
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() =>
                handleToggle(settings.setSoundEnabled, settings.soundEnabled)
              }
              trackColor={{
                false: colors.border.subtle,
                true: colors.accent.action,
              }}
              thumbColor={colors.text.primary}
              accessibilityLabel="Sound effects"
              accessibilityRole="switch"
            />
          </View>
        </GlassCard>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text variant="caption" color="secondary" style={styles.sectionTitle} accessibilityRole="header">
          ABOUT
        </Text>

        <GlassCard intensity="light" padding="medium">
          <Text variant="body" style={styles.settingLabel}>
            VisionSathi
          </Text>
          <Text variant="caption" color="secondary" style={styles.settingDescription}>
            Version 1.0.0  --  Made with care for accessibility
          </Text>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: layout.screenPadding,
  },
  section: {
    marginBottom: layout.spacing.xl,
  },
  sectionTitle: {
    letterSpacing: 1,
    marginBottom: layout.spacing.sm,
    marginLeft: layout.spacing.xs,
  },
  settingItem: {
    marginBottom: layout.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.spacing.md,
    minHeight: layout.minTouchTarget,
  },
  settingInfo: {
    flex: 1,
    marginRight: layout.spacing.md,
  },
  settingLabel: {
    color: colors.text.primary,
  },
  settingDescription: {
    marginTop: layout.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginBottom: layout.spacing.md,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginHorizontal: layout.spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.glass.background,
    borderRadius: layout.borderRadius.md,
    padding: layout.spacing.xs,
    marginTop: layout.spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  segment: {
    flex: 1,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderRadius: layout.borderRadius.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accent.action,
  },
  segmentText: {
    ...typography.buttonSmall,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    ...typography.buttonSmall,
    color: colors.background.primary,
  },
  urlInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.glass.background,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    marginTop: layout.spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
    backgroundColor: colors.glass.background,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    minHeight: layout.minTouchTarget,
  },
});
