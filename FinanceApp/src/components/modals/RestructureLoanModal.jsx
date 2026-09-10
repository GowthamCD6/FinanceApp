import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const RestructureLoanModal = ({ visible, loan, onClose, onRestructure }) => {
  if (!visible || !loan) return null;

  const outstanding = loan.outstanding_amount !== undefined ? loan.outstanding_amount : (loan.remainingAmount || 0);
  const currentDuration = loan.total_installments || loan.duration || 10;

  const [extraWeeks, setExtraWeeks] = useState('4');
  const [newInstallmentAmt, setNewInstallmentAmt] = useState(String(Math.round(outstanding / (currentDuration + 4))));
  const [note, setNote] = useState('Borrower requested tenor extension due to seasonal shop slowdown.');

  const handleConfirm = () => {
    const w = parseInt(extraWeeks, 10);
    const amt = parseFloat(newInstallmentAmt);

    if (isNaN(w) || w <= 0 || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Entry', 'Please enter valid extension weeks and installment amounts.');
      return;
    }

    if (onRestructure) {
      onRestructure({
        loanId: loan.id,
        extraWeeks: w,
        newInstallmentAmount: amt,
        note,
      });
    }

    Alert.alert(
      'Loan Restructured',
      `Loan ${loan.loan_number || loan.loanNumber} extended by ${w} weeks with new installment amount of ${formatINR(amt)}.`
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Restructure Loan Tenor</Text>
              <Text style={styles.sub}>{loan.loan_number || loan.loanNumber} • Outstanding: {formatINR(outstanding)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Extension Term (Additional Weeks/Days)</Text>
          <TextInput
            style={styles.input}
            value={extraWeeks}
            onChangeText={setExtraWeeks}
            keyboardType="numeric"
            placeholder="e.g. 4"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>New Recalculated Installment (₹)</Text>
          <TextInput
            style={styles.input}
            value={newInstallmentAmt}
            onChangeText={setNewInstallmentAmt}
            keyboardType="numeric"
            placeholder="e.g. 1500"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Restructure Justification / Remarks</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Reason for restructuring..."
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Apply Restructuring</Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default RestructureLoanModal;
