import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../../../../../context/AppContext';
import { formatINR } from '../../../../../utils/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash (Field)', icon: 'wallet' },
  { id: 'UPI', label: 'UPI / QR Scan', icon: 'qrcode-scan' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'bank-transfer' },
];

export const CollectPaymentModal = ({ visible, onClose, initialLoan = null }) => {
  const { loans, collectPayment } = useApp();

  const activeLoans = useMemo(() => {
    return loans.filter(
      (l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID' || l.status === 'OVERDUE'
    );
  }, [loans]);

  const [selectedLoanId, setSelectedLoanId] = useState(
    initialLoan?.id ? String(initialLoan.id) : (activeLoans[0]?.id ? String(activeLoans[0]?.id) : '')
  );
  const [amountStr, setAmountStr] = useState(
    initialLoan?.emi_amount ? String(initialLoan.emi_amount) : (activeLoans[0]?.emi_amount ? String(activeLoans[0]?.emi_amount) : '1000')
  );
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLoan = useMemo(() => {
    return activeLoans.find((l) => String(l.id) === String(selectedLoanId)) || activeLoans[0];
  }, [activeLoans, selectedLoanId]);

  const handleSelectLoan = (loan) => {
    setSelectedLoanId(String(loan.id));
    setAmountStr(String(loan.emi_amount || loan.installment_amount || 1000));
  };

  const handleCollect = async () => {
    if (!selectedLoan) {
      Alert.alert('Loan Required', 'Please select an active borrower loan to record repayment.');
      return;
    }
    const amt = parseFloat(amountStr);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid installment collection amount.');
      return;
    }

    setSubmitting(true);
    try {
      await collectPayment(selectedLoan.id, amt, paymentMethod);
      Alert.alert(
        'Payment Recorded! 🎉',
        `Collection of ${formatINR(amt)} received from ${selectedLoan.customer_name || 'Borrower'} via ${paymentMethod}.`
      );
      onClose();
    } catch (err) {
      Alert.alert('Collection Error', err.message || 'Failed to record repayment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = activeLoans.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.customer_name?.toLowerCase().includes(q) ||
      l.loan_code?.toLowerCase().includes(q) ||
      l.customer_phone?.includes(q)
    );
  });

  const remainingBalance = selectedLoan
    ? Number(selectedLoan.outstanding_amount || (Number(selectedLoan.total_repayment_amount || 0) - Number(selectedLoan.total_paid || 0)) || 0)
    : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Record Collection / Payment</Text>
              <Text style={styles.sheetSubtitle}>Field installment recovery & instant digital ledger update</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* 1. Loan / Borrower Selector */}
            <Text style={styles.fieldLabel}>Select Borrower Loan Account *</Text>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={14} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by borrower name or loan code..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.loanPickerRow}>
              {filteredLoans.slice(0, 8).map((l) => {
                const isSelected = String(l.id) === String(selectedLoanId);
                return (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.loanChip, isSelected && styles.loanChipSelected]}
                    onPress={() => handleSelectLoan(l)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.loanChipTop}>
                      <Text style={[styles.loanBorrowerName, isSelected && { color: '#1D4ED8' }]}>
                        {l.customer_name || 'Borrower'}
                      </Text>
                      <Text style={styles.loanCodeTag}>{l.loan_code || `LN-${l.id}`}</Text>
                    </View>
                    <Text style={styles.loanEmiText}>
                      Due EMI: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{formatINR(l.emi_amount || 1000)}</Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Loan Status Card */}
            {selectedLoan && (
              <View style={styles.selectedLoanBanner}>
                <View style={styles.bannerRow}>
                  <View>
                    <Text style={styles.bannerName}>{selectedLoan.customer_name || 'Borrower Account'}</Text>
                    <Text style={styles.bannerSub}>{selectedLoan.repayment_frequency || 'WEEKLY'} Scheme • {selectedLoan.loan_code}</Text>
                  </View>
                  <View style={styles.balanceBadge}>
                    <Text style={styles.balanceLabel}>Remaining Balance</Text>
                    <Text style={styles.balanceVal}>{formatINR(remainingBalance)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2. Collection Amount Input */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Installment Amount to Collect (₹) *</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="e.g. 1000"
              placeholderTextColor="#94A3B8"
            />

            {/* Quick Amount Helper Chips */}
            {selectedLoan && (
              <View style={styles.quickAmtRow}>
                <TouchableOpacity
                  style={styles.quickAmtChip}
                  onPress={() => setAmountStr(String(selectedLoan.emi_amount || 1000))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickAmtChipText}>1 Installment ({formatINR(selectedLoan.emi_amount || 1000)})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmtChip}
                  onPress={() => setAmountStr(String((selectedLoan.emi_amount || 1000) * 2))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickAmtChipText}>2 Installments ({formatINR((selectedLoan.emi_amount || 1000) * 2)})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmtChip}
                  onPress={() => setAmountStr(String(remainingBalance))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickAmtChipText}>Full Balance ({formatINR(remainingBalance)})</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. Payment Method Choice */}
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Payment Channel / Method *</Text>
            <View style={styles.methodsRow}>
              {PAYMENT_METHODS.map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodCard, isSelected && styles.methodCardActive]}
                    onPress={() => setPaymentMethod(m.id)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={m.icon}
                      size={18}
                      color={isSelected ? '#059669' : '#64748B'}
                    />
                    <Text style={[styles.methodLabel, isSelected && styles.methodLabelActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Optional Collection Note */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Collector Reference / Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, { height: 38, fontSize: 12, fontWeight: '500' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Received at shop by agent Rajesh"
              placeholderTextColor="#94A3B8"
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCollect}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Recording...' : `Collect ${formatINR(parseFloat(amountStr) || 0)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },
  loanPickerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  loanChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    minWidth: 130,
  },
  loanChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  loanChipTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  loanBorrowerName: {
    fontSize: 11,
    fontWeight: '750',
    color: '#0F172A',
  },
  loanCodeTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  loanEmiText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },
  selectedLoanBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  bannerSub: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
  },
  balanceBadge: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  balanceVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickAmtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  quickAmtChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAmtChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
  },
  methodCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  methodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  methodLabelActive: {
    color: '#059669',
    fontWeight: '800',
  },
  sheetFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CollectPaymentModal;
