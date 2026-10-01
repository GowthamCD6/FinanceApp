import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import { Colors, Fonts } from '../../theme';
import RestructureLoanModal from './modal/RestructureLoanModal';
import EarlySettlementModal from './modal/EarlySettlementModal';
import { EditLoanModal, DeleteLoanModal } from '../../components/loans/LoanModals';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: Colors.purpleTintLightest, border: Colors.purpleBorderLight, text: Colors.primary },
    secondary: { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
    success: { bg: Colors.successBg, border: '#A7F3D0', text: Colors.success },
    warning: { bg: Colors.amberBg, border: '#FDE68A', text: Colors.amberDark },
    neutral: { bg: Colors.backgroundContainer, border: Colors.lightGray400, text: Colors.gray200 },
    danger: { bg: Colors.errorBg, border: '#FECACA', text: Colors.errorDanger },
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
    fontFamily: Fonts.gilroy.bold,
  },
});

const SuperAdminLoanDetail = ({ loanId, onBack, onNavigateToCustomer, onOpenAudit }) => {
  const { loans, customers, collectPayment } = useApp();

  const [showRestructureModal, setShowRestructureModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [showDeleteLoanModal, setShowDeleteLoanModal] = useState(false);

  const loan = loans.find((l) => l.id === loanId || l.loan_number === loanId || l.loanNumber === loanId) || loans[0];
  const customer = customers.find((c) => c.id === (loan?.customer_id || loan?.customerId)) || {
    name: loan?.customer_name || loan?.customerName || 'Customer',
    phone: loan?.customer_phone || '9876543210',
    customer_type: loan?.customer_type || 'COMMON_CUSTOMER',
  };

  const principal = loan.principal_amount !== undefined ? loan.principal_amount : (loan.principal || 0);
  const totalRepay = loan.total_repayment_amount !== undefined ? loan.total_repayment_amount : (loan.totalRepayment || 1);
  const contractedIncome = loan.contracted_income_amount !== undefined ? loan.contracted_income_amount : (loan.lendingIncome || (totalRepay - principal));
  const totalPaid = loan.total_paid !== undefined ? loan.total_paid : (loan.paidAmount || 0);
  const outstanding = loan.outstanding_amount !== undefined ? loan.outstanding_amount : (loan.remainingAmount || Math.max(0, totalRepay - totalPaid));
  const principalRecovered = loan.total_principal_recovered !== undefined ? loan.total_principal_recovered : Math.round(totalPaid * (principal / totalRepay));
  const incomeCollected = loan.total_income_collected !== undefined ? loan.total_income_collected : (totalPaid - principalRecovered);
  const loanNumber = loan.loan_number || loan.loanNumber || '#001';
  const duration = loan.total_installments || loan.duration || 10;
  const frequency = loan.repayment_frequency || loan.type || 'WEEKLY';
  const status = loan.status || 'ACTIVE';
  const isCompleted = status === 'COMPLETED';
  const isOverdue = status === 'OVERDUE';
  const progressPercent = totalRepay > 0 ? Math.min(100, Math.round((totalPaid / totalRepay) * 100)) : 0;

  const installments = loan.installments || loan.schedule || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Header & Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={15} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={styles.backBtnText}>Back to Loans</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.auditShortcutBtn} 
          onPress={() => onOpenAudit && onOpenAudit(loanNumber)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="history" size={15} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={styles.auditShortcutText}>Central Audit</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Loan Header Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <View style={styles.loanBadgeRow}>
              <Text style={styles.loanNumber}>{loanNumber}</Text>
              {(loan.parent_loan_id || loan.parentLoanId) && (
                <View style={styles.repeatBadge}>
                  <Text style={styles.repeatText}>Repeat of #{loan.parent_loan_id || loan.parentLoanId}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => onNavigateToCustomer && onNavigateToCustomer(customer.id)}>
              <Text style={styles.customerName}>{customer.name || customer.full_name}</Text>
              <Text style={styles.customerPhone}>Phone: {customer.phone} • {customer.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : 'Regular'}</Text>
            </TouchableOpacity>
          </View>
          <Badge 
            label={status} 
            variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'primary'} 
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: isCompleted ? '#059669' : '#2563EB' }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressVal}>{progressPercent}% Recovered ({formatINR(totalPaid)})</Text>
            <Text style={styles.progressRem}>Outstanding: {formatINR(outstanding)}</Text>
          </View>
        </View>
      </View>

      {/* Financial Breakdown Grid */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>EXECUTIVE FINANCIAL METRICS</Text>
        <Text style={styles.sectionTitle}>Principal & Lending Income Breakdown</Text>

        <View style={styles.grid2x2}>
          <View style={styles.gridItem}>
            <Text style={styles.metricLabel}>Principal Disbursed</Text>
            <Text style={styles.metricValue}>{formatINR(principal)}</Text>
            <Text style={styles.metricNote}>From Central Fund Cash</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricLabel}>Lending Fee (Income)</Text>
            <Text style={[styles.metricValue, { color: '#059669' }]}>+{formatINR(contractedIncome)}</Text>
            <Text style={styles.metricNote}>{frequency === 'WEEKLY' ? '10% Fixed Fee' : '12.5% Shopkeeper'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricLabel}>Principal Recovered</Text>
            <Text style={[styles.metricValue, { color: '#2563EB' }]}>+{formatINR(principalRecovered)}</Text>
            <Text style={styles.metricNote}>Recycled into Pool</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricLabel}>Income Collected</Text>
            <Text style={[styles.metricValue, { color: '#7C3AED' }]}>+{formatINR(incomeCollected)}</Text>
            <Text style={styles.metricNote}>Net Gross Profit</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Total Repayable Contract:</Text>
          <Text style={styles.metaVal}>{formatINR(totalRepay)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Cycle & Tenor:</Text>
          <Text style={styles.metaVal}>{duration} {frequency === 'WEEKLY' ? 'Weeks' : 'Days'} ({frequency})</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Disbursement Date:</Text>
          <Text style={styles.metaVal}>{formatDate(loan.disbursement_date || '2026-07-20')}</Text>
        </View>
      </View>

      {/* Repayment Schedule & Installment Matrix */}
      <View style={styles.sectionCard}>
        <View style={styles.scheduleHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>INSTALLMENT MATRIX</Text>
            <Text style={styles.sectionTitle}>Amortization & Recovery Stream</Text>
          </View>
          <Text style={styles.tableCount}>{installments.length} Installments</Text>
        </View>

        {/* Matrix Header */}
        <View style={styles.matrixHeaderRow}>
          <Text style={[styles.mTh, { flex: 0.7 }]}>#</Text>
          <Text style={[styles.mTh, { flex: 1.8 }]}>Due Date</Text>
          <Text style={[styles.mTh, { flex: 1.5 }]}>Expected</Text>
          <Text style={[styles.mTh, { flex: 1.5 }]}>Paid</Text>
          <Text style={[styles.mTh, { flex: 1.5, textAlign: 'right' }]}>Status</Text>
        </View>

        {/* Matrix Rows */}
        {installments.length === 0 ? (
          <Text style={styles.emptyText}>No installment breakdown found for this loan record.</Text>
        ) : (
          installments.map((inst, index) => {
            const instNum = inst.installment_number || inst.installmentNumber || (index + 1);
            const dueDt = inst.due_date || inst.dueDate || '—';
            const expAmt = inst.expected_amount !== undefined ? inst.expected_amount : (inst.expectedAmount || 0);
            const pdAmt = inst.paid_amount !== undefined ? inst.paid_amount : (inst.paidAmount || 0);
            const instStatus = inst.status || (pdAmt >= expAmt ? 'PAID' : 'PENDING');
            const isInstPaid = instStatus === 'PAID';
            const isInstOverdue = instStatus === 'OVERDUE';

            return (
              <View 
                key={inst.id || index} 
                style={[
                  styles.matrixRow,
                  isInstPaid && styles.matrixRowPaid,
                  isInstOverdue && styles.matrixRowOverdue,
                ]}
              >
                <Text style={[styles.mTd, { flex: 0.7, fontWeight: '800', color: '#0F172A' }]}>
                  {instNum}
                </Text>
                <Text style={[styles.mTd, { flex: 1.8, color: '#64748B' }]}>
                  {formatDate(dueDt)}
                </Text>
                <Text style={[styles.mTd, { flex: 1.5, fontWeight: '700', color: '#0F172A' }]}>
                  {formatINR(expAmt)}
                </Text>
                <Text style={[styles.mTd, { flex: 1.5, color: isInstPaid ? '#059669' : '#64748B', fontWeight: isInstPaid ? '700' : '400' }]}>
                  {formatINR(pdAmt)}
                </Text>
                <View style={[styles.mTd, { flex: 1.5, alignItems: 'flex-end' }]}>
                  <Badge 
                    label={instStatus} 
                    variant={isInstPaid ? 'success' : isInstOverdue ? 'danger' : 'neutral'} 
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Executive Governance Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>EXECUTIVE CONTROLS</Text>
        <Text style={styles.sectionTitle}>Super Admin Operations</Text>

        <View style={styles.actionsList}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowRestructureModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconBox}>
              <MaterialCommunityIcons name="calendar-refresh-outline" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionBtnTitle}>Restructure Loan Tenor</Text>
              <Text style={styles.actionBtnDesc}>Extend tenor or split pending dues into smaller installments</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSettlementModal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <MaterialCommunityIcons name="check-all" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionBtnTitle}>Early Settlement & Closure</Text>
              <Text style={styles.actionBtnDesc}>Grant settlement waiver, return principal, and close portfolio</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowEditLoanModal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }]}>
              <MaterialCommunityIcons name="pencil" size={18} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionBtnTitle}>Edit Loan Terms</Text>
              <Text style={styles.actionBtnDesc}>Modify principal, interest rate, tenure or repayment mode</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowDeleteLoanModal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#BE123C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionBtnTitle, { color: '#BE123C' }]}>Delete Loan Record</Text>
              <Text style={styles.actionBtnDesc}>Permanently remove loan and all ledger schedules</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Modals */}
      <RestructureLoanModal
        visible={showRestructureModal}
        loan={loan}
        onClose={() => setShowRestructureModal(false)}
        onRestructure={() => {}}
      />

      <EarlySettlementModal
        visible={showSettlementModal}
        loan={loan}
        onClose={() => setShowSettlementModal(false)}
        onSettleLoan={(data) => {
          collectPayment({
            loanId: loan.id,
            amount: data.settlementAmount,
            paymentMethod: data.paymentMode,
          });
        }}
      />

      {loan && (
        <EditLoanModal
          visible={showEditLoanModal}
          onClose={() => setShowEditLoanModal(false)}
          loan={loan}
          customer={customer}
          onSuccess={() => {
            if (onBack) onBack();
          }}
        />
      )}

      {loan && (
        <DeleteLoanModal
          visible={showDeleteLoanModal}
          onClose={() => setShowDeleteLoanModal(false)}
          loan={loan}
          customer={customer}
          onSuccess={() => {
            if (onBack) onBack();
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 70,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
  },
  auditShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Colors.purpleTintLightest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  auditShortcutText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
  },
  heroCard: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  loanNumber: {
    fontSize: 20,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.primary,
  },
  repeatBadge: {
    backgroundColor: Colors.purpleTintLightest,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repeatText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: Fonts.gilroy.bold,
  },
  customerName: {
    fontSize: 17,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    marginTop: 3,
  },
  progressBlock: {
    marginTop: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressVal: {
    fontSize: 11,
    color: '#059669',
    fontFamily: Fonts.gilroy.bold,
  },
  progressRem: {
    fontSize: 11,
    color: '#D97706',
    fontFamily: Fonts.gilroy.bold,
  },
  sectionCard: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.primary,
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 14,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  metricNote: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  metaVal: {
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tableCount: {
    fontSize: 11,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textSecondary,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray400,
    marginTop: 8,
  },
  mTh: {
    fontSize: 11,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray400,
  },
  matrixRowPaid: {
    backgroundColor: '#F0FDF4',
  },
  matrixRowOverdue: {
    backgroundColor: '#FEF2F2',
  },
  mTd: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    paddingVertical: 16,
    textAlign: 'center',
  },
  actionsList: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
    gap: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.purpleTintLightest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  actionBtnTitle: {
    fontSize: 13,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
  },
  actionBtnDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    marginTop: 2,
  },
});

export default SuperAdminLoanDetail;
