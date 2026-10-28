import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { useAuth } from '../../lib/auth-context';
import { useEngagement } from '../../lib/engagement-store';
import { MOCK_COACHING_TIPS, MOCK_HOME_EXERCISES } from '../../lib/engagement-mock';
import { MOCK_CHILDREN } from '../../lib/mock-data';
import { CueingLevel, HomePracticeExercise } from '../../types/engagement';

const CUEING_META: Record<CueingLevel, { label: string; variant: 'success' | 'info' | 'warning' | 'danger'; hint: string }> = {
  independent: { label: 'Independent', variant: 'success', hint: 'Let your child try on their own.' },
  minimal_cueing: { label: 'Minimal cueing', variant: 'info', hint: 'Give a gentle reminder only if needed.' },
  moderate_cueing: { label: 'Moderate cueing', variant: 'warning', hint: 'Model the sound first, then let them copy.' },
  maximal_prompting: { label: 'Full support', variant: 'danger', hint: 'Say it together — model every attempt.' },
};

export default function HomePracticeScreen() {
  const { children: authChildren, activeChild } = useAuth();
  const { isDoneToday, markDoneToday, getStreak } = useEngagement();

  const childOptions = authChildren.length > 0 ? authChildren : MOCK_CHILDREN;
  const [childId, setChildId] = useState<string>(activeChild?.id ?? childOptions[0]?.id ?? '');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const child = childOptions.find((c) => c.id === childId) ?? childOptions[0];
  const exercises = useMemo(() => MOCK_HOME_EXERCISES.filter((e) => e.childId === child?.id), [child?.id]);
  const tips = useMemo(() => MOCK_COACHING_TIPS.filter((t) => t.childId === child?.id), [child?.id]);

  const doneCount = exercises.filter((e) => isDoneToday(e.id)).length;
  const streak = child ? getStreak(child.id) : 0;
  const allDone = exercises.length > 0 && doneCount === exercises.length;

  const handleMarkDone = (ex: HomePracticeExercise) => {
    const firstToday = doneCount === 0;
    markDoneToday(ex.id);
    if (firstToday) {
      Alert.alert('Practice logged 🎉', `Great work! ${child?.first_name}'s streak is now ${streak + 1} day(s).`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Home Practice" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Child selector */}
        {childOptions.length > 1 && (
          <View style={styles.childRow}>
            {childOptions.map((c) => {
              const active = c.id === child?.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.childChip, active && styles.childChipActive]}
                  onPress={() => setChildId(c.id)}
                >
                  <Ionicons name="happy-outline" size={14} color={active ? Palette.white : Palette.primaryDark} />
                  <Text style={[styles.childChipText, active && { color: Palette.white }]}>{c.first_name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Streak + today summary */}
        <Card variant="elevated" style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <MaterialCommunityIcons name="fire" size={32} color={Palette.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakNumber}>
              {streak} day{streak === 1 ? '' : 's'}
            </Text>
            <Text style={styles.streakLabel}>Practice streak for {child?.first_name}</Text>
          </View>
          <View style={styles.todayBox}>
            <Text style={styles.todayNumber}>
              {doneCount}/{exercises.length}
            </Text>
            <Text style={styles.todayLabel}>today</Text>
          </View>
        </Card>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${exercises.length ? (doneCount / exercises.length) * 100 : 0}%` },
            ]}
          />
        </View>
        {allDone && (
          <Text style={styles.allDoneText}>All of today&apos;s activities are done — wonderful teamwork!</Text>
        )}

        {/* Exercises */}
        <Text style={styles.sectionHeader}>Today&apos;s activities</Text>
        {exercises.length === 0 && (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No home practice assigned yet. Your SLP will add activities after your next session.
            </Text>
          </Card>
        )}

        {exercises.map((ex) => {
          const done = isDoneToday(ex.id);
          const cue = CUEING_META[ex.cueingLevel];
          const expanded = expandedId === ex.id;
          return (
            <Card key={ex.id} variant="elevated" style={[styles.exCard, done && styles.exCardDone]}>
              <TouchableOpacity onPress={() => setExpandedId(expanded ? null : ex.id)} activeOpacity={0.8}>
                <View style={styles.exHeader}>
                  <View style={styles.soundBubble}>
                    <Text style={styles.soundBubbleText}>{ex.targetSound}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exTitle}>{ex.title}</Text>
                    <Text style={styles.exMeta}>
                      {ex.repetitions} · {ex.durationMinutes} min · {ex.frequency}
                    </Text>
                  </View>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Palette.slate400} />
                </View>
              </TouchableOpacity>

              <View style={styles.badgeRow}>
                <Badge label={cue.label} variant={cue.variant} size="sm" />
                <Text style={styles.cueHint}>{cue.hint}</Text>
              </View>

              {/* Word list with visual phonetic cues */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wordRow}>
                {ex.words.map((w) => (
                  <View key={w.word} style={styles.wordCard}>
                    <Text style={styles.wordEmoji}>{w.emoji}</Text>
                    <Text style={styles.wordText}>{w.word}</Text>
                    <Text style={styles.wordPhonetic}>{w.phonetic}</Text>
                  </View>
                ))}
              </ScrollView>

              {expanded && (
                <View style={styles.expandedBox}>
                  <Text style={styles.exDesc}>{ex.description}</Text>
                  <Text style={styles.promptHeader}>Practice prompts</Text>
                  {ex.prompts.map((p) => (
                    <View key={p} style={styles.promptRow}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={Palette.primary} />
                      <Text style={styles.promptText}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Button
                title={done ? 'Done today ✓' : 'Mark Done Today'}
                size="md"
                variant={done ? 'outline' : 'primary'}
                disabled={done}
                leftIcon={
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'checkbox-outline'}
                    size={16}
                    color={done ? Palette.success : Palette.white}
                  />
                }
                onPress={() => handleMarkDone(ex)}
                style={{ marginTop: Spacing.two }}
              />
            </Card>
          );
        })}

        {/* Coaching tips */}
        {tips.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Coaching tips from your SLP</Text>
            {tips.map((t) => (
              <Card key={t.id} variant="subtle" style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb-outline" size={16} color={Palette.purple} />
                  <Text style={styles.tipTitle}>{t.title}</Text>
                </View>
                <Text style={styles.tipBody}>{t.body}</Text>
                <Text style={styles.tipAuthor}>— {t.slpName}</Text>
              </Card>
            ))}
          </>
        )}

        <Button
          title="Ask your SLP a question"
          variant="ghost"
          size="md"
          leftIcon={<Ionicons name="chatbubbles-outline" size={16} color={Palette.primary} />}
          onPress={() => router.push('/messages')}
          style={{ marginTop: Spacing.two }}
        />

        <Text style={styles.clinicalNote}>
          Activities are assigned by your treating SLP. Logging practice helps them plan sessions; it is not a
          diagnosis or a guarantee of progress.
        </Text>
        <DisclaimerBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.slate50 },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  childRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
    backgroundColor: Palette.primaryLight,
  },
  childChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  childChipText: { fontSize: 13, fontWeight: '700', color: Palette.primaryDark },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: { fontSize: 24, fontWeight: '800', color: Palette.slate900 },
  streakLabel: { fontSize: 12, color: Palette.slate500, marginTop: 2 },
  todayBox: {
    alignItems: 'center',
    backgroundColor: Palette.primaryLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  todayNumber: { fontSize: 18, fontWeight: '800', color: Palette.primaryDark },
  todayLabel: { fontSize: 10, fontWeight: '600', color: Palette.primaryDark },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.slate200,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.success, borderRadius: 4 },
  allDoneText: { fontSize: 12, fontWeight: '600', color: Palette.success, marginTop: 6 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  emptyCard: { padding: Spacing.three },
  emptyText: { fontSize: 13, color: Palette.slate500 },
  exCard: { padding: Spacing.three, marginBottom: Spacing.three },
  exCardDone: { borderWidth: 1, borderColor: Palette.success + '66', backgroundColor: Palette.successLight },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  soundBubble: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBubbleText: { fontSize: 13, fontWeight: '800', color: Palette.secondary },
  exTitle: { fontSize: 15, fontWeight: '800', color: Palette.slate900 },
  exMeta: { fontSize: 12, color: Palette.slate500, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  cueHint: { flex: 1, fontSize: 11, color: Palette.slate600 },
  wordRow: { gap: Spacing.two, paddingVertical: Spacing.two },
  wordCard: {
    width: 92,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  wordEmoji: { fontSize: 28 },
  wordText: { fontSize: 13, fontWeight: '700', color: Palette.slate900, marginTop: 4, textAlign: 'center' },
  wordPhonetic: { fontSize: 11, color: Palette.primaryDark, fontStyle: 'italic', marginTop: 2, textAlign: 'center' },
  expandedBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
  },
  exDesc: { fontSize: 13, color: Palette.slate700, lineHeight: 19 },
  promptHeader: { fontSize: 12, fontWeight: '800', color: Palette.slate800, marginTop: Spacing.two, marginBottom: 4 },
  promptRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4 },
  promptText: { flex: 1, fontSize: 12, color: Palette.slate600, lineHeight: 17 },
  tipCard: { padding: Spacing.three, marginBottom: Spacing.two, backgroundColor: Palette.purpleLight },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipTitle: { fontSize: 14, fontWeight: '800', color: Palette.slate900 },
  tipBody: { fontSize: 13, color: Palette.slate700, marginTop: 4, lineHeight: 19 },
  tipAuthor: { fontSize: 11, color: Palette.purple, fontWeight: '700', marginTop: 6 },
  clinicalNote: { fontSize: 11, color: Palette.slate500, marginTop: Spacing.three, lineHeight: 16 },
});
