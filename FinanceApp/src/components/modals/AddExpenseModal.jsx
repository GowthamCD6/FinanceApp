import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatINR } from '../../utils/helpers';
import Icon from '../common/Icon';

export const AddExpenseModal = ({ visible, onClose, onAddExpense }) => {
  if (!visible) return null;

  const [category, setCategory] = useState('Fuel & Transport');
  const [amount, setAmount] = useState('1500');
  const [paymentAccount, setPaymentAccount] = useState('CASH');
  const [description, setDescription] = useState('Motorcycle fuel for field collections');

  const categories = [
    'Fuel & Transport',
    'Office & Stationery',
    'Staff Meals & Field',
    'Vehicle Maintenance',
    'Office Rent & Utilities',
    'Miscellaneous',
  ];

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    if (onAddExpense) {
      onAddExpense({
        category,
        amount: amt,
        paymentAccount,
        description,
      });
    }

    Alert.alert('Expense Recorded', `Deducted ${formatINR(amt)} from ${paymentAccount} drawer.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Record Field Expense</Text>
              <Text style={styles.sub}>Deducts directly from Central Fund Available Cash</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Expense Category</Text>
          <View style={styles.catGrid}>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="e.g. 1500"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Payment Drawer / Account</Text>
          <View style={styles.accRow}>
            {[
              { id: 'CASH', label: 'Cash Drawer' },
              { id: 'BANK', label: 'Bank Account' },
              { id: 'UPI', label: 'UPI / Card' },
            ].map((acc) => {
              const active = paymentAccount === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accBtn, active && styles.accBtnActive]}
                  onPress={() => setPaymentAccount(acc.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.accText, active && styles.accTextActive]}>{acc.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Purpose / Notes</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Expense notes or receipt reference..."
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Save Expense Voucher</Text>
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
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    marginBottom: 6,
    marginTop: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  catTextActive: {
    color: '#FFFFFF',
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
  accRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  accBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  accText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  accTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
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
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default AddExpenseModal;
