import React from 'react';
import { Modal, View, Text, StyleSheet, Share } from 'react-native';
import { colors, formatINR } from '../../utils/helpers';
import { Button } from '../common/Button';
import Icon from '../common/Icon';

export const ReceiptModal = ({ visible, payment, onClose }) => {
  if (!payment) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Official Payment Receipt\nReceipt #: ${payment.payment_number}\nCustomer: ${payment.customer_name}\nLoan: ${payment.loan_number}\nAmount Paid: ${formatINR(payment.amount)}\nPayment Method: ${payment.payment_method}\nDate: ${payment.payment_date}\nCollector: ${payment.collector_name || 'System'}\nFund Flow Micro-Lending`,
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <View style={styles.successIconBox}>
              <Icon name="check" size={16} color="#059669" />
            </View>
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
            <Text style={styles.receiptNum}>{payment.payment_number}</Text>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
            <Text style={styles.amountVal}>{formatINR(payment.amount)}</Text>
            <Text style={styles.paymentMethod}>via {payment.payment_method}</Text>
          </View>

          <View style={styles.detailsTable}>
            <View style={styles.row}>
              <Text style={styles.label}>Client Name</Text>
              <Text style={styles.val}>{payment.customer_name}</Text>
            </View>

            {payment.shop_name && (
              <View style={styles.row}>
                <Text style={styles.label}>Shop / Business</Text>
                <Text style={styles.val}>{payment.shop_name}</Text>
              </View>
            )}

            <View style={styles.row}>
              <Text style={styles.label}>Loan Account</Text>
              <Text style={styles.val}>{payment.loan_number}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.val}>{payment.payment_date}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Field Collector</Text>
              <Text style={styles.val}>{payment.collector_name || 'Branch Official'}</Text>
            </View>
          </View>

          <View style={styles.allocationBox}>
            <Text style={styles.allocTitle}>Ledger Accounting Breakdown</Text>
            <View style={styles.allocRow}>
              <Text style={styles.allocLabel}>Principal Recycled to Cash Pool:</Text>
              <Text style={styles.allocValGreen}>+{formatINR(payment.principal_recovered)}</Text>
            </View>
            <View style={styles.allocRow}>
              <Text style={styles.allocLabel}>Contract Lending Income:</Text>
              <Text style={styles.allocValBlue}>+{formatINR(payment.income_collected)}</Text>
            </View>
          </View>

          <View style={styles.stamp}>
            <Text style={styles.stampText}>AUTHORIZED COLLECTION • RECYCLED</Text>
          </View>

          <View style={styles.btnRow}>
            <Button
              title="Share Receipt"
              variant="outline"
              onPress={handleShare}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Done"
              variant="primary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  successIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  checkIcon: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '800',
  },
  receiptTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  receiptNum: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  amountVal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginVertical: 2,
  },
  paymentMethod: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsTable: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
  },
  val: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  allocationBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  allocTitle: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  allocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  allocLabel: {
    fontSize: 11,
    color: '#334155',
  },
  allocValGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successText,
  },
  allocValBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  stamp: {
    alignItems: 'center',
    marginVertical: 4,
  },
  stampText: {
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});

export default ReceiptModal;

