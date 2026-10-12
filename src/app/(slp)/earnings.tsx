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
import { MOCK_SLP_EARNINGS, MOCK_TRANSACTIONS } from '../../lib/mock-data';
import { Transaction } from '../../types/database';

type FilterType = 'all' | 'paid' | 'processing' | 'withdrawn';

export default function SlpEarningsScreen() {
  const [earnings, setEarnings] = useState(MOCK_SLP_EARNINGS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Withdrawal Modal State
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(
    earnings.withdrawable_balance.toFixed(2)
  );
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  const handleOpenWithdraw = () => {
    setWithdrawAmount(earnings.withdrawable_balance.toFixed(2));
    setWithdrawModalVisible(true);
  };

  const handlePresetAmount = (fraction: number) => {
    const val = (earnings.withdrawable_balance * fraction).toFixed(2);
    setWithdrawAmount(val);
  };

  const handleConfirmWithdrawal = () => {
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    if (amountNum > earnings.withdrawable_balance) {
      Alert.alert(
        'Insufficient Balance',
        `Your withdrawable balance is $${earnings.withdrawable_balance.toFixed(2)}.`
      );
      return;
    }

    setIsProcessingWithdrawal(true);
    setTimeout(() => {
      setIsProcessingWithdrawal(false);
      setWithdrawModalVisible(false);

      // Deduct balance and record transaction
      setEarnings((prev) => ({
        ...prev,
        withdrawable_balance: Math.max(0, prev.withdrawable_balance - amountNum),
      }));

      const newTxn: Transaction = {
        id: `txn-${Date.now().toString().slice(-4)}`,
        appointment_id: 'payout-req',
        slp_id: '11111111-1111-4111-a111-111111111111',
        parent_id: 'system',
        child_name: 'Bank Direct Deposit Payout',
        date: 'Just now',
        duration_minutes: 0,
        gross_amount: amountNum,
        service_fee: 0,
        net_earnings: amountNum,
        payment_method: 'Bank Transfer',
        status: 'processing',
      };
      setTransactions((prev) => [newTxn, ...prev]);

      Alert.alert(
        'Payout Initiated!',
        `$${amountNum.toFixed(2)} is en route to Chase Checking account (****4821). Expected deposit in 1-2 business days.`
      );
    }, 1200);
  };

  const handleDownloadTaxStatement = () => {
    Alert.alert(
      'Tax Summary Generated',
      'Your annual Form 1099-K earnings statement and session breakdown PDF have been saved.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title="Earnings & Payouts"
        rightElement={
          <Badge label="ACH Connected" variant="success" size="sm" />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Metrics Dashboard Cards */}
        <View style={styles.kpiGrid}>
          <Card style={[styles.kpiCard, styles.kpiCardPrimary]} variant="elevated">
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabelPrimary}>Withdrawable Balance</Text>
              <MaterialCommunityIcons name="wallet-outline" size={20} color={Palette.primary} />
            </View>
            <Text style={styles.kpiValuePrimary}>
              ${earnings.withdrawable_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Button
              title="Withdraw Funds"
              size="sm"
              variant="primary"
              leftIcon={<Ionicons name="arrow-up-circle-outline" size={16} color="#FFF" />}
              onPress={handleOpenWithdraw}
              style={{ marginTop: Spacing.two }}
            />
          </Card>

          <View style={styles.kpiRow}>
            <Card style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>Total Gross</Text>
              <Text style={styles.kpiSmallValue}>
                ${earnings.total_earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.kpiSmallSub}>All-time earnings</Text>
            </Card>

            <Card style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>Pending Escrow</Text>
              <Text style={styles.kpiSmallValue}>
                ${earnings.pending_payouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.kpiSmallSub}>Clears post-session</Text>
            </Card>
          </View>
        </View>

        {/* Payout Channel Info Banner */}
        <Card style={styles.payoutChannelCard}>
          <View style={styles.channelRow}>
            <View style={styles.bankIconCircle}>
              <MaterialCommunityIcons name="bank" size={22} color={Palette.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.channelTitle}>Chase Commercial Checking</Text>
              <Text style={styles.channelSub}>Account ending in ****4821 • Verified ACH</Text>
            </View>
            <Badge label="Default" variant="primary" size="sm" />
          </View>
          <View style={styles.payoutNoticeRow}>
            <Ionicons name="information-circle-outline" size={14} color={Palette.slate500} />
            <Text style={styles.payoutNoticeText}>
              Platform commission is 8% per session. Automatic weekly payout batches every Monday.
            </Text>
          </View>
        </Card>

        {/* Statement & Tax Actions */}
        <View style={styles.statementRow}>
          <TouchableOpacity
            style={styles.statementBtn}
            onPress={handleDownloadTaxStatement}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={18} color={Palette.primary} />
            <Text style={styles.statementBtnText}>Download 1099-K Statement</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Text style={styles.sectionSub}>Recent clinical session payouts and ledger entries</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'paid', 'processing', 'withdrawn'] as FilterType[]).map((f) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
                >
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color={Palette.slate400} />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyDesc}>
              No ledger entries match the selected &ldquo;{activeFilter}&rdquo; filter.
            </Text>
          </Card>
        ) : (
          filteredTransactions.map((item) => {
            const isPayout = item.appointment_id === 'payout-req';
            return (
              <Card key={item.id} style={styles.txnCard}>
                <View style={styles.txnTop}>
                  <View style={styles.txnLeft}>
                    <View
                      style={[
                        styles.txnIconWrap,
                        isPayout ? styles.iconWrapWithdraw : styles.iconWrapSession,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          isPayout
                            ? 'bank-transfer-out'
                            : item.payment_method === 'UPI'
                            ? 'cellphone-check'
                            : 'credit-card-outline'
                        }
                        size={20}
                        color={isPayout ? Palette.secondary : Palette.primary}
                      />
                    </View>
                    <View>
                      <Text style={styles.txnTitle}>{item.child_name}</Text>
                      <Text style={styles.txnDate}>
                        {item.date} • {item.payment_method}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txnRight}>
                    <Text
                      style={[
                        styles.txnAmount,
                        isPayout ? styles.txnAmountWithdraw : styles.txnAmountCredit,
                      ]}
                    >
                      {isPayout ? '-' : '+'}${item.net_earnings.toFixed(2)}
                    </Text>
                    <Badge
                      label={item.status.toUpperCase()}
                      variant={
                        item.status === 'paid'
                          ? 'success'
                          : item.status === 'processing'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    />
                  </View>
                </View>

                {!isPayout && (
                  <View style={styles.txnBreakdown}>
                    <Text style={styles.breakdownText}>
                      Gross: ${item.gross_amount.toFixed(2)} | Platform Fee (8%): -$
                      {item.service_fee.toFixed(2)} | Net to SLP: ${item.net_earnings.toFixed(2)}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* WITHDRAW FUNDS MODAL */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.withdrawHeaderIcon}>
                <MaterialCommunityIcons name="bank-transfer-out" size={24} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Request Payout Withdrawal</Text>
                <Text style={styles.modalSubtitle}>Transfer earnings to your bank account</Text>
              </View>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate500} />
              </TouchableOpacity>
            </View>

            <View style={styles.destAccountBox}>
              <Text style={styles.destAccountLabel}>Payout Destination:</Text>
              <Text style={styles.destAccountName}>Chase Commercial Checking (****4821)</Text>
              <Text style={styles.destAccountSub}>ACH Direct Deposit • 1-2 business days</Text>
            </View>

            <Text style={styles.inputLabel}>Withdrawal Amount ($ USD):</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handlePresetAmount(0.25)}
              >
                <Text style={styles.presetChipText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handlePresetAmount(0.5)}
              >
                <Text style={styles.presetChipText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handlePresetAmount(1.0)}
              >
                <Text style={styles.presetChipText}>All ($ {earnings.withdrawable_balance.toFixed(2)})</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimerText}>
              Funds will be transferred directly to your verified commercial checking account. No transfer fees applied.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                size="md"
                variant="outline"
                onPress={() => setWithdrawModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isProcessingWithdrawal ? 'Transferring...' : 'Confirm Payout'}
                size="md"
                variant="primary"
                loading={isProcessingWithdrawal}
                onPress={handleConfirmWithdrawal}
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
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  kpiGrid: {
    marginBottom: Spacing.three,
  },
  kpiCard: {
    padding: Spacing.four,
    marginBottom: Spacing.two,
  },
  kpiCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabelPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate600,
    textTransform: 'uppercase',
  },
  kpiValuePrimary: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.slate900,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kpiSmallCard: {
    flex: 1,
    padding: Spacing.three,
  },
  kpiSmallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
  },
  kpiSmallValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  kpiSmallSub: {
    fontSize: 10,
    color: Palette.slate400,
    marginTop: 2,
  },
  payoutChannelCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.slate900,
  },
  channelSub: {
    fontSize: 11,
    color: Palette.slate500,
  },
  payoutNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
  payoutNoticeText: {
    fontSize: 11,
    color: Palette.slate600,
    flex: 1,
    lineHeight: 15,
  },
  statementRow: {
    marginBottom: Spacing.three,
  },
  statementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
    borderRadius: BorderRadius.md,
  },
  statementBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  sectionHeaderRow: {
    marginBottom: Spacing.two,
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
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  filterChip: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.slate100,
  },
  filterChipActive: {
    backgroundColor: Palette.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  filterChipTextActive: {
    color: Palette.white,
  },
  emptyCard: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: Spacing.two,
  },
  emptyDesc: {
    fontSize: 12,
    color: Palette.slate500,
    textAlign: 'center',
    marginTop: 2,
  },
  txnCard: {
    marginBottom: Spacing.two,
    padding: Spacing.three,
  },
  txnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  txnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSession: {
    backgroundColor: Palette.primaryLight,
  },
  iconWrapWithdraw: {
    backgroundColor: Palette.secondaryLight,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  txnDate: {
    fontSize: 11,
    color: Palette.slate400,
    marginTop: 1,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  txnAmountCredit: {
    color: Palette.success,
  },
  txnAmountWithdraw: {
    color: Palette.secondary,
  },
  txnBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: 6,
    marginTop: 8,
  },
  breakdownText: {
    fontSize: 10,
    color: Palette.slate500,
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
  withdrawHeaderIcon: {
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
  destAccountBox: {
    backgroundColor: Palette.slate50,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
  },
  destAccountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate500,
    textTransform: 'uppercase',
  },
  destAccountName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
    marginTop: 2,
  },
  destAccountSub: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.one,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    backgroundColor: Palette.white,
    marginBottom: Spacing.two,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate800,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Palette.slate100,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate700,
  },
  disclaimerText: {
    fontSize: 11,
    color: Palette.slate500,
    lineHeight: 16,
    marginBottom: Spacing.three,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
