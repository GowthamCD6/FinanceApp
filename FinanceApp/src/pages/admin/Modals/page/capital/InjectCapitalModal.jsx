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

export const InjectCapitalModal = ({ visible, onClose }) => {
  const { injectCapital } = useApp();

  const [amount, setAmount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('CASH_VAULT');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const quickCapitalPresets = [
    { label: '₹25,000', value: 25000 },
    { label: '₹50,000', value: 50000 },
    { label: '₹1,00,000', value: 100000 },
    { label: '₹2,50,000', value: 250000 },
    { label: '₹5,00,000', value: 500000 },
  ];

  const handleInject = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Capital Amount', 'Please enter a valid deposit amount.');
      return;
    }

    try {
      setSubmitting(true);
      if (injectCapital) {
        await injectCapital(
          numAmount,
          description || `Owner Capital Injection into ${destinationAccount.replace('_', ' ')}`
        );
      }

      Alert.alert(
        'Capital Injected Successfully',
        `₹${formatINR(numAmount)} has been credited to ${destinationAccount.replace('_', ' ')} for borrower lending.`
      );
      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to inject capital.');
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
              <Text style={styles.title}>Deposit Lending Capital</Text>
              <Text style={styles.sub}>Inject fresh liquidity into branch cash vault or bank float</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <Text style={styles.sectionLabel}>CAPITAL INJECTION AMOUNT (₹)</Text>
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

            {/* Quick Presets */}
            <View style={styles.presetRow}>
              {quickCapitalPresets.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.presetChip, amount === String(p.value) && styles.presetChipActive]}
                  onPress={() => setAmount(String(p.value))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetText, amount === String(p.value) && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Destination Account */}
            <Text style={styles.sectionLabel}>CREDIT INTO ACCOUNT</Text>
            <View style={styles.destAccounts}>
              {[
                { id: 'CASH_VAULT', label: 'Cash Vault (Physical Safe)' },
                { id: 'BANK_ACCOUNT', label: 'Primary Business Bank' },
                { id: 'UPI_FLOAT', label: 'UPI Float Account' },
              ].map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.destAccountBtn, destinationAccount === acc.id && styles.destAccountBtnActive]}
                  onPress={() => setDestinationAccount(acc.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.destAccountText, destinationAccount === acc.id && styles.destAccountTextActive]}>
                    {acc.label}
                  </Text>
                  {destinationAccount === acc.id && (
                    <MaterialCommunityIcons name="check" size={14} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Source & Description */}
            <Text style={styles.sectionLabel}>CAPITAL SOURCE / REFERENCE NOTE</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Director equity tranche, Bank withdrawal slip #991"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
            />

            {/* Summary preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>New Lending Liquidity</Text>
                <Text style={styles.previewValue}>{amount ? formatINR(Number(amount)) : '₹0'}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Assigned Account</Text>
                <Text style={styles.previewValue}>{destinationAccount.replace('_', ' ')}</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleInject}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bank" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Depositing...' : `Deposit ${amount ? formatINR(Number(amount)) : 'Capital'}`}
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
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetTextActive: {
    color: '#059669',
  },
  destAccounts: {
    gap: 8,
    marginBottom: 12,
  },
  destAccountBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  destAccountBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  destAccountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  destAccountTextActive: {
    color: '#059669',
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
    marginBottom: 14,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#059669',
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

export default InjectCapitalModal;
