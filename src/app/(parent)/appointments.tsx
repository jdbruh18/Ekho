import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

type TabType = 'upcoming' | 'completed' | 'cancelled';

const RESCHEDULE_SLOTS = [
  'Tomorrow, 10:00 AM',
  'Tomorrow, 2:30 PM',
  'Thursday, 11:00 AM',
  'Friday, 3:30 PM',
  'Saturday, 10:30 AM',
];

const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Child is unwell',
  'Need to change clinician',
  'Financial / insurance reasons',
  'Other personal reason',
];

export default function ParentAppointmentsScreen() {
  const {
    appointments,
    cancelAppointment,
    rescheduleAppointment,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Modal States
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [soapModalVisible, setSoapModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Form selections for modals
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(RESCHEDULE_SLOTS[0]);
  const [cancellationReason, setCancellationReason] = useState(CANCELLATION_REASONS[0]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Partitioned lists
  const upcomingList = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'pending' || a.status === 'rescheduled'
  );
  const completedList = appointments.filter((a) => a.status === 'completed');
  const cancelledList = appointments.filter((a) => a.status === 'cancelled');

  const currentList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  // Actions
  const handleOpenJoin = (appt: Appointment) => {
    setSelectedAppt(appt);
    setJoinModalVisible(true);
  };

  const handleOpenReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
    setSelectedRescheduleSlot(RESCHEDULE_SLOTS[0]);
    setRescheduleModalVisible(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppt) return;
    setIsSubmitting(true);
    try {
      await rescheduleAppointment(selectedAppt.id, selectedRescheduleSlot);
      setRescheduleModalVisible(false);
      Alert.alert(
        'Appointment Rescheduled!',
        `Your teletherapy session with ${selectedAppt.slp?.profile?.full_name || 'your clinician'} has been updated to ${selectedRescheduleSlot}.`
      );
    } catch {
      Alert.alert('Error', 'Failed to reschedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCancel = (appt: Appointment) => {
    setSelectedAppt(appt);
    setCancellationReason(CANCELLATION_REASONS[0]);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppt) return;
    setIsSubmitting(true);
    try {
      await cancelAppointment(selectedAppt.id);
      setCancelModalVisible(false);
      Alert.alert(
        'Appointment Cancelled',
        'Your appointment has been cancelled. Any eligible refund has been credited back to your original payment method.'
      );
    } catch {
      Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSoap = (appt: Appointment) => {
    setSelectedAppt(appt);
    setSoapModalVisible(true);
  };

  const handleOpenReview = (appt: Appointment) => {
    setSelectedAppt(appt);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setReviewModalVisible(false);
      Alert.alert(
        'Review Submitted!',
        `Thank you for rating ${selectedAppt?.slp?.profile?.full_name || 'your clinician'} ${reviewRating} stars.`
      );
    }, 600);
  };

  const handleBookAgain = (appt: Appointment) => {
    router.push({
      pathname: '/(parent)/book-session',
      params: { slpId: appt.slp_id, childId: appt.child_id },
    });
  };

  const formatScheduleText = (scheduledAt: string) => {
    if (!scheduledAt) return 'Scheduled Time';
    if (scheduledAt.includes('T')) {
      const d = new Date(scheduledAt);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return scheduledAt;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title="My Appointments"
        rightElement={
          <TouchableOpacity
            style={styles.newBookingBtn}
            onPress={() => router.push('/(parent)/find-slp')}
          >
            <Ionicons name="add" size={18} color={Palette.primary} />
            <Text style={styles.newBookingText}>Book New</Text>
          </TouchableOpacity>
        }
      />

      {/* Segmented Control Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}
          >
            Upcoming
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'upcoming' ? styles.tabBadgeActive : styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'upcoming' && styles.tabBadgeTextActive,
              ]}
            >
              {upcomingList.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}
          >
            Completed
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'completed' ? styles.tabBadgeActive : styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'completed' && styles.tabBadgeTextActive,
              ]}
            >
              {completedList.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cancelled' && styles.tabButtonActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text
            style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}
          >
            Cancelled
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'cancelled' ? styles.tabBadgeActive : styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'cancelled' && styles.tabBadgeTextActive,
              ]}
            >
              {cancelledList.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name={
                  activeTab === 'upcoming'
                    ? 'calendar-clock'
                    : activeTab === 'completed'
                    ? 'clipboard-check-outline'
                    : 'calendar-remove-outline'
                }
                size={40}
                color={Palette.slate400}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming'
                ? 'No Upcoming Sessions'
                : activeTab === 'completed'
                ? 'No Completed Sessions Yet'
                : 'No Cancelled Sessions'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'upcoming'
                ? 'Ready to boost your child&apos;s speech milestones? Discover verified pediatric clinicians and schedule a session today.'
                : activeTab === 'completed'
                ? 'Once you attend online sessions with your clinician, past clinical SOAP reports and review options will appear here.'
                : 'Any cancelled appointments will be listed here with details on refund statuses.'}
            </Text>
            {activeTab === 'upcoming' && (
              <Button
                title="Find a Speech Specialist"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="search" size={16} color="#FFF" />}
                onPress={() => router.push('/(parent)/find-slp')}
                style={styles.emptyBtn}
              />
            )}
          </View>
        ) : (
          currentList.map((appt) => {
            const slpName = appt.slp?.profile?.full_name || 'Dr. Maya Lin, Ph.D., CCC-SLP';
            const slpTitle = appt.slp?.title || 'Pediatric Speech-Language Pathologist';
            const childName = appt.child
              ? `${appt.child.first_name} ${appt.child.last_name}`
              : 'Leo Watson (Age 5)';
            const avatarUrl =
              appt.slp?.profile?.avatar_url ||
              'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80';

            const isPending = appt.status === 'pending';
            const isScheduled = appt.status === 'scheduled';
            const isCompleted = appt.status === 'completed';

            return (
              <Card key={appt.id} style={styles.apptCard} variant="elevated">
                {/* Reference & Badge Header */}
                <View style={styles.cardTopRow}>
                  <View style={styles.refBox}>
                    <Text style={styles.refText}>
                      Ref: {appt.booking_reference || `#TS-${appt.id.slice(0, 6).toUpperCase()}`}
                    </Text>
                  </View>
                  <Badge
                    label={
                      isPending
                        ? 'Pending SLP Confirmation'
                        : isScheduled
                        ? 'Confirmed Teletherapy'
                        : isCompleted
                        ? 'Completed'
                        : 'Cancelled'
                    }
                    variant={
                      isPending
                        ? 'warning'
                        : isScheduled
                        ? 'success'
                        : isCompleted
                        ? 'primary'
                        : 'danger'
                    }
                    size="sm"
                  />
                </View>

                {/* Clinician & Child Details */}
                <View style={styles.slpRow}>
                  <Image source={{ uri: avatarUrl }} style={styles.slpAvatar} />
                  <View style={styles.slpInfo}>
                    <Text style={styles.slpName}>{slpName}</Text>
                    <Text style={styles.slpTitle} numberOfLines={1}>
                      {slpTitle}
                    </Text>
                    <View style={styles.childTag}>
                      <MaterialCommunityIcons name="account-child" size={14} color={Palette.secondary} />
                      <Text style={styles.childTagText}>Patient: {childName}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Time & Duration Grid */}
                <View style={styles.timeInfoGrid}>
                  <View style={styles.timeItem}>
                    <Ionicons name="calendar-outline" size={16} color={Palette.primary} />
                    <View>
                      <Text style={styles.timeItemLabel}>Date & Time</Text>
                      <Text style={styles.timeItemVal}>{formatScheduleText(appt.scheduled_at)}</Text>
                    </View>
                  </View>

                  <View style={styles.timeItem}>
                    <Ionicons name="timer-outline" size={16} color={Palette.secondary} />
                    <View>
                      <Text style={styles.timeItemLabel}>Duration</Text>
                      <Text style={styles.timeItemVal}>
                        {appt.duration_minutes || 45} mins ($
                        {(appt.amount_paid ?? 71.25).toFixed(2)})
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Clinical Goal Target Note */}
                {appt.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Session Focus Target:</Text>
                    <Text style={styles.notesText}>{appt.notes}</Text>
                  </View>
                ) : null}

                {/* Actions per Status */}
                <View style={styles.cardActions}>
                  {activeTab === 'upcoming' && (
                    <>
                      {isScheduled && (
                        <Button
                          title="Join Live Session"
                          size="sm"
                          variant="primary"
                          leftIcon={<Ionicons name="videocam" size={16} color="#FFF" />}
                          onPress={() => handleOpenJoin(appt)}
                          style={{ flex: 1.3 }}
                        />
                      )}
                      <Button
                        title="Reschedule"
                        size="sm"
                        variant="outline"
                        leftIcon={<Ionicons name="calendar" size={15} color={Palette.primary} />}
                        onPress={() => handleOpenReschedule(appt)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Cancel"
                        size="sm"
                        variant="ghost"
                        onPress={() => handleOpenCancel(appt)}
                        style={styles.cancelBtn}
                      />
                    </>
                  )}

                  {activeTab === 'completed' && (
                    <>
                      <Button
                        title="SOAP Report"
                        size="sm"
                        variant="outline"
                        leftIcon={
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={16}
                            color={Palette.primary}
                          />
                        }
                        onPress={() => handleOpenSoap(appt)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Review"
                        size="sm"
                        variant="secondary"
                        leftIcon={<Ionicons name="star-outline" size={15} color="#FFF" />}
                        onPress={() => handleOpenReview(appt)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Book Again"
                        size="sm"
                        variant="primary"
                        onPress={() => handleBookAgain(appt)}
                        style={{ flex: 1 }}
                      />
                    </>
                  )}

                  {activeTab === 'cancelled' && (
                    <Button
                      title="Rebook with Clinician"
                      size="sm"
                      variant="primary"
                      leftIcon={<Ionicons name="repeat" size={16} color="#FFF" />}
                      onPress={() => handleBookAgain(appt)}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* 1. JOIN SESSION MODAL */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.videoHeaderIcon}>
                <Ionicons name="videocam" size={24} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Join Teletherapy Room</Text>
                <Text style={styles.modalSubtitle}>HIPAA & FERPA Secure Consultation</Text>
              </View>
              <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <View style={styles.sessionBrief}>
              <Text style={styles.briefClinician}>
                Clinician: {selectedAppt?.slp?.profile?.full_name || 'Dr. Maya Lin, Ph.D.'}
              </Text>
              <Text style={styles.briefPatient}>
                Child Patient:{' '}
                {selectedAppt?.child?.first_name || 'Leo'}{' '}
                {selectedAppt?.child?.last_name || 'Watson'}
              </Text>
              <Text style={styles.briefTime}>
                Room Status: <Text style={{ color: Palette.success, fontWeight: '700' }}>Active & Waiting</Text>
              </Text>
            </View>

            <View style={styles.checklistBox}>
              <Text style={styles.checklistTitle}>Pre-Session Readiness Checklist:</Text>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={Palette.success} />
                <Text style={styles.checkText}>Microphone & Camera operational</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={Palette.success} />
                <Text style={styles.checkText}>Quiet room with minimal background distractions</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={Palette.success} />
                <Text style={styles.checkText}>Child favorite toy or practice cards nearby</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                size="md"
                variant="outline"
                onPress={() => setJoinModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Connect Video Now"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="videocam" size={18} color="#FFF" />}
                onPress={() => {
                  setJoinModalVisible(false);
                  Alert.alert(
                    'Teletherapy Connected!',
                    `Connecting encrypted WebRTC audio/video bridge with ${selectedAppt?.slp?.profile?.full_name}. Have a productive session!`
                  );
                }}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. RESCHEDULE MODAL */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.calendarHeaderIcon}>
                <Ionicons name="calendar" size={24} color={Palette.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Reschedule Session</Text>
                <Text style={styles.modalSubtitle}>Pick an alternate available slot</Text>
              </View>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectSlotLabel}>Available Teletherapy Slots:</Text>
            <View style={styles.slotGrid}>
              {RESCHEDULE_SLOTS.map((slot) => {
                const isSelected = selectedRescheduleSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, isSelected && styles.slotChipActive]}
                    onPress={() => setSelectedRescheduleSlot(slot)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSelected ? Palette.secondary : Palette.slate400}
                    />
                    <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.rescheduleNotice}>
              * Rescheduling is free of charge up to 4 hours prior to the session start time.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Keep Original"
                size="md"
                variant="outline"
                onPress={() => setRescheduleModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? 'Updating...' : 'Confirm Reschedule'}
                size="md"
                variant="primary"
                loading={isSubmitting}
                onPress={handleConfirmReschedule}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. CANCEL MODAL */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.dangerHeaderIcon}>
                <Ionicons name="alert-circle" size={24} color={Palette.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Cancel Appointment</Text>
                <Text style={styles.modalSubtitle}>Please let us know why you need to cancel</Text>
              </View>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectSlotLabel}>Reason for cancellation:</Text>
            <View style={styles.slotGrid}>
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = cancellationReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonChip, isSelected && styles.reasonChipActive]}
                    onPress={() => setCancellationReason(reason)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={isSelected ? Palette.danger : Palette.slate400}
                    />
                    <Text style={[styles.reasonChipText, isSelected && styles.reasonChipTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.refundPolicyCard}>
              <Text style={styles.refundPolicyTitle}>Ekho Cancellation Policy:</Text>
              <Text style={styles.refundPolicyDesc}>
                Full refund will be processed to your source payment method within 3-5 business days. Your clinician will be automatically notified.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Go Back"
                size="md"
                variant="outline"
                onPress={() => setCancelModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                size="md"
                variant="danger"
                loading={isSubmitting}
                onPress={handleConfirmCancel}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. SOAP REPORT MODAL */}
      <Modal
        visible={soapModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSoapModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.soapHeaderIcon}>
                <MaterialCommunityIcons name="file-chart-outline" size={24} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Clinical SOAP Note</Text>
                <Text style={styles.modalSubtitle}>Official Session Summary</Text>
              </View>
              <TouchableOpacity onPress={() => setSoapModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.soapMetaRow}>
                <Text style={styles.soapMetaItem}>
                  Patient:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {selectedAppt?.child?.first_name || 'Leo'}{' '}
                    {selectedAppt?.child?.last_name || 'Watson'}
                  </Text>
                </Text>
                <Text style={styles.soapMetaItem}>
                  Target Accuracy:{' '}
                  <Text style={{ fontWeight: '700', color: Palette.success }}>78% (+13%)</Text>
                </Text>
              </View>

              <View style={styles.soapSection}>
                <Text style={styles.soapSectionHeader}>S (Subjective):</Text>
                <Text style={styles.soapText}>
                  Child arrived promptly for the teletherapy session with caregiver. High engagement and cooperative behavior observed throughout interactive phonological awareness games.
                </Text>
              </View>

              <View style={styles.soapSection}>
                <Text style={styles.soapSectionHeader}>O (Objective):</Text>
                <Text style={styles.soapText}>
                  • Target phoneme /s/ produced in word-initial position with 78% accuracy across 30 trials with moderate verbal/visual cueing.
                  {'\n'}• Minimal pair contrast drills (/s/ vs /t/) completed with 85% discrimination accuracy.
                </Text>
              </View>

              <View style={styles.soapSection}>
                <Text style={styles.soapSectionHeader}>A (Assessment):</Text>
                <Text style={styles.soapText}>
                  Noticeable reduction in stopping pattern for alveolar fricatives. Child demonstrated self-correction on 4 out of 10 misarticulations.
                </Text>
              </View>

              <View style={styles.soapSection}>
                <Text style={styles.soapSectionHeader}>P (Plan & Home Practice):</Text>
                <Text style={styles.soapText}>
                  Caregiver instructed on 5-minute daily &ldquo;Snake Sound&rdquo; flashcard routine. Continue weekly 45-min teletherapy targeting sentence-level transfer.
                </Text>
              </View>

              <View style={styles.soapSignOff}>
                <Text style={styles.soapSignText}>
                  Clinician Signature: {selectedAppt?.slp?.profile?.full_name || 'Dr. Maya Lin, Ph.D., CCC-SLP'}
                </Text>
                <Text style={styles.soapSignSub}>State License #SLP-94812 • Verified Clinician</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Close"
                size="md"
                variant="outline"
                onPress={() => setSoapModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Download PDF"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="download-outline" size={18} color="#FFF" />}
                onPress={() => {
                  Alert.alert('Report Downloaded', 'The clinical SOAP note PDF has been saved to your downloads.');
                }}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. REVIEW MODAL */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.reviewHeaderIcon}>
                <Ionicons name="star" size={24} color={Palette.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Leave Clinician Review</Text>
                <Text style={styles.modalSubtitle}>Help other parents discover great speech care</Text>
              </View>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= reviewRating ? Palette.accent : Palette.slate300}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabelText}>
              {reviewRating === 5
                ? 'Exceptional Clinical Care (5.0)'
                : reviewRating === 4
                ? 'Very Helpful & Engaging (4.0)'
                : reviewRating === 3
                ? 'Average Therapy Experience (3.0)'
                : 'Needs Improvement'}
            </Text>

            <Text style={styles.feedbackInputLabel}>Your Feedback & Experience:</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder="Describe how the clinician connected with your child and what progress you noticed..."
              placeholderTextColor={Palette.slate400}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                size="md"
                variant="outline"
                onPress={() => setReviewModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? 'Submitting...' : 'Post Review'}
                size="md"
                variant="primary"
                loading={isSubmitting}
                onPress={handleSubmitReview}
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
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Palette.primaryLight,
  },
  newBookingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    gap: Spacing.two,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Palette.primaryLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate600,
  },
  tabTextActive: {
    color: Palette.primaryDark,
    fontWeight: '800',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  tabBadgeActive: {
    backgroundColor: Palette.primary,
  },
  tabBadgeInactive: {
    backgroundColor: Palette.slate200,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate600,
  },
  tabBadgeTextActive: {
    color: Palette.white,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  emptyState: {
    paddingVertical: Spacing.six * 1.5,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate800,
    marginBottom: Spacing.one,
  },
  emptyDesc: {
    fontSize: 13,
    color: Palette.slate500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.four,
  },
  emptyBtn: {
    minWidth: 200,
  },
  apptCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  refBox: {
    backgroundColor: Palette.slate100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  refText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  slpRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  slpAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.slate200,
  },
  slpInfo: {
    flex: 1,
  },
  slpName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
  },
  slpTitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  childTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  childTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.slate100,
    marginVertical: Spacing.two,
  },
  timeInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    flex: 1,
  },
  timeItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.slate400,
    textTransform: 'uppercase',
  },
  timeItemVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: 1,
  },
  notesBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#14532D',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.two,
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
  calendarHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soapHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.accentLight,
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
  sessionBrief: {
    backgroundColor: Palette.slate50,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  briefClinician: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  briefPatient: {
    fontSize: 12,
    color: Palette.slate600,
    marginTop: 2,
  },
  briefTime: {
    fontSize: 12,
    color: Palette.slate600,
    marginTop: 2,
  },
  checklistBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    gap: 8,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: Palette.slate600,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  selectSlotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
  },
  slotGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  slotChipActive: {
    borderColor: Palette.secondary,
    backgroundColor: Palette.secondaryLight,
  },
  slotChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate700,
  },
  slotChipTextActive: {
    color: Palette.secondary,
    fontWeight: '700',
  },
  rescheduleNotice: {
    fontSize: 11,
    color: Palette.slate500,
    lineHeight: 16,
    marginBottom: Spacing.two,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  reasonChipActive: {
    borderColor: Palette.danger,
    backgroundColor: Palette.dangerLight,
  },
  reasonChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  reasonChipTextActive: {
    color: Palette.danger,
    fontWeight: '700',
  },
  refundPolicyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    marginBottom: Spacing.two,
  },
  refundPolicyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  refundPolicyDesc: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 15,
  },
  soapMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.slate100,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  soapMetaItem: {
    fontSize: 12,
    color: Palette.slate700,
  },
  soapSection: {
    marginBottom: Spacing.two,
  },
  soapSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.primaryDark,
    marginBottom: 2,
  },
  soapText: {
    fontSize: 12,
    color: Palette.slate700,
    lineHeight: 17,
  },
  soapSignOff: {
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
  },
  soapSignText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate900,
  },
  soapSignSub: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 1,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primaryDark,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  feedbackInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.one,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    fontSize: 13,
    color: Palette.slate900,
    backgroundColor: Palette.slate50,
    textAlignVertical: 'top',
    height: 90,
    marginBottom: Spacing.two,
  },
});
