import React from 'react';
import {
  Alert,
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
import { Button } from '../../components/ui/Button';
import { MOCK_SESSION_REPORTS } from '../../lib/mock-data';

export default function SlpSessionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Session Documentation & SOAP" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Structured Post-Session Reports</Text>
          <Text style={styles.bannerSub}>
            Complete your clinical notes, accuracy percentages, and home assignments after every
            appointment to keep parents informed and update progress trajectories.
          </Text>
        </View>

        <Button
          title="+ Create New Session SOAP Report"
          variant="primary"
          size="md"
          onPress={() =>
            Alert.alert(
              'Session Documentation',
              'The SOAP clinical report template is ready for your post-session notes and objective accuracy scores.'
            )
          }
          style={{ marginBottom: Spacing.four }}
        />

        <Text style={styles.sectionTitle}>Completed Session Reports</Text>

        {MOCK_SESSION_REPORTS.map((report) => (
          <Card key={report.id} style={styles.reportCard} variant="elevated">
            <View style={styles.reportHeader}>
              <View>
                <Text style={styles.childName}>Leo Watson (Age 5)</Text>
                <Text style={styles.reportDate}>
                  Session Date: {new Date(report.session_date).toLocaleDateString()} • {report.duration_minutes} min
                </Text>
              </View>
              <Badge label="Report Dispatched" variant="success" size="sm" />
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>ACCURACY</Text>
                <Text style={styles.metricValue}>{report.accuracy_percentage}%</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>PERFORMANCE</Text>
                <Text style={styles.metricValue}>{report.child_performance_rating?.toUpperCase()}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>ASSISTANCE</Text>
                <Text style={styles.metricValue}>MINIMAL CUE</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.blockLabel}>Activities Completed:</Text>
              <Text style={styles.blockText}>{report.activities_completed.join(' • ')}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.blockLabel}>Clinical Notes & Observations:</Text>
              <Text style={styles.blockText}>{report.clinical_notes}</Text>
            </View>

            <View style={styles.homePracticeBlock}>
              <View style={styles.homePracticeHeader}>
                <MaterialCommunityIcons name="home-variant-outline" size={16} color="#0369A1" />
                <Text style={styles.homePracticeTitle}>Home Practice Assigned to Parent</Text>
              </View>
              <Text style={styles.homePracticeText}>{report.home_practice_instructions}</Text>
            </View>
          </Card>
        ))}
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
  banner: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.three,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  bannerSub: {
    fontSize: 12,
    color: Palette.slate600,
    marginTop: 2,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
  },
  reportCard: {
    marginBottom: Spacing.three,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  reportDate: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    marginBottom: Spacing.three,
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.slate400,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.slate800,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: Spacing.two,
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  blockText: {
    fontSize: 12,
    color: Palette.slate800,
    lineHeight: 17,
  },
  homePracticeBlock: {
    backgroundColor: Palette.secondaryLight,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.one,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  homePracticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  homePracticeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
  },
  homePracticeText: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 16,
  },
});
