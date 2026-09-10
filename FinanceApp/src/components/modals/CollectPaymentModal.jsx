import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const CollectPaymentModal = ({
  visible,
  loan,
  installment,
  onClose,
  onSuccess,
  onCollectPayment,
}) => {
  if (!visible || !loan) return null;

  const expectedAmount = installment?.expected_amount !== undefined 
    ? installment.expected_amount 
    : (installment?.expectedAmount || loan.installment_amount || 2000);
  const paidAmount = installment?.paid_amount !== undefined 
    ? installment.paid_amount 
    : (installment?.paidAmount || 0);
  const dueAmount = Math.max(0, expectedAmount - paidAmount);

  const [amount, setAmount] = useState(String(dueAmount));
  const [paymentMode, setPaymentMode] = useState('CASH');

  const customerName = loan.customer_name || loan.customerName || 'Customer';
  const loanNumber = loan.loan_number || loan.loanNumber || '#001';
  const instNum = installment?.installment_number || installment?.installmentNumber || 1;

  // Live calculation of principal split
  const princRatio = (loan.principal_amount || loan.principal || 20000) / (loan.total_repayment_amount || loan.totalRepayment || 22000);
  const payAmtNum = parseFloat(amount) || 0;
  const princReturn = Math.round(payAmtNum * princRatio);
  const incomeFee = Math.max(0, payAmtNum - princReturn);

  const handleConfirm = () => {
    if (!payAmtNum || payAmtNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (onCollectPayment) {
      onCollectPayment({
        loanId: loan.id,
        installmentId: installment?.id,
        amount: payAmtNum,
        paymentMethod: paymentMode,
      });
    }

    if (onSuccess) {
      onSuccess({
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        customerName,
        loanNumber,
        installmentNumber: instNum,
        amount: payAmtNum,
        principal: princReturn,
        income: incomeFee,
        paymentMethod: paymentMode,
        date: new Date().toISOString().slice(0, 10),
      });
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Collect Installment</Text>
              <Text style={styles.subTitle}>{customerName} • {loanNumber} (Inst #{instNum})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Due Info */}
          <View style={styles.dueCard}>
            <Text style={styles.dueLabel}>SCHEDULED DUE</Text>
            <Text style={styles.dueValue}>{formatINR(dueAmount)}</Text>
          </View>

          {/* Payment Mode Selector */}
          <Text style={styles.inputLabel}>Payment Mode</Text>
          <View style={styles.modeRow}>
            {[
              { key: 'CASH', label: 'Cash Drawer' },
              { key: 'UPI', label: 'UPI / QR' },
              { key: 'BANK', label: 'Bank Transfer' },
            ].map((m) => {
              const active = paymentMode === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setPaymentMode(m.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Input */}
          <Text style={styles.inputLabel}>Collected Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter collected amount"
            placeholderTextColor="#94A3B8"
          />

          {/* Fund Re-circulation Note */}
          <View style={styles.splitBox}>
            <Text style={styles.splitTitle}>Central Fund Circulation Impact</Text>
            <Text style={styles.splitItem}>
              • Principal Recycled: <Text style={{ color: '#059669', fontWeight: '700' }}>+{formatINR(princReturn)}</Text> (Refuels Cash Pool)
            </Text>
            <Text style={styles.splitItem}>
              • Fee Profit: <Text style={{ color: '#2563EB', fontWeight: '700' }}>+{formatINR(incomeFee)}</Text> (Operating Income)
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Receive & Issue Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeIcon: {
    padding: 4,
  },
  dueCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    alignItems: 'center',
  },
  dueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dueValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  splitBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  splitTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  splitItem: {
    fontSize: 11,
    color: '#334155',
    marginVertical: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CollectPaymentModal;
