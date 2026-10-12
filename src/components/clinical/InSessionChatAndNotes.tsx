import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { InSessionChatMessage, InSessionNote } from '../../types/teletherapy';

interface InSessionChatAndNotesProps {
  onClose: () => void;
  isSlpRole: boolean;
  notes: InSessionNote[];
  onAddNote: (noteText: string, category: InSessionNote['category']) => void;
  messages: InSessionChatMessage[];
  onSendMessage: (text: string, sticker?: InSessionChatMessage['reward_sticker']) => void;
  elapsedSeconds: number;
}

const QUICK_OBSERVATION_TAGS: { label: string; text: string; cat: InSessionNote['category'] }[] = [
  { label: '+ Clear /s/', text: 'Produced clear /s/ in initial word position', cat: 'accuracy' },
  { label: '+ Self-Corrected', text: 'Self-corrected sound placement upon repetition', cat: 'accuracy' },
  { label: '+ Tongue Retraction', text: 'Achieved proper tongue retraction with verbal cue', cat: 'cue' },
  { label: '+ Great Focus', text: 'Demonstrated high visual attention to flashcard prompt', cat: 'behavior' },
  { label: '+ Needed Model', text: 'Required clinician slow audio model to produce blend', cat: 'cue' },
];

export const InSessionChatAndNotes: React.FC<InSessionChatAndNotesProps> = ({
  onClose,
  isSlpRole,
  notes,
  onAddNote,
  messages,
  onSendMessage,
  elapsedSeconds,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>(isSlpRole ? 'notes' : 'chat');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendNote = () => {
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim(), 'observation');
    setNoteInput('');
  };

  const handleSendChat = (sticker?: InSessionChatMessage['reward_sticker']) => {
    if (sticker) {
      onSendMessage(sticker === 'star' ? '⭐ Star Awarded!' : '🎉 Great effort!', sticker);
      return;
    }
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {isSlpRole && (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
                Clinical Notes ({notes.length})
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              In-Call Chat ({messages.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Palette.slate600} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {activeTab === 'notes' && isSlpRole && (
          <View style={styles.tabContent}>
            {/* Quick shorthand chips */}
            <Text style={styles.sectionLabel}>Quick Clinical Shorthand:</Text>
            <View style={styles.tagsScroll}>
              {QUICK_OBSERVATION_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.label}
                  style={styles.tagChip}
                  onPress={() => onAddNote(tag.text, tag.cat)}
                >
                  <Text style={styles.tagText}>{tag.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* List of Captured Notes */}
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: Spacing.two }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="notebook-outline"
                    size={36}
                    color={Palette.slate300}
                  />
                  <Text style={styles.emptyText}>
                    No clinical notes recorded yet. Tap quick tags or type observations below.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.noteItem}>
                  <View style={styles.noteTimestampPill}>
                    <Text style={styles.noteTimestampText}>{item.timestamp}</Text>
                  </View>
                  <Text style={styles.noteContent}>{item.note}</Text>
                </View>
              )}
            />

            {/* Note input row */}
            <View style={styles.inputBar}>
              <View style={styles.timerBadge}>
                <Text style={styles.timerBadgeText}>{formatSeconds(elapsedSeconds)}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Log observation with timestamp..."
                placeholderTextColor={Palette.slate400}
                value={noteInput}
                onChangeText={setNoteInput}
                onSubmitEditing={handleSendNote}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !noteInput.trim() && styles.sendBtnDisabled]}
                onPress={handleSendNote}
                disabled={!noteInput.trim()}
              >
                <Ionicons name="arrow-up" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'chat' && (
          <View style={styles.tabContent}>
            {/* Rewards row (if clinician) */}
            {isSlpRole && (
              <View style={styles.cheerRow}>
                <Text style={styles.cheerLabel}>Send Child Reward:</Text>
                <TouchableOpacity
                  style={styles.cheerChip}
                  onPress={() => handleSendChat('star')}
                >
                  <Text style={styles.cheerChipText}>⭐ Star</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cheerChip}
                  onPress={() => handleSendChat('dino')}
                >
                  <Text style={styles.cheerChipText}>🦖 Dino</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cheerChip}
                  onPress={() => handleSendChat('balloon')}
                >
                  <Text style={styles.cheerChipText}>🎈 Balloon</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cheerChip}
                  onPress={() => handleSendChat('trophy')}
                >
                  <Text style={styles.cheerChipText}>🏆 Trophy</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Message List */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: Spacing.two }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={36} color={Palette.slate300} />
                  <Text style={styles.emptyText}>
                    In-call chat is encrypted. Use this to send written words or caregiver prompts.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isMe = isSlpRole ? item.sender_role === 'slp' : item.sender_role === 'parent';
                return (
                  <View style={[styles.messageBubbleWrap, isMe ? styles.wrapRight : styles.wrapLeft]}>
                    <Text style={styles.messageSender}>{item.sender_name}</Text>
                    <View style={[styles.messageBubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
                      <Text style={[styles.messageText, isMe ? styles.textRight : styles.textLeft]}>
                        {item.text}
                      </Text>
                    </View>
                    <Text style={styles.messageTime}>{item.timestamp}</Text>
                  </View>
                );
              }}
            />

            {/* Chat input */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Type message or target prompt..."
                placeholderTextColor={Palette.slate400}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => handleSendChat()}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !chatInput.trim() && styles.sendBtnDisabled]}
                onPress={() => handleSendChat()}
                disabled={!chatInput.trim()}
              >
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.slate100,
  },
  tabBtnActive: {
    backgroundColor: Palette.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate600,
  },
  tabTextActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  closeBtn: {
    padding: Spacing.one,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.three,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tagsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.two,
  },
  tagChip: {
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate300,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate700,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  emptyText: {
    fontSize: 12,
    color: Palette.slate400,
    textAlign: 'center',
    marginTop: Spacing.two,
    maxWidth: 240,
    lineHeight: 17,
  },
  noteItem: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  noteTimestampPill: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  noteTimestampText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  noteContent: {
    fontSize: 13,
    color: Palette.slate800,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.white,
    padding: Spacing.two,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginTop: Spacing.two,
  },
  timerBadge: {
    backgroundColor: Palette.slate100,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate600,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: Palette.slate900,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Palette.slate300,
  },
  cheerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.two,
  },
  cheerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  cheerChip: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cheerChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  messageBubbleWrap: {
    marginBottom: Spacing.two,
    maxWidth: '80%',
  },
  wrapLeft: {
    alignSelf: 'flex-start',
  },
  wrapRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageSender: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.slate400,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  messageBubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.lg,
  },
  bubbleLeft: {
    backgroundColor: Palette.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  bubbleRight: {
    backgroundColor: Palette.primary,
    borderBottomRightRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textLeft: {
    color: Palette.slate800,
  },
  textRight: {
    color: Palette.white,
  },
  messageTime: {
    fontSize: 9,
    color: Palette.slate400,
    marginTop: 2,
    marginHorizontal: 4,
  },
});
