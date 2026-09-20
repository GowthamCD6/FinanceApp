import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/apiService';
import { formatINR } from '../../../utils/helpers';

const SCHEMES = [
  {
    id: 'WEEKLY',
    title: 'Weekly Loan',
    sub: '10 Weekly Installments',
    tenure: 10,
    tenureUnit: 'Wks',
    interestRate: 25.0,
    frequency: 'WEEKLY',
    defaultPrincipal: 5000,
  },
  {
    id: 'DAILY',
    title: 'Merchant Daily',
    sub: '100 Daily Collections',
    tenure: 100,
    tenureUnit: 'Days',
    interestRate: 25.0,
    frequency: 'DAILY',
    defaultPrincipal: 10000,
  },
  {
    id: 'MONTHLY',
    title: 'Monthly (EMI)',
    sub: '12 Monthly Installments',
    tenure: 12,
    tenureUnit: 'Mos',
    interestRate: 25.0,
    frequency: 'MONTHLY',
    defaultPrincipal: 25000,
  },
];

const PRESET_AMOUNTS = [2000, 5000, 10000, 25000, 50000, 100000];

const DisburseLoanModal = ({ visible, initialCustomer, onClose, onSuccess }) => {
  const { customers: contextCustomers, disburseLoan, refreshData } = useApp();

  const [dbCustomers, setDbCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(SCHEMES[0]);
  const [principalAmount, setPrincipalAmount] = useState('5000');
  const [fundingSource, setFundingSource] = useState('VAULT'); // 'VAULT' | 'HANDS_ON'
  const [submitting, setSubmitting] = useState(false);

  // Fetch live customers if context list is empty
  useEffect(() => {
    if (!visible) return;
    const loadCusts = async () => {
      try {
        const res = await apiService.getCustomers({ limit: '100' });
        const list = Array.isArray(res) ? res : (res?.customers || []);
        if (list.length > 0) setDbCustomers(list);
      } catch (e) {
        console.warn('DisburseLoanModal fetch error:', e);
      }
    };
    loadCusts();
  }, [visible]);

  const customerList = dbCustomers.length > 0 ? dbCustomers : (contextCustomers || []);

  // Sync initial customer or selected ID on open
  useEffect(() => {
    if (!visible) return;
    if (initialCustomer?.id) {
      setSelectedCustomerId(String(initialCustomer.id));
      if (initialCustomer.isShop || initialCustomer.customer_type === 'SHOPKEEPER') {
        setSelectedScheme(SCHEMES[1]);
        setPrincipalAmount('10000');
      } else if (initialCustomer.isMonthly || initialCustomer.customer_type === 'MONTHLY_BORROWER') {
        setSelectedScheme(SCHEMES[2]);
        setPrincipalAmount('25000');
      } else {
        setSelectedScheme(SCHEMES[0]);
        setPrincipalAmount('5000');
      }
    } else if (customerList.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(String(customerList[0].id));
    }
  }, [visible, initialCustomer, customerList]);

  const selectedCustomer = customerList.find((c) => String(c.id) === String(selectedCustomerId)) || initialCustomer || customerList[0];

  const principal = parseFloat(principalAmount) || 0;
  const interestAmount = Math.round((principal * selectedScheme.interestRate) / 100);
  const totalRepayment = principal + interestAmount;
  const installmentAmount = selectedScheme.tenure > 0 ? Math.round(totalRepayment / selectedScheme.tenure) : 0;

  if (!visible) return null;

  const handleDisburse = async () => {
    if (!principal || principal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid loan principal amount.');
      return;
    }

    const cust = selectedCustomer || initialCustomer || customerList[0];
    if (!cust) {
      Alert.alert('No Borrower Selected', 'Please register or select a borrower.');
      return;
    }

    try {
      setSubmitting(true);
      if (disburseLoan) {
        await disburseLoan({
          customerId: cust.id,
          customerName: cust.name || cust.full_name,
          customer_type: cust.customer_type || (selectedScheme.id === 'DAILY' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER'),
          principal: principal,
          principal_amount: principal,
          totalRepayment: totalRepayment,
          total_repayment_amount: totalRepayment,
          interestRate: selectedScheme.interestRate,
          duration: selectedScheme.tenure,
          total_installments: selectedScheme.tenure,
          type: selectedScheme.frequency,
          repayment_frequency: selectedScheme.frequency,
          installmentAmount: installmentAmount,
          installment_amount: installmentAmount,
          lendingIncome: interestAmount,
          contracted_income_amount: interestAmount,
          funding_source: fundingSource,
        });
      }
      Alert.alert('Loan Disbursed', `Successfully issued ${formatINR(principal)} to ${cust.name || cust.full_name}.`);
      if (refreshData) refreshData();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to disburse loan.');
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
              <Text style={styles.title}>Disburse New Loan</Text>
              <Text style={styles.sub}>Central Treasury capital lending</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Borrower Select */}
            <Text style={styles.sectionLabel}>SELECT BORROWER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.custScroll}>
              {customerList.map((c) => {
                const active = (selectedCustomerId || customerList[0]?.id) === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.custChip, active && styles.custChipActive]}
                    onPress={() => setSelectedCustomerId(c.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.custChipText, active && styles.custChipTextActive]}>
                      {c.name || c.full_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Scheme Select */}
            <Text style={styles.sectionLabel}>LENDING SCHEME</Text>
            <View style={styles.schemeRow}>
              {SCHEMES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.schemeCard, selectedScheme.id === s.id && styles.schemeCardActive]}
                  onPress={() => setSelectedScheme(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.schemeTitle, selectedScheme.id === s.id && styles.schemeTitleActive]}>
                    {s.title}
                  </Text>
                  <Text style={styles.schemeSub}>{s.sub}</Text>
                  <Text style={styles.schemeRate}>{s.interestRate}% Interest</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Principal Input */}
            <Text style={styles.sectionLabel}>PRINCIPAL AMOUNT (₹)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="10000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={principalAmount}
                onChangeText={setPrincipalAmount}
              />
            </View>

            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetChip, principalAmount === String(amt) && styles.presetChipActive]}
                  onPress={() => setPrincipalAmount(String(amt))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetText, principalAmount === String(amt) && styles.presetTextActive]}>
                    {formatINR(amt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Disbursement Funding Source */}
            <Text style={styles.sectionLabel}>DISBURSEMENT FUNDING SOURCE</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <TouchableOpacity
                style={[
                  styles.schemeCard,
                  fundingSource === 'VAULT' && { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
                ]}
                onPress={() => setFundingSource('VAULT')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons
                    name="wallet-outline"
                    size={16}
                    color={fundingSource === 'VAULT' ? '#2563EB' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.schemeTitle,
                      fundingSource === 'VAULT' && { color: '#2563EB' },
                    ]}
                  >
                    From Vault
                  </Text>
                </View>
                <Text style={styles.schemeSub}>Deducts from branch cash float</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.schemeCard,
                  fundingSource === 'HANDS_ON' && { borderColor: '#059669', backgroundColor: '#ECFDF5' },
                ]}
                onPress={() => setFundingSource('HANDS_ON')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons
                    name="bank-transfer"
                    size={16}
                    color={fundingSource === 'HANDS_ON' ? '#059669' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.schemeTitle,
                      fundingSource === 'HANDS_ON' && { color: '#059669' },
                    ]}
                  >
                    Hands-on Money
                  </Text>
                </View>
                <Text style={styles.schemeSub}>Admin pocket / bank direct</Text>
              </TouchableOpacity>
            </View>

            {/* Loan Contract Preview */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>LOAN CONTRACT SUMMARY</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>Principal Disbursal</Text>
                <Text style={styles.previewVal}>{formatINR(principal)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>Contracted Lending Fee</Text>
                <Text style={[styles.previewVal, { color: '#059669' }]}>+{formatINR(interestAmount)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>Total Repayable Contract</Text>
                <Text style={[styles.previewVal, { color: '#2563EB', fontWeight: '800' }]}>{formatINR(totalRepayment)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>Installment Amount</Text>
                <Text style={styles.previewVal}>{formatINR(installmentAmount)} / {selectedScheme.frequency === 'WEEKLY' ? 'Wk' : 'Day'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleDisburse}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="cash-check" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Disbursing...' : `Disburse ${principal ? formatINR(principal) : 'Loan'}`}
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
  custScroll: { flexDirection: 'row', marginBottom: 6 },
  custChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  custChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  custChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  custChipTextActive: { color: '#2563EB' },
  schemeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  schemeCard: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  schemeCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  schemeTitle: { fontSize: 12, fontWeight: '800', color: '#334155' },
  schemeTitleActive: { color: '#2563EB' },
  schemeSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
  schemeRate: { fontSize: 10, fontWeight: '700', color: '#059669', marginTop: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  currencySymbol: { fontSize: 20, fontWeight: '800', color: '#2563EB', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', color: '#0F172A', padding: 0 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 12 },
  presetChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  presetChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  presetText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  presetTextActive: { color: '#2563EB' },
  previewBox: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, gap: 6, marginBottom: 16 },
  previewTitle: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.8, marginBottom: 4 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewKey: { fontSize: 11, color: '#64748B' },
  previewVal: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default DisburseLoanModal;
