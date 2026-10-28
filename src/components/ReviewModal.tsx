import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../constants/theme';
import { Button } from './ui/Button';
import { Appointment } from '../types/database';
import { ReviewCategoryScores } from '../types/engagement';
import { useAuth } from '../lib/auth-context';
import { useEngagement } from '../lib/engagement-store';
import { REVIEW_TAGS } from '../lib/engagement-mock';

interface ReviewModalProps {
  visible: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

const CATEGORIES: { key: keyof ReviewCategoryScores; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'communication', label: 'Communication', icon: 'chatbubbles-outline' },
  { key: 'punctuality', label: 'Punctuality', icon: 'time-outline' },
  { key: 'engagement', label: 'Child Engagement', icon: 'happy-outline' },
];

const INITIAL_SCORES: ReviewCategoryScores = { communication: 0, punctuality: 0, engagement: 0 };

export function ReviewModal({ visible, appointment, onClose }: ReviewModalProps) {
  const { profile } = useAuth();
  const { submitReview, hasReviewed } = useEngagement();
  const [scores, setScores] = useState<ReviewCategoryScores>(INITIAL_SCORES);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state resets per appointment because the parent passes key={appointment.id}.

  if (!appointment) return null;

  const slpName = appointment.slp?.profile?.full_name?.split(',')[0] ?? 'your clinician';
  const alreadyReviewed = hasReviewed(appointment.id);
  const allRated = CATEGORIES.every((c) => scores[c.key] > 0);
  const overall = allRated
    ? Math.round(((scores.communication + scores.punctuality + scores.engagement) / 3) * 10) / 10
    : 0;

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = () => {
    // Spec §14: only completed sessions can be reviewed, once per appointment.
    if (appointment.status !== 'completed' || alreadyReviewed || !allRated) return;
    setSubmitting(true);
    setTimeout(() => {
      submitReview({
        appointmentId: appointment.id,
        slpId: appointment.slp_id,
        parentName: profile?.full_name?.split(' ')[0] ? `${profile.full_name.split(' ')[0]} (verified parent)` : 'Verified parent',
        scores,
        overall,
        tags,
        comment: comment.trim(),
      });
      setSubmitting(false);
      onClose();
      Alert.alert('Thank you!', `Your ${overall.toFixed(1)}★ review for ${slpName} is now on their profile.`);
    }, 500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="star" size={22} color={Palette.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Rate your session</Text>
              <Text style={styles.subtitle}>
                {slpName} · {appointment.child?.first_name ?? 'your child'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={Palette.slate500} />
            </TouchableOpacity>
          </View>

          {alreadyReviewed ? (
            <View style={styles.doneBox}>
              <Ionicons name="checkmark-circle" size={40} color={Palette.success} />
              <Text style={styles.doneText}>You have already reviewed this session. Thank you!</Text>
              <Button title="Close" variant="outline" onPress={onClose} style={{ alignSelf: 'stretch' }} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {CATEGORIES.map((c) => (
                <View key={c.key} style={styles.catRow}>
                  <View style={styles.catLabelRow}>
                    <Ionicons name={c.icon} size={16} color={Palette.primaryDark} />
                    <Text style={styles.catLabel}>{c.label}</Text>
                  </View>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => setScores((s) => ({ ...s, [c.key]: n }))}
                        hitSlop={6}
                        accessibilityLabel={`${c.label} ${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Ionicons
                          name={n <= scores[c.key] ? 'star' : 'star-outline'}
                          size={28}
                          color={n <= scores[c.key] ? Palette.accent : Palette.slate300}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <View style={styles.overallBox}>
                <Text style={styles.overallLabel}>Overall</Text>
                <Text style={styles.overallValue}>{allRated ? `${overall.toFixed(1)} ★` : '—'}</Text>
              </View>

              <Text style={styles.sectionLabel}>What stood out? (optional)</Text>
              <View style={styles.tagWrap}>
                {REVIEW_TAGS.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <TouchableOpacity key={t} style={[styles.tag, on && styles.tagOn]} onPress={() => toggleTag(t)}>
                      {on && <Ionicons name="checkmark" size={12} color={Palette.white} />}
                      <Text style={[styles.tagText, on && { color: Palette.white }]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Written feedback (optional)</Text>
              <TextInput
                style={styles.input}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
                placeholder="How did the SLP connect with your child?"
                placeholderTextColor={Palette.slate400}
              />
              <Text style={styles.privacy}>
                Only your first name is shown. Please avoid sharing your child&apos;s medical details.
              </Text>

              <Button
                title={allRated ? 'Submit Review' : 'Rate all three areas'}
                size="lg"
                disabled={!allRated}
                loading={submitting}
                onPress={handleSubmit}
                style={{ marginTop: Spacing.three }}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.slate300,
    marginBottom: Spacing.three,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: Palette.slate900 },
  subtitle: { fontSize: 12, color: Palette.slate500, marginTop: 2 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  catLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catLabel: { fontSize: 14, fontWeight: '700', color: Palette.slate800 },
  stars: { flexDirection: 'row', gap: 4 },
  overallBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    marginTop: Spacing.three,
  },
  overallLabel: { fontSize: 13, fontWeight: '700', color: Palette.primaryDark },
  overallValue: { fontSize: 18, fontWeight: '800', color: Palette.primaryDark },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: Palette.slate800, marginTop: Spacing.three, marginBottom: Spacing.two },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.slate50,
  },
  tagOn: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  tagText: { fontSize: 12, fontWeight: '600', color: Palette.slate600 },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    fontSize: 14,
    color: Palette.slate900,
    textAlignVertical: 'top',
  },
  privacy: { fontSize: 11, color: Palette.slate400, marginTop: 6 },
  doneBox: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four },
  doneText: { fontSize: 14, color: Palette.slate600, textAlign: 'center' },
});
