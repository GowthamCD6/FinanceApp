import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../../context/AppContext';
import { formatINR } from '../../../../../utils/helpers';

const EXPENSE_CATEGORIES = [
  { id: 'TRAVEL_FUEL', label: 'Fuel & Travel', icon: 'collections' },
  { id: 'AGENT_COMMISSION', label: 'Agent Commission', icon: 'user' },
  { id: 'OFFICE_TEA', label: 'Tea & Refreshment', icon: 'shop' },
  { id: 'PRINTING_PASSBOOK', label: 'Passbooks & Print', icon: 'document' },
  { id: 'OFFICE_RENT', label: 'Office Utilities', icon: 'building' },
  { id: 'MISC', label: 'Miscellaneous', icon: 'receipt' },
];

export const RecordExpenseModal = ({ visible, onClose }) => {
  const { addExpense } = useApp();

  const [category, setCategory] = useState('TRAVEL_FUEL');
  const [amount, setAmount] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('CASH_VAULT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const handleSaveExpense = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    try {
      setSubmitting(true);
      if (addExpense) {
        await addExpense({
          category,
          amount: numAmount,
          account: paymentAccount,
          notes: notes || 'Operational Expense',
          date: new Date().toISOString(),
        });
      }

      Alert.alert('Expense Logged', `₹${numAmount} logged under ${category.replace(/_/g, ' ')} successfully.`);
      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Log Operational Expense</Text>
              <Text style={styles.sub}>Record field travel, recovery costs & office outflows</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Category Selector */}
            <Text style={styles.sectionLabel}>EXPENSE CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Input */}
            <Text style={styles.sectionLabel}>EXPENSE AMOUNT (₹)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickChips}>
              {quickAmounts.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.quickChip}
                  onPress={() => setAmount(String(val))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickChipText}>+₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Paid From Account */}
            <Text style={styles.sectionLabel}>PAID FROM ACCOUNT</Text>
            <View style={styles.accountRow}>
              {[
                { id: 'CASH_VAULT', label: 'Cash Vault (Field Cash)' },
                { id: 'BANK_ACCOUNT', label: 'Bank / UPI Float' },
              ].map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accountBtn, paymentAccount === acc.id && styles.accountBtnActive]}
                  onPress={() => setPaymentAccount(acc.id)}
                >
                  <Text style={[styles.accountBtnText, paymentAccount === acc.id && styles.accountBtnTextActive]}>
                    {acc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Remarks / Bill Notes */}
            <Text style={styles.sectionLabel}>PURPOSE / VOUCHER NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Collector petrol bill, client tea, voucher #84"
              placeholderTextColor="#94A3B8"
              value={notes}
              onChangeText={setNotes}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleRecord}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Saving...' : `Record ₹${amount || '0'} Outflow`}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#2563EB',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  accountRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  accountBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  accountBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  accountBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  accountBtnTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default RecordExpenseModal;
