import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert 
} from 'react-native';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

export const DisburseLoanModal = ({
  visible,
  onClose,
  onSuccess,
}) => {
  if (!visible) return null;

  const { customers = [], fundAccounts = [], fundMetrics = {}, disburseLoan } = useApp();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 101);
  const [principalStr, setPrincipalStr] = useState('20000');
  const [loanProduct, setLoanProduct] = useState('WEEKLY'); // 'WEEKLY' or 'DAILY'
  const [selectedAccountId, setSelectedAccountId] = useState(fundAccounts[0]?.id || 1);
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || {};
  const selectedAccount = fundAccounts.find((a) => a.id === selectedAccountId) || fundAccounts[0] || {
    id: 1,
    account_name: 'Central Vault Cash',
    balance: fundMetrics?.availableCash || 240000,
    account_type: 'CASH',
  };

  const principal = parseFloat(principalStr) || 0;

  // Real-time Amortization Calculation
  const isWeekly = loanProduct === 'WEEKLY';
  const totalInstallments = isWeekly ? 10 : 25;
  const contractedIncome = isWeekly 
    ? Math.round(principal * 0.10) // 10% fee for weekly (e.g., ₹20,000 -> ₹2,000 fee -> ₹22,000 total)
    : Math.round(principal * 0.125); // 12.5% fee for daily (e.g., ₹20,000 -> ₹2,500 fee -> ₹22,500 total)
  
  const totalRepayment = principal + contractedIncome;
  const installmentAmount = totalInstallments > 0 ? Math.round(totalRepayment / totalInstallments) : 0;
  
  const availableVaultCash = selectedAccount?.balance || fundMetrics?.availableCash || 240000;
  const remainingVaultCashAfter = Math.max(0, availableVaultCash - principal);

  const handleSelectCustomer = (c) => {
    setSelectedCustomerId(c.id);
    if (c.customer_type === 'SHOPKEEPER' || c.type === 'Shopkeeper') {
      setLoanProduct('DAILY');
    } else {
      setLoanProduct('WEEKLY');
    }
  };

  const handleDisburse = () => {
    if (principal < 1000) {
      Alert.alert('Invalid Principal', 'Minimum loan amount is ₹1,000.');
      return;
    }

    if (availableVaultCash < principal) {
      Alert.alert(
        'Insufficient Central Fund',
        `Central Fund Vault only has ${formatINR(availableVaultCash)}. Requested: ${formatINR(principal)}. Please inject capital or select another account.`
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const res = disburseLoan({
          customerId: selectedCustomer.id,
          customerType: selectedCustomer.customer_type || 'COMMON_CUSTOMER',
          loanType: loanProduct,
          principalAmount: principal,
          duration: totalInstallments,
          repaymentAmount: totalRepayment,
          installmentAmount: installmentAmount,
          fundAccountId: selectedAccountId,
        });

        setLoading(false);
        if (res?.success) {
          Alert.alert('Loan Disbursed', res.message || 'Loan issued and Central Fund updated.');
          if (typeof onSuccess === 'function') onSuccess();
          if (typeof onClose === 'function') onClose();
        } else {
          Alert.alert('Disbursement Notice', res?.message || 'Unable to disburse loan');
        }
      } catch (err) {
        setLoading(false);
        Alert.alert('Error', err.message || 'Something went wrong during loan issuance.');
      }
    }, 400);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Originate & Disburse Loan</Text>
              <Text style={styles.subtitle}>Direct issuance from Central Fund Cash Pool</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtnBox}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Vault Cash Balance Bar */}
            <View style={styles.vaultBar}>
              <View style={styles.vaultBarLeft}>
                <Text style={styles.vaultLabel}>CENTRAL FUND CASH VAULT</Text>
                <Text style={styles.vaultBalance}>{formatINR(availableVaultCash)} Available</Text>
              </View>
              <View style={styles.vaultBarRight}>
                <Text style={styles.vaultImpactLabel}>After Disbursal</Text>
                <Text style={[styles.vaultImpactVal, { color: remainingVaultCashAfter >= 0 ? '#059669' : '#DC2626' }]}>
                  {formatINR(remainingVaultCashAfter)}
                </Text>
              </View>
            </View>

            {/* 1. Select Customer */}
            <Text style={styles.sectionLabel}>1. Select Customer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
              {customers.map((c) => {
                const isSelected = c.id === selectedCustomer?.id;
                const isShopkeeper = c.customer_type === 'SHOPKEEPER' || c.type === 'Shopkeeper';
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.customerChip, isSelected && styles.selectedCustomerChip]}
                    onPress={() => handleSelectCustomer(c)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chipHeaderRow}>
                      <Icon name={isShopkeeper ? 'shop' : 'user'} size={14} color={isSelected ? '#2563EB' : '#64748B'} />
                      <Text style={[styles.chipName, isSelected && styles.selectedChipText]}>
                        {c.full_name || c.name}
                      </Text>
                    </View>
                    <Text style={styles.chipType}>
                      {isShopkeeper ? (c.shop_name || 'Shopkeeper') : 'Common Client'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 2. Loan Structure Selector */}
            <Text style={styles.sectionLabel}>2. Loan Product & Term</Text>
            <View style={styles.productToggleRow}>
              <TouchableOpacity
                style={[styles.productBtn, isWeekly && styles.productBtnActive]}
                onPress={() => setLoanProduct('WEEKLY')}
                activeOpacity={0.8}
              >
                <Text style={[styles.productBtnTitle, isWeekly && styles.productBtnTitleActive]}>
                  Weekly Loan (10 Wks)
                </Text>
                <Text style={styles.productBtnSub}>10% flat fee • Common Customers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.productBtn, !isWeekly && styles.productBtnActive]}
                onPress={() => setLoanProduct('DAILY')}
                activeOpacity={0.8}
              >
                <Text style={[styles.productBtnTitle, !isWeekly && styles.productBtnTitleActive]}>
                  Daily Loan (25 Days)
                </Text>
                <Text style={styles.productBtnSub}>12.5% flat fee • Shopkeepers</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Principal Amount */}
            <Text style={styles.sectionLabel}>3. Principal Loan Amount (₹)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={principalStr}
                onChangeText={setPrincipalStr}
                placeholder="20000"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Quick Chips */}
            <View style={styles.quickRow}>
              {[10000, 20000, 30000, 50000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickBtn, principal === amt && styles.quickBtnActive]}
                  onPress={() => setPrincipalStr(amt.toString())}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickBtnText, principal === amt && styles.quickBtnTextActive]}>
                    {formatINR(amt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calculation Card */}
            <View style={styles.simCard}>
              <View style={styles.simHeader}>
                <Text style={styles.simTitle}>REPAYMENT SCHEDULE BREAKDOWN</Text>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>
                    {isWeekly ? '10 Weekly Installments' : '25 Daily Installments'}
                  </Text>
                </View>
              </View>

              <View style={styles.simGrid}>
                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Principal (Capital Out)</Text>
                  <Text style={styles.simVal}>{formatINR(principal)}</Text>
                </View>

                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Fee (Lending Income)</Text>
                  <Text style={[styles.simVal, { color: '#059669' }]}>
                    +{formatINR(contractedIncome)}
                  </Text>
                </View>

                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Total Repayable</Text>
                  <Text style={[styles.simVal, { color: '#2563EB', fontWeight: '800' }]}>
                    {formatINR(totalRepayment)}
                  </Text>
                </View>

                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Installment Amount</Text>
                  <Text style={[styles.simVal, { color: '#D97706', fontWeight: '800' }]}>
                    {formatINR(installmentAmount)} / {isWeekly ? 'wk' : 'day'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. Fund Account */}
            <Text style={styles.sectionLabel}>4. Disburse From Vault Account</Text>
            <View style={styles.accountsList}>
              {fundAccounts.map((acc) => {
                const isSelected = acc.id === selectedAccount?.id;
                const hasBalance = acc.balance >= principal;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accountItem,
                      isSelected && styles.selectedAccountItem,
                      !hasBalance && styles.lowBalanceItem,
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.accLeft}>
                      <Icon name="fund" size={16} color={isSelected ? '#2563EB' : '#64748B'} />
                      <View>
                        <Text style={[styles.accName, isSelected && styles.selectedAccText]}>
                          {acc.account_name}
                        </Text>
                        <Text style={styles.accType}>{acc.account_type}</Text>
                      </View>
                    </View>
                    <Text style={[styles.accBalance, { color: hasBalance ? '#059669' : '#DC2626' }]}>
                      {formatINR(acc.balance)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Submit Action */}
            <View style={styles.actionsBox}>
              <TouchableOpacity
                style={[styles.disburseBtn, loading && styles.disabledBtn]}
                onPress={handleDisburse}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.disburseBtnText}>
                  {loading ? 'Processing Disbursement...' : `Disburse ${formatINR(principal)} Now`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtnBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vaultBarLeft: {},
  vaultLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  vaultBalance: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  vaultBarRight: {
    alignItems: 'flex-end',
  },
  vaultImpactLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  vaultImpactVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 6,
  },
  customerScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  customerChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 130,
  },
  selectedCustomerChip: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  chipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedChipText: {
    color: '#2563EB',
  },
  chipType: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },
  productToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  productBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  productBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  productBtnTitleActive: {
    color: '#2563EB',
  },
  productBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rupeePrefix: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quickBtnTextActive: {
    color: '#2563EB',
  },
  simCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  simTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  productBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  productBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  simVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  accountsList: {
    gap: 8,
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedAccountItem: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  lowBalanceItem: {
    opacity: 0.6,
  },
  accLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedAccText: {
    color: '#2563EB',
  },
  accType: {
    fontSize: 10,
    color: '#64748B',
  },
  accBalance: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionsBox: {
    marginTop: 6,
    marginBottom: 16,
  },
  disburseBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#94A3B8',
  },
  disburseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default DisburseLoanModal;
