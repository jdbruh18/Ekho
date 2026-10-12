import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth-context';
import { generateUUID } from '../../lib/uuid';
import {
  AssistanceLevel,
  ChildPerformanceRating,
  SessionReport,
} from '../../types/database';
import { MOCK_GOALS } from '../../lib/mock-data';

export default function SessionReportFormScreen() {
  const {
    appointmentId,
    childId,
    childName,
    durationMinutes,
    totalTrials,
    correctTrials,
    accuracyPercentage,
    capturedNotes,
  } = useLocalSearchParams<{
    appointmentId?: string;
    childId?: string;
    childName?: string;
    durationMinutes?: string;
    totalTrials?: string;
    correctTrials?: string;
    accuracyPercentage?: string;
    capturedNotes?: string;
  }>();

  const { session, slpProfile, saveSessionReport } = useAuth();

  const clinicianName =
    session?.profile?.full_name || 'Dr. Maya Lin, Ph.D., CCC-SLP';
  const licenseNumber = slpProfile?.license_number || 'SLP-NY-48921-A';

  // Parse notes from session
  let parsedCapturedNotes: string[] = [];
  try {
    if (capturedNotes) {
      parsedCapturedNotes = JSON.parse(capturedNotes);
    }
  } catch {
    parsedCapturedNotes = [];
  }

  // Pre-fill metrics
  const parsedTotalTrials = parseInt(totalTrials || '18', 10);
  const parsedCorrect = parseInt(correctTrials || '14', 10);
  const initialAcc = parseInt(accuracyPercentage || '78', 10);

  // Form State
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    MOCK_GOALS[0]?.title || '/s/ sound production in initial word positions',
  ]);
  const [assistanceLevel, setAssistanceLevel] = useState<AssistanceLevel>('minimal_cueing');
  const [performanceRating, setPerformanceRating] = useState<ChildPerformanceRating>('developing');
  const [accuracyInput, setAccuracyInput] = useState(initialAcc.toString());

  // SOAP fields
  const [subjective, setSubjective] = useState(
    'Patient arrived on time with mother present. Alert, cooperative, and engaged well with digital picture cards.'
  );
  const [objective, setObjective] = useState(
    parsedCapturedNotes.length > 0
      ? `Completed ${parsedTotalTrials} articulation drill trials. Production accuracy: ${initialAcc}%.\nIn-session observations:\n• ${parsedCapturedNotes.join('\n• ')}`
      : `Completed ${parsedTotalTrials} articulation drill trials across initial /s/ sound targets. Production accuracy: ${initialAcc}%.`
  );
  const [assessment, setAssessment] = useState(
    'Demonstrated marked improvement in phonological awareness. Self-corrected initial sound placements with minimal visual mirror cues.'
  );
  const [plan, setPlan] = useState(
    'Continue weekly 45-min telepractice sessions. Target sound expansion into 2-syllable phrases and minimal pair contrasts.'
  );

  // Home practice builder
  const [homeExerciseTitle, setHomeExerciseTitle] = useState('Mirror Sound Repetition');
  const [homeExerciseDesc, setHomeExerciseDesc] = useState(
    'Practice initial /s/ target words (Sun, Soup, Star) in front of bathroom mirror for 5 minutes twice daily.'
  );
  const [homeInstructions, setHomeInstructions] = useState(
    'Praise child immediately when teeth close gently for the snake sound. Avoid correcting during casual conversation.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGoal = (title: string) => {
    if (selectedGoals.includes(title)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== title));
      }
    } else {
      setSelectedGoals([...selectedGoals, title]);
    }
  };

  const handleSubmitReport = async () => {
    if (!subjective.trim() || !objective.trim() || !assessment.trim() || !plan.trim()) {
      Alert.alert('Incomplete SOAP Note', 'Please ensure all Subjective, Objective, Assessment, and Plan fields are filled.');
      return;
    }

    setIsSubmitting(true);
    const finalAccuracy = Math.min(100, Math.max(0, parseInt(accuracyInput, 10) || initialAcc));

    const newReport: SessionReport = {
      id: generateUUID(),
      appointment_id: appointmentId || 'demo-appt',
      child_id: childId || 'child-1',
      slp_id: session?.id || 'slp-1',
      session_date: new Date().toISOString(),
      duration_minutes: parseInt(durationMinutes || '45', 10),
      activities_completed: selectedGoals,
      child_performance_rating: performanceRating,
      accuracy_percentage: finalAccuracy,
      assistance_level: assistanceLevel,
      strengths: 'Cooperative, receptive to auditory feedback and mirror cues.',
      difficulties_observed: 'Occasional dentalization when speaking rapidly in sentence context.',
      behavior_participation: 'High motivation and sustained attention.',
      clinical_notes: `SOAP DOCUMENTATION:\n\n[S - Subjective]: ${subjective}\n\n[O - Objective]: ${objective}\n\n[A - Assessment]: ${assessment}\n\n[P - Plan]: ${plan}`,
      home_practice_instructions: homeInstructions,
      home_practice_exercises: [
        {
          title: homeExerciseTitle,
          description: homeExerciseDesc,
          target_frequency: 'Twice daily (5 mins)',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await saveSessionReport(newReport);
      Alert.alert(
        'Clinical SOAP Report Dispatched!',
        `Report successfully signed by ${clinicianName} and added to ${childName || 'the patient'}'s longitudinal record. The parent has been notified.`,
        [
          {
            text: 'Return to Dashboard',
            onPress: () => router.replace('/(slp)'),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit clinical report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title="Post-Session SOAP Report"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Summary Card */}
          <Card style={styles.headerCard} variant="elevated">
            <View style={styles.badgeRow}>
              <Badge label="Clinical Documentation" variant="info" size="sm" />
              <Badge label="HIPAA Signed" variant="success" size="sm" />
            </View>

            <Text style={styles.patientName}>{childName || 'Leo Watson'}</Text>
            <Text style={styles.sessionMeta}>
              Session Date: {new Date().toLocaleDateString()} • {durationMinutes || 45} Minutes Telepractice
            </Text>

            <View style={styles.slpSignBox}>
              <View style={styles.slpSignLeft}>
                <Ionicons name="shield-checkmark" size={16} color={Palette.primary} />
                <Text style={styles.slpSignName}>Licensed Clinician: {clinicianName}</Text>
              </View>
              <Text style={styles.licenseCode}>State Board: {licenseNumber}</Text>
            </View>
          </Card>

          {/* Section 1: Goals Addressed */}
          <Text style={styles.sectionHeader}>1. Individualized Goals Addressed</Text>
          <Card style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>Select Target Clinical Goals:</Text>
            {MOCK_GOALS.map((g) => {
              const isChecked = selectedGoals.includes(g.title);
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCheckRow, isChecked && styles.goalCheckRowActive]}
                  onPress={() => toggleGoal(g.title)}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={isChecked ? Palette.primary : Palette.slate400}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalCheckTitle, isChecked && styles.goalCheckTitleActive]}>
                      {g.title}
                    </Text>
                    <Text style={styles.goalCheckCat}>
                      {g.category} • Target Accuracy: {g.target_accuracy}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Section 2: Objective Production Metrics */}
          <Text style={styles.sectionHeader}>2. Objective Production Metrics</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricNum}>{parsedTotalTrials}</Text>
                <Text style={styles.metricLbl}>Total Trials</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricNum, { color: Palette.success }]}>
                  {parsedCorrect}
                </Text>
                <Text style={styles.metricLbl}>Correct Productions</Text>
              </View>
              <View style={styles.metricBox}>
                <View style={styles.accInputRow}>
                  <TextInput
                    style={styles.accInput}
                    value={accuracyInput}
                    onChangeText={setAccuracyInput}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.accPercentSign}>%</Text>
                </View>
                <Text style={styles.metricLbl}>Accuracy Score</Text>
              </View>
            </View>

            {/* Assistance Level Chips */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.three }]}>
              Level of Assistance Required:
            </Text>
            <View style={styles.chipsWrap}>
              {(
                [
                  { key: 'independent', label: 'Independent' },
                  { key: 'minimal_cueing', label: 'Minimal Verbal Cues' },
                  { key: 'moderate_cueing', label: 'Gestural / Visual Cues' },
                  { key: 'maximal_prompting', label: 'Maximal Hand/Model' },
                ] as const
              ).map((lvl) => {
                const isSelected = assistanceLevel === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.key}
                    style={[styles.optionChip, isSelected && styles.optionChipActive]}
                    onPress={() => setAssistanceLevel(lvl.key)}
                  >
                    <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Child Performance Rating */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.three }]}>
              Clinical Performance Rating:
            </Text>
            <View style={styles.chipsWrap}>
              {(
                [
                  { key: 'emerging', label: 'Emerging (0-49%)' },
                  { key: 'developing', label: 'Developing (50-79%)' },
                  { key: 'consistent', label: 'Consistent (80-94%)' },
                  { key: 'mastered', label: 'Mastered (95%+)' },
                ] as const
              ).map((rt) => {
                const isSelected = performanceRating === rt.key;
                return (
                  <TouchableOpacity
                    key={rt.key}
                    style={[styles.optionChip, isSelected && styles.optionChipActive]}
                    onPress={() => setPerformanceRating(rt.key)}
                  >
                    <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Section 3: Structured SOAP Clinical Notes */}
          <Text style={styles.sectionHeader}>3. Structured SOAP Notes</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.soapField}>
              <View style={styles.soapLabelRow}>
                <View style={[styles.soapPill, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={[styles.soapPillText, { color: '#0369A1' }]}>S</Text>
                </View>
                <Text style={styles.soapFieldName}>Subjective (Affect & Participation):</Text>
              </View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={subjective}
                onChangeText={setSubjective}
              />
            </View>

            <View style={styles.soapField}>
              <View style={styles.soapLabelRow}>
                <View style={[styles.soapPill, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.soapPillText, { color: '#15803D' }]}>O</Text>
                </View>
                <Text style={styles.soapFieldName}>Objective (Data & Stimulus Results):</Text>
              </View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={objective}
                onChangeText={setObjective}
              />
            </View>

            <View style={styles.soapField}>
              <View style={styles.soapLabelRow}>
                <View style={[styles.soapPill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.soapPillText, { color: '#B45309' }]}>A</Text>
                </View>
                <Text style={styles.soapFieldName}>Assessment (Progress vs Baseline):</Text>
              </View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={assessment}
                onChangeText={setAssessment}
              />
            </View>

            <View style={styles.soapField}>
              <View style={styles.soapLabelRow}>
                <View style={[styles.soapPill, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={[styles.soapPillText, { color: '#7E22CE' }]}>P</Text>
                </View>
                <Text style={styles.soapFieldName}>Plan (Recommendations & Frequency):</Text>
              </View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={plan}
                onChangeText={setPlan}
              />
            </View>
          </Card>

          {/* Section 4: Home Practice Assignment Builder */}
          <Text style={styles.sectionHeader}>4. Home Practice Assigned to Caregiver</Text>
          <Card style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>Home Exercise Title:</Text>
            <TextInput
              style={styles.singleInput}
              value={homeExerciseTitle}
              onChangeText={setHomeExerciseTitle}
            />

            <Text style={[styles.fieldLabel, { marginTop: Spacing.two }]}>
              Exercise Instructions & Target Words:
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              value={homeExerciseDesc}
              onChangeText={setHomeExerciseDesc}
            />

            <Text style={[styles.fieldLabel, { marginTop: Spacing.two }]}>
              Parent Guidance & Positive Reinforcement Tip:
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={2}
              value={homeInstructions}
              onChangeText={setHomeInstructions}
            />
          </Card>

          {/* Submit & Sign Action */}
          <View style={styles.submitContainer}>
            <View style={styles.legalNotice}>
              <MaterialCommunityIcons name="signature-freehand" size={20} color={Palette.slate600} />
              <Text style={styles.legalText}>
                Submitting this clinical documentation affixes your electronic signature ({clinicianName})
                under professional state license #{licenseNumber}.
              </Text>
            </View>

            <Button
              title="Submit & Sign Clinical Report"
              size="lg"
              variant="primary"
              loading={isSubmitting}
              onPress={handleSubmitReport}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerCard: {
    marginBottom: Spacing.four,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  patientName: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.slate900,
  },
  sessionMeta: {
    fontSize: 13,
    color: Palette.slate600,
    marginTop: 2,
    marginBottom: Spacing.three,
  },
  slpSignBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  slpSignLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  slpSignName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  licenseCode: {
    fontSize: 11,
    color: Palette.slate500,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: Spacing.two,
  },
  sectionCard: {
    marginBottom: Spacing.four,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: Spacing.two,
  },
  goalCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.two,
    backgroundColor: Palette.slate50,
  },
  goalCheckRowActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  goalCheckTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate800,
  },
  goalCheckTitleActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  goalCheckCat: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.slate900,
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
  accInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accInput: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.primary,
    textAlign: 'center',
    padding: 0,
    minWidth: 40,
  },
  accPercentSign: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  optionChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.white,
  },
  optionChipActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  optionChipTextActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  soapField: {
    marginBottom: Spacing.three,
  },
  soapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 6,
  },
  soapPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soapPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  soapFieldName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  textArea: {
    backgroundColor: Palette.slate50,
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 13,
    color: Palette.slate900,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  singleInput: {
    backgroundColor: Palette.slate50,
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 13,
    color: Palette.slate900,
  },
  submitContainer: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.slate100,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  legalText: {
    flex: 1,
    fontSize: 11,
    color: Palette.slate600,
    lineHeight: 16,
  },
});
