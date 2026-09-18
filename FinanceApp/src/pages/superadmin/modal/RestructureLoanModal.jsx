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

const RestructureLoanModal = ({ visible, loan, onClose, onRestructure }) => {
  const [extraTenure, setExtraTenure] = useState('4');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleRestructure = () => {
    const extra = parseInt(extraTenure, 10);
    if (!extra || extra <= 0) {
      Alert.alert('Invalid Tenor', 'Please specify a positive number of additional installments.');
      return;
    }

    try {
      setSubmitting(true);
      if (onRestructure) {
        onRestructure({ loanId: loan?.id, extraTenure: extra, reason });
      }
      Alert.alert('Loan Restructured', `Extended loan schedule by ${extra} additional installments.`);
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to restructure loan.');
    } finally {
      setSubmitting(false);
    }
  };

  const outstanding = loan?.outstanding_amount !== undefined ? loan?.outstanding_amount : (loan?.remainingAmount || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Restructure Loan Tenor</Text>
              <Text style={styles.sub}>Extend schedule for Loan #{loan?.loan_number || loan?.loanNumber || '001'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>CURRENT OUTSTANDING DUES</Text>
              <Text style={styles.infoVal}>{formatINR(outstanding)}</Text>
            </View>

            <Text style={styles.sectionLabel}>ADDITIONAL INSTALLMENTS (TENOR EXTENSION)</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={extraTenure}
              onChangeText={setExtraTenure}
            />

            <Text style={styles.sectionLabel}>JUSTIFICATION / NOTES</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Borrower requested 4 additional weeks due to medical expense"
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleRestructure}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="calendar-refresh" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Updating...' : 'Confirm Restructuring'}
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
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 12 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 0.6 },
  infoVal: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.6, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default RestructureLoanModal;
