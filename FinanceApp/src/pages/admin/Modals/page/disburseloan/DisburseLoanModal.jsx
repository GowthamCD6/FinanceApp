import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../../../../../context/AppContext';
import { formatINR } from '../../../../../utils/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SCHEMES = [
  {
    id: 'WEEKLY',
    title: 'Weekly Micro-Loan',
    sub: '10 Weekly Installments',
    tenure: 10,
    interestRate: 10.0,
    frequency: 'WEEKLY',
    defaultPrincipal: 10000,
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
  },
  {
    id: 'DAILY_MERCHANT',
    title: 'Daily Merchant Loan',
    sub: '25 Daily Installments',
    tenure: 25,
    interestRate: 12.5,
    frequency: 'DAILY',
    defaultPrincipal: 25000,
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
  },
  {
    id: 'MONTHLY',
    title: 'Monthly Salaried',
    sub: '12 Monthly Installments',
    tenure: 12,
    interestRate: 18.0,
    frequency: 'MONTHLY',
    defaultPrincipal: 50000,
    badgeColor: '#7C3AED',
    badgeBg: '#FAF5FF',
    badgeBorder: '#DDD6FE',
  },
];

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

export const DisburseLoanModal = ({ visible, onClose, initialBorrower = null }) => {
  const { customers, disburseLoan } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialBorrower?.id ? String(initialBorrower.id) : (customers[0]?.id ? String(customers[0]?.id) : '')
  );
  const [selectedScheme, setSelectedScheme] = useState('WEEKLY');
  const [principalStr, setPrincipalStr] = useState('10000');
  const [interestRateStr, setInterestRateStr] = useState('10.0');
  const [tenureStr, setTenureStr] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-fill scheme defaults on scheme switch
  const handleSelectScheme = (schemeId) => {
    setSelectedScheme(schemeId);
    const s = SCHEMES.find((item) => item.id === schemeId);
    if (s) {
      setPrincipalStr(String(s.defaultPrincipal));
      setInterestRateStr(String(s.interestRate));
      setTenureStr(String(s.tenure));
    }
  };

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === String(selectedCustomerId)) || customers[0];
  }, [customers, selectedCustomerId]);

  // Live Financial Breakdown Formula
  const calculation = useMemo(() => {
    const p = parseFloat(principalStr) || 0;
    const rate = parseFloat(interestRateStr) || 0;
    const t = parseInt(tenureStr, 10) || 1;

    const interestAmount = Math.round((p * rate) / 100);
    const totalRepayable = p + interestAmount;
    const installmentAmount = t > 0 ? Math.ceil(totalRepayable / t) : totalRepayable;

    return {
      principal: p,
      interestAmount,
      totalRepayable,
      installmentAmount,
      tenure: t,
    };
  }, [principalStr, interestRateStr, tenureStr]);

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      Alert.alert('Selection Error', 'Please select a valid borrower to assign this loan.');
      return;
    }
    if (calculation.principal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid loan principal amount.');
      return;
    }

    setSubmitting(true);
    try {
      await disburseLoan({
        customer_id: selectedCustomer.id,
        principal_amount: calculation.principal,
        interest_rate: parseFloat(interestRateStr) || 10.0,
        interest_amount: calculation.interestAmount,
        total_repayment_amount: calculation.totalRepayable,
        tenure_installments: calculation.tenure,
        emi_amount: calculation.installmentAmount,
        repayment_frequency: selectedScheme === 'DAILY_MERCHANT' ? 'DAILY' : selectedScheme === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY',
      });

      Alert.alert('Loan Disbursed!', `Loan of ${formatINR(calculation.principal)} successfully issued to ${selectedCustomer.name}.`);
      onClose();
    } catch (err) {
      Alert.alert('Disbursal Failed', err.message || 'Could not disburse loan.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.customer_code?.toLowerCase().includes(q);
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Disburse & Assign Loan</Text>
              <Text style={styles.sheetSubtitle}>Capital disbursement & contracted interest agreement</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* 1. Borrower Selector */}
            <Text style={styles.fieldLabel}>Select Borrower / Recipient *</Text>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={14} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search borrower by name, phone, code..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.borrowerPickerRow}>
              {filteredCustomers.slice(0, 8).map((c) => {
                const isSelected = String(c.id) === String(selectedCustomerId);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.borrowerChip, isSelected && styles.borrowerChipSelected]}
                    onPress={() => setSelectedCustomerId(String(c.id))}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.borrowerAvatar, isSelected && styles.borrowerAvatarSelected]}>
                      <Text style={[styles.avatarText, isSelected && { color: '#FFFFFF' }]}>
                        {c.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.chipName, isSelected && styles.chipNameSelected]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={styles.chipPhone}>{c.phone || c.customer_code}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 2. Lending Scheme Card Selector */}
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Lending Scheme *</Text>
            <View style={styles.schemeGrid}>
              {SCHEMES.map((scheme) => {
                const isSelected = selectedScheme === scheme.id;
                return (
                  <TouchableOpacity
                    key={scheme.id}
                    style={[
                      styles.schemeCard,
                      isSelected && { borderColor: scheme.badgeColor, backgroundColor: scheme.badgeBg },
                    ]}
                    onPress={() => handleSelectScheme(scheme.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.schemeTitle, isSelected && { color: scheme.badgeColor }]}>
                      {scheme.title}
                    </Text>
                    <Text style={styles.schemeSub}>{scheme.sub}</Text>
                    <View
                      style={[
                        styles.schemeBadge,
                        { backgroundColor: scheme.badgeBg, borderColor: scheme.badgeBorder },
                      ]}
                    >
                      <Text style={[styles.schemeBadgeText, { color: scheme.badgeColor }]}>
                        {scheme.interestRate}% Interest
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Principal Amount & Preset Chips */}
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Principal Capital Amount (₹) *</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={principalStr}
              onChangeText={setPrincipalStr}
              placeholder="e.g. 10000"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.presetChipRow}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetChip, principalStr === String(amt) && styles.presetChipActive]}
                  onPress={() => setPrincipalStr(String(amt))}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      principalStr === String(amt) && styles.presetChipTextActive,
                    ]}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. Interest & Tenure Row */}
            <View style={styles.rowTwo}>
              <View style={styles.colHalf}>
                <Text style={styles.fieldLabel}>Interest Rate (%) *</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={interestRateStr}
                  onChangeText={setInterestRateStr}
                  placeholder="10.0"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.fieldLabel}>Total Installments *</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={tenureStr}
                  onChangeText={setTenureStr}
                  placeholder="10"
                />
              </View>
            </View>

            {/* 5. Live Calculation Breakdown Card */}
            <View style={styles.calcCard}>
              <View style={styles.calcHeader}>
                <Text style={styles.calcTitle}>CONTRACTED LEDGER PREVIEW</Text>
                <Text style={styles.calcBadge}>Verified Formula</Text>
              </View>

              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Net Capital Given (Principal):</Text>
                <Text style={styles.calcVal}>{formatINR(calculation.principal)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Contracted Profit Interest ({interestRateStr}%):</Text>
                <Text style={[styles.calcVal, { color: '#059669' }]}>+{formatINR(calculation.interestAmount)}</Text>
              </View>
              <View style={[styles.calcRow, styles.calcRowTotal]}>
                <Text style={styles.calcLabelTotal}>Total Repayment Contract:</Text>
                <Text style={styles.calcValTotal}>{formatINR(calculation.totalRepayable)}</Text>
              </View>
              <View style={[styles.calcRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                <Text style={styles.calcLabel}>Installment Amount ({calculation.tenure} installments):</Text>
                <Text style={[styles.calcVal, { fontWeight: '900', color: '#2563EB' }]}>
                  {formatINR(calculation.installmentAmount)} / inst.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Disbursing...' : 'Disburse & Assign Loan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
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
  sheetBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },
  borrowerPickerRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  borrowerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    gap: 8,
  },
  borrowerChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  borrowerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowerAvatarSelected: {
    backgroundColor: '#2563EB',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  chipName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  chipNameSelected: {
    color: '#1D4ED8',
  },
  chipPhone: {
    fontSize: 9,
    color: '#64748B',
  },
  schemeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  schemeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  schemeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  schemeSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  schemeBadge: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  schemeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  presetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  colHalf: {
    flex: 1,
  },
  calcCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  calcBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  calcRowTotal: {
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calcLabel: {
    fontSize: 11,
    color: '#475569',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  calcLabelTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  calcValTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  sheetFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DisburseLoanModal;
