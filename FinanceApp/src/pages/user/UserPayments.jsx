import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import DigitalReceiptModal from '../../components/modals/DigitalReceiptModal';

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
        <Badge label={item.status} variant="success" size="sm" />
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
        <Icon name="arrow-right" size={12} color="#2563EB" />
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
