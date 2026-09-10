import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Share } from 'react-native';
import { formatINR, formatDate } from '../../utils/helpers';
import Icon from '../common/Icon';

export const DigitalReceiptModal = ({ visible, receiptData, onClose }) => {
  if (!visible || !receiptData) return null;

  const {
    receiptNumber = `REC-${Date.now().toString().slice(-6)}`,
    customerName = 'Customer',
    loanNumber = '#001',
    installmentNumber = 1,
    amount = 0,
    principal = 0,
    income = 0,
    paymentMethod = 'CASH',
    date = new Date().toISOString().slice(0, 10),
  } = receiptData;

  const handleShare = async () => {
    try {
      const message = `*FUND FLOW - PAYMENT RECEIPT*\n` +
        `Receipt #: ${receiptNumber}\n` +
        `Date: ${formatDate(date)}\n` +
        `Customer: ${customerName}\n` +
        `Loan: ${loanNumber} (Installment #${installmentNumber})\n` +
        `Amount Paid: ${formatINR(amount)}\n` +
        `Payment Mode: ${paymentMethod}\n` +
        `Status: VERIFIED & CREDITED TO CENTRAL FUND\n` +
        `Thank you for your timely payment!`;

      await Share.share({ message });
    } catch {
      Alert.alert('Copied', 'Receipt details ready to share.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.voucherCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Payment Voucher</Text>
            <Text style={styles.receiptNum}>{receiptNumber}</Text>
          </View>

          {/* Amount Hero */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>COLLECTED AMOUNT</Text>
            <Text style={styles.amountValue}>{formatINR(amount)}</Text>
            <Text style={styles.paymentMethodText}>Paid via {paymentMethod}</Text>
          </View>

          {/* Line items */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Borrower</Text>
              <Text style={styles.val}>{customerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Loan & Installment</Text>
              <Text style={styles.val}>{loanNumber} • Inst #{installmentNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date & Timestamp</Text>
              <Text style={styles.val}>{formatDate(date)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Fund Circulation Accounting Split */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Principal Return (Fund Re-circulation)</Text>
              <Text style={[styles.val, { color: '#059669' }]}>+{formatINR(principal)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Lending Fee (Gross Income)</Text>
              <Text style={[styles.val, { color: '#2563EB' }]}>+{formatINR(income)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Text style={styles.shareBtnText}>Share Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voucherCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  receiptNum: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  amountBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  paymentMethodText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  val: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  shareBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default DigitalReceiptModal;
