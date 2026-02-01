/**
 * VisionSathi - History Screen
 *
 * View past conversation sessions.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { layout } from '@/constants';

// Placeholder data - will be replaced with actual storage
const placeholderSessions = [
  {
    id: '1',
    date: '2026-02-01',
    time: '14:30',
    preview: 'A wooden door is open ahead...',
    messageCount: 3,
  },
  {
    id: '2',
    date: '2026-02-01',
    time: '10:15',
    preview: 'I see a crosswalk with...',
    messageCount: 5,
  },
];

export default function HistoryScreen() {
  const renderSession = ({ item }: { item: typeof placeholderSessions[0] }) => (
    <Pressable
      style={styles.sessionCard}
      accessibilityLabel={`Conversation from ${item.date} at ${item.time}. ${item.preview}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view conversation details"
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{item.date}</Text>
        <Text style={styles.sessionTime}>{item.time}</Text>
      </View>
      <Text style={styles.sessionPreview} numberOfLines={2}>
        {item.preview}
      </Text>
      <View style={styles.sessionFooter}>
        <Ionicons
          name="chatbubbles-outline"
          size={16}
          color={colors.text.secondary}
        />
        <Text style={styles.messageCount}>{item.messageCount} messages</Text>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={colors.text.secondary}
      />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptyDescription}>
        Your conversation history will appear here after you start using VisionSathi.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={placeholderSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: layout.screenPadding,
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: layout.borderRadius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: layout.spacing.sm,
  },
  sessionDate: {
    ...typography.label,
    color: colors.accent.action,
  },
  sessionTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  sessionPreview: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: layout.spacing.sm,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.xs,
  },
  messageCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text.primary,
    marginTop: layout.spacing.lg,
    marginBottom: layout.spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
