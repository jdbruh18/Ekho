import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../../constants/theme';
import { Header } from '../../components/Header';
import { MessagingScopeBanner } from '../../components/messaging/MessagingScopeBanner';
import { useAuth } from '../../lib/auth-context';
import { useEngagement } from '../../lib/engagement-store';
import { formatRelativeTime } from '../../lib/time';

export default function MessagesScreen() {
  const { session } = useAuth();
  const { threads, messages } = useEngagement();
  const viewer: 'parent' | 'slp' = session?.role === 'slp' ? 'slp' : 'parent';

  const rows = threads
    .map((t) => {
      const thread = messages.filter((m) => m.threadId === t.id);
      const last = thread[thread.length - 1];
      return { thread: t, last };
    })
    .sort((a, b) => (b.last?.sentAt ?? '').localeCompare(a.last?.sentAt ?? ''));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Messages" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <MessagingScopeBanner />

        {rows.map(({ thread, last }) => {
          const unread = viewer === 'parent' ? thread.unreadForParent : thread.unreadForSlp;
          const title = viewer === 'parent' ? thread.slpName : `${thread.parentName} (for ${thread.childName})`;
          const preview = last
            ? `${last.sender === viewer ? 'You: ' : ''}${last.attachment ? (last.attachment.kind === 'photo' ? '📷 ' : '🎤 ') : ''}${last.text}`
            : 'No messages yet';

          return (
            <TouchableOpacity
              key={thread.id}
              style={styles.row}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: '/messages/[id]', params: { id: thread.id } })}
              accessibilityLabel={`Conversation with ${title}${unread ? `, ${unread} unread` : ''}`}
            >
              {viewer === 'parent' && thread.slpAvatarUrl ? (
                <Image source={{ uri: thread.slpAvatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>{title.charAt(0)}</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.name, unread > 0 && styles.nameUnread]} numberOfLines={1}>
                    {title}
                  </Text>
                  {last && <Text style={styles.time}>{formatRelativeTime(last.sentAt)}</Text>}
                </View>
                <View style={styles.contextRow}>
                  <Ionicons name="person-circle-outline" size={12} color={Palette.primary} />
                  <Text style={styles.context} numberOfLines={1}>
                    {thread.childName} · {thread.patientContext}
                  </Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={[styles.preview, unread > 0 && styles.previewUnread]} numberOfLines={1}>
                    {preview}
                  </Text>
                  {unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={12} color={Palette.slate400} />
          <Text style={styles.secureText}>
            Conversations are visible only to the caregiver and the authorised SLP.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.slate50 },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.two,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Palette.slate200 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primaryMuted },
  avatarInitial: { fontSize: 18, fontWeight: '800', color: Palette.primaryDark },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: Palette.slate800 },
  nameUnread: { fontWeight: '800', color: Palette.slate900 },
  time: { fontSize: 11, color: Palette.slate400 },
  contextRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  context: { flex: 1, fontSize: 11, fontWeight: '600', color: Palette.primaryDark },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  preview: { flex: 1, fontSize: 13, color: Palette.slate500 },
  previewUnread: { color: Palette.slate800, fontWeight: '600' },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontSize: 11, fontWeight: '800', color: Palette.white },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.three },
  secureText: { flex: 1, fontSize: 11, color: Palette.slate400 },
});
