import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';
import { Customer, CustomerType, FundAccount } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import { calculateLoanSchedule } from '../../utils/loanCalculators';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface DisburseLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisburseLoanModal: React.FC<DisburseLoanModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { customers, fundAccounts, disburseLoan } = useApp();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.id || 101);
  const [principalStr, setPrincipalStr] = useState<string>('20000');
  const [selectedAccountId, setSelectedAccountId] = useState<number>(fundAccounts[0]?.id || 1);
  const [loading, setLoading] = useState<boolean>(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const selectedAccount = fundAccounts.find((a) => a.id === selectedAccountId) || fundAccounts[0];

  const principal = parseFloat(principalStr) || 0;
  const simulation = calculateLoanSchedule(
    selectedCustomer ? selectedCustomer.customer_type : 'COMMON_CUSTOMER',
    principal
  );

  const handleDisburse = () => {
    if (principal < 1000) {
      Alert.alert('Invalid Principal', 'Minimum loan amount is ₹1,000.');
      return;
    }

    if (selectedAccount.balance < principal) {
      Alert.alert(
        'Insufficient Fund Cash',
        `${selectedAccount.account_name} only has ₹${selectedAccount.balance}. Please select another account or inject capital.`
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = disburseLoan({
        customerId: selectedCustomer.id,
        customerType: selectedCustomer.customer_type,
        principalAmount: principal,
        fundAccountId: selectedAccountId,
      });

      setLoading(false);
      if (res.success) {
        Alert.alert('Loan Disbursed', res.message);
        onSuccess();
        onClose();
      } else {
        Alert.alert('Disbursement Error', res.message);
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
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Customer Picker */}
            <Text style={styles.sectionLabel}>1. Select Beneficiary Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
              {customers.map((c) => {
                const isSelected = c.id === selectedCustomer?.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.customerChip, isSelected && styles.selectedCustomerChip]}
                    onPress={() => setSelectedCustomerId(c.id)}
                  >
                    <Text style={[styles.chipName, isSelected && styles.selectedChipText]}>
                      {c.full_name}
                    </Text>
                    <Text style={styles.chipType}>
                      {c.customer_type === 'SHOPKEEPER' ? `🏪 ${c.shop_name?.slice(0, 18)}` : 'Common Household'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Loan Model Badge */}
            <View style={styles.policyCard}>
              <View style={styles.policyRow}>
                <Text style={styles.policyTitle}>
                  {selectedCustomer?.customer_type === 'SHOPKEEPER'
                    ? 'Daily Loan - Shopkeepers'
                    : 'Weekly Loan - Common Customers'}
                </Text>
                <Badge
                  label={selectedCustomer?.customer_type === 'SHOPKEEPER' ? '25 Daily Days' : '10 Weekly Weeks'}
                  variant="primary"
                  size="sm"
                />
              </View>
              <Text style={styles.policyDesc}>
                {selectedCustomer?.customer_type === 'SHOPKEEPER'
                  ? 'High velocity daily merchant capital for inventory and store float.'
                  : 'Structured weekly repayment plan with fixed interest for individuals.'}
              </Text>
            </View>

            {/* Principal Amount Input */}
            <Text style={styles.sectionLabel}>2. Principal Loan Amount (₹)</Text>
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

            {/* Quick Amount Buttons */}
            <View style={styles.quickRow}>
              {[10000, 20000, 30000, 50000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickBtn}
                  onPress={() => setPrincipalStr(amt.toString())}
                >
                  <Text style={styles.quickBtnText}>{formatINR(amt)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Real-Time Amortization Simulation */}
            <View style={styles.simCard}>
              <Text style={styles.simTitle}>📊 Repayment Schedule Summary</Text>
              <View style={styles.simGrid}>
                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Principal Issued</Text>
                  <Text style={styles.simVal}>{formatINR(simulation.principalAmount)}</Text>
                </View>
                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Lending Income</Text>
                  <Text style={[styles.simVal, { color: colors.secondaryDark }]}>
                    +{formatINR(simulation.contractedIncomeAmount)}
                  </Text>
                </View>
                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Total Repayable</Text>
                  <Text style={[styles.simVal, { color: colors.primaryDark, fontWeight: typography.weights.heavy }]}>
                    {formatINR(simulation.totalRepaymentAmount)}
                  </Text>
                </View>
                <View style={styles.simItem}>
                  <Text style={styles.simLabel}>Installment Due</Text>
                  <Text style={[styles.simVal, { color: colors.primaryDark }]}>
                    {formatINR(simulation.installmentAmount)} / {simulation.frequency.toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fund Account Selection */}
            <Text style={styles.sectionLabel}>3. Disburse from Fund Account</Text>
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
                  >
                    <View>
                      <Text style={[styles.accName, isSelected && styles.selectedAccText]}>
                        {acc.account_name}
                      </Text>
                      <Text style={styles.accType}>{acc.account_type} Wallet</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.accBalance,
                          { color: hasBalance ? colors.successText : colors.dangerText },
                        ]}
                      >
                        {formatINR(acc.balance)}
                      </Text>
                      <Text style={styles.availLabel}>
                        {hasBalance ? 'Available' : 'Insufficient'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={onClose}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Disburse & Issue"
                variant="primary"
                loading={loading}
                disabled={selectedAccount.balance < principal || principal <= 0}
                onPress={handleDisburse}
                style={{ flex: 2 }}
              />
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#334155',
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  customerScroll: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  customerChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 130,
  },
  selectedCustomerChip: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
  },
  chipName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  selectedChipText: {
    color: colors.primaryDark,
  },
  chipType: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  policyCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  policyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#0369A1',
  },
  policyDesc: {
    fontSize: 11,
    color: '#0284C7',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  rupeePrefix: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
    paddingVertical: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#475569',
  },
  simCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  simTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  simLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  simVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
    marginTop: 2,
  },
  accountsList: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectedAccountItem: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
  },
  lowBalanceItem: {
    opacity: 0.6,
  },
  accName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  selectedAccText: {
    color: colors.primaryDark,
  },
  accType: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  accBalance: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
  },
  availLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
