import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert 
} from 'react-native';
import { colors, formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { allocatePayment } from '../../utils/loanCalculators';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import Icon from '../common/Icon';

export const QuickCollectModal = ({
  visible,
  loan,
  installment,
  onClose,
  onSuccess,
}) => {
  const { recordPayment } = useApp();
  const [amountStr, setAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);

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
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Collect Installment</Text>
              <Text style={styles.subtitle}>{loan.loan_number} • {loan.product_name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <Text style={styles.customerName}>{loan.customer_name}</Text>
                <Badge
                  label={loan.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : 'Common Client'}
                  variant={loan.customer_type === 'SHOPKEEPER' ? 'secondary' : 'neutral'}
                  size="sm"
                />
              </View>
              {loan.shop_name && <Text style={styles.shopName}>{loan.shop_name}</Text>}
              <Text style={styles.customerPhone}>{loan.customer_phone}</Text>
            </View>

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
                  <Text style={[styles.summaryVal, { color: colors.primaryDark, fontWeight: '700' }]}>
                    {formatINR(currentInst.outstanding_amount)}
                  </Text>
                </View>
              </View>
            )}

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

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.methodSelector}>
              {['CASH', 'UPI', 'BANK_TRANSFER'].map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={[styles.methodBtn, isSelected && styles.selectedMethodBtn]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={[styles.methodText, isSelected && styles.selectedMethodText]}>
                      {method === 'CASH' ? 'Cash' : method === 'UPI' ? 'UPI' : 'Bank'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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

            <View style={styles.circulationPreview}>
              <Text style={styles.circTitle}>Fund Circulation Allocation</Text>
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

            <View style={styles.actionsRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={onClose}
                style={{ flex: 1, marginRight: 8 }}
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
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '700',
  },
  customerCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  shopName: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '500',
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  instSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  rupeePrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 10,
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
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
    fontWeight: '500',
    color: '#475569',
  },
  selectedMethodText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  refWrapper: {
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  circulationPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  circTitle: {
    fontSize: 11,
    fontWeight: '700',
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
    fontWeight: '800',
    color: colors.successText,
    marginTop: 2,
  },
  circIncome: {
    fontSize: 16,
    fontWeight: '800',
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
    marginBottom: 12,
  },
});
