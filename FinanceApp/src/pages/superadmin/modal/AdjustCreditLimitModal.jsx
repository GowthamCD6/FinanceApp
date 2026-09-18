import React, { useState, useEffect } from 'react';
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

const AdjustCreditLimitModal = ({ visible, customer, currentLimit = 50000, onClose, onSaveLimit }) => {
  const [limit, setLimit] = useState(String(currentLimit));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setLimit(String(currentLimit || 50000));
    }
  }, [visible, currentLimit]);

  if (!visible) return null;

  const presets = [25000, 50000, 75000, 100000, 150000];

  const handleSave = () => {
    const numLimit = parseFloat(limit);
    if (!numLimit || numLimit <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid credit limit amount.');
      return;
    }

    try {
      setSubmitting(true);
      if (onSaveLimit) {
        onSaveLimit({ customerId: customer?.id, newLimit: numLimit });
      }
      Alert.alert('Credit Limit Updated', `Credit limit for ${customer?.name || customer?.full_name} set to ${formatINR(numLimit)}.`);
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to update credit limit.');
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
              <Text style={styles.title}>Adjust Credit Limit</Text>
              <Text style={styles.sub}>Set authorized lending ceiling for {customer?.name || customer?.full_name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>NEW CREDIT LIMIT (₹)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="50000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={limit}
                onChangeText={setLimit}
              />
            </View>

            <View style={styles.presetRow}>
              {presets.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.presetChip, limit === String(val) && styles.presetChipActive]}
                  onPress={() => setLimit(String(val))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetText, limit === String(val) && styles.presetTextActive]}>
                    {formatINR(val)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#2563EB" />
              <Text style={styles.infoText}>
                The client will be permitted to take active loans up to this cumulative balance ceiling.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Updating...' : `Set Limit to ${limit ? formatINR(Number(limit)) : '₹0'}`}
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
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  currencySymbol: { fontSize: 20, fontWeight: '800', color: '#2563EB', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', color: '#0F172A', padding: 0 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 12 },
  presetChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  presetChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  presetText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  presetTextActive: { color: '#2563EB' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 16 },
  infoText: { flex: 1, fontSize: 11, color: '#1E40AF', lineHeight: 16 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default AdjustCreditLimitModal;
