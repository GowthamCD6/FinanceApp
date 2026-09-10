import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import DayEndHandoverModal from '../../components/modals/DayEndHandoverModal';

const AdminDayEndSettlement = ({ onBack, onCompleteSettlement }) => {
  const { fundTransactions, expenses } = useApp();
  const [cashNote, setCashNote] = useState('Evening field cash reconciled with physical bag count.');
  const [isLocked, setIsLocked] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  // Today's collections
  const todayTx = fundTransactions.filter((tx) => tx.type === 'COLLECTION');
  const cashCollected = todayTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const upiCollected = 14200; // Digital UPI collections today
  const totalCollectedToday = cashCollected + upiCollected;

  // Today's field expenses
  const todayExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Net physical cash calculation
  const openingCashInBag = 10000; // Opening float
  const fieldCashDisbursed = 0; // Today's loan disbursement
  const netCashInBag = openingCashInBag + cashCollected - todayExpenses - fieldCashDisbursed;

  const handleOpenHandover = () => {
    if (isLocked) return;
    setShowHandoverModal(true);
  };

  const handleConfirmHandover = ({ netCash, note, signature }) => {
    setIsLocked(true);
    setCashNote(`${note} (Signed by: ${signature})`);
    if (onCompleteSettlement) onCompleteSettlement();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={14} color="#2563EB" />
          <Text style={styles.backBtnText}>Back to Ops Hub</Text>
        </TouchableOpacity>
        <Badge label={isLocked ? "SETTLED & LOCKED" : "DRAWER OPEN"} variant={isLocked ? "success" : "warning"} size="sm" />
      </View>

      {/* Hero Title */}
      <View style={styles.heroBox}>
        <Text style={styles.heroEyebrow}>FIELD OPERATIONS CLOSE-OUT</Text>
        <Text style={styles.heroTitle}>Day-End Cash Settlement</Text>
        <Text style={styles.heroSub}>Reconcile today's collections, field expenses, and handover net cash</Text>
      </View>

      {/* Net Physical Cash Handover Card */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>NET PHYSICAL CASH TO HANDOVER</Text>
        <Text style={styles.highlightVal}>{formatINR(netCashInBag)}</Text>
        <Text style={styles.highlightNote}>Physical bank notes in field bag ready for vault deposit</Text>
      </View>

      {/* Mathematical Breakdown Section */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>CASH DRAWER RECONCILIATION</Text>
        <Text style={styles.cardTitle}>Daily Cash Equation</Text>

        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>1. Opening Cash Float in Bag</Text>
          <Text style={styles.reconVal}>{formatINR(openingCashInBag)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>2. Physical Cash Collected (+)</Text>
          <Text style={[styles.reconVal, { color: '#059669' }]}>+{formatINR(cashCollected)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>3. Field Disbursed in Cash (−)</Text>
          <Text style={[styles.reconVal, { color: '#64748B' }]}>−{formatINR(fieldCashDisbursed)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>4. Operational Expenses Paid (−)</Text>
          <Text style={[styles.reconVal, { color: '#DC2626' }]}>−{formatINR(todayExpenses)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Physical Cash Balance:</Text>
          <Text style={styles.netVal}>{formatINR(netCashInBag)}</Text>
        </View>
      </View>

      {/* Digital & UPI Collections Card */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>DIGITAL / UPI COLLECTIONS</Text>
        <Text style={styles.cardTitle}>Direct Bank Receipts</Text>

        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>UPI QR / PhonePe / GPay</Text>
          <Text style={[styles.reconVal, { color: '#2563EB' }]}>+{formatINR(upiCollected)}</Text>
        </View>
        <Text style={styles.digitalNote}>
          Digital receipts bypass the field bag and reflect directly in Central Fund Bank Account.
        </Text>
      </View>

      {/* Field Expenses Detail */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>FIELD DISBURSEMENTS & EXPENSES</Text>
        <Text style={styles.cardTitle}>Deductions Breakdown</Text>

        {expenses.length === 0 ? (
          <Text style={styles.emptyText}>No field expenses logged today.</Text>
        ) : (
          expenses.map((exp, idx) => (
            <View key={exp.id || idx} style={styles.expenseItem}>
              <View>
                <Text style={styles.expenseTitle}>{exp.title || exp.category}</Text>
                <Text style={styles.expenseSub}>{exp.date} • {exp.payment_method || 'CASH'}</Text>
              </View>
              <Text style={styles.expenseAmount}>−{formatINR(exp.amount)}</Text>
            </View>
          ))
        )}
      </View>

      {/* Verification Notes & Submission */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>SETTLEMENT VOUCHER</Text>
        <Text style={styles.cardTitle}>Handover Verification Note</Text>

        <TextInput
          style={styles.textArea}
          value={cashNote}
          onChangeText={setCashNote}
          placeholder="Enter settlement handover remarks..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          editable={!isLocked}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, isLocked && styles.submitBtnDisabled]} 
          onPress={handleOpenHandover}
          disabled={isLocked}
          activeOpacity={0.8}
        >
          <Icon name={isLocked ? "check" : "lock"} size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>
            {isLocked ? 'Settlement Locked & Completed' : 'Submit Handover & Lock Drawer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day End Handover Modal */}
      <DayEndHandoverModal
        visible={showHandoverModal}
        netCashAmount={netCashInBag}
        cashCollected={cashCollected}
        upiCollected={upiCollected}
        todayExpenses={todayExpenses}
        onClose={() => setShowHandoverModal(false)}
        onConfirmHandover={handleConfirmHandover}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 70,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  heroBox: {
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  heroSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  highlightCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1,
  },
  highlightVal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065F46',
    marginVertical: 4,
  },
  highlightNote: {
    fontSize: 11,
    color: '#047857',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 12,
  },
  reconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  reconLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  reconVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  netVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  digitalNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  expenseSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    color: '#0F172A',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default AdminDayEndSettlement;
