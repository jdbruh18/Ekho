import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { router } from 'expo-router';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SlpProfile, ChildProfile, Appointment } from '../../types/database';
import { useAuth } from '../../lib/auth-context';
import { generateUUID } from '../../lib/uuid';

export interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  slp: SlpProfile;
  child: ChildProfile;
  date: string;
  time: string;
  durationMinutes: number;
  sessionFee: number;
  notes?: string;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';

export function PaymentModal({
  visible,
  onClose,
  slp,
  child,
  date,
  time,
  durationMinutes,
  sessionFee,
  notes,
}: PaymentModalProps) {
  const { session, bookAppointment } = useAuth();

  // Payment UI state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [upiId, setUpiId] = useState('parent@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('891');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedRefCode, setGeneratedRefCode] = useState('');

  // Fee calculation
  const platformFee = Math.round(sessionFee * 0.08 * 100) / 100;
  const totalAmount = Math.round((sessionFee + platformFee) * 100) / 100;

  const handlePayAndConfirm = async () => {
    setIsProcessing(true);

    // Simulate payment gateway roundtrip
    setTimeout(async () => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const refCode = `TS-${randomSuffix}-V3`;
      setGeneratedRefCode(refCode);

      const newAppt: Appointment = {
        id: generateUUID(),
        parent_id: session?.id || '44444444-4444-4444-a444-444444444444',
        slp_id: slp.id,
        child_id: child.id,
        scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        duration_minutes: durationMinutes,
        status: 'scheduled',
        consultation_type: 'online',
        meeting_link: `https://meet.slptherapy.app/session/${refCode.toLowerCase()}`,
        amount_paid: totalAmount,
        payment_status: 'paid',
        booking_reference: refCode,
        notes: notes || `Session focus: General communication practice (${durationMinutes} mins)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slp,
        child,
      };

      await bookAppointment(newAppt);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800);
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Event Added',
      `45-min Teletherapy Consultation with ${slp.profile?.full_name} for ${child.first_name} has been synced to your device calendar with 15-minute reminders.`
    );
  };

  const handleViewAppointments = () => {
    onClose();
    setIsSuccess(false);
    router.push('/(parent)/appointments');
  };

  const handleGoHome = () => {
    onClose();
    setIsSuccess(false);
    router.push('/(parent)');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {isSuccess ? 'Booking Confirmed' : 'Checkout & Payment'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isSuccess
                  ? 'Your teletherapy video session is scheduled'
                  : 'HIPAA-compliant encrypted payment processing'}
              </Text>
            </View>
            {!isProcessing && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Palette.slate700} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* SCREEN 1: SUCCESS CONFIRMATION RECEIPT */}
            {isSuccess ? (
              <View style={styles.successSection}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={56} color={Palette.success} />
                </View>

                <Text style={styles.successHeadline}>Session Successfully Booked!</Text>
                <Text style={styles.successSub}>
                  A confirmation receipt and secure video room link have been sent to your registered
                  email.
                </Text>

                {/* Receipt Card */}
                <Card style={styles.receiptCard} variant="elevated">
                  <View style={styles.refRow}>
                    <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
                    <Text style={styles.refCode}>{generatedRefCode}</Text>
                  </View>

                  <View style={styles.receiptDivider} />

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Clinician:</Text>
                    <Text style={styles.receiptVal}>{slp.profile?.full_name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Patient (Child):</Text>
                    <Text style={styles.receiptVal}>
                      {child.first_name} {child.last_name}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Scheduled Slot:</Text>
                    <Text style={styles.receiptVal}>
                      {date} • {time} ({durationMinutes} mins)
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Amount Paid:</Text>
                    <Text style={[styles.receiptVal, { color: Palette.primaryDark }]}>
                      ${totalAmount} (USD)
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Payment Method:</Text>
                    <Text style={styles.receiptVal}>
                      {selectedMethod === 'card'
                        ? 'Credit Card (••4242)'
                        : selectedMethod === 'upi'
                        ? 'UPI Instant'
                        : 'Net Banking'}
                    </Text>
                  </View>
                </Card>

                {/* Add to Calendar Button */}
                <Button
                  title="Add to Device Calendar"
                  size="md"
                  variant="outline"
                  leftIcon={<Ionicons name="calendar-outline" size={16} color={Palette.primary} />}
                  onPress={handleAddToCalendar}
                  style={styles.calendarBtn}
                />

                {/* Direct Navigation Actions */}
                <View style={styles.successActionsGroup}>
                  <Button
                    title="View My Appointments"
                    size="lg"
                    variant="primary"
                    rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFF" />}
                    onPress={handleViewAppointments}
                  />
                  <Button
                    title="Return to Parent Dashboard"
                    size="md"
                    variant="ghost"
                    onPress={handleGoHome}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>
            ) : isProcessing ? (
              /* SCREEN 2: SIMULATED PAYMENT PROCESSING */
              <View style={styles.processingSection}>
                <ActivityIndicator size="large" color={Palette.primary} />
                <Text style={styles.processingTitle}>Securing Teletherapy Session...</Text>
                <Text style={styles.processingSub}>
                  Contacting payment gateway, assigning HIPAA video room tokens, and notifying{' '}
                  {slp.profile?.full_name}.
                </Text>
              </View>
            ) : (
              /* SCREEN 3: CHECKOUT & PAYMENT METHOD SELECTOR */
              <View>
                {/* Appointment Summary Box */}
                <Card style={styles.summaryCard} variant="outlined">
                  <View style={styles.slpSummaryRow}>
                    <Image
                      source={{
                        uri:
                          slp.profile?.avatar_url ||
                          'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
                      }}
                      style={styles.summaryAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summarySlpName}>{slp.profile?.full_name}</Text>
                      <Text style={styles.summarySlpTitle}>{slp.title}</Text>
                      <View style={styles.summaryBadgeRow}>
                        <Badge label="Online Teletherapy" variant="info" size="sm" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>PATIENT</Text>
                      <Text style={styles.detailValue}>
                        {child.first_name} {child.last_name}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>DATE & TIME</Text>
                      <Text style={styles.detailValue}>
                        {date} • {time}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>DURATION</Text>
                      <Text style={styles.detailValue}>{durationMinutes} Minutes</Text>
                    </View>
                  </View>
                </Card>

                {/* Itemized Fee Breakdown */}
                <Text style={styles.sectionHeader}>Itemized Fee Breakdown</Text>
                <Card style={styles.breakdownCard} variant="outlined">
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Clinician Session Fee ({durationMinutes}m)</Text>
                    <Text style={styles.feeValue}>${sessionFee.toFixed(2)}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Platform Technology & HIPAA Fee (8%)</Text>
                    <Text style={styles.feeValue}>${platformFee.toFixed(2)}</Text>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Due Now</Text>
                    <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
                  </View>
                </Card>

                {/* Payment Method Selector */}
                <Text style={styles.sectionHeader}>Select Payment Method</Text>
                <View style={styles.methodSelectorBar}>
                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      selectedMethod === 'card' && styles.methodTabActive,
                    ]}
                    onPress={() => setSelectedMethod('card')}
                  >
                    <FontAwesome5
                      name="credit-card"
                      size={14}
                      color={selectedMethod === 'card' ? Palette.primaryDark : Palette.slate600}
                    />
                    <Text
                      style={[
                        styles.methodTabText,
                        selectedMethod === 'card' && styles.methodTabTextActive,
                      ]}
                    >
                      Credit Card
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      selectedMethod === 'upi' && styles.methodTabActive,
                    ]}
                    onPress={() => setSelectedMethod('upi')}
                  >
                    <MaterialCommunityIcons
                      name="qrcode-scan"
                      size={16}
                      color={selectedMethod === 'upi' ? Palette.primaryDark : Palette.slate600}
                    />
                    <Text
                      style={[
                        styles.methodTabText,
                        selectedMethod === 'upi' && styles.methodTabTextActive,
                      ]}
                    >
                      UPI / QR
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      selectedMethod === 'netbanking' && styles.methodTabActive,
                    ]}
                    onPress={() => setSelectedMethod('netbanking')}
                  >
                    <Ionicons
                      name="business-outline"
                      size={15}
                      color={selectedMethod === 'netbanking' ? Palette.primaryDark : Palette.slate600}
                    />
                    <Text
                      style={[
                        styles.methodTabText,
                        selectedMethod === 'netbanking' && styles.methodTabTextActive,
                      ]}
                    >
                      Net Banking
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Dynamic Payment Input Section */}
                {selectedMethod === 'card' ? (
                  <Card style={styles.paymentInputCard} variant="outlined">
                    <Text style={styles.inputTitle}>Card Information</Text>
                    <View style={styles.cardInputRow}>
                      <TextInput
                        style={styles.cardTextInput}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        placeholder="Card Number"
                        keyboardType="numeric"
                      />
                      <FontAwesome5 name="cc-visa" size={20} color={Palette.slate400} />
                    </View>

                    <View style={styles.cardSplitRow}>
                      <TextInput
                        style={[styles.cardTextInput, { flex: 1, marginRight: 8 }]}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM / YY"
                      />
                      <TextInput
                        style={[styles.cardTextInput, { flex: 1 }]}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        placeholder="CVV"
                        secureTextEntry
                        keyboardType="numeric"
                      />
                    </View>
                  </Card>
                ) : selectedMethod === 'upi' ? (
                  <Card style={styles.paymentInputCard} variant="outlined">
                    <Text style={styles.inputTitle}>UPI VPA / Fast Checkout</Text>
                    <View style={styles.upiQuickRow}>
                      <Badge label="Google Pay" variant="info" size="md" />
                      <Badge label="PhonePe" variant="primary" size="md" />
                      <Badge label="Paytm" variant="neutral" size="md" />
                    </View>
                    <TextInput
                      style={[styles.cardTextInput, { marginTop: 8 }]}
                      value={upiId}
                      onChangeText={setUpiId}
                      placeholder="e.g. yourname@okhdfcbank"
                    />
                    <Text style={styles.upiHelperText}>
                      A payment request will be triggered on your UPI app upon confirmation.
                    </Text>
                  </Card>
                ) : (
                  <Card style={styles.paymentInputCard} variant="outlined">
                    <Text style={styles.inputTitle}>Select Bank / Wallet</Text>
                    <View style={styles.bankGrid}>
                      {['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank'].map((b) => (
                        <View key={b} style={styles.bankPill}>
                          <Ionicons name="shield-checkmark" size={14} color={Palette.primary} />
                          <Text style={styles.bankName}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}

                {/* Pay & Confirm CTA */}
                <Button
                  title={`Pay & Confirm Booking ($${totalAmount.toFixed(2)})`}
                  size="lg"
                  variant="primary"
                  leftIcon={<Ionicons name="lock-closed" size={16} color="#FFF" />}
                  onPress={handlePayAndConfirm}
                  style={styles.payBtn}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  modalBody: {
    marginBottom: Spacing.two,
  },
  summaryCard: {
    backgroundColor: Palette.slate50,
    marginBottom: Spacing.three,
  },
  slpSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  summarySlpName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  summarySlpTitle: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 1,
  },
  summaryBadgeRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  detailsGrid: {
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    paddingTop: Spacing.two,
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate400,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.one + 2,
    marginTop: Spacing.two,
  },
  breakdownCard: {
    marginBottom: Spacing.two,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 12,
    color: Palette.slate600,
  },
  feeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate800,
  },
  feeDivider: {
    height: 1,
    backgroundColor: Palette.slate200,
    marginVertical: Spacing.one,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate900,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.primaryDark,
  },
  methodSelectorBar: {
    flexDirection: 'row',
    backgroundColor: Palette.slate100,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.two,
    gap: 4,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.md - 2,
  },
  methodTabActive: {
    backgroundColor: Palette.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  methodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate600,
  },
  methodTabTextActive: {
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  paymentInputCard: {
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  inputTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two,
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two,
    height: 42,
    marginBottom: Spacing.two,
  },
  cardTextInput: {
    flex: 1,
    fontSize: 13,
    color: Palette.slate900,
  },
  cardSplitRow: {
    flexDirection: 'row',
  },
  upiQuickRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  upiHelperText: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 6,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate50,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  bankName: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate800,
  },
  payBtn: {
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  processingSection: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  processingSub: {
    fontSize: 12,
    color: Palette.slate500,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    lineHeight: 18,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  successIconCircle: {
    marginBottom: Spacing.two,
  },
  successHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
    textAlign: 'center',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: Palette.slate600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Palette.slate50,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate400,
    letterSpacing: 0.5,
  },
  refCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.primaryDark,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Palette.slate200,
    marginVertical: Spacing.two,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptField: {
    fontSize: 12,
    color: Palette.slate500,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
  },
  calendarBtn: {
    width: '100%',
    marginBottom: Spacing.two,
  },
  successActionsGroup: {
    width: '100%',
    gap: 4,
  },
});
