import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import MetricCard from '../../components/common/MetricCard';
import Icon from '../../components/common/Icon';

const AdminExpenses = () => {
  const { expenses, addExpense, fundMetrics } = useApp();

  const [category, setCategory] = useState('Transport');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('Cash');

  const categories = ['Office', 'Transport', 'Salary', 'Other'];

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid expense amount.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter an expense description.');
      return;
    }

    addExpense({
      category,
      amount: numAmount,
      description: description.trim(),
      account: paymentAccount,
    });

    Alert.alert(
      'Expense Recorded',
      `Logged ${formatINR(numAmount)} for ${description.trim()}.\n\nImpact:\n• Available Cash ↓ ${formatINR(numAmount)}\n• Expenses ↑ ${formatINR(numAmount)}\n• Profit ↓ ${formatINR(numAmount)}`
    );

    setAmount('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expense Management</Text>
        <Text style={styles.subtitle}>Daily operational outflow & cash accounting</Text>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="This Month Expenses"
            value={formatINR(fundMetrics.thisMonthExpenses)}
            change="Operational Outflow"
            isPositive={false}
            color="#DC2626"
            iconName="reports"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Available Cash"
            value={formatINR(fundMetrics.availableCash)}
            change="Remaining Vault"
            isPositive={true}
            color="#059669"
            iconName="fund"
          />
        </View>
      </View>

      {/* ADD EXPENSE FORM */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Daily Expense</Text>
        <Text style={styles.cardSub}>Directly reduces available cash and monthly net profit</Text>

        {/* Category selector */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, category === c && styles.categoryChipActive]}
              onPress={() => setCategory(c)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 500"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Description */}
        <Text style={styles.label}>Description / Purpose *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Fuel for collection bike"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
          <Icon name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Record Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Recent expenses list */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Operational Expenses</Text>
        {expenses.length === 0 ? (
          <Text style={styles.emptyText}>No expenses logged yet.</Text>
        ) : (
          expenses.map((e) => (
            <View key={e.id} style={styles.expenseItem}>
              <View>
                <Text style={styles.expenseDesc}>{e.description || e.category}</Text>
                <Text style={styles.expenseDate}>{e.date} • {e.category} ({e.account || 'Cash'})</Text>
              </View>
              <Text style={styles.expenseAmt}>−{formatINR(e.amount)}</Text>
            </View>
          ))
        )}
      </View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricHalf: {
    flex: 1,
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    gap: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  expenseDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  expenseAmt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default AdminExpenses;
