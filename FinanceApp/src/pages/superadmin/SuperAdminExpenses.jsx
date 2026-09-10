import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { formatINR, formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { FadeInView } from '../../animations/FadeInView';
import Icon from '../../components/common/Icon';
import AddExpenseModal from '../../components/modals/AddExpenseModal';

export const SuperAdminExpenses = () => {
  const { expenses, fundMetrics, addExpense } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.totalLabel}>THIS MONTH'S OPERATING EXPENSES</Text>
          <Text style={styles.totalVal}>{formatINR(fundMetrics.thisMonthExpenses)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addBtnText}>Log Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Accounting Notice */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          Every operational expenditure deducts from Central Fund Available Cash, logs into the Audit Ledger, and reduces Net Profit.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{expenses.length} Expense Entries Logged</Text>

        {expenses.map((e, idx) => (
          <FadeInView key={e.id || idx} delay={idx * 30}>
            <View style={styles.expenseCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.expCategory}>{e.category}</Text>
                  <Text style={styles.expDate}>{formatDate(e.date || '2026-09-08')} • Paid via {e.payment_method || e.account || 'CASH'}</Text>
                </View>
                <Text style={styles.expAmount}>−{formatINR(e.amount)}</Text>
              </View>
              {e.description && <Text style={styles.expDesc}>{e.description}</Text>}
            </View>
          </FadeInView>
        ))}
      </ScrollView>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddExpense={(exp) => addExpense(exp)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  totalLabel: { fontSize: 10, fontWeight: '800', color: '#DC2626', letterSpacing: 1.1 },
  totalVal: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  noticeBox: { 
    backgroundColor: '#FEF2F2', 
    padding: 12, 
    marginHorizontal: 14, 
    marginTop: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#FECACA' 
  },
  noticeText: { fontSize: 11, color: '#B91C1C', lineHeight: 16 },
  listContent: { padding: 14, paddingBottom: 70 },
  countText: { fontSize: 11, color: '#64748B', fontWeight: '700', marginBottom: 10 },
  expenseCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expCategory: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  expDate: { fontSize: 10, color: '#64748B', marginTop: 2 },
  expAmount: { fontSize: 15, fontWeight: '900', color: '#DC2626' },
  expDesc: { fontSize: 12, color: '#475569', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
});

export default SuperAdminExpenses;
