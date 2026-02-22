/**
 * VisionSathi - History Screen
 *
 * View past conversation sessions with replay and delete.
 * Glassmorphism design with GlassCard session cards and date grouping.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { layout } from '@/constants';
import { triggerHaptic } from '@/constants/haptics';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from '@/hooks/useTTS';
import { Text, GlassCard, FadeIn } from '@/components/ui';

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;
type HistorySession = HistoryStoreState['sessions'][0];

interface DateGroup {
  type: 'header';
  title: string;
  id: string;
}

interface SessionItem {
  type: 'session';
  session: HistorySession;
  id: string;
}

type ListItem = DateGroup | SessionItem;

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const getDateLabel = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group sessions by date
  const groupedItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    let lastGroup = '';

    sessions.forEach((session) => {
      const group = getDateLabel(session.timestamp);
      if (group !== lastGroup) {
        items.push({
          type: 'header',
          title: group,
          id: `header-${group}`,
        });
        lastGroup = group;
      }
      items.push({
        type: 'session',
        session,
        id: session.id,
      });
    });

    return items;
  }, [sessions]);

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.dateHeader} accessibilityRole="header">
          <Text variant="caption" color="secondary" style={styles.dateHeaderText}>
            {item.title}
          </Text>
          <View style={styles.dateHeaderLine} />
        </View>
      );
    }

    const session = item.session;
    const lastMessage = session.messages[session.messages.length - 1];
    const preview = lastMessage?.content.slice(0, 100) || 'No content';

    return (
      <FadeIn delay={index * 50}>
        <GlassCard intensity="medium" padding="medium" style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionMeta}>
              <Text variant="caption" color="secondary">
                {formatTime(session.timestamp)}
              </Text>
              <View style={styles.modeTag}>
                <Text variant="caption" color="secondary">
                  {session.mode}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleDelete(session.id)}
              hitSlop={12}
              style={styles.deleteButton}
              accessibilityLabel="Delete session"
              accessibilityRole="button"
              accessibilityHint="Double tap to permanently delete this conversation"
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
              accessibilityHint="Double tap to hear the response again"
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name="play"
                  size={14}
                  color={colors.accent.action}
                />
              </View>
              <Text variant="caption" color="accent">
                Replay
              </Text>
            </Pressable>

            <Text variant="caption" color="secondary">
              {session.messages.length} messages
            </Text>
          </View>
        </GlassCard>
      </FadeIn>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="chatbubbles-outline"
          size={64}
          color={colors.text.secondary}
        />
      </View>
      <Text variant="heading" style={styles.emptyTitle}>
        No conversations yet
      </Text>
      <Text variant="body" color="secondary" center>
        Your conversation history will appear here after you start using
        VisionSathi.
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
        data={groupedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + layout.spacing.xl },
        ]}
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
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: layout.screenPadding,
    paddingTop: 0,
    flexGrow: 1,
  },

  // Date grouping
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
    marginTop: layout.spacing.md,
    marginBottom: layout.spacing.sm,
  },
  dateHeaderText: {
    letterSpacing: 0.5,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.border,
  },

  // Session card
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
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: layout.borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  deleteButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopColor: colors.glass.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
    minHeight: 44,
    paddingVertical: layout.spacing.xs,
  },
  actionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderWidth: 1,
    borderColor: colors.glow.action,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: layout.spacing.lg,
    marginBottom: layout.spacing.sm,
  },
});
