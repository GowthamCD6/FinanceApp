import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import CollectPaymentModal from '../../components/modals/CollectPaymentModal';
import DigitalReceiptModal from '../../components/modals/DigitalReceiptModal';

const AdminLoanDetail = ({ loanId, onBack }) => {
  const { loans, customers, collectPayment } = useApp();
  const [selectedInst, setSelectedInst] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const loan = loans.find((l) => l.id === loanId || l.loan_number === loanId || l.loanNumber === loanId) || loans[0];
  const customer = customers.find((c) => c.id === (loan?.customer_id || loan?.customerId)) || { 
    name: loan?.customer_name || loan?.customerName || 'Customer',
    phone: loan?.customer_phone || '9876543210',
  };

  const principal = loan.principal_amount !== undefined ? loan.principal_amount : (loan.principal || 0);
  const totalRepay = loan.total_repayment_amount !== undefined ? loan.total_repayment_amount : (loan.totalRepayment || 1);
  const paidAmount = loan.total_paid !== undefined ? loan.total_paid : (loan.paidAmount || 0);
  const outstanding = loan.outstanding_amount !== undefined ? loan.outstanding_amount : (loan.remainingAmount || Math.max(0, totalRepay - paidAmount));
  const income = loan.contracted_income_amount !== undefined ? loan.contracted_income_amount : (loan.lendingIncome || (totalRepay - principal));
  const loanNumber = loan.loan_number || loan.loanNumber || `#00${loan.id}`;
  const loanType = loan.repayment_frequency || loan.loan_type || loan.type || 'WEEKLY';
  const duration = loan.total_installments || loan.duration || 10;
  const status = loan.status || 'ACTIVE';

  const schedule = loan.installments || loan.schedule || [];
  const progressPercent = totalRepay > 0 ? Math.min(100, Math.round((paidAmount / totalRepay) * 100)) : 0;

  const openPaymentModal = (inst) => {
    if (inst.status === 'PAID') {
      Alert.alert('Already Paid', `Installment #${inst.installment_number || inst.installmentNumber} is fully settled.`);
      return;
    }
    setSelectedInst(inst);
  };

  const handleCollectSuccess = (receiptData) => {
    setSelectedInst(null);
    setActiveReceipt(receiptData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icon name="arrow-left" size={14} color="#2563EB" />
        <Text style={styles.backBtnText}>Back to Loans</Text>
      </TouchableOpacity>

      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.numBadgeRow}>
              <Text style={styles.loanNumber}>{loanNumber}</Text>
              {(loan.parent_loan_id || loan.parentLoanId) && (
                <View style={styles.repeatBadge}>
                  <Icon name="repeat" size={10} color="#7C3AED" />
                  <Text style={styles.repeatText}>Repeat Loan</Text>
                </View>
              )}
            </View>
            <Text style={styles.borrowerName}>{customer.name || customer.full_name}</Text>
            <View style={styles.phoneRow}>
              <Icon name="phone" size={12} color="#64748B" />
              <Text style={styles.borrowerPhone}>{customer.phone || '9876543210'}</Text>
            </View>
          </View>
          <Badge 
            label={status} 
            variant={status === 'ACTIVE' ? 'primary' : status === 'COMPLETED' ? 'success' : 'danger'} 
            size="md"
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: status === 'COMPLETED' ? '#059669' : '#2563EB' }]} />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressSub}>{progressPercent}% Recovered</Text>
            <Text style={styles.progressSub}>
              {formatINR(paidAmount)} of {formatINR(totalRepay)}
            </Text>
          </View>
        </View>
      </View>

      {/* LOAN METRICS SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>LOAN CONTRACT OVERVIEW</Text>
        <Text style={styles.cardTitle}>Financial Terms & Recovery</Text>

        <View style={styles.specsGrid}>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Loan Product:</Text>
            <Text style={styles.specVal}>{loanType} ({duration} {loanType === 'WEEKLY' ? 'Weeks' : 'Days'})</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Principal Disbursed:</Text>
            <Text style={[styles.specVal, { color: '#0F172A', fontWeight: '800' }]}>
              {formatINR(principal)}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Lending Fee (Income):</Text>
            <Text style={[styles.specVal, { color: '#2563EB', fontWeight: '800' }]}>
              +{formatINR(income)}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Total Repayable:</Text>
            <Text style={[styles.specVal, { color: '#059669', fontWeight: '900' }]}>
              {formatINR(totalRepay)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Total Paid:</Text>
            <Text style={[styles.specVal, { color: '#059669', fontWeight: '700' }]}>
              {formatINR(paidAmount)}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Outstanding Balance:</Text>
            <Text style={[styles.specVal, { color: outstanding > 0 ? '#D97706' : '#059669', fontWeight: '800' }]}>
              {formatINR(outstanding)}
            </Text>
          </View>
        </View>
      </View>

      {/* REPAYMENT SCHEDULE TABLE */}
      <View style={styles.card}>
        <View style={styles.scheduleHeaderRow}>
          <View>
            <Text style={styles.cardEyebrow}>FIELD COLLECTION MATRIX</Text>
            <Text style={styles.cardTitle}>Repayment Schedule</Text>
          </View>
          <Text style={styles.scheduleHint}>Tap row to collect</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 0.6 }]}>#</Text>
          <Text style={[styles.th, { flex: 1.6 }]}>Due Date</Text>
          <Text style={[styles.th, { flex: 1.4 }]}>Expected</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Paid</Text>
          <Text style={[styles.th, { flex: 1.4, textAlign: 'right' }]}>Status</Text>
        </View>

        {/* Table Rows */}
        {schedule.length === 0 ? (
          <Text style={styles.emptyText}>No installment schedule rows available.</Text>
        ) : (
          schedule.map((row, idx) => {
            const instNum = row.installment_number || row.installmentNumber || (idx + 1);
            const dueDt = row.due_date || row.dueDate || '2026-09-15';
            const expAmt = row.expected_amount !== undefined ? row.expected_amount : (row.expectedAmount || 0);
            const pdAmt = row.paid_amount !== undefined ? row.paid_amount : (row.paidAmount || 0);
            const rowStatus = row.status || (pdAmt >= expAmt ? 'PAID' : 'PENDING');
            const isPaid = rowStatus === 'PAID';
            const isOverdue = rowStatus === 'OVERDUE';
            const isPending = rowStatus === 'PENDING';

            return (
              <TouchableOpacity
                key={row.id || idx}
                style={[
                  styles.tableRow,
                  isPending && styles.pendingTableRow,
                  isOverdue && styles.overdueTableRow,
                ]}
                onPress={() => openPaymentModal(row)}
                activeOpacity={0.7}
              >
                <Text style={[styles.td, { flex: 0.6, fontWeight: '800', color: '#0F172A' }]}>
                  {instNum}
                </Text>
                <Text style={[styles.td, { flex: 1.6, color: '#64748B' }]}>
                  {formatDate(dueDt)}
                </Text>
                <Text style={[styles.td, { flex: 1.4, fontWeight: '700', color: '#0F172A' }]}>
                  {formatINR(expAmt)}
                </Text>
                <Text style={[styles.td, { flex: 1.2, color: isPaid ? '#059669' : '#94A3B8', fontWeight: isPaid ? '700' : '400' }]}>
                  {formatINR(pdAmt)}
                </Text>
                <View style={[styles.td, { flex: 1.4, alignItems: 'flex-end' }]}>
                  <Badge
                    label={rowStatus}
                    variant={isPaid ? 'success' : isOverdue ? 'danger' : 'neutral'}
                    size="sm"
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Collect Modal */}
      {selectedInst && (
        <CollectPaymentModal
          visible={!!selectedInst}
          loan={loan}
          installment={selectedInst}
          onClose={() => setSelectedInst(null)}
          onCollectPayment={({ loanId, installmentId, amount, paymentMethod }) => {
            const instNum = selectedInst.installment_number || selectedInst.installmentNumber;
            collectPayment(loanId, instNum, amount, paymentMethod);
          }}
          onSuccess={handleCollectSuccess}
        />
      )}

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        visible={!!activeReceipt}
        receiptData={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  headerCard: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  numBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repeatText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '700',
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  borrowerPhone: {
    fontSize: 12,
    color: '#64748B',
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
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
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 12,
  },
  specsGrid: {
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  specVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  scheduleHint: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pendingTableRow: {
    backgroundColor: 'rgba(37, 99, 235, 0.02)',
  },
  overdueTableRow: {
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
  },
  td: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 14,
  },
});

export default AdminLoanDetail;
