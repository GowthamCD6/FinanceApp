import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR, formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Colors, Fonts } from '../../theme';
import AddExpenseModal from './modal/AddExpenseModal';

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
          <MaterialCommunityIcons name="plus" size={16} color={Colors.white} style={{ marginRight: 4 }} />
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
          <View key={e.id || idx} style={styles.expenseCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.expCategory}>{e.category}</Text>
                <Text style={styles.expDate}>{formatDate(e.date || '2026-09-08')} • Paid via {e.payment_method || e.account || 'CASH'}</Text>
              </View>
              <Text style={styles.expAmount}>−{formatINR(e.amount)}</Text>
            </View>
            {e.description && <Text style={styles.expDesc}>{e.description}</Text>}
          </View>
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
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.lightGray400,
  },
  totalLabel: { fontSize: 10, fontFamily: Fonts.gilroy.bold, color: '#DC2626', letterSpacing: 1.1 },
  totalVal: { fontSize: 24, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: Colors.white, fontFamily: Fonts.gilroy.bold, fontSize: 12 },
  noticeBox: { 
    backgroundColor: '#FEF2F2', 
    padding: 12, 
    marginHorizontal: 14, 
    marginTop: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#FECACA',
  },
  noticeText: { fontSize: 11, color: '#B91C1C', lineHeight: 16, fontFamily: Fonts.gilroy.medium },
  listContent: { padding: 14, paddingBottom: 70 },
  countText: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.gilroy.bold, marginBottom: 10 },
  expenseCard: { 
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: Colors.lightGray400, // #E5E7EB
    borderLeftWidth: 4, 
    borderLeftColor: '#DC2626',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expCategory: { fontSize: 14, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary },
  expDate: { fontSize: 10, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, marginTop: 2 },
  expAmount: { fontSize: 15, fontFamily: Fonts.gilroy.bold, color: '#DC2626' },
  expDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.lightGray400 },
});

export default SuperAdminExpenses;
