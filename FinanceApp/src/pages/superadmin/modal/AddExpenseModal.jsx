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
import { formatINR } from '../../../utils/helpers';

const AddExpenseModal = ({ visible, onClose, onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('OFFICE_RENT');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const categories = [
    { id: 'OFFICE_RENT', label: 'Office Rent' },
    { id: 'STAFF_SALARY', label: 'Staff Salaries' },
    { id: 'TRANSPORT', label: 'Field Collection & Fuel' },
    { id: 'STATIONERY', label: 'Stationery & Printing' },
    { id: 'UTILITIES', label: 'Electricity & Internet' },
    { id: 'MISC', label: 'Miscellaneous' },
  ];

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    try {
      setSubmitting(true);
      if (onAddExpense) {
        await onAddExpense({
          amount: numAmount,
          category: categories.find((c) => c.id === category)?.label || category,
          description: description || 'Operational Expense',
          payment_method: paymentMethod,
          date: new Date().toISOString().split('T')[0],
        });
      }
      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Record Business Expense</Text>
              <Text style={styles.sub}>Deducts from Central Fund liquidity</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
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

            <Text style={styles.sectionLabel}>EXPENSE CATEGORY</Text>
            <View style={styles.catGrid}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, category === c.id && styles.catChipActive]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.catText, category === c.id && styles.catTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>PAYMENT ACCOUNT</Text>
            <View style={styles.payRow}>
              {['CASH', 'BANK_TRANSFER', 'UPI'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.payChip, paymentMethod === m && styles.payChipActive]}
                  onPress={() => setPaymentMethod(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.payText, paymentMethod === m && styles.payTextActive]}>
                    {m.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>NOTE / VOUCHER REMARKS</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Month rent voucher #491, Tea/Coffee bill"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Recording...' : `Record Expense (${amount ? formatINR(Number(amount)) : '₹0'})`}
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
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '88%', paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  sub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.6, marginBottom: 8, marginTop: 10 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#DC2626', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  currencySymbol: { fontSize: 20, fontWeight: '800', color: '#DC2626', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', color: '#0F172A', padding: 0 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  catText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  catTextActive: { color: '#DC2626' },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  payChip: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  payChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  payText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  payTextActive: { color: '#2563EB' },
  notesInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A', marginBottom: 16 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#DC2626', paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default AddExpenseModal;
