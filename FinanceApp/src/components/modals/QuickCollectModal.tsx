import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';
import { Loan, LoanInstallment, PaymentMethod, Payment } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import { allocatePayment } from '../../utils/loanCalculators';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface QuickCollectModalProps {
  visible: boolean;
  loan?: Loan;
  installment?: LoanInstallment;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const QuickCollectModal: React.FC<QuickCollectModalProps> = ({
  visible,
  loan,
  installment,
  onClose,
  onSuccess,
}) => {
  const { recordPayment } = useApp();
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [refNumber, setRefNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (installment) {
      setAmountStr(installment.outstanding_amount.toString());
    } else if (loan) {
      const pending = loan.installments.find((i) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status));
      if (pending) {
        setAmountStr(pending.outstanding_amount.toString());
      }
    }
    setPaymentMethod('CASH');
    setRefNumber('');
  }, [visible, loan, installment]);

  if (!loan) return null;

  const currentInst = installment || loan.installments.find((i) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status));
  const numericAmount = parseFloat(amountStr) || 0;

  // Real-time breakdown calculation
  const breakdown = currentInst 
    ? allocatePayment(numericAmount, currentInst)
    : { principalAllocated: numericAmount * 0.9, incomeAllocated: numericAmount * 0.1 };

  const handleCollect = () => {
    if (numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid collection amount.');
      return;
    }

    if (currentInst && numericAmount > currentInst.outstanding_amount) {
      Alert.alert('Warning', `Amount exceeds outstanding installment of ₹${currentInst.outstanding_amount}.`);
    }

    setLoading(true);
    setTimeout(() => {
      const res = recordPayment({
        loanId: loan.id,
        installmentId: currentInst?.id,
        amount: numericAmount,
        paymentMethod,
        referenceNumber: paymentMethod !== 'CASH' ? refNumber : undefined,
      });

      setLoading(false);
      if (res.success && res.payment) {
        onSuccess(res.payment);
      } else {
        Alert.alert('Collection Error', res.message);
      }
    }, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Collect Installment</Text>
              <Text style={styles.subtitle}>{loan.loan_number} • {loan.product_name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Customer Information Card */}
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <Text style={styles.customerName}>{loan.customer_name}</Text>
                <Badge
                  label={loan.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : 'Common Client'}
                  variant={loan.customer_type === 'SHOPKEEPER' ? 'secondary' : 'neutral'}
                  size="sm"
                />
              </View>
              {loan.shop_name && <Text style={styles.shopName}>🏪 {loan.shop_name}</Text>}
              <Text style={styles.customerPhone}>📞 {loan.customer_phone}</Text>
            </View>

            {/* Installment Summary */}
            {currentInst && (
              <View style={styles.instSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Installment</Text>
                  <Text style={styles.summaryVal}>#{currentInst.installment_number} of {loan.total_installments}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Due Date</Text>
                  <Text style={styles.summaryVal}>{currentInst.due_date}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Scheduled Due</Text>
                  <Text style={[styles.summaryVal, { color: colors.primaryDark, fontWeight: typography.weights.bold }]}>
                    {formatINR(currentInst.outstanding_amount)}
                  </Text>
                </View>
              </View>
            )}

            {/* Amount Input */}
            <Text style={styles.inputLabel}>Collected Amount (₹)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Quick Amount Pills */}
            {currentInst && (
              <View style={styles.quickPillsRow}>
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => setAmountStr(currentInst.outstanding_amount.toString())}
                >
                  <Text style={styles.pillText}>Full ({formatINR(currentInst.outstanding_amount)})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => setAmountStr(Math.round(currentInst.outstanding_amount / 2).toString())}
                >
                  <Text style={styles.pillText}>Half (50%)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Payment Method Selector */}
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.methodSelector}>
              {(['CASH', 'UPI', 'BANK_TRANSFER'] as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={[styles.methodBtn, isSelected && styles.selectedMethodBtn]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={[styles.methodText, isSelected && styles.selectedMethodText]}>
                      {method === 'CASH' ? '💵 Cash' : method === 'UPI' ? '📱 UPI' : '🏦 Bank'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reference Number if non-cash */}
            {paymentMethod !== 'CASH' && (
              <View style={styles.refWrapper}>
                <Text style={styles.inputLabel}>UTR / Transaction Reference</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. UPI Ref # 938472918"
                  placeholderTextColor="#94A3B8"
                  value={refNumber}
                  onChangeText={setRefNumber}
                />
              </View>
            )}

            {/* The Fund Circulation Recycle Preview */}
            <View style={styles.circulationPreview}>
              <Text style={styles.circTitle}>🔄 Fund Circulation Allocation</Text>
              <View style={styles.circRow}>
                <View style={styles.circCol}>
                  <Text style={styles.circLabel}>Principal Recycled</Text>
                  <Text style={styles.circPrincipal}>+{formatINR(breakdown.principalAllocated)}</Text>
                  <Text style={styles.circSub}>Returns to Available Cash</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.circCol}>
                  <Text style={styles.circLabel}>Lending Income</Text>
                  <Text style={styles.circIncome}>+{formatINR(breakdown.incomeAllocated)}</Text>
                  <Text style={styles.circSub}>Recognized Earnings</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={onClose}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Confirm & Recycle"
                variant="primary"
                loading={loading}
                onPress={handleCollect}
                style={{ flex: 2 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  customerCard: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  shopName: {
    fontSize: typography.sizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  instSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: typography.weights.medium,
  },
  summaryVal: {
    fontSize: typography.sizes.sm,
    color: '#0F172A',
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  rupeePrefix: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
    paddingVertical: 10,
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  pillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: typography.weights.semibold,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedMethodBtn: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
  },
  methodText: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: '#475569',
  },
  selectedMethodText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  refWrapper: {
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  circulationPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.lg,
  },
  circTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  circRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#CBD5E1',
  },
  circLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  circPrincipal: {
    fontSize: 16,
    fontWeight: typography.weights.heavy,
    color: colors.successText,
    marginTop: 2,
  },
  circIncome: {
    fontSize: 16,
    fontWeight: typography.weights.heavy,
    color: colors.secondaryDark,
    marginTop: 2,
  },
  circSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
