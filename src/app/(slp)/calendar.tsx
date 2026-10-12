import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth-context';
import { Appointment } from '../../types/database';

interface DaySchedule {
  day: string;
  short: string;
  active: boolean;
  start: string;
  end: string;
}

const DEFAULT_DAYS: DaySchedule[] = [
  { day: 'Monday', short: 'Mon', active: true, start: '09:00 AM', end: '05:00 PM' },
  { day: 'Tuesday', short: 'Tue', active: true, start: '09:00 AM', end: '05:00 PM' },
  { day: 'Wednesday', short: 'Wed', active: true, start: '09:00 AM', end: '05:00 PM' },
  { day: 'Thursday', short: 'Thu', active: true, start: '09:00 AM', end: '05:00 PM' },
  { day: 'Friday', short: 'Fri', active: true, start: '09:00 AM', end: '03:00 PM' },
  { day: 'Saturday', short: 'Sat', active: false, start: '10:00 AM', end: '02:00 PM' },
  { day: 'Sunday', short: 'Sun', active: false, start: '10:00 AM', end: '01:00 PM' },
];

const BUFFER_OPTIONS = [10, 15, 20];
const MAX_SESSIONS_OPTIONS = [4, 6, 8, 10];

export default function SlpCalendarScreen() {
  const {
    appointments,
    acceptAppointmentRequest,
    declineAppointmentRequest,
  } = useAuth();

  // Schedule settings state
  const [scheduleDays, setScheduleDays] = useState<DaySchedule[]>(DEFAULT_DAYS);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(6);
  const [activeTab, setActiveTab] = useState<'requests' | 'agenda' | 'settings'>('requests');

  // Video session modal state
  const [activeVideoModal, setActiveVideoModal] = useState<Appointment | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Appointments partitioned
  const pendingRequests = appointments.filter((a) => a.status === 'pending');
  const confirmedSessions = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'rescheduled'
  );

  const toggleDayActive = (index: number) => {
    setScheduleDays((prev) =>
      prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item))
    );
  };

  const handleSaveSchedule = () => {
    Alert.alert(
      'Schedule Saved!',
      `Weekly availability updated: ${scheduleDays.filter((d) => d.active).length} active days, ${bufferMinutes}m buffer between sessions, max ${maxSessionsPerDay} sessions/day.`
    );
  };

  const handleAcceptRequest = async (appt: Appointment) => {
    setActionLoadingId(appt.id);
    try {
      await acceptAppointmentRequest(appt.id);
      Alert.alert(
        'Booking Accepted!',
        `Session with ${appt.child?.first_name || 'Patient'} on ${appt.scheduled_at} is now confirmed on your calendar.`
      );
    } catch {
      Alert.alert('Error', 'Unable to accept request. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (appt: Appointment) => {
    Alert.alert(
      'Decline Booking Request',
      `Are you sure you want to decline this session request for ${appt.child?.first_name || 'Patient'}?`,
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(appt.id);
            try {
              await declineAppointmentRequest(appt.id);
              Alert.alert('Request Declined', 'The parent has been notified and no fee was collected.');
            } catch {
              Alert.alert('Error', 'Unable to decline request.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title="Schedule & Calendar"
        rightElement={
          <Badge
            label={`${pendingRequests.length} Pending`}
            variant={pendingRequests.length > 0 ? 'warning' : 'neutral'}
            size="sm"
          />
        }
      />

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
          onPress={() => setActiveTab('requests')}
        >
          <View style={styles.tabLabelRow}>
            <MaterialCommunityIcons
              name="clock-alert-outline"
              size={16}
              color={activeTab === 'requests' ? Palette.primary : Palette.slate500}
            />
            <Text style={[styles.tabBtnText, activeTab === 'requests' && styles.tabBtnTextActive]}>
              Requests
            </Text>
          </View>
          {pendingRequests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'agenda' && styles.tabBtnActive]}
          onPress={() => setActiveTab('agenda')}
        >
          <View style={styles.tabLabelRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={activeTab === 'agenda' ? Palette.primary : Palette.slate500}
            />
            <Text style={[styles.tabBtnText, activeTab === 'agenda' && styles.tabBtnTextActive]}>
              Confirmed Agenda
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: Palette.slate200 }]}>
            <Text style={[styles.countBadgeText, { color: Palette.slate700 }]}>
              {confirmedSessions.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('settings')}
        >
          <View style={styles.tabLabelRow}>
            <Ionicons
              name="options-outline"
              size={16}
              color={activeTab === 'settings' ? Palette.primary : Palette.slate500}
            />
            <Text style={[styles.tabBtnText, activeTab === 'settings' && styles.tabBtnTextActive]}>
              Working Hours
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: BOOKING REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Incoming Booking Requests</Text>
                <Text style={styles.sectionSub}>Review caregiver session intakes within 24 hours</Text>
              </View>
            </View>

            {pendingRequests.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle" size={48} color={Palette.success} />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyDesc}>
                  You have no pending appointment requests. Newly scheduled parent sessions will appear here for your confirmation.
                </Text>
              </Card>
            ) : (
              pendingRequests.map((appt) => {
                const childName = appt.child
                  ? `${appt.child.first_name} ${appt.child.last_name}`
                  : 'Leo Watson';
                const parentName = appt.parent?.full_name || 'Emily Watson';
                const isLoading = actionLoadingId === appt.id;

                return (
                  <Card key={appt.id} style={styles.requestCard} variant="elevated">
                    <View style={styles.requestTop}>
                      <View style={styles.patientInfo}>
                        <View style={styles.childIconBox}>
                          <MaterialCommunityIcons name="human-child" size={24} color={Palette.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.patientName}>{childName}</Text>
                          <Text style={styles.parentName}>Caregiver: {parentName}</Text>
                        </View>
                      </View>
                      <Badge label="Needs Response" variant="warning" size="sm" />
                    </View>

                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={15} color={Palette.primary} />
                        <Text style={styles.detailText}>{appt.scheduled_at}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="timer-outline" size={15} color={Palette.secondary} />
                        <Text style={styles.detailText}>{appt.duration_minutes || 45} mins</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="currency-usd" size={15} color={Palette.success} />
                        <Text style={styles.detailText}>
                          Fee: ${(appt.amount_paid ?? 71.25).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {appt.notes ? (
                      <View style={styles.intakeBox}>
                        <Text style={styles.intakeLabel}>Parent Intake Note:</Text>
                        <Text style={styles.intakeText}>&ldquo;{appt.notes}&rdquo;</Text>
                      </View>
                    ) : null}

                    <View style={styles.btnRow}>
                      <Button
                        title="Decline"
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onPress={() => handleDeclineRequest(appt)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title={isLoading ? 'Accepting...' : 'Accept & Confirm'}
                        size="sm"
                        variant="primary"
                        loading={isLoading}
                        leftIcon={<Ionicons name="checkmark" size={16} color="#FFF" />}
                        onPress={() => handleAcceptRequest(appt)}
                        style={{ flex: 1.5 }}
                      />
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: CONFIRMED AGENDA */}
        {activeTab === 'agenda' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Confirmed Therapy Schedule</Text>
                <Text style={styles.sectionSub}>Upcoming live teletherapy sessions</Text>
              </View>
            </View>

            {confirmedSessions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={48} color={Palette.slate400} />
                <Text style={styles.emptyTitle}>No Confirmed Sessions</Text>
                <Text style={styles.emptyDesc}>
                  Accepted bookings will appear here in chronological order with direct video consultation links.
                </Text>
              </Card>
            ) : (
              confirmedSessions.map((appt) => {
                const childName = appt.child
                  ? `${appt.child.first_name} ${appt.child.last_name}`
                  : 'Leo Watson';

                return (
                  <Card key={appt.id} style={styles.agendaCard} variant="elevated">
                    <View style={styles.agendaHeader}>
                      <View style={styles.agendaHeaderLeft}>
                        <Badge label="Teletherapy" variant="primary" size="sm" />
                        <Text style={styles.agendaTime}>{appt.scheduled_at}</Text>
                      </View>
                      <Text style={styles.agendaDuration}>{appt.duration_minutes || 45} mins</Text>
                    </View>

                    <View style={styles.agendaBody}>
                      <Text style={styles.agendaChild}>{childName}</Text>
                      <Text style={styles.agendaFocus}>
                        Target Focus: {appt.notes || 'Articulation therapy /s/ sounds'}
                      </Text>
                    </View>

                    <View style={styles.agendaActions}>
                      <Button
                        title="Start Video Room"
                        size="sm"
                        variant="primary"
                        leftIcon={<Ionicons name="videocam" size={16} color="#FFF" />}
                        onPress={() => setActiveVideoModal(appt)}
                        style={{ flex: 1.5 }}
                      />
                      <Button
                        title="Patient File"
                        size="sm"
                        variant="outline"
                        onPress={() =>
                          Alert.alert(
                            'Client Record',
                            `Accessing clinical profile, baseline milestones, and past SOAP reports for ${childName}.`
                          )
                        }
                        style={{ flex: 1 }}
                      />
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* TAB 3: WORKING HOURS & BUFFER CONFIGURATOR */}
        {activeTab === 'settings' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Weekly Availability Configurator</Text>
                <Text style={styles.sectionSub}>Set active days, working hours, and session spacing</Text>
              </View>
            </View>

            {/* Days Toggle Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.cardSectionTitle}>Active Practice Days & Hours</Text>

              {scheduleDays.map((d, index) => (
                <View key={d.day} style={styles.dayRow}>
                  <View style={styles.dayLeft}>
                    <Switch
                      value={d.active}
                      onValueChange={() => toggleDayActive(index)}
                      trackColor={{ false: Palette.slate300, true: Palette.primaryMuted }}
                      thumbColor={d.active ? Palette.primary : Palette.slate100}
                    />
                    <Text style={[styles.dayName, !d.active && styles.dayNameDisabled]}>
                      {d.day}
                    </Text>
                  </View>

                  <View style={styles.dayHours}>
                    {d.active ? (
                      <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={13} color={Palette.primary} />
                        <Text style={styles.timeBadgeText}>
                          {d.start} - {d.end}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.dayOffText}>Unavailable</Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>

            {/* Session Buffer Time Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.cardSectionTitle}>Rest & Documentation Buffer</Text>
              <Text style={styles.cardSectionSub}>
                Automatic spacing between video sessions for SOAP note documentation:
              </Text>
              <View style={styles.chipsRow}>
                {BUFFER_OPTIONS.map((buffer) => {
                  const isSelected = bufferMinutes === buffer;
                  return (
                    <TouchableOpacity
                      key={buffer}
                      style={[styles.bufferChip, isSelected && styles.bufferChipActive]}
                      onPress={() => setBufferMinutes(buffer)}
                    >
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? Palette.primary : Palette.slate400}
                      />
                      <Text
                        style={[
                          styles.bufferChipText,
                          isSelected && styles.bufferChipTextActive,
                        ]}
                      >
                        {buffer} Mins Buffer
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Max Sessions Per Day Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.cardSectionTitle}>Daily Caseload Limit</Text>
              <Text style={styles.cardSectionSub}>
                Maximum number of teletherapy appointments you wish to accept per day:
              </Text>
              <View style={styles.chipsRow}>
                {MAX_SESSIONS_OPTIONS.map((maxNum) => {
                  const isSelected = maxSessionsPerDay === maxNum;
                  return (
                    <TouchableOpacity
                      key={maxNum}
                      style={[styles.bufferChip, isSelected && styles.bufferChipActive]}
                      onPress={() => setMaxSessionsPerDay(maxNum)}
                    >
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? Palette.secondary : Palette.slate400}
                      />
                      <Text
                        style={[
                          styles.bufferChipText,
                          isSelected && { color: Palette.secondary, fontWeight: '700' },
                        ]}
                      >
                        Max {maxNum} Sessions
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Button
              title="Save Availability Schedule"
              size="lg"
              variant="primary"
              leftIcon={<Ionicons name="save-outline" size={18} color="#FFF" />}
              onPress={handleSaveSchedule}
              style={{ marginTop: Spacing.two }}
            />
          </View>
        )}
      </ScrollView>

      {/* Clinician Video Launch Modal */}
      <Modal
        visible={!!activeVideoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveVideoModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.videoHeaderIcon}>
                <Ionicons name="videocam" size={24} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Clinician Teletherapy Station</Text>
                <Text style={styles.modalSubtitle}>High-Definition Interactive Speech Room</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveVideoModal(null)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <View style={styles.roomInfoBox}>
              <Text style={styles.roomPatient}>
                Client: {activeVideoModal?.child?.first_name || 'Leo'}{' '}
                {activeVideoModal?.child?.last_name || 'Watson'}
              </Text>
              <Text style={styles.roomTarget}>
                Target: {activeVideoModal?.notes || 'Speech sound production /s/'}
              </Text>
              <Text style={styles.roomTime}>Scheduled: {activeVideoModal?.scheduled_at}</Text>
            </View>

            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Station Features Ready:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="mic-outline" size={16} color={Palette.success} />
                <Text style={styles.featureText}>Noise cancellation & pitch feedback</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="images-outline" size={16} color={Palette.secondary} />
                <Text style={styles.featureText}>Interactive visual flashcards & reward stickers</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="document-text-outline" size={16} color={Palette.primary} />
                <Text style={styles.featureText}>Real-time SOAP shorthand note logger</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                size="md"
                variant="outline"
                onPress={() => setActiveVideoModal(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Open Video Room"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="videocam" size={18} color="#FFF" />}
                onPress={() => {
                  setActiveVideoModal(null);
                  Alert.alert(
                    'Teletherapy Room Active',
                    'Clinician teletherapy room launched. Screen sharing and digital stimuli enabled.'
                  );
                }}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Palette.primaryLight,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate600,
  },
  tabBtnTextActive: {
    color: Palette.primaryDark,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: Palette.warning,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.white,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sectionHeaderRow: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  sectionSub: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  emptyCard: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate800,
    marginTop: Spacing.two,
  },
  emptyDesc: {
    fontSize: 12,
    color: Palette.slate500,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  requestCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: Palette.warning,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  childIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
  },
  parentName: {
    fontSize: 12,
    color: Palette.slate500,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate700,
  },
  intakeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  intakeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  intakeText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  agendaCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  agendaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  agendaTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  agendaDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate500,
  },
  agendaBody: {
    marginBottom: Spacing.three,
  },
  agendaChild: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
  },
  agendaFocus: {
    fontSize: 12,
    color: Palette.slate600,
    marginTop: 2,
  },
  agendaActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  settingsCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: 2,
  },
  cardSectionSub: {
    fontSize: 11,
    color: Palette.slate500,
    marginBottom: Spacing.two,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  dayNameDisabled: {
    color: Palette.slate400,
  },
  dayHours: {},
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  dayOffText: {
    fontSize: 11,
    color: Palette.slate400,
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  bufferChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  bufferChipActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  bufferChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  bufferChipTextActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  videoHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  roomInfoBox: {
    backgroundColor: Palette.slate50,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  roomPatient: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate900,
  },
  roomTarget: {
    fontSize: 12,
    color: Palette.slate700,
    marginTop: 2,
  },
  roomTime: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  featuresList: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    gap: 8,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: Palette.slate600,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
