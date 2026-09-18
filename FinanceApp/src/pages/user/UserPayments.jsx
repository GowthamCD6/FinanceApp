import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import DigitalReceiptModal from './modal/DigitalReceiptModal';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' },
    success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  };
  const current = variantStyles[variant] || variantStyles.primary;

  return (
    <View style={[badgeStyles.badge, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[badgeStyles.text, { color: current.text }]}>{label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});

const UserPayments = () => {
  const { fundTransactions, loans, customers } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter collections related to Kumar
  const customer = customers.find((c) => ((c?.name || c?.full_name || '')).toLowerCase().includes('kumar')) || customers[0] || {};

  // Payments made by Kumar
  const payments = [
    {
      id: 'pay-001',
      loanNumber: '004',
      installmentNumber: 2,
      amount: 1100,
      principal: 1000,
      income: 100,
      date: '2026-09-08',
      status: 'VERIFIED',
      paymentMethod: 'CASH',
      receiptNumber: 'RCP-2026-0908-01',
      customerName: customer.full_name || customer.name || 'Kumar',
    },
    {
      id: 'pay-002',
      loanNumber: '004',
      installmentNumber: 1,
      amount: 1100,
      principal: 1000,
      income: 100,
      date: '2026-09-01',
      status: 'VERIFIED',
      paymentMethod: 'CASH',
      receiptNumber: 'RCP-2026-0901-44',
      customerName: customer.full_name || customer.name || 'Kumar',
    },
    {
      id: 'pay-003',
      loanNumber: '003',
      installmentNumber: 10,
      amount: 3850,
      principal: 3500,
      income: 350,
      date: '2026-08-15',
      status: 'VERIFIED',
      paymentMethod: 'CASH',
      receiptNumber: 'RCP-2026-0815-12',
      customerName: customer.full_name || customer.name || 'Kumar',
    },
    {
      id: 'pay-004',
      loanNumber: '003',
      installmentNumber: 9,
      amount: 3850,
      principal: 3500,
      income: 350,
      date: '2026-08-08',
      status: 'VERIFIED',
      paymentMethod: 'CASH',
      receiptNumber: 'RCP-2026-0808-09',
      customerName: customer.full_name || customer.name || 'Kumar',
    },
  ];

  const totalRepaidAmount = 32000;

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.paymentCard}
      onPress={() => setSelectedReceipt(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.receiptTitle}>Receipt #{item.receiptNumber}</Text>
          <Text style={styles.receiptMeta}>
            Loan #{item.loanNumber} • Installment #{item.installmentNumber}
          </Text>
        </View>
        <Badge label={item.status} variant="success" />
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Paid on {formatDate(item.date)}</Text>
          <Text style={styles.paymentMode}>Mode: {item.paymentMethod}</Text>
        </View>
        <Text style={styles.amountValue}>{formatINR(item.amount)}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewReceiptLink}>View Official Digital Receipt</Text>
        <MaterialCommunityIcons name="arrow-right" size={14} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>Verified digital vouchers & repayment receipts</Text>
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Repaid</Text>
          <Text style={styles.summaryVal}>{formatINR(totalRepaidAmount)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Receipts</Text>
          <Text style={[styles.summaryVal, { color: '#2563EB' }]}>{payments.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Verification</Text>
          <Text style={[styles.summaryVal, { color: '#059669' }]}>100% Valid</Text>
        </View>
      </View>

      {/* Payments List */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        visible={!!selectedReceipt}
        receiptData={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 70,
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  receiptMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  paymentMode: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  amountValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  viewReceiptLink: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default UserPayments;
