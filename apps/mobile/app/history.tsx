/**
 * VisionSathi - History Screen
 *
 * View past conversation sessions with replay and delete.
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from '@/hooks/useTTS';
import { Text, Card, FadeIn } from '@/components/ui';

export default function HistoryScreen() {
  const router = useRouter();
  const { sessions, deleteSession, clearHistory } = useHistoryStore();
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);
  const { speak } = useTTS();

  const handleBack = useCallback(() => {
    triggerHaptic('light', hapticEnabled);
    router.back();
  }, [hapticEnabled, router]);

  const handleReplay = useCallback(
    (text: string) => {
      triggerHaptic('light', hapticEnabled);
      speak(text);
    },
    [hapticEnabled, speak]
  );

  const handleDelete = useCallback(
    (id: string) => {
      triggerHaptic('light', hapticEnabled);
      Alert.alert(
        'Delete Session',
        'Are you sure you want to delete this conversation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteSession(id),
          },
        ]
      );
    },
    [hapticEnabled, deleteSession]
  );

  const handleClearAll = useCallback(() => {
    triggerHaptic('heavy', hapticEnabled);
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  }, [hapticEnabled, clearHistory]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString();
  };

  const renderSession = ({
    item,
    index,
  }: {
    item: (typeof sessions)[0];
    index: number;
  }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    const preview = lastMessage?.content.slice(0, 100) || 'No content';

    return (
      <FadeIn delay={index * 50}>
        <Card variant="elevated" padding="medium" style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionMeta}>
              <Text variant="caption" color="secondary">
                {formatDate(item.timestamp)}
              </Text>
              <View style={styles.modeTag}>
                <Text variant="caption" color="secondary">
                  {item.mode}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id)}
              hitSlop={12}
              accessibilityLabel="Delete session"
              accessibilityRole="button"
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.text.secondary}
              />
            </Pressable>
          </View>

          <Text variant="body" numberOfLines={3} style={styles.preview}>
            {preview}
          </Text>

          <View style={styles.sessionActions}>
            <Pressable
              onPress={() => handleReplay(lastMessage?.content || '')}
              style={styles.actionButton}
              accessibilityLabel="Replay response"
              accessibilityRole="button"
            >
              <Ionicons
                name="play-circle-outline"
                size={20}
                color={colors.accent.action}
              />
              <Text variant="caption" color="accent">
                Replay
              </Text>
            </Pressable>

            <Text variant="caption" color="secondary">
              {item.messages.length} messages
            </Text>
          </View>
        </Card>
      </FadeIn>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={colors.text.secondary}
      />
      <Text variant="heading" style={styles.emptyTitle}>
        No conversations yet
      </Text>
      <Text variant="body" color="secondary" center>
        Your conversation history will appear here after you start using VisionSathi.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
        <Text variant="heading" accessibilityRole="header">
          History
        </Text>
        {sessions.length > 0 ? (
          <Pressable
            onPress={handleClearAll}
            style={styles.clearButton}
            accessibilityLabel="Clear all history"
            accessibilityRole="button"
          >
            <Text variant="caption" color="secondary">
              Clear
            </Text>
          </Pressable>
        ) : (
          <View style={styles.clearButton} />
        )}
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: layout.spacing.sm,
    height: layout.headerHeight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: layout.screenPadding,
    paddingTop: 0,
    flexGrow: 1,
  },
  sessionCard: {
    marginBottom: layout.spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.sm,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
  },
  modeTag: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: layout.borderRadius.sm,
  },
  preview: {
    marginBottom: layout.spacing.md,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.spacing.xl,
  },
  emptyTitle: {
    marginTop: layout.spacing.lg,
    marginBottom: layout.spacing.sm,
  },
});
