import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../../constants/theme';
import { Header } from '../../components/Header';
import { MessagingScopeBanner } from '../../components/messaging/MessagingScopeBanner';
import { useAuth } from '../../lib/auth-context';
import { useEngagement } from '../../lib/engagement-store';
import { QUICK_INQUIRY_PROMPTS, SLP_QUICK_REPLIES } from '../../lib/engagement-mock';
import { formatClockTime } from '../../lib/time';
import { ChatMessage, MessageAttachment } from '../../types/engagement';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { threads, messages, sendMessage, markThreadRead } = useEngagement();
  const viewer: 'parent' | 'slp' = session?.role === 'slp' ? 'slp' : 'parent';

  const thread = threads.find((t) => t.id === id);
  const threadMessages = messages.filter((m) => m.threadId === id);

  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the thread marked read while it is open (including after simulated replies).
  useEffect(() => {
    if (id) markThreadRead(id, viewer);
  }, [id, viewer, threadMessages.length, markThreadRead]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [threadMessages.length, isTyping]);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  if (!thread) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack title="Conversation" />
        <View style={styles.missing}>
          <Text style={styles.missingText}>This conversation is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const counterpartName = viewer === 'parent' ? thread.slpName : thread.parentName;

  const send = (text: string, attachment?: MessageAttachment) => {
    const body = text.trim();
    if (!body && !attachment) return;
    sendMessage(thread.id, viewer, body, attachment);
    setDraft('');

    // Mock: simulate a short acknowledgement from the clinician so the demo feels live.
    if (viewer === 'parent') {
      setIsTyping(true);
      replyTimer.current = setTimeout(() => {
        setIsTyping(false);
        sendMessage(
          thread.id,
          'slp',
          `Thanks for the message! I'll get back to you within working hours (9 AM – 7 PM IST). — ${thread.slpName}`
        );
      }, 2200);
    }
  };

  const handleAttach = (kind: MessageAttachment['kind']) => {
    if (kind === 'photo') {
      Alert.alert('Share a photo', 'Choose a source (mock)', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => send('Shared a photo', { kind: 'photo', label: 'camera_capture.jpg' }) },
        { text: 'Gallery', onPress: () => send('Shared a photo', { kind: 'photo', label: 'practice_cards.jpg' }) },
      ]);
    } else {
      Alert.alert('Voice note', 'Record a short practice clip for your SLP? (mock)', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record 15s',
          onPress: () => send('Voice note: practice attempt', { kind: 'audio', label: 'voice_note.m4a', durationSec: 15 }),
        },
      ]);
    }
  };

  const quickPrompts = viewer === 'parent' ? QUICK_INQUIRY_PROMPTS : SLP_QUICK_REPLIES;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        showBack
        title={counterpartName}
        rightElement={
          viewer === 'parent' ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(parent)/slp/[id]', params: { id: thread.slpId } })}
              accessibilityLabel="View clinician profile"
            >
              <Ionicons name="person-circle-outline" size={24} color={Palette.primaryDark} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Patient context strip */}
      <View style={styles.contextStrip}>
        <Ionicons name="medkit-outline" size={14} color={Palette.primaryDark} />
        <Text style={styles.contextText} numberOfLines={1}>
          Patient: {thread.childName} · {thread.patientContext}
        </Text>
      </View>
      <MessagingScopeBanner compact />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
          {threadMessages.map((m) => (
            <Bubble key={m.id} message={m} mine={m.sender === viewer} />
          ))}
          {isTyping && (
            <View style={[styles.bubble, styles.theirs, styles.typing]}>
              <Text style={styles.typingText}>{thread.slpName} is typing…</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
          keyboardShouldPersistTaps="handled"
        >
          {quickPrompts.map((p) => (
            <TouchableOpacity key={p} style={styles.quickChip} onPress={() => send(p)}>
              <Text style={styles.quickText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleAttach('photo')} accessibilityLabel="Attach photo">
            <Ionicons name="camera-outline" size={22} color={Palette.slate600} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleAttach('audio')} accessibilityLabel="Record voice note">
            <Ionicons name="mic-outline" size={22} color={Palette.slate600} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={Palette.slate400}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && { opacity: 0.4 }]}
            disabled={!draft.trim()}
            onPress={() => send(draft)}
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={18} color={Palette.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  if (message.sender === 'system') {
    return (
      <View style={styles.systemRow}>
        <Ionicons name="lock-closed" size={11} color={Palette.slate400} />
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {message.attachment && (
        <View style={[styles.attachment, mine && { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Ionicons
            name={message.attachment.kind === 'photo' ? 'image-outline' : 'play-circle-outline'}
            size={18}
            color={mine ? Palette.white : Palette.primaryDark}
          />
          <Text style={[styles.attachmentText, mine && { color: Palette.white }]}>
            {message.attachment.label}
            {message.attachment.kind === 'audio' ? ` · 0:${String(message.attachment.durationSec).padStart(2, '0')}` : ''}
          </Text>
        </View>
      )}
      {!!message.text && <Text style={[styles.bubbleText, mine && { color: Palette.white }]}>{message.text}</Text>}
      <Text style={[styles.bubbleTime, mine && { color: 'rgba(255,255,255,0.75)' }]}>
        {formatClockTime(message.sentAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.slate50 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  missingText: { fontSize: 14, color: Palette.slate500 },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.four,
    paddingVertical: 6,
    backgroundColor: Palette.primaryLight,
  },
  contextText: { flex: 1, fontSize: 12, fontWeight: '600', color: Palette.primaryDark },
  messages: { padding: Spacing.three, paddingBottom: Spacing.two, gap: Spacing.two },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    maxWidth: '90%',
    paddingVertical: 4,
  },
  systemText: { fontSize: 11, color: Palette.slate400, textAlign: 'center' },
  bubble: { maxWidth: '80%', borderRadius: BorderRadius.lg, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: Palette.primary, borderBottomRightRadius: 4 },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderBottomLeftRadius: 4,
  },
  typing: { paddingVertical: 6 },
  typingText: { fontSize: 12, fontStyle: 'italic', color: Palette.slate500 },
  bubbleText: { fontSize: 14, color: Palette.slate800, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: Palette.slate400, marginTop: 4, alignSelf: 'flex-end' },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primaryLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
  },
  attachmentText: { fontSize: 12, fontWeight: '600', color: Palette.primaryDark },
  quickRow: { gap: 6, paddingHorizontal: Spacing.three, paddingVertical: 6 },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.secondary + '55',
    backgroundColor: Palette.secondaryLight,
  },
  quickText: { fontSize: 12, fontWeight: '600', color: Palette.secondary },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.slate100,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: Palette.slate900,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
