import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import DigitalReceiptModal from '../../Modals/Pages/DigitalReceiptModal';
import Colors from '../../../../theme/colors';

const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: Colors.purpleTintLightest, border: Colors.purpleBorderLight, text: Colors.primary },
    success: { bg: Colors.successBg, border: '#A7F3D0', text: Colors.success },
    warning: { bg: Colors.amberBg, border: '#FDE68A', text: Colors.amberDark },
    danger: { bg: Colors.errorBg, border: '#FECACA', text: Colors.errorDanger },
  };
  const current = variantStyles[variant] || variantStyles.primary;

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[styles.badgeText, { color: current.text }]}>{label}</Text>
    </View>
  );
};

export const Payments = () => {
  const { customers } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const customer = customers.find((c) => ((c?.name || c?.full_name || '')).toLowerCase().includes('kumar')) || customers[0] || {};

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
      paymentMethod: 'UPI',
      receiptNumber: 'RCP-2026-0901-01',
      customerName: customer.full_name || customer.name || 'Kumar',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Receipts</Text>
        <Text style={styles.subtitle}>All verified repayments with verifiable digital receipts</Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.paymentCard}
            onPress={() => setSelectedReceipt({
              receipt_id: item.receiptNumber,
              amount: item.amount,
              date: item.date,
              customer_name: item.customerName,
              payment_mode: item.paymentMethod,
              loan_code: `LN-${item.loanNumber}`,
              remaining_balance: 3800,
            })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.receiptNo}>{item.receiptNumber}</Text>
                <Text style={styles.paymentDate}>{item.date}</Text>
              </View>
              <Badge label={item.status} variant="success" />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Amount Paid</Text>
                <Text style={styles.amountValue}>{formatINR(item.amount)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Mode: {item.paymentMethod}</Text>
                <Text style={styles.metaLabel}>Inst: #{item.installmentNumber}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.viewReceiptText}>View Digital Receipt</Text>
              <MaterialCommunityIcons name="receipt-outline" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedReceipt && (
        <DigitalReceiptModal
          visible={!!selectedReceipt}
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray800,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray200,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingTop: 6,
    gap: 12,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptNo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray800,
  },
  paymentDate: {
    fontSize: 11,
    color: Colors.gray200,
    marginTop: 2,
  },
  cardBody: {
    backgroundColor: Colors.lightGray50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.gray200,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.gray200,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewReceiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Payments;
