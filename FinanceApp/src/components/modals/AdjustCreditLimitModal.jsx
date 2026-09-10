import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const AdjustCreditLimitModal = ({ visible, customer, currentLimit = 50000, onClose, onSaveLimit }) => {
  if (!visible || !customer) return null;

  const [limit, setLimit] = useState(String(currentLimit));
  const [riskTier, setRiskTier] = useState('TIER_A');
  const [reason, setReason] = useState('Timely repayment performance on previous cycles.');

  const handleSave = () => {
    const lAmt = parseFloat(limit);
    if (!lAmt || lAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid credit limit.');
      return;
    }

    if (onSaveLimit) {
      onSaveLimit({
        customerId: customer.id,
        newLimit: lAmt,
        riskTier,
        reason,
      });
    }

    Alert.alert(
      'Credit Limit Updated',
      `Credit line for ${customer.name || customer.full_name} set to ${formatINR(lAmt)} (${riskTier}).`
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Adjust Authorized Credit Line</Text>
              <Text style={styles.sub}>{customer.name || customer.full_name} • Current: {formatINR(currentLimit)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Authorized Credit Limit (₹)</Text>
          <TextInput
            style={styles.input}
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Borrower Risk Rating Tier</Text>
          <View style={styles.tierRow}>
            {[
              { id: 'TIER_A', label: 'Tier A (Low Risk)' },
              { id: 'TIER_B', label: 'Tier B (Standard)' },
              { id: 'TIER_C', label: 'Tier C (Restricted)' },
            ].map((t) => {
              const active = riskTier === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tierBtn, active && styles.tierBtnActive]}
                  onPress={() => setRiskTier(t.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tierText, active && styles.tierTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Governance Justification Note</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Update Credit Limit</Text>
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
  tierRow: {
    gap: 6,
    marginBottom: 4,
  },
  tierBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tierBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tierTextActive: {
    color: '#2563EB',
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

export default AdjustCreditLimitModal;
