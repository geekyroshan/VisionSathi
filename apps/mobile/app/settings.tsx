/**
 * VisionSathi - Settings Screen
 *
 * User preferences for voice, processing, and accessibility.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useSettingsStore } from '@/stores/settingsStore';

type SpeedOption = 0.75 | 1.0 | 1.25;
type VerbosityOption = 'brief' | 'normal' | 'detailed';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Voice Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          VOICE
        </Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Speed</Text>
          <View style={styles.segmentedControl}>
            {speedOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSpeedChange(option.value)}
                style={[
                  styles.segment,
                  settings.speechSpeed === option.value && styles.segmentActive,
                ]}
                accessibilityLabel={`${option.label} speed`}
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.speechSpeed === option.value }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.speechSpeed === option.value && styles.segmentTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Verbosity</Text>
          <View style={styles.segmentedControl}>
            {verbosityOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleVerbosityChange(option.value)}
                style={[
                  styles.segment,
                  settings.verbosity === option.value && styles.segmentActive,
                ]}
                accessibilityLabel={`${option.label} verbosity`}
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.verbosity === option.value }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.verbosity === option.value && styles.segmentTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Processing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          PROCESSING
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Prefer Offline</Text>
            <Text style={styles.settingDescription}>
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

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cloud Fallback</Text>
            <Text style={styles.settingDescription}>
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
      </View>

      {/* Accessibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          ACCESSIBILITY
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingDescription}>
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

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Text style={styles.settingDescription}>
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
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          ABOUT
        </Text>

        <View style={styles.aboutItem}>
          <Text style={styles.settingLabel}>VisionSathi</Text>
          <Text style={styles.settingDescription}>
            Version 1.0.0 • Made with care for accessibility
          </Text>
        </View>
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
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: layout.spacing.md,
    letterSpacing: 1,
  },
  settingItem: {
    marginBottom: layout.spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    marginBottom: layout.spacing.sm,
    minHeight: layout.minTouchTarget,
  },
  settingInfo: {
    flex: 1,
    marginRight: layout.spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: layout.spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.background.elevated,
    borderRadius: layout.borderRadius.md,
    padding: layout.spacing.xs,
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
    color: colors.background.primary,
  },
  aboutItem: {
    backgroundColor: colors.background.elevated,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
  },
});
