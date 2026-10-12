import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth-context';
import { MOCK_APPOINTMENTS, MOCK_SLP_PROFILES, MOCK_CHILDREN } from '../../lib/mock-data';
import { StimulusBoard } from '../../components/clinical/StimulusBoard';
import { InSessionChatAndNotes } from '../../components/clinical/InSessionChatAndNotes';
import {
  ClinicalTrialScore,
  InSessionChatMessage,
  InSessionNote,
} from '../../types/teletherapy';
import { Appointment } from '../../types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TeletherapyRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, session } = useAuth();

  // Find appointment
  const currentAppt: Appointment =
    appointments.find((a) => a.id === id) ||
    MOCK_APPOINTMENTS.find((a) => a.id === id) || {
      id: id || 'demo-appt',
      parent_id: '44444444-4444-4444-a444-444444444444',
      slp_id: '11111111-1111-4111-a111-111111111111',
      child_id: 'aaaaaaa1-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
      scheduled_at: new Date().toISOString(),
      duration_minutes: 45,
      status: 'scheduled',
      consultation_type: 'online',
      amount_paid: 95.0,
      payment_status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slp: MOCK_SLP_PROFILES[0],
      child: MOCK_CHILDREN[0],
    };

  const isSlpRole = session?.role === 'slp';
  const clinicianName = currentAppt.slp?.profile?.full_name || 'Dr. Maya Lin, Ph.D., CCC-SLP';
  const childName = currentAppt.child
    ? `${currentAppt.child.first_name} ${currentAppt.child.last_name}`
    : 'Leo Watson';

  // 1. Pre-Session State
  const [inPreSession, setInPreSession] = useState(true);
  const [micReady, setMicReady] = useState(true);
  const [camReady, setCamReady] = useState(true);

  // 2. In-Call Media & Layout State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMirrorMode, setIsMirrorMode] = useState(false); // Oral-Motor positioning mode
  const [isSwappedView, setIsSwappedView] = useState(false);

  // 3. Modals & Drawers
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const [notesChatVisible, setNotesChatVisible] = useState(false);
  const [parentRecapVisible, setParentRecapVisible] = useState(false);

  // 4. In-Session Timer
  const sessionTotalSeconds = (currentAppt.duration_minutes || 45) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(sessionTotalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 5. Clinical Trial Scoring
  const [trialScore, setTrialScore] = useState<ClinicalTrialScore>({
    total_trials: 0,
    correct_count: 0,
    accuracy_percentage: 0,
    minimal_cue_count: 0,
    moderate_cue_count: 0,
    maximal_cue_count: 0,
  });

  // 6. Positive Reinforcement
  const [starCount, setStarCount] = useState(0);
  const [starAlertText, setStarAlertText] = useState<string | null>(null);

  // 7. Clinical Notes & Chat Messages
  const [sessionNotes, setSessionNotes] = useState<InSessionNote[]>([]);
  const [chatMessages, setChatMessages] = useState<InSessionChatMessage[]>([
    {
      id: 'msg-init',
      sender_id: 'slp-1',
      sender_name: isSlpRole ? 'You (SLP)' : clinicianName,
      sender_role: 'slp',
      text: 'Welcome! Today we will practice initial /s/ words and minimal pairs.',
      timestamp: '00:01',
    },
  ]);

  // Timer countdown hook
  useEffect(() => {
    if (inPreSession) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [inPreSession]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isFiveMinWarning = remainingSeconds <= 300 && remainingSeconds > 0;

  // Trial scoring handlers
  const handleRecordTrial = (
    isCorrect: boolean,
    cueLevel: 'independent' | 'minimal' | 'moderate' | 'maximal'
  ) => {
    setTrialScore((prev) => {
      const newTotal = prev.total_trials + 1;
      const newCorrect = isCorrect ? prev.correct_count + 1 : prev.correct_count;
      const newAcc = Math.round((newCorrect / newTotal) * 100);

      return {
        total_trials: newTotal,
        correct_count: newCorrect,
        accuracy_percentage: newAcc,
        minimal_cue_count:
          cueLevel === 'minimal' ? prev.minimal_cue_count + 1 : prev.minimal_cue_count,
        moderate_cue_count:
          cueLevel === 'moderate' ? prev.moderate_cue_count + 1 : prev.moderate_cue_count,
        maximal_cue_count:
          cueLevel === 'maximal' ? prev.maximal_cue_count + 1 : prev.maximal_cue_count,
      };
    });
  };

  // Award positive star
  const handleAwardStar = (msg: string) => {
    setStarCount((prev) => prev + 1);
    setStarAlertText(msg);
    setTimeout(() => {
      setStarAlertText(null);
    }, 2800);
  };

  // Add clinical shorthand note
  const handleAddNote = (noteText: string, category: InSessionNote['category']) => {
    const newNote: InSessionNote = {
      id: 'note-' + Date.now(),
      timestamp: formatTimer(elapsedSeconds),
      elapsed_seconds: elapsedSeconds,
      note: noteText,
      category,
    };
    setSessionNotes((prev) => [newNote, ...prev]);
  };

  // Send in-session message
  const handleSendMessage = (text: string, sticker?: InSessionChatMessage['reward_sticker']) => {
    const newMessage: InSessionChatMessage = {
      id: 'msg-' + Date.now(),
      sender_id: session?.id || 'demo-user',
      sender_name: isSlpRole ? clinicianName : (session?.profile?.full_name || 'Emily Watson'),
      sender_role: isSlpRole ? 'slp' : 'parent',
      text,
      timestamp: formatTimer(elapsedSeconds),
      reward_sticker: sticker,
    };
    setChatMessages((prev) => [...prev, newMessage]);
    if (sticker === 'star') {
      handleAwardStar('Clinician awarded a gold star! ⭐');
    }
  };

  // End consultation
  const handleEndCallPress = () => {
    Alert.alert(
      'End Teletherapy Consultation',
      isSlpRole
        ? 'Are you ready to conclude this video consultation and open the structured SOAP clinical report?'
        : 'Are you sure you want to leave this teletherapy session?',
      [
        { text: 'Keep In Session', style: 'cancel' },
        {
          text: isSlpRole ? 'Conclude & SOAP Report' : 'Leave Room',
          style: 'destructive',
          onPress: () => {
            if (isSlpRole) {
              router.replace({
                pathname: '/session/report-form',
                params: {
                  appointmentId: currentAppt.id,
                  childId: currentAppt.child_id,
                  childName,
                  durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
                  totalTrials: trialScore.total_trials,
                  correctTrials: trialScore.correct_count,
                  accuracyPercentage: trialScore.accuracy_percentage,
                  capturedNotes: JSON.stringify(sessionNotes.map((n) => `[${n.timestamp}] ${n.note}`)),
                },
              });
            } else {
              setParentRecapVisible(true);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* ============================================================== */}
      {/* 1. PRE-SESSION READINESS MODAL */}
      {/* ============================================================== */}
      <Modal visible={inPreSession} animationType="fade" transparent>
        <View style={styles.preSessionOverlay}>
          <View style={styles.preSessionCard}>
            <View style={styles.preHeaderRow}>
              <View style={styles.preLogoBadge}>
                <MaterialCommunityIcons name="video-account" size={26} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.preTitle}>Your Session is About to Begin</Text>
                <Text style={styles.preSubtitle}>HIPAA & FERPA Compliant Speech Consultation</Text>
              </View>
            </View>

            {/* Session Info Card */}
            <View style={styles.preInfoBox}>
              <View style={styles.preInfoItem}>
                <Text style={styles.preInfoLabel}>TREATING CLINICIAN</Text>
                <Text style={styles.preInfoValue}>{clinicianName}</Text>
                <Badge label="Verified ASHA CCC-SLP" variant="success" size="sm" />
              </View>
              <View style={styles.preDivider} />
              <View style={styles.preInfoItem}>
                <Text style={styles.preInfoLabel}>PATIENT</Text>
                <Text style={styles.preInfoValue}>{childName}</Text>
                <Text style={styles.preSubValue}>
                  Scheduled Duration: {currentAppt.duration_minutes || 45} mins
                </Text>
              </View>
            </View>

            {/* Device Check Toggles */}
            <Text style={styles.checklistHeadline}>Pre-Session Device Check:</Text>
            <View style={styles.deviceRow}>
              <TouchableOpacity
                style={[styles.deviceToggle, micReady && styles.deviceToggleActive]}
                onPress={() => setMicReady(!micReady)}
              >
                <Ionicons
                  name={micReady ? 'mic' : 'mic-off'}
                  size={20}
                  color={micReady ? '#16A34A' : '#DC2626'}
                />
                <View>
                  <Text style={styles.deviceToggleTitle}>Microphone</Text>
                  <Text style={styles.deviceToggleStatus}>
                    {micReady ? 'Operational (Audio OK)' : 'Muted / Disabled'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deviceToggle, camReady && styles.deviceToggleActive]}
                onPress={() => setCamReady(!camReady)}
              >
                <Ionicons
                  name={camReady ? 'videocam' : 'videocam-off'}
                  size={20}
                  color={camReady ? '#16A34A' : '#DC2626'}
                />
                <View>
                  <Text style={styles.deviceToggleTitle}>Video Camera</Text>
                  <Text style={styles.deviceToggleStatus}>
                    {camReady ? 'HD Camera Ready' : 'Camera Off'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Readiness Advice Banner */}
            <View style={styles.readinessNote}>
              <MaterialCommunityIcons name="information" size={18} color="#0284C7" />
              <Text style={styles.readinessText}>
                Ensure your child is seated comfortably in a quiet, well-lit space. Have their favorite
                practice toy or target words ready.
              </Text>
            </View>

            {/* Enter Button */}
            <Button
              title="Enter Teletherapy Room"
              size="lg"
              variant="primary"
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              onPress={() => {
                setIsMuted(!micReady);
                setIsVideoOff(!camReady);
                setInPreSession(false);
              }}
              style={styles.enterRoomBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* 2. ACTIVE VIDEO CONSULTATION CANVAS */}
      {/* ============================================================== */}
      <View style={styles.videoCanvas}>
        {/* Primary Video Stream */}
        <View style={styles.primaryStream}>
          <Image
            source={{
              uri: isSwappedView
                ? 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=900&fit=crop&q=80' // Child view
                : 'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=900&fit=crop&q=80', // Clinician view
            }}
            style={styles.primaryVideoImage}
          />

          {/* Participant Label Tag */}
          <View style={styles.participantTag}>
            <View style={styles.speakingDot} />
            <Text style={styles.participantName}>
              {isSwappedView ? childName : clinicianName}
            </Text>
          </View>
        </View>

        {/* Secondary Picture-in-Picture (PiP) Stream */}
        <TouchableOpacity
          style={[styles.pipContainer, isMirrorMode && styles.mirrorModePip]}
          activeOpacity={0.9}
          onPress={() => setIsSwappedView(!isSwappedView)}
        >
          {isVideoOff ? (
            <View style={styles.videoOffPlaceholder}>
              <Ionicons name="videocam-off" size={24} color={Palette.slate400} />
              <Text style={styles.videoOffText}>Camera Off</Text>
            </View>
          ) : (
            <Image
              source={{
                uri: isSwappedView
                  ? 'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=400&fit=crop&q=80',
              }}
              style={styles.pipVideoImage}
            />
          )}

          <View style={styles.pipLabelBox}>
            <Text style={styles.pipLabelText}>
              {isSwappedView ? 'Clinician' : 'Child Patient (You)'}
            </Text>
          </View>

          {isMirrorMode && (
            <View style={styles.mirrorCrosshairs}>
              <Text style={styles.mirrorHelpText}>
                Oral-Motor Mirror Mode: Watch tongue & lip placement
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ============================================================== */}
        {/* 3. TOP CLINICAL HUD OVERLAY */}
        {/* ============================================================== */}
        <View style={styles.topHud}>
          {/* Patient Tag */}
          <View style={styles.hudPatientBadge}>
            <MaterialCommunityIcons name="account-child" size={16} color={Palette.white} />
            <Text style={styles.hudPatientName}>{childName}</Text>
          </View>

          {/* Center Timer & Warning */}
          <View style={[styles.hudTimerBadge, isFiveMinWarning && styles.hudTimerWarning]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isFiveMinWarning ? '#DC2626' : Palette.white}
            />
            <Text style={[styles.hudTimerText, isFiveMinWarning && styles.hudTimerTextWarning]}>
              {formatTimer(remainingSeconds)}
            </Text>
            {isFiveMinWarning && (
              <Badge label="5 Min Left" variant="danger" size="sm" />
            )}
          </View>

          {/* Star Counter & Encrypted Connection */}
          <View style={styles.hudRightGroup}>
            {starCount > 0 && (
              <View style={styles.hudStarBadge}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.hudStarText}>{starCount}</Text>
              </View>
            )}
            <View style={styles.hudSecurityPill}>
              <Ionicons name="lock-closed" size={11} color="#34D399" />
              <Text style={styles.hudSecurityText}>HIPAA</Text>
            </View>
          </View>
        </View>

        {/* Floating Gentle Star Reward Animation Banner */}
        {starAlertText && (
          <View style={styles.floatingStarBanner}>
            <Ionicons name="star" size={22} color="#FBBF24" />
            <Text style={styles.floatingStarText}>{starAlertText}</Text>
          </View>
        )}

        {/* Mirror Mode Quick Toggle Pill */}
        <TouchableOpacity
          style={[styles.mirrorPill, isMirrorMode && styles.mirrorPillActive]}
          onPress={() => setIsMirrorMode(!isMirrorMode)}
        >
          <MaterialCommunityIcons
            name="mirror"
            size={16}
            color={isMirrorMode ? '#FFF' : Palette.slate800}
          />
          <Text style={[styles.mirrorPillText, isMirrorMode && styles.mirrorPillTextActive]}>
            {isMirrorMode ? 'Exit Mirror Mode' : 'Oral-Motor Mirror Mode'}
          </Text>
        </TouchableOpacity>

        {/* ============================================================== */}
        {/* 4. IN-CALL BOTTOM CONTROL DOCK */}
        {/* ============================================================== */}
        <View style={styles.controlDock}>
          {/* Mute Mic */}
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnInactive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={22}
              color={isMuted ? '#DC2626' : '#FFF'}
            />
            <Text style={styles.controlBtnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* Toggle Camera */}
          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnInactive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons
              name={isVideoOff ? 'videocam-off' : 'videocam'}
              size={22}
              color={isVideoOff ? '#DC2626' : '#FFF'}
            />
            <Text style={styles.controlBtnLabel}>{isVideoOff ? 'Start Cam' : 'Stop Cam'}</Text>
          </TouchableOpacity>

          {/* Clinical Stimulus Board */}
          <TouchableOpacity
            style={[styles.controlBtn, stimulusVisible && styles.controlBtnActive]}
            onPress={() => setStimulusVisible(true)}
          >
            <MaterialCommunityIcons
              name="cards-playing"
              size={22}
              color={stimulusVisible ? Palette.primary : '#FFF'}
            />
            <Text style={styles.controlBtnLabel}>Stimulus</Text>
            {trialScore.total_trials > 0 && (
              <View style={styles.controlBadge}>
                <Text style={styles.controlBadgeText}>{trialScore.accuracy_percentage}%</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Chat & Notes */}
          <TouchableOpacity
            style={[styles.controlBtn, notesChatVisible && styles.controlBtnActive]}
            onPress={() => setNotesChatVisible(true)}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={22}
              color={notesChatVisible ? Palette.primary : '#FFF'}
            />
            <Text style={styles.controlBtnLabel}>
              {isSlpRole ? 'Notes & Chat' : 'Chat'}
            </Text>
            {sessionNotes.length > 0 && (
              <View style={styles.controlBadge}>
                <Text style={styles.controlBadgeText}>{sessionNotes.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Camera Flip */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setIsFrontCamera(!isFrontCamera)}
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#FFF" />
            <Text style={styles.controlBtnLabel}>Flip</Text>
          </TouchableOpacity>

          {/* Red End Consultation Action */}
          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCallPress}>
            <MaterialCommunityIcons name="phone-hangup" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ============================================================== */}
      {/* 5. SLIDE-OVER STIMULUS BOARD MODAL */}
      {/* ============================================================== */}
      <Modal visible={stimulusVisible} animationType="slide" transparent>
        <View style={styles.drawerOverlay}>
          <StimulusBoard
            onClose={() => setStimulusVisible(false)}
            onAwardStar={handleAwardStar}
            trialScore={trialScore}
            onRecordTrial={handleRecordTrial}
            isSlpRole={isSlpRole}
          />
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* 6. SLIDE-OVER NOTES & CHAT DRAWER */}
      {/* ============================================================== */}
      <Modal visible={notesChatVisible} animationType="slide" transparent>
        <View style={styles.drawerOverlay}>
          <InSessionChatAndNotes
            onClose={() => setNotesChatVisible(false)}
            isSlpRole={isSlpRole}
            notes={sessionNotes}
            onAddNote={handleAddNote}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            elapsedSeconds={elapsedSeconds}
          />
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* 7. PARENT SESSION RECAP MODAL */}
      {/* ============================================================== */}
      <Modal visible={parentRecapVisible} animationType="slide" transparent>
        <View style={styles.preSessionOverlay}>
          <View style={styles.preSessionCard}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.three }}>
              <View style={styles.recapStarCircle}>
                <Ionicons name="trophy" size={32} color="#D97706" />
              </View>
              <Text style={styles.recapTitle}>Great Teletherapy Session!</Text>
              <Text style={styles.recapSub}>
                {childName} completed {Math.round(elapsedSeconds / 60)} minutes of live practice.
              </Text>
            </View>

            <View style={styles.recapBox}>
              <View style={styles.recapRow}>
                <Text style={styles.recapRowLabel}>Treating Clinician:</Text>
                <Text style={styles.recapRowVal}>{clinicianName}</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapRowLabel}>Session Duration:</Text>
                <Text style={styles.recapRowVal}>{Math.round(elapsedSeconds / 60)} mins</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapRowLabel}>Positive Stars Earned:</Text>
                <Text style={styles.recapRowVal}>⭐ {starCount || 5} Stars</Text>
              </View>
            </View>

            <View style={styles.soapNotice}>
              <Ionicons name="document-text-outline" size={20} color={Palette.primary} />
              <Text style={styles.soapNoticeText}>
                Your clinician is finalizing the official SOAP clinical report, performance
                percentages, and home practice exercises.
              </Text>
            </View>

            <Button
              title="Return to Appointments"
              size="lg"
              variant="primary"
              onPress={() => {
                setParentRecapVisible(false);
                router.replace('/(parent)/appointments');
              }}
              style={{ marginTop: Spacing.two }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  preSessionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  preSessionCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  preHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  preLogoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  preSubtitle: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  preInfoBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.three,
  },
  preInfoItem: {
    gap: 4,
  },
  preInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate500,
    letterSpacing: 0.5,
  },
  preInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  preSubValue: {
    fontSize: 12,
    color: Palette.slate600,
  },
  preDivider: {
    height: 1,
    backgroundColor: Palette.slate200,
    marginVertical: Spacing.two,
  },
  checklistHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
  },
  deviceRow: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  deviceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  deviceToggleActive: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  deviceToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  deviceToggleStatus: {
    fontSize: 11,
    color: Palette.slate600,
  },
  readinessNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    backgroundColor: '#F0F9FF',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    marginBottom: Spacing.four,
  },
  readinessText: {
    flex: 1,
    fontSize: 12,
    color: Palette.slate700,
    lineHeight: 17,
  },
  enterRoomBtn: {
    width: '100%',
  },
  videoCanvas: {
    flex: 1,
    backgroundColor: '#0B132B',
    position: 'relative',
  },
  primaryStream: {
    flex: 1,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  primaryVideoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  participantTag: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  participantName: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '600',
  },
  pipContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 110,
    height: 155,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  mirrorModePip: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.55,
    top: 70,
    right: (SCREEN_WIDTH * 0.15) / 2,
    borderColor: '#38BDF8',
    borderWidth: 3,
  },
  pipVideoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOffPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  videoOffText: {
    color: Palette.slate400,
    fontSize: 10,
    marginTop: 4,
  },
  pipLabelBox: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  pipLabelText: {
    color: Palette.white,
    fontSize: 9,
    fontWeight: '600',
  },
  mirrorCrosshairs: {
    position: 'absolute',
    bottom: 24,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.85)',
    padding: 6,
    borderRadius: 6,
  },
  mirrorHelpText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  topHud: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  hudPatientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  hudPatientName: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  hudTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  hudTimerWarning: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  hudTimerText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  hudTimerTextWarning: {
    color: '#DC2626',
  },
  hudRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  hudStarText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  hudSecurityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  hudSecurityText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingStarBanner: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },
  floatingStarText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '800',
  },
  mirrorPill: {
    position: 'absolute',
    bottom: 95,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    zIndex: 10,
  },
  mirrorPillActive: {
    backgroundColor: '#0284C7',
  },
  mirrorPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate800,
  },
  mirrorPillTextActive: {
    color: Palette.white,
  },
  controlDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: 'rgba(11, 19, 43, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 52,
    position: 'relative',
  },
  controlBtnInactive: {
    opacity: 0.8,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
  },
  controlBtnLabel: {
    color: Palette.slate300,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  controlBadge: {
    position: 'absolute',
    top: 2,
    right: 8,
    backgroundColor: Palette.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  controlBadgeText: {
    color: Palette.white,
    fontSize: 8,
    fontWeight: '800',
  },
  endCallBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  recapStarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  recapTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
    textAlign: 'center',
  },
  recapSub: {
    fontSize: 13,
    color: Palette.slate600,
    textAlign: 'center',
    marginTop: 4,
  },
  recapBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recapRowLabel: {
    fontSize: 13,
    color: Palette.slate600,
  },
  recapRowVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  soapNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.primaryLight,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  soapNoticeText: {
    flex: 1,
    fontSize: 12,
    color: Palette.primaryDark,
    lineHeight: 16,
  },
});
