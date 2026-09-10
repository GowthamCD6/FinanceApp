import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const DayEndHandoverModal = ({
  visible,
  netCashAmount,
  cashCollected,
  upiCollected,
  todayExpenses,
  onClose,
  onConfirmHandover,
}) => {
  if (!visible) return null;

  const [handoverNote, setHandoverNote] = useState('Physical bank notes counted in cash bag. Verified against receipt vouchers.');
  const [collectorSignature, setCollectorSignature] = useState('Officer Rajesh Sharma');

  const handleConfirm = () => {
    if (onConfirmHandover) {
      onConfirmHandover({
        netCash: netCashAmount,
        note: handoverNote,
        signature: collectorSignature,
      });
    }

    Alert.alert(
      'Daily Handover Submitted',
      `Net physical cash of ${formatINR(netCashAmount)} transferred to Central Vault ledger. Daily drawer locked.`
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Submit Daily Cash Handover</Text>
              <Text style={styles.sub}>Lock field drawer & deposit cash into Central Vault</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Amount Hero */}
          <View style={styles.heroBox}>
            <Text style={styles.heroLabel}>PHYSICAL CASH HANDOVER AMOUNT</Text>
            <Text style={styles.heroVal}>{formatINR(netCashAmount)}</Text>
          </View>

          {/* Verification Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.sLabel}>Physical Cash Collected</Text>
              <Text style={[styles.sVal, { color: '#059669' }]}>+{formatINR(cashCollected)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.sLabel}>Digital UPI (Direct Bank Credit)</Text>
              <Text style={[styles.sVal, { color: '#2563EB' }]}>+{formatINR(upiCollected)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.sLabel}>Field Expenses Deducted</Text>
              <Text style={[styles.sVal, { color: '#DC2626' }]}>−{formatINR(todayExpenses)}</Text>
            </View>
          </View>

          <Text style={styles.label}>Handover Verification Note</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={handoverNote}
            onChangeText={setHandoverNote}
            multiline
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Field Officer Signature</Text>
          <TextInput
            style={styles.input}
            value={collectorSignature}
            onChangeText={setCollectorSignature}
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Lock & Submit to Vault</Text>
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
  heroBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  heroVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  sVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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

export default DayEndHandoverModal;
