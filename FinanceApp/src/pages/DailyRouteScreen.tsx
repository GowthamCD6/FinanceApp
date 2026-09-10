import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, Linking 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Loan, LoanInstallment, Payment, CustomerType } from '../types';
import { formatINR, isToday, isPastDate, formatRelativeDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { QuickCollectModal } from '../components/modals/QuickCollectModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { FadeInView } from '../animations/FadeInView';

export const DailyRouteScreen: React.FC = () => {
  const { loans, metrics } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'SHOPKEEPER' | 'COMMON'>('DUE_TODAY');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeCollectLoan, setActiveCollectLoan] = useState<Loan | undefined>();
  const [activeCollectInst, setActiveCollectInst] = useState<LoanInstallment | undefined>();
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [lastPayment, setLastPayment] = useState<Payment | undefined>();

  // Extract all pending and overdue installments across loans
  interface RouteItem {
    loan: Loan;
    installment: LoanInstallment;
    isOverdue: boolean;
    isDueToday: boolean;
  }

  const routeItems: RouteItem[] = [];

  loans.forEach((loan) => {
    loan.installments.forEach((inst) => {
      if (['PENDING', 'PARTIAL', 'OVERDUE'].includes(inst.status)) {
        const isDueToday = isToday(inst.due_date);
        const isOverdue = isPastDate(inst.due_date) || inst.status === 'OVERDUE';
        routeItems.push({
          loan,
          installment: inst,
          isOverdue,
          isDueToday,
        });
      }
    });
  });

  // Apply filters
  const filteredItems = routeItems.filter((item) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.loan.customer_name.toLowerCase().includes(q);
      const matchShop = item.loan.shop_name?.toLowerCase().includes(q);
      const matchPhone = item.loan.customer_phone.includes(q);
      const matchLoan = item.loan.loan_number.toLowerCase().includes(q);
      if (!matchName && !matchShop && !matchPhone && !matchLoan) return false;
    }

    if (filterType === 'DUE_TODAY') return item.isDueToday;
    if (filterType === 'OVERDUE') return item.isOverdue;
    if (filterType === 'SHOPKEEPER') return item.loan.customer_type === 'SHOPKEEPER';
    if (filterType === 'COMMON') return item.loan.customer_type === 'COMMON_CUSTOMER';
    return true;
  });

  const totalTarget = routeItems
    .filter((i) => i.isDueToday || i.isOverdue)
    .reduce((sum, i) => sum + i.installment.outstanding_amount, 0);

  const handleOpenCollect = (loan: Loan, installment: LoanInstallment) => {
    setActiveCollectLoan(loan);
    setActiveCollectInst(installment);
  };

  const handleCollectionSuccess = (payment: Payment) => {
    setActiveCollectLoan(undefined);
    setActiveCollectInst(undefined);
    setLastPayment(payment);
    setShowReceipt(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Unable to place direct call to ${phone}`);
    });
  };

  const handleLogVisitNote = (loan: Loan) => {
    Alert.prompt
      ? Alert.prompt(
          'Log Field Visit Note',
          `Record reason or note for ${loan.customer_name}:`,
          (note) => {
            if (note) Alert.alert('Visit Logged', `Field note saved: "${note}"`);
          }
        )
      : Alert.alert('Log Field Visit', `Field visit recorded for ${loan.customer_name}. Customer notified.`);
  };

  return (
    <View style={styles.container}>
      {/* Route Header Metrics */}
      <View style={styles.routeHeader}>
        <View style={styles.headerStatsRow}>
          <View>
            <Text style={styles.statLabel}>TODAY'S COLLECTION ROUTE</Text>
            <Text style={styles.statMain}>{formatINR(totalTarget)}</Text>
            <Text style={styles.statSub}>Total Target Due in Field</Text>
          </View>
          <View style={styles.collectedBox}>
            <Text style={styles.collectedLabel}>Collected Today</Text>
            <Text style={styles.collectedVal}>{formatINR(metrics.todayCollection)}</Text>
            <Text style={styles.collectedSub}>+{formatINR(metrics.todayLendingIncome)} income</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shop, client name or phone..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { key: 'DUE_TODAY', label: "Due Today" },
            { key: 'OVERDUE', label: "⚠️ Overdue" },
            { key: 'SHOPKEEPER', label: "🏪 Daily Shops" },
            { key: 'COMMON', label: "👤 Weekly Common" },
            { key: 'ALL', label: "All Scheduled" },
          ].map((f) => {
            const isSelected = filterType === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                onPress={() => setFilterType(f.key as any)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.selectedFilterText]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Route Installment List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              No pending collections found for this filter.
            </Text>
          </View>
        ) : (
          filteredItems.map((item, idx) => {
            const { loan, installment, isOverdue, isDueToday } = item;
            return (
              <FadeInView key={`${loan.id}-${installment.id}`} delay={idx * 60}>
                <View
                  style={[
                    styles.routeCard,
                    isOverdue && styles.overdueCard,
                    isDueToday && styles.dueTodayCard,
                  ]}
                >
                  {/* Top Line */}
                  <View style={styles.cardHeader}>
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>{loan.customer_name}</Text>
                      {loan.shop_name ? (
                        <Text style={styles.shopName}>🏪 {loan.shop_name}</Text>
                      ) : (
                        <Text style={styles.shopName}>👤 Common Resident</Text>
                      )}
                    </View>

                    <Badge
                      label={
                        isOverdue
                          ? `${formatRelativeDate(installment.due_date)}`
                          : isDueToday
                          ? 'Due Today'
                          : installment.due_date
                      }
                      variant={isOverdue ? 'danger' : isDueToday ? 'warning' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  {/* Installment Details */}
                  <View style={styles.detailRow}>
                    <View>
                      <Text style={styles.instLabel}>
                        {loan.repayment_frequency} Installment #{installment.installment_number} of {loan.total_installments}
                      </Text>
                      <Text style={styles.loanNumber}>{loan.loan_number}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.amountDue}>
                        {formatINR(installment.outstanding_amount)}
                      </Text>
                      <Text style={styles.splitSub}>
                        Principal: {formatINR(installment.principal_component)} • Income: {formatINR(installment.income_component)}
                      </Text>
                    </View>
                  </View>

                  {/* Quick Action Footer */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleCall(loan.customer_phone)}
                    >
                      <Text style={styles.iconBtnText}>📞 Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleLogVisitNote(loan)}
                    >
                      <Text style={styles.iconBtnText}>📝 Log Note</Text>
                    </TouchableOpacity>

                    <Button
                      title="Collect Now"
                      variant="primary"
                      size="sm"
                      icon="⚡"
                      onPress={() => handleOpenCollect(loan, installment)}
                      style={styles.collectBtn}
                    />
                  </View>
                </View>
              </FadeInView>
            );
          })
        )}
      </ScrollView>

      {/* Collection Modal */}
      <QuickCollectModal
        visible={!!activeCollectLoan}
        loan={activeCollectLoan}
        installment={activeCollectInst}
        onClose={() => setActiveCollectLoan(undefined)}
        onSuccess={handleCollectionSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={showReceipt}
        payment={lastPayment}
        onClose={() => setShowReceipt(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  routeHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statMain: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
  },
  statSub: {
    fontSize: typography.sizes.xs,
    color: '#94A3B8',
  },
  collectedBox: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'flex-end',
  },
  collectedLabel: {
    fontSize: 9,
    color: colors.successText,
    fontWeight: typography.weights.semibold,
  },
  collectedVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.success,
  },
  collectedSub: {
    fontSize: 9,
    color: colors.successText,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 38,
    marginVertical: spacing.xs,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  selectedFilterChip: {
    backgroundColor: colors.primaryDark,
  },
  filterChipText: {
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
  routeCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    backgroundColor: '#FFFBFB',
  },
  dueTodayCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  shopName: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  instLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  loanNumber: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountDue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
    color: '#0F172A',
  },
  splitSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: 8,
  },
  iconBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  iconBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: typography.weights.medium,
  },
  collectBtn: {
    flex: 1,
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
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 4,
  },
});
