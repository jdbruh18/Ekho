import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PaymentModal } from '../../components/checkout/PaymentModal';
import { useAuth } from '../../lib/auth-context';
import { MOCK_SLP_PROFILES } from '../../lib/mock-data';
import { ChildProfile } from '../../types/database';

const DATES = [
  { day: 'Wed', date: '14', full: 'Wednesday, Oct 14' },
  { day: 'Thu', date: '15', full: 'Thursday, Oct 15' },
  { day: 'Fri', date: '16', full: 'Friday, Oct 16' },
  { day: 'Sat', date: '17', full: 'Saturday, Oct 17' },
  { day: 'Mon', date: '19', full: 'Monday, Oct 19' },
];

const MORNING_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '03:30 PM', '05:00 PM'];

export default function BookSessionScreen() {
  const { slpId } = useLocalSearchParams<{ slpId?: string }>();
  const { children, activeChild } = useAuth();

  const slp = MOCK_SLP_PROFILES.find((s) => s.id === slpId) || MOCK_SLP_PROFILES[0];

  // Default child
  const fallbackChild: ChildProfile = {
    id: 'child-default',
    parent_id: 'parent-1',
    first_name: 'Leo',
    last_name: 'Watson',
    date_of_birth: '2021-04-15',
    gender: 'Male',
    communication_concerns: ['Speech sound disorders', 'Articulation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const availableChildren = children && children.length > 0 ? children : [fallbackChild];

  // Form states
  const [selectedChild, setSelectedChild] = useState<ChildProfile>(
    activeChild || availableChildren[0]
  );
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedDuration, setSelectedDuration] = useState<30 | 45 | 60>(45);
  const [intakeNote, setIntakeNote] = useState(
    'Focus on initial /s/ and /r/ blend sounds with mirror repetition drills.'
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Recalculate fee dynamically based on duration
  const getSessionFee = (duration: number): number => {
    switch (duration) {
      case 30:
        return Math.round(slp.hourly_rate * 0.7);
      case 60:
        return Math.round(slp.hourly_rate * 1.3);
      case 45:
      default:
        return Math.round(slp.hourly_rate);
    }
  };

  const calculatedFee = getSessionFee(selectedDuration);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Book Teletherapy Session" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clinician Card Summary */}
        <Card style={styles.slpCard} variant="elevated">
          <View style={styles.slpRow}>
            <Image
              source={{
                uri:
                  slp.profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
              }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.slpName}>{slp.profile?.full_name}</Text>
              <Text style={styles.slpTitle}>{slp.title}</Text>
              <View style={styles.slpBadgeRow}>
                <Badge
                  label="Verified SLP"
                  variant="success"
                  size="sm"
                  icon={<MaterialCommunityIcons name="check-decagram" size={12} color="#065F46" />}
                />
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={12} color={Palette.accent} />
                  <Text style={styles.ratingText}>{slp.rating.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* STEP 1: SELECT CHILD PROFILE */}
        <View style={styles.stepHeaderRow}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Select Child Patient</Text>
            <Text style={styles.stepSub}>Choose who this speech consultation is for</Text>
          </View>
        </View>

        <View style={styles.childrenList}>
          {availableChildren.map((child) => {
            const isSelected = selectedChild.id === child.id;
            return (
              <TouchableOpacity
                key={child.id}
                style={[styles.childOptionCard, isSelected && styles.childOptionSelected]}
                onPress={() => setSelectedChild(child)}
              >
                <View style={styles.childOptionLeft}>
                  <View
                    style={[
                      styles.childAvatarCircle,
                      isSelected && { backgroundColor: Palette.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name="happy"
                      size={20}
                      color={isSelected ? Palette.primary : Palette.slate500}
                    />
                  </View>
                  <View>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <Text style={styles.childDob}>
                      DOB: {child.date_of_birth} • {child.gender || 'Child'}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? Palette.primary : Palette.slate400}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addChildShortcut}
            onPress={() => router.push('/(parent)/children')}
          >
            <Ionicons name="add-circle-outline" size={16} color={Palette.primaryDark} />
            <Text style={styles.addChildText}>Add another child profile</Text>
          </TouchableOpacity>
        </View>

        {/* STEP 2: SELECT DATE & TIME SLOT */}
        <View style={[styles.stepHeaderRow, { marginTop: Spacing.four }]}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Choose Date & Time</Text>
            <Text style={styles.stepSub}>Real-time availability synced with clinician calendar</Text>
          </View>
        </View>

        <Card style={styles.sectionCard} variant="outlined">
          <Text style={styles.slotGroupTitle}>Select Day:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datePickerRow}>
            {DATES.map((d) => {
              const isSelected = selectedDate.full === d.full;
              return (
                <TouchableOpacity
                  key={d.full}
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.dateDayText, isSelected && styles.dateDayTextActive]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateNumText, isSelected && styles.dateNumTextActive]}>
                    {d.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Morning Slots */}
          <Text style={[styles.slotGroupTitle, { marginTop: Spacing.three }]}>Morning Slots:</Text>
          <View style={styles.slotsGrid}>
            {MORNING_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotPill, isSelected && styles.slotPillActive]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Ionicons
                    name="sunny-outline"
                    size={14}
                    color={isSelected ? '#FFF' : Palette.slate600}
                  />
                  <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Afternoon Slots */}
          <Text style={[styles.slotGroupTitle, { marginTop: Spacing.three }]}>
            Afternoon & Evening Slots:
          </Text>
          <View style={styles.slotsGrid}>
            {AFTERNOON_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotPill, isSelected && styles.slotPillActive]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? '#FFF' : Palette.slate600}
                  />
                  <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* STEP 3: SESSION DURATION SELECTOR */}
        <View style={[styles.stepHeaderRow, { marginTop: Spacing.four }]}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Session Duration & Fee</Text>
            <Text style={styles.stepSub}>Rate dynamically calculated from ${slp.hourly_rate}/hr</Text>
          </View>
        </View>

        <View style={styles.durationRow}>
          {[
            { mins: 30 as const, label: '30 Mins', sub: 'Targeted drill' },
            { mins: 45 as const, label: '45 Mins', sub: 'Standard care (Recommended)' },
            { mins: 60 as const, label: '60 Mins', sub: 'In-depth evaluation' },
          ].map((item) => {
            const isSelected = selectedDuration === item.mins;
            const fee = getSessionFee(item.mins);
            return (
              <TouchableOpacity
                key={item.mins}
                style={[styles.durationCard, isSelected && styles.durationCardActive]}
                onPress={() => setSelectedDuration(item.mins)}
              >
                <Text
                  style={[styles.durationLabel, isSelected && styles.durationLabelActive]}
                >
                  {item.label}
                </Text>
                <Text style={styles.durationFee}>${fee}</Text>
                <Text style={styles.durationSub}>{item.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* STEP 4: INTAKE NOTE FOR SLP */}
        <View style={[styles.stepHeaderRow, { marginTop: Spacing.four }]}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>4</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Clinical Intake Note (Optional)</Text>
            <Text style={styles.stepSub}>
              What specific speech sound or concern should this session target?
            </Text>
          </View>
        </View>

        <Card style={styles.intakeCard} variant="outlined">
          <TextInput
            multiline
            numberOfLines={3}
            style={styles.intakeInput}
            value={intakeNote}
            onChangeText={setIntakeNote}
            placeholder="e.g. Leo had trouble pronouncing /s/ in preschool this week. Please work on visual cues..."
            placeholderTextColor={Palette.slate400}
          />
        </Card>

        {/* STEP 5: BOOKING SUMMARY BEFORE PAYMENT */}
        <Card style={styles.finalSummaryCard} variant="elevated">
          <Text style={styles.summaryCardTitle}>Appointment Summary</Text>

          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryItemLabel}>Speech Therapist:</Text>
            <Text style={styles.summaryItemValue}>{slp.profile?.full_name}</Text>
          </View>
          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryItemLabel}>Child Patient:</Text>
            <Text style={styles.summaryItemValue}>
              {selectedChild.first_name} {selectedChild.last_name}
            </Text>
          </View>
          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryItemLabel}>Scheduled Slot:</Text>
            <Text style={styles.summaryItemValue}>
              {selectedDate.full} at {selectedTime}
            </Text>
          </View>
          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryItemLabel}>Duration:</Text>
            <Text style={styles.summaryItemValue}>{selectedDuration} Minutes (Video Teletherapy)</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Consultation Fee:</Text>
            <Text style={styles.summaryTotalValue}>${calculatedFee}.00</Text>
          </View>

          <Button
            title="Proceed to Secure Payment"
            size="lg"
            variant="primary"
            rightIcon={<Ionicons name="lock-closed" size={16} color="#FFF" />}
            onPress={() => setPaymentModalOpen(true)}
            style={{ marginTop: Spacing.three }}
          />
        </Card>
      </ScrollView>

      {/* Payment Processing Modal */}
      <PaymentModal
        visible={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        slp={slp}
        child={selectedChild}
        date={selectedDate.full}
        time={selectedTime}
        durationMinutes={selectedDuration}
        sessionFee={calculatedFee}
        notes={intakeNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  slpCard: {
    marginBottom: Spacing.three,
  },
  slpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
  },
  slpName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  slpTitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
    marginBottom: 4,
  },
  slpBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  stepSub: {
    fontSize: 11,
    color: Palette.slate500,
  },
  childrenList: {
    gap: Spacing.two,
  },
  childOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  childOptionSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  childOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  childAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  childDob: {
    fontSize: 11,
    color: Palette.slate500,
  },
  addChildShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  addChildText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  sectionCard: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
  },
  slotGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: Spacing.one + 2,
  },
  datePickerRow: {
    gap: Spacing.two,
    paddingBottom: 4,
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.slate50,
    minWidth: 54,
  },
  dateCardActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate600,
  },
  dateDayTextActive: {
    color: '#FFF',
  },
  dateNumText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  dateNumTextActive: {
    color: '#FFF',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.slate50,
  },
  slotPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  slotPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  slotPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  durationCard: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    alignItems: 'center',
  },
  durationCardActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
  },
  durationLabelActive: {
    color: Palette.primaryDark,
  },
  durationFee: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    marginVertical: 4,
  },
  durationSub: {
    fontSize: 10,
    color: Palette.slate500,
    textAlign: 'center',
  },
  intakeCard: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
  },
  intakeInput: {
    fontSize: 13,
    color: Palette.slate900,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  finalSummaryCard: {
    backgroundColor: Palette.white,
    marginTop: Spacing.four,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: Spacing.two,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: Palette.slate500,
  },
  summaryItemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Palette.slate200,
    marginVertical: Spacing.two,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate700,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.primaryDark,
  },
});
