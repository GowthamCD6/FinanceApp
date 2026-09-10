import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';
import { Payment } from '../../types';
import { formatINR, formatDate } from '../../utils/helpers';
import { Button } from '../common/Button';

interface ReceiptModalProps {
  visible: boolean;
  payment?: Payment;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, payment, onClose }) => {
  if (!payment) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🧾 Official Payment Receipt\nReceipt #: ${payment.payment_number}\nCustomer: ${payment.customer_name}\nLoan: ${payment.loan_number}\nAmount Paid: ${formatINR(payment.amount)}\nPayment Method: ${payment.payment_method}\nDate: ${payment.payment_date}\nCollector: ${payment.collector_name || 'System'}\nFund Flow Micro-Lending`,
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.receiptContainer}>
          {/* Top Zig-Zag / Header Notch */}
          <View style={styles.receiptHeader}>
            <View style={styles.successIconBox}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
            <Text style={styles.receiptNum}>{payment.payment_number}</Text>
          </View>

          {/* Amount Paid Big Display */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
            <Text style={styles.amountVal}>{formatINR(payment.amount)}</Text>
            <Text style={styles.paymentMethod}>via {payment.payment_method}</Text>
          </View>

          {/* Details Table */}
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

          {/* Fund Circulation Allocation Breakdown */}
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

          {/* Stamp */}
          <View style={styles.stamp}>
            <Text style={styles.stampText}>AUTHORIZED COLLECTION • RECYCLED</Text>
          </View>

          {/* Actions */}
          <View style={styles.btnRow}>
            <Button
              title="Share Receipt"
              variant="outline"
              icon="📤"
              onPress={handleShare}
              style={{ flex: 1, marginRight: spacing.sm }}
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
    padding: spacing.lg,
  },
  receiptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
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
    marginBottom: spacing.md,
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
    fontWeight: typography.weights.heavy,
  },
  receiptTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  receiptNum: {
    fontSize: typography.sizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
  },
  amountVal: {
    fontSize: 28,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
    marginVertical: 2,
  },
  paymentMethod: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    fontWeight: typography.weights.medium,
  },
  detailsTable: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
  },
  val: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#1E293B',
  },
  allocationBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  allocTitle: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: typography.weights.bold,
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
    fontWeight: typography.weights.bold,
    color: colors.successText,
  },
  allocValBlue: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  stamp: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  stampText: {
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
