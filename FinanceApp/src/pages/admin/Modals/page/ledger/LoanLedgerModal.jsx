import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { formatINR } from '../../../../../utils/helpers';

export const LoanLedgerModal = ({ visible, onClose, loan, onOpenCollect }) => {
  if (!visible || !loan) return null;

  const totalInstallments = loan.total_installments || loan.tenure_weeks || 10;
  const paidCount = loan.paid_installments || (loan.status === 'COMPLETED' ? totalInstallments : Math.floor(totalInstallments * 0.6));
  const installmentAmount = loan.emi_amount || loan.installment_amount || 600;
  const principal = loan.principal_amount || loan.principal || 5000;
  const totalRepayment = loan.total_repayment_amount || principal * 1.2;
  const paidAmount = loan.total_paid || (paidCount * installmentAmount);
  const remaining = Math.max(0, totalRepayment - paidAmount);

  // Generate virtual schedule of installments
  const schedule = Array.from({ length: totalInstallments }, (_, idx) => {
    const num = idx + 1;
    const isPaid = num <= paidCount;
    const isCurrent = num === paidCount + 1 && remaining > 0;
    return {
      number: num,
      dueDate: `2026-09-${String(10 + idx).padStart(2, '0')}`,
      amount: installmentAmount,
      status: isPaid ? 'PAID' : isCurrent ? 'PENDING' : 'UPCOMING',
      receipt: isPaid ? `RCP-2024-${8800 + num}` : null,
      mode: isPaid ? (num % 2 === 0 ? 'UPI' : 'CASH') : null,
    };
  });

  const handleSharePassbook = () => {
    Alert.alert(
      'Share Passbook Statement',
      `Passbook statement for ${loan.customer_name || loan.borrower_name || 'Borrower'} (Loan: ${loan.loan_code || 'LN-2024'}) is ready to share via WhatsApp / SMS.`
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <Header
            title={loan.customer_name || loan.borrower_name || loan.loan_code || 'Loan Passbook'}
            onBack={onClose}
            showBackButton={true}
            showDivider={true}
            rightComponent={
              <TouchableOpacity onPress={handleSharePassbook} activeOpacity={0.7} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="share-variant" size={18} color="#2563EB" />
              </TouchableOpacity>
            }
          />

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Financial Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.metricGrid}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>PRINCIPAL</Text>
                  <Text style={styles.metricValue}>{formatINR(principal)}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>TOTAL CONTRACT</Text>
                  <Text style={styles.metricValue}>{formatINR(totalRepayment)}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>TOTAL RECOVERED</Text>
                  <Text style={[styles.metricValue, { color: '#059669' }]}>{formatINR(paidAmount)}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>OUTSTANDING</Text>
                  <Text style={[styles.metricValue, { color: '#DC2626' }]}>{formatINR(remaining)}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressWrap}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(paidCount / totalInstallments) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {paidCount} of {totalInstallments} installments completed ({Math.round((paidCount / totalInstallments) * 100)}%)
                </Text>
              </View>
            </View>

            {/* Actions Bar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleSharePassbook}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="file-document-outline" size={14} color="#2563EB" />
                <Text style={styles.shareBtnText}>Share Statement</Text>
              </TouchableOpacity>

              {remaining > 0 && (
                <TouchableOpacity
                  style={styles.collectBtn}
                  onPress={() => {
                    onClose();
                    if (onOpenCollect) onOpenCollect(loan);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                  <Text style={styles.collectBtnText}>Collect ₹{installmentAmount}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Installment Passbook Timeline */}
            <Text style={styles.sectionTitle}>INSTALLMENT SCHEDULE & RECEIPTS</Text>
            <View style={styles.scheduleList}>
              {schedule.map((item) => (
                <View key={item.number} style={styles.scheduleItem}>
                  <View style={styles.itemLeft}>
                    <View style={[
                      styles.indexCircle,
                      item.status === 'PAID' && styles.indexCirclePaid,
                      item.status === 'PENDING' && styles.indexCirclePending,
                    ]}>
                      <Text style={[
                        styles.indexText,
                        item.status === 'PAID' && styles.indexTextPaid,
                        item.status === 'PENDING' && styles.indexTextPending,
                      ]}>
                        {item.number}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>Installment #{item.number}</Text>
                      <Text style={styles.itemSub}>
                        {item.receipt ? `${item.receipt} • ${item.mode}` : `Due: ${item.dueDate}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <Text style={[
                      styles.itemAmount,
                      item.status === 'PAID' && { color: '#059669' },
                    ]}>
                      {formatINR(item.amount)}
                    </Text>
                    <View style={[
                      styles.statusTag,
                      item.status === 'PAID' && styles.statusTagPaid,
                      item.status === 'PENDING' && styles.statusTagPending,
                      item.status === 'UPCOMING' && styles.statusTagUpcoming,
                    ]}>
                      <Text style={[
                        styles.statusTagText,
                        item.status === 'PAID' && styles.statusTagTextPaid,
                        item.status === 'PENDING' && styles.statusTagTextPending,
                        item.status === 'UPCOMING' && styles.statusTagTextUpcoming,
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  loanCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  borrowerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metricCol: {
    width: '47%',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressWrap: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  collectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
  },
  collectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  scheduleList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indexCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexCirclePaid: {
    backgroundColor: '#ECFDF5',
  },
  indexCirclePending: {
    backgroundColor: '#FEF3C7',
  },
  indexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  indexTextPaid: {
    color: '#059669',
  },
  indexTextPending: {
    color: '#D97706',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  statusTagPaid: {
    backgroundColor: '#ECFDF5',
  },
  statusTagPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTagUpcoming: {
    backgroundColor: '#F1F5F9',
  },
  statusTagText: {
    fontSize: 8,
    fontWeight: '800',
  },
  statusTagTextPaid: {
    color: '#059669',
  },
  statusTagTextPending: {
    color: '#D97706',
  },
  statusTagTextUpcoming: {
    color: '#94A3B8',
  },
});

export default LoanLedgerModal;
