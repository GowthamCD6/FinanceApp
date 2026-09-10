import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { FundTransactionType, FundAccount } from '../types';
import { formatINR, formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { FadeInView } from '../animations/FadeInView';

export const FundLedgerScreen: React.FC = () => {
  const { 
    fundAccounts, fundTransactions, expenses, reconciliations,
    addCapital, addExpense, reconcileCash 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'ACCOUNTS' | 'RECONCILE'>('TRANSACTIONS');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modals
  const [showCapitalModal, setShowCapitalModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showReconcileModal, setShowReconcileModal] = useState<boolean>(false);

  // Capital Form
  const [capitalAmt, setCapitalAmt] = useState<string>('100000');
  const [capitalAccId, setCapitalAccId] = useState<number>(fundAccounts[0]?.id || 1);
  const [capitalDesc, setCapitalDesc] = useState<string>('Owner Equity Infusion');

  // Expense Form
  const [expenseAmt, setExpenseAmt] = useState<string>('2500');
  const [expenseCat, setExpenseCat] = useState<string>('COLLECTION_TRANSPORT');
  const [expenseAccId, setExpenseAccId] = useState<number>(fundAccounts[0]?.id || 1);
  const [expenseDesc, setExpenseDesc] = useState<string>('Collector Transit Fuel');

  // Reconcile Form
  const [reconcileAccId, setReconcileAccId] = useState<number>(1); // Cash
  const [actualCashStr, setActualCashStr] = useState<string>('145000');
  const [reconcileNotes, setReconcileNotes] = useState<string>('End of shift cash balance count');

  const filteredTx = fundTransactions.filter((tx) => {
    if (filterType === 'CAPITAL') return tx.transaction_type === 'CAPITAL_IN';
    if (filterType === 'DISBURSEMENT') return tx.transaction_type === 'LOAN_DISBURSEMENT';
    if (filterType === 'COLLECTION') return ['PRINCIPAL_COLLECTION', 'LENDING_INCOME'].includes(tx.transaction_type);
    if (filterType === 'EXPENSE') return tx.transaction_type === 'EXPENSE';
    return true;
  });

  const handleAddCapital = () => {
    const amt = parseFloat(capitalAmt);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid capital amount.');
      return;
    }
    const res = addCapital(amt, capitalAccId, capitalDesc);
    Alert.alert('Capital Infused', res.message);
    setShowCapitalModal(false);
  };

  const handleAddExpense = () => {
    const amt = parseFloat(expenseAmt);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }
    const res = addExpense({
      categoryName: expenseCat,
      fundAccountId: expenseAccId,
      amount: amt,
      description: expenseDesc,
    });
    if (res.success) {
      Alert.alert('Expense Recorded', res.message);
      setShowExpenseModal(false);
    } else {
      Alert.alert('Expense Error', res.message);
    }
  };

  const handleReconcile = () => {
    const actual = parseFloat(actualCashStr);
    if (isNaN(actual) || actual < 0) {
      Alert.alert('Invalid Count', 'Please enter physical cash counted.');
      return;
    }
    const res = reconcileCash(reconcileAccId, actual, reconcileNotes);
    Alert.alert('Reconciliation Logged', res.message);
    setShowReconcileModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topBar}>
        <View style={styles.tabRow}>
          {[
            { key: 'TRANSACTIONS', label: 'Ledger Log' },
            { key: 'ACCOUNTS', label: 'Cash Accounts' },
            { key: 'RECONCILE', label: 'Reconciliation' },
          ].map((t) => {
            const isSelected = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, isSelected && styles.selectedTabBtn]}
                onPress={() => setActiveTab(t.key as any)}
              >
                <Text style={[styles.tabBtnText, isSelected && styles.selectedTabText]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionRow}>
          <Button
            title="Capital"
            variant="outline"
            size="sm"
            icon="💰"
            onPress={() => setShowCapitalModal(true)}
            style={{ marginRight: 6 }}
          />
          <Button
            title="Expense"
            variant="danger"
            size="sm"
            icon="💸"
            onPress={() => setShowExpenseModal(true)}
          />
        </View>
      </View>

      {/* 1. Immutable Transactions Tab */}
      {activeTab === 'TRANSACTIONS' && (
        <>
          {/* Sub Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subFilterScroll}>
            {[
              { key: 'ALL', label: 'All Entries' },
              { key: 'COLLECTION', label: '📥 Collections' },
              { key: 'DISBURSEMENT', label: '📤 Disbursements' },
              { key: 'EXPENSE', label: '💸 Expenses' },
              { key: 'CAPITAL', label: '💰 Capital' },
            ].map((f) => {
              const isSelected = filterType === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.subChip, isSelected && styles.selectedSubChip]}
                  onPress={() => setFilterType(f.key)}
                >
                  <Text style={[styles.subChipText, isSelected && styles.selectedSubText]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filteredTx.map((tx, idx) => {
              const isIn = tx.direction === 'IN';
              return (
                <FadeInView key={tx.id} delay={idx * 30}>
                  <View style={styles.txCard}>
                    <View style={styles.txTop}>
                      <View>
                        <Text style={styles.txNum}>{tx.transaction_number}</Text>
                        <Text style={styles.txDate}>{tx.transaction_date}</Text>
                      </View>
                      <Text style={[styles.txAmount, { color: isIn ? colors.successText : colors.dangerText }]}>
                        {isIn ? '+' : '−'}{formatINR(tx.amount)}
                      </Text>
                    </View>

                    <Text style={styles.txDesc}>{tx.description}</Text>

                    <View style={styles.txFooter}>
                      <Badge
                        label={tx.transaction_type.replace('_', ' ')}
                        variant={
                          tx.transaction_type === 'PRINCIPAL_COLLECTION'
                            ? 'success'
                            : tx.transaction_type === 'LENDING_INCOME'
                            ? 'secondary'
                            : tx.transaction_type === 'EXPENSE'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      />
                      <Text style={styles.txAccount}>{tx.account_name.split('(')[0]}</Text>
                    </View>
                  </View>
                </FadeInView>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* 2. Fund Accounts Tab */}
      {activeTab === 'ACCOUNTS' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {fundAccounts.map((acc) => (
            <View key={acc.id} style={styles.accountCard}>
              <View style={styles.accTop}>
                <View>
                  <Text style={styles.accCode}>{acc.account_code}</Text>
                  <Text style={styles.accTitle}>{acc.account_name}</Text>
                </View>
                <Badge label={acc.account_type} variant="primary" />
              </View>

              <Text style={styles.accBalanceLabel}>Available Cash Pool</Text>
              <Text style={styles.accBalanceVal}>{formatINR(acc.balance)}</Text>

              <View style={styles.accFooter}>
                <Text style={styles.accSub}>Immutable Double-Entry Asset Vault</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 3. Reconcile Tab */}
      {activeTab === 'RECONCILE' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.reconcileActionCard}>
            <Text style={styles.recTitle}>Physical Cash Drawer Balancing</Text>
            <Text style={styles.recSub}>
              Verify physical cash in hand against system computed balance to detect shortages or surpluses.
            </Text>
            <Button
              title="Perform Shift Reconciliation"
              variant="primary"
              icon="⚖️"
              onPress={() => setShowReconcileModal(true)}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <Text style={styles.recHistoryTitle}>Recent Reconciliations</Text>
          {reconciliations.map((rec) => {
            const isBalanced = rec.status === 'BALANCED';
            return (
              <View key={rec.id} style={styles.recItem}>
                <View style={styles.recItemTop}>
                  <Text style={styles.recItemDate}>{rec.reconciliation_date} • {rec.account_name.split('(')[0]}</Text>
                  <Badge
                    label={rec.status}
                    variant={isBalanced ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>

                <View style={styles.recNumbersRow}>
                  <View>
                    <Text style={styles.recNumLabel}>System Cash</Text>
                    <Text style={styles.recNumVal}>{formatINR(rec.system_cash)}</Text>
                  </View>
                  <View>
                    <Text style={styles.recNumLabel}>Physical Count</Text>
                    <Text style={styles.recNumVal}>{formatINR(rec.actual_cash)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.recNumLabel}>Variance</Text>
                    <Text style={[styles.recNumVal, { color: isBalanced ? colors.successText : colors.dangerText }]}>
                      {rec.discrepancy === 0 ? '₹0 (Exact)' : formatINR(rec.discrepancy)}
                    </Text>
                  </View>
                </View>

                {rec.notes && <Text style={styles.recNote}>Notes: {rec.notes}</Text>}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Capital Modal */}
      <Modal visible={showCapitalModal} transparent animationType="slide" onRequestClose={() => setShowCapitalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💰 Inject Capital Infusion</Text>
            <Text style={styles.modalSub}>Add equity capital to fuel loan disbursements</Text>

            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={capitalAmt}
              onChangeText={setCapitalAmt}
            />

            <Text style={styles.inputLabel}>Deposit Account</Text>
            <View style={styles.accountPickRow}>
              {fundAccounts.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.pickBtn, capitalAccId === a.id && styles.selectedPickBtn]}
                  onPress={() => setCapitalAccId(a.id)}
                >
                  <Text style={[styles.pickText, capitalAccId === a.id && styles.selectedPickText]}>
                    {a.account_type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Description / Notes</Text>
            <TextInput
              style={styles.textInput}
              value={capitalDesc}
              onChangeText={setCapitalDesc}
            />

            <View style={styles.btnRow}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowCapitalModal(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Inject Capital" variant="primary" onPress={handleAddCapital} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} transparent animationType="slide" onRequestClose={() => setShowExpenseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💸 Log Operating Expense</Text>
            <Text style={styles.modalSub}>Operational costs deducted from fund pool</Text>

            <Text style={styles.inputLabel}>Expense Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {['COLLECTION_TRANSPORT', 'STAFF_SALARY', 'OFFICE_RENT', 'BANK_CHARGES', 'MISC'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pickBtn, expenseCat === cat && styles.selectedPickBtn]}
                  onPress={() => setExpenseCat(cat)}
                >
                  <Text style={[styles.pickText, expenseCat === cat && styles.selectedPickText]}>
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={expenseAmt}
              onChangeText={setExpenseAmt}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={expenseDesc}
              onChangeText={setExpenseDesc}
            />

            <View style={styles.btnRow}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowExpenseModal(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Record Expense" variant="danger" onPress={handleAddExpense} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Cash Drawer Reconcile Modal */}
      <Modal visible={showReconcileModal} transparent animationType="slide" onRequestClose={() => setShowReconcileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚖️ Reconcile Cash Drawer</Text>
            <Text style={styles.modalSub}>Physical cash count check</Text>

            <Text style={styles.inputLabel}>Physical Cash Counted (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={actualCashStr}
              onChangeText={setActualCashStr}
            />

            <Text style={styles.inputLabel}>Audit Notes</Text>
            <TextInput
              style={styles.textInput}
              value={reconcileNotes}
              onChangeText={setReconcileNotes}
            />

            <View style={styles.btnRow}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowReconcileModal(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Save Reconciliation" variant="primary" onPress={handleReconcile} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    marginRight: 6,
    backgroundColor: '#F1F5F9',
  },
  selectedTabBtn: {
    backgroundColor: colors.primaryDark,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#475569',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  subFilterScroll: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: '#F8FAFC',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedSubChip: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
  },
  subChipText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: typography.weights.medium,
  },
  selectedSubText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  txNum: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  txDate: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  txAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
  },
  txDesc: {
    fontSize: typography.sizes.xs,
    color: '#475569',
    marginVertical: 4,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  txAccount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  accCode: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  accTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  accBalanceLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  accBalanceVal: {
    fontSize: 26,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
    marginVertical: 2,
  },
  accFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
    marginTop: 4,
  },
  accSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  reconcileActionCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: spacing.lg,
  },
  recTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F766E',
  },
  recSub: {
    fontSize: typography.sizes.xs,
    color: '#115E59',
    marginTop: 2,
    lineHeight: 16,
  },
  recHistoryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginBottom: spacing.sm,
  },
  recItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recItemDate: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: typography.weights.medium,
  },
  recNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recNumLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  recNumVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginTop: 2,
  },
  recNote: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#334155',
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  accountPickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  selectedPickBtn: {
    backgroundColor: colors.primaryDark,
  },
  pickText: {
    fontSize: 11,
    color: '#475569',
  },
  selectedPickText: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
