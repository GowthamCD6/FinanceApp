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

const EarlySettlementModal = ({ visible, loan, onClose, onSettleLoan }) => {
  const [discountAmount, setDiscountAmount] = useState('0');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const outstanding = loan?.outstanding_amount !== undefined ? loan?.outstanding_amount : (loan?.remainingAmount || 0);
  const discount = parseFloat(discountAmount) || 0;
  const settlementAmount = Math.max(0, outstanding - discount);

  const handleSettle = () => {
    try {
      setSubmitting(true);
      if (onSettleLoan) {
        onSettleLoan({
          loanId: loan?.id,
          settlementAmount,
          discountAmount: discount,
          paymentMode,
        });
      }
      Alert.alert('Loan Settled', `Loan settled for ${formatINR(settlementAmount)} and closed.`);
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to settle loan.');
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
              <Text style={styles.title}>Early Settlement & Closure</Text>
              <Text style={styles.sub}>Close Loan #{loan?.loan_number || loan?.loanNumber || '001'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>OUTSTANDING CONTRACT BALANCE</Text>
              <Text style={styles.infoVal}>{formatINR(outstanding)}</Text>
            </View>

            <Text style={styles.sectionLabel}>WAIVER / DISCOUNT (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={discountAmount}
              onChangeText={setDiscountAmount}
            />

            <Text style={styles.sectionLabel}>COLLECTION MODE</Text>
            <View style={styles.payRow}>
              {['CASH', 'UPI', 'BANK'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.payChip, paymentMode === m && styles.payChipActive]}
                  onPress={() => setPaymentMode(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.payText, paymentMode === m && styles.payTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>Final Settlement Recovery</Text>
                <Text style={styles.previewVal}>{formatINR(settlementAmount)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSettle}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check-all" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Settling...' : `Settle & Close Loan (${formatINR(settlementAmount)})`}
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
  infoCard: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#A7F3D0', marginBottom: 12 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 0.6 },
  infoVal: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.6, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A' },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  payChip: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  payChipActive: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
  payText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  payTextActive: { color: '#059669' },
  previewBox: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 16 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewKey: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  previewVal: { fontSize: 16, fontWeight: '900', color: '#059669' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default EarlySettlementModal;
