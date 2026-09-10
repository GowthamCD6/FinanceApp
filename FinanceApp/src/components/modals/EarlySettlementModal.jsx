import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const EarlySettlementModal = ({ visible, loan, onClose, onSettleLoan }) => {
  if (!visible || !loan) return null;

  const outstanding = loan.outstanding_amount !== undefined ? loan.outstanding_amount : (loan.remainingAmount || 0);

  const [settlementAmount, setSettlementAmount] = useState(String(Math.round(outstanding * 0.95))); // 5% settlement discount
  const [waiver, setWaiver] = useState(String(Math.round(outstanding * 0.05)));
  const [paymentMode, setPaymentMode] = useState('CASH');

  const handleConfirm = () => {
    const sAmt = parseFloat(settlementAmount);
    if (!sAmt || sAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid settlement collection amount.');
      return;
    }

    if (onSettleLoan) {
      onSettleLoan({
        loanId: loan.id,
        settlementAmount: sAmt,
        waiverAmount: parseFloat(waiver) || 0,
        paymentMode,
      });
    }

    Alert.alert(
      'Early Settlement Finalized',
      `Collected ${formatINR(sAmt)}. Loan ${loan.loan_number || loan.loanNumber} marked Settled & Closed.`
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Early Settlement & Closure</Text>
              <Text style={styles.sub}>{loan.loan_number || loan.loanNumber} • Current Outstanding: {formatINR(outstanding)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Settlement Payment Mode</Text>
          <View style={styles.modeRow}>
            {['CASH', 'BANK', 'UPI'].map((m) => {
              const active = paymentMode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setPaymentMode(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Agreed Settlement Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={settlementAmount}
            onChangeText={(v) => {
              setSettlementAmount(v);
              const val = parseFloat(v) || 0;
              setWaiver(String(Math.max(0, outstanding - val)));
            }}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Discount / Fee Waiver Granted (₹)</Text>
          <TextInput
            style={styles.input}
            value={waiver}
            onChangeText={setWaiver}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Settlement Impact</Text>
            <Text style={styles.noteDesc}>
              Full remaining balance will be settled. {formatINR(parseFloat(settlementAmount) || 0)} will immediately credit Central Fund {paymentMode} liquidity drawer and close this contract.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Finalize & Close Loan</Text>
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
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
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  noteBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noteTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
  },
  noteDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
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
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default EarlySettlementModal;
