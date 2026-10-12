import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../lib/auth-context';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_APPOINTMENTS } from '../../lib/mock-data';

export default function SlpDashboard() {
  const { profile, slpProfile, appointments, signOut } = useAuth();

  const isVerified = slpProfile?.is_verified ?? true;
  const hourlyRate = slpProfile?.hourly_rate ?? 95.0;

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const scheduledCount = appointments.filter((a) => a.status === 'scheduled').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Clinician Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topSub}>SLP Clinician Portal</Text>
          <Text style={styles.topName}>
            {profile?.full_name || 'Dr. Maya Lin, Ph.D., CCC-SLP'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/landing');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Palette.slate600} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <MaterialCommunityIcons
                name={isVerified ? 'check-decagram' : 'clock-outline'}
                size={22}
                color={isVerified ? Palette.success : Palette.warning}
              />
              <Text style={styles.statusTitle}>
                {isVerified ? 'Verified SLP License' : 'Verification Under Review'}
              </Text>
            </View>
            <Badge
              label={isVerified ? 'Active & Listed' : 'Pending Approval'}
              variant={isVerified ? 'success' : 'warning'}
              size="sm"
            />
          </View>
          <Text style={styles.statusDesc}>
            {isVerified
              ? 'Your credentials have been validated. You are eligible to receive parent bookings and conduct paid video therapy.'
              : 'Our clinical board is verifying your state license and degree records. You can still set up your profile and schedule.'}
          </Text>
        </Card>

        {/* Incoming Booking Requests Alert Banner */}
        {pendingAppointments.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(slp)/calendar')}
          >
            <Card style={styles.pendingAlertCard}>
              <View style={styles.pendingAlertRow}>
                <View style={styles.pendingAlertIcon}>
                  <MaterialCommunityIcons name="bell-ring" size={20} color={Palette.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingAlertTitle}>
                    {pendingAppointments.length} New Booking Request{pendingAppointments.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.pendingAlertDesc}>
                    Caregivers awaiting teletherapy confirmation. Tap to review intake details.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Practice KPI Metrics Row */}
        <Text style={styles.sectionHeader}>Practice Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{scheduledCount || 1}</Text>
            <Text style={styles.statLabel}>Today&apos;s Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>${hourlyRate}</Text>
            <Text style={styles.statLabel}>Hourly Rate</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.95 ★</Text>
            <Text style={styles.statLabel}>Rating (48)</Text>
          </View>
        </View>

        {/* Quick Navigation Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(slp)/calendar')}
          >
            <Ionicons name="calendar-outline" size={20} color={Palette.primary} />
            <Text style={styles.actionText}>Calendar & Hours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(slp)/earnings')}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={22}
              color={Palette.success}
            />
            <Text style={styles.actionText}>Earnings & Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(slp)/clients')}
          >
            <FontAwesome5 name="users" size={17} color={Palette.secondary} />
            <Text style={styles.actionText}>Client Caseload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(slp)/sessions')}
          >
            <MaterialCommunityIcons
              name="clipboard-edit-outline"
              size={20}
              color={Palette.purple}
            />
            <Text style={styles.actionText}>SOAP Notes</Text>
          </TouchableOpacity>
        </View>

        {/* Next Scheduled Video Therapy Consultation */}
        <Text style={styles.sectionHeader}>Next Appointment</Text>

        {MOCK_APPOINTMENTS.map((appt) => (
          <Card key={appt.id} style={styles.apptCard} variant="elevated">
            <View style={styles.apptHeader}>
              <View style={styles.patientRow}>
                <View style={styles.childIconBox}>
                  <MaterialCommunityIcons
                    name="human-child"
                    size={22}
                    color={Palette.primary}
                  />
                </View>
                <View>
                  <Text style={styles.childName}>Leo Watson (Age 5)</Text>
                  <Text style={styles.parentName}>Parent: Emily Watson</Text>
                </View>
              </View>
              <Badge label="Online Video" variant="info" size="sm" />
            </View>

            <View style={styles.apptTimeRow}>
              <Ionicons name="time-outline" size={16} color={Palette.slate500} />
              <Text style={styles.apptTime}>In 2 Days • 45 minutes duration</Text>
            </View>

            <View style={styles.focusGoalBox}>
              <Text style={styles.focusGoalLabel}>Therapy Target:</Text>
              <Text style={styles.focusGoalText}>
                {appt.notes || 'Speech sound production /s/ in initial positions'}
              </Text>
            </View>

            <View style={styles.apptBtnGroup}>
              <Button
                title="Launch Video Room"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="videocam" size={16} color="#FFF" />}
                onPress={() => router.push(`/session/${appt.id}`)}
                style={{ flex: 1 }}
              />
              <Button
                title="Clinical Record"
                size="md"
                variant="outline"
                onPress={() => router.push('/(slp)/clients')}
              />
            </View>
          </Card>
        ))}

        {/* Recent Session Notes Checklist */}
        <Text style={styles.sectionHeader}>Therapy Documentation</Text>
        <Card style={styles.docCard}>
          <View style={styles.docRow}>
            <MaterialCommunityIcons
              name="checkbox-marked-circle-outline"
              size={20}
              color={Palette.success}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Leo Watson • Articulation Drills</Text>
              <Text style={styles.docSub}>
                Session completed 3 days ago. SOAP summary sent to parent.
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(slp)/sessions')}>
              <Text style={styles.docLink}>View</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  topSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.secondary,
    textTransform: 'uppercase',
  },
  topName: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.slate900,
  },
  signOutBtn: {
    padding: Spacing.one + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  statusCard: {
    marginBottom: Spacing.three,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  statusDesc: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 17,
  },
  pendingAlertCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: Spacing.three,
    padding: Spacing.two + 2,
  },
  pendingAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pendingAlertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingAlertDesc: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
  },
  statLabel: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  actionBtn: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  apptCard: {
    marginBottom: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: Palette.secondary,
  },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  childIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  parentName: {
    fontSize: 11,
    color: Palette.slate500,
  },
  apptTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.two,
  },
  apptTime: {
    fontSize: 12,
    color: Palette.slate600,
    fontWeight: '500',
  },
  focusGoalBox: {
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  focusGoalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  focusGoalText: {
    fontSize: 12,
    color: Palette.slate800,
    marginTop: 2,
  },
  apptBtnGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  docCard: {
    marginBottom: Spacing.four,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  docSub: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  docLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
});
