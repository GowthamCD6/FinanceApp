import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Modal 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Loan, LoanStatus } from '../types';
import { formatINR, formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DisburseLoanModal } from '../components/modals/DisburseLoanModal';
import { FadeInView } from '../animations/FadeInView';

export const LoansScreen: React.FC = () => {
  const { loans } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'COMPLETED'>('ACTIVE');
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>();
  const [showDisburseModal, setShowDisburseModal] = useState<boolean>(false);

  const filteredLoans = loans.filter((l) => {
    if (filter === 'ACTIVE') return ['ACTIVE', 'PARTIALLY_PAID', 'DISBURSED'].includes(l.status);
    if (filter === 'OVERDUE') return l.status === 'OVERDUE';
    if (filter === 'COMPLETED') return l.status === 'COMPLETED';
    return true;
  });

  const getStatusBadgeVariant = (status: LoanStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'PARTIALLY_PAID':
        return 'primary';
      case 'OVERDUE':
      case 'DEFAULTED':
        return 'danger';
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      case 'APPROVED':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.filterRow}>
          {(['ACTIVE', 'OVERDUE', 'COMPLETED', 'ALL'] as const).map((f) => {
            const isSelected = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, isSelected && styles.selectedFilterText]}>
                  {f === 'ACTIVE' ? '🟢 Active' : f === 'OVERDUE' ? '⚠️ Overdue' : f === 'COMPLETED' ? '✓ Settled' : 'All'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="New Loan"
          variant="primary"
          size="sm"
          icon="➕"
          onPress={() => setShowDisburseModal(true)}
        />
      </View>

      {/* Loans List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredLoans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Loans in this Category</Text>
            <Text style={styles.emptySub}>Select another filter or issue a new loan.</Text>
          </View>
        ) : (
          filteredLoans.map((loan, idx) => {
            const progress = loan.total_repayment_amount > 0 
              ? Math.min(100, Math.round((loan.total_paid / loan.total_repayment_amount) * 100))
              : 0;

            return (
              <FadeInView key={loan.id} delay={idx * 50}>
                <TouchableOpacity
                  style={styles.loanCard}
                  onPress={() => setSelectedLoan(loan)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.loanNum}>{loan.loan_number}</Text>
                      <Text style={styles.custName}>{loan.customer_name}</Text>
                      {loan.shop_name && <Text style={styles.shopName}>🏪 {loan.shop_name}</Text>}
                    </View>
                    <Badge label={loan.status} variant={getStatusBadgeVariant(loan.status)} size="sm" />
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Principal Disbursed</Text>
                      <Text style={styles.principalVal}>{formatINR(loan.principal_amount)}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Lending Income</Text>
                      <Text style={styles.incomeVal}>+{formatINR(loan.contracted_income_amount)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.detailLabel}>Balance Due</Text>
                      <Text style={styles.balanceVal}>{formatINR(loan.outstanding_amount)}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressText}>{progress}% Repaid ({formatINR(loan.total_paid)})</Text>
                      <Text style={styles.progressText}>
                        {loan.repayment_frequency} • {loan.total_installments} Installments
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.tapToView}>Tap to view schedule & payments ➔</Text>
                  </View>
                </TouchableOpacity>
              </FadeInView>
            );
          })
        )}
      </ScrollView>

      {/* Loan Schedule Detail Modal */}
      {selectedLoan && (
        <Modal visible={!!selectedLoan} transparent animationType="slide" onRequestClose={() => setSelectedLoan(undefined)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Amortization Schedule</Text>
                  <Text style={styles.modalSub}>{selectedLoan.loan_number} • {selectedLoan.customer_name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedLoan(undefined)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Loan Meta Stats */}
              <View style={styles.scheduleMeta}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Principal</Text>
                  <Text style={styles.metaVal}>{formatINR(selectedLoan.principal_amount)}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Recovered</Text>
                  <Text style={[styles.metaVal, { color: colors.successText }]}>
                    {formatINR(selectedLoan.total_principal_recovered)}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Income Earned</Text>
                  <Text style={[styles.metaVal, { color: colors.secondaryDark }]}>
                    {formatINR(selectedLoan.total_income_collected)}
                  </Text>
                </View>
              </View>

              {/* Installments Table */}
              <ScrollView style={styles.instList} showsVerticalScrollIndicator={false}>
                {selectedLoan.installments.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  const isOverdue = inst.status === 'OVERDUE';
                  return (
                    <View
                      key={inst.id}
                      style={[
                        styles.instItem,
                        isPaid && styles.paidInstItem,
                        isOverdue && styles.overdueInstItem,
                      ]}
                    >
                      <View style={styles.instLeft}>
                        <Text style={styles.instNum}>#{inst.installment_number}</Text>
                        <View>
                          <Text style={styles.instDue}>Due: {formatDate(inst.due_date)}</Text>
                          <Text style={styles.instComponents}>
                            Principal: {formatINR(inst.principal_component)} • Income: {formatINR(inst.income_component)}
                          </Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.instAmt, isPaid && styles.paidInstAmt]}>
                          {formatINR(inst.scheduled_amount)}
                        </Text>
                        <Badge
                          label={inst.status}
                          variant={isPaid ? 'success' : isOverdue ? 'danger' : 'neutral'}
                          size="sm"
                        />
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <Button
                title="Close Schedule"
                variant="outline"
                onPress={() => setSelectedLoan(undefined)}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Disburse Modal */}
      <DisburseLoanModal
        visible={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        onSuccess={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  selectedFilterChip: {
    backgroundColor: colors.primaryDark,
  },
  filterText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#475569',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  loanNum: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  custName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
    marginTop: 2,
  },
  shopName: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  principalVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginTop: 2,
  },
  incomeVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
    marginTop: 2,
  },
  balanceVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
  },
  cardFooter: {
    marginTop: spacing.xs,
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  tapToView: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  emptySub: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  modalClose: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  scheduleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: spacing.md,
  },
  metaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: typography.weights.medium,
  },
  metaVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
    marginTop: 2,
  },
  instList: {
    maxHeight: 320,
  },
  instItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paidInstItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  overdueInstItem: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  instLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instNum: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#64748B',
    width: 28,
  },
  instDue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#1E293B',
  },
  instComponents: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  instAmt: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy,
    color: '#0F172A',
    marginBottom: 2,
  },
  paidInstAmt: {
    color: colors.successText,
    textDecorationLine: 'line-through',
  },
});
