import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const AddCapitalModal = ({ visible, onClose, onAddCapital }) => {
  if (!visible) return null;

  const [amount, setAmount] = useState('200000');
  const [source, setSource] = useState('Founder Equity Infusion');
  const [drawer, setDrawer] = useState('CASH');

  const handleConfirm = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid capital infusion amount.');
      return;
    }

    if (onAddCapital) {
      onAddCapital(amt, `${source} (${drawer})`);
    }

    Alert.alert('Capital Infused', `Added ${formatINR(amt)} to Central Fund ${drawer} liquidity pool.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Inject Capital Pool</Text>
              <Text style={styles.sub}>Direct equity infusion into Central Fund liquidity</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Infusion Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="e.g. 200000"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Target Drawer / Account</Text>
          <View style={styles.drawerRow}>
            {[
              { id: 'CASH', label: 'Cash Drawer' },
              { id: 'BANK', label: 'Bank Account' },
              { id: 'UPI', label: 'UPI QR Pool' },
            ].map((d) => {
              const active = drawer === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.drawerBtn, active && styles.drawerBtnActive]}
                  onPress={() => setDrawer(d.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.drawerText, active && styles.drawerTextActive]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Source of Funds / Reference Note</Text>
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="e.g. Founder Equity, Partner Deposit..."
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Confirm Capital Infusion</Text>
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
    marginBottom: 14,
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
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  drawerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  drawerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  drawerBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  drawerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  drawerTextActive: {
    color: '#FFFFFF',
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

export default AddCapitalModal;
