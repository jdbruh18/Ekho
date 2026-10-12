import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_GOALS, MOCK_SESSION_REPORTS } from '../../lib/mock-data';
import { useAuth } from '../../lib/auth-context';

export default function ProgressScreen() {
  const { activeChild, children } = useAuth();
  const currentChild = activeChild || (children && children.length > 0 ? children[0] : null);
  const childDisplayName = currentChild ? `${currentChild.first_name} ${currentChild.last_name}` : 'Leo Watson';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Speech & Language Progress" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Header banner */}
        <View style={styles.childHeader}>
          <Text style={styles.childName}>{childDisplayName}&apos;s Milestones</Text>
          <Text style={styles.childSubtitle}>
            Clinical records managed by treating therapist: Dr. Maya Lin, CCC-SLP
          </Text>
        </View>

        {/* Goals Progress */}
        <Text style={styles.sectionTitle}>Individualized Therapy Goals</Text>

        {MOCK_GOALS.map((goal) => {
          const baseline = goal.baseline_accuracy;
          const current = goal.current_accuracy;
          const target = goal.target_accuracy;
          const improvement = Math.max(0, current - baseline);

          return (
            <Card key={goal.id} style={styles.goalCard} variant="elevated">
              <View style={styles.goalTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryLabel}>{goal.category.toUpperCase()}</Text>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                <Badge
                  label={`+${improvement.toFixed(0)}% Progress`}
                  variant="success"
                  size="sm"
                />
              </View>

              {/* Progress Visual Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${current}%` }]} />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>Baseline</Text>
                    <Text style={styles.metricValue}>{baseline}%</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>Current Accuracy</Text>
                    <Text style={[styles.metricValue, { color: Palette.primaryDark }]}>
                      {current}%
                    </Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>Target Goal</Text>
                    <Text style={[styles.metricValue, { color: Palette.secondary }]}>
                      {target}%
                    </Text>
                  </View>
                </View>
              </View>

              {goal.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Therapist Observation:</Text>
                  <Text style={styles.notesText}>{goal.notes}</Text>
                </View>
              ) : null}
            </Card>
          );
        })}

        {/* Session History Log */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.four }]}>
          Session-by-Session Performance Logs
        </Text>

        {MOCK_SESSION_REPORTS.map((report) => (
          <Card key={report.id} style={styles.historyCard}>
            <View style={styles.historyTopRow}>
              <View>
                <Text style={styles.historyDate}>3 Days Ago • 45 min Online</Text>
                <Text style={styles.historyPerf}>
                  Performance: Consistently Developing (Accuracy: {report.accuracy_percentage}%)
                </Text>
              </View>
              <Badge label="Report" variant="info" size="sm" />
            </View>

            <View style={styles.activitiesBox}>
              <Text style={styles.activitiesLabel}>Activities Completed:</Text>
              <Text style={styles.activitiesText}>
                {report.activities_completed.join(' • ')}
              </Text>
            </View>

            <Text style={styles.clinicalNotes}>&ldquo;{report.clinical_notes}&rdquo;</Text>
          </Card>
        ))}

        {/* Clinical Progress Disclaimer */}
        <View style={styles.clinicalNoticeBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color={Palette.slate600} />
          <Text style={styles.clinicalNoticeText}>
            Progress scores and accuracy percentages are clinical tracking information entered by
            the treating Speech-Language Pathologist and are not an automated medical diagnosis or
            guarantee of outcome.
          </Text>
        </View>
      </ScrollView>
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
  childHeader: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.three,
  },
  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  childSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
  },
  goalCard: {
    marginBottom: Spacing.three,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.primaryDark,
    letterSpacing: 0.5,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
    marginTop: 2,
  },
  progressContainer: {
    marginVertical: Spacing.two,
  },
  barBackground: {
    height: 10,
    backgroundColor: Palette.slate100,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: 5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: Palette.slate400,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate800,
  },
  notesBox: {
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.two,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate700,
  },
  notesText: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 16,
    marginTop: 2,
  },
  historyCard: {
    marginBottom: Spacing.two,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  historyDate: {
    fontSize: 12,
    color: Palette.slate500,
  },
  historyPerf: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
    marginTop: 2,
  },
  activitiesBox: {
    marginVertical: Spacing.one,
  },
  activitiesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate500,
  },
  activitiesText: {
    fontSize: 12,
    color: Palette.slate700,
  },
  clinicalNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Palette.slate600,
    marginTop: Spacing.one,
  },
  clinicalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
    marginTop: Spacing.three,
  },
  clinicalNoticeText: {
    flex: 1,
    fontSize: 11,
    color: Palette.slate600,
    lineHeight: 15,
  },
});
