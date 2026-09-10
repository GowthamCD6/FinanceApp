import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { FadeInView } from '../animations/FadeInView';

export const ReportsScreen: React.FC = () => {
  const { metrics, fundTransactions, expenses, loans } = useApp();

  const [activeReport, setActiveReport] = useState<'CASH_FLOW' | 'PROFIT' | 'OVERDUE'>('CASH_FLOW');

  // Compute Cash Flow breakdown
  const capitalIn = fundTransactions
    .filter((t) => t.transaction_type === 'CAPITAL_IN')
    .reduce((s, t) => s + t.amount, 0);

  const principalCollected = fundTransactions
    .filter((t) => t.transaction_type === 'PRINCIPAL_COLLECTION')
    .reduce((s, t) => s + t.amount, 0);

  const lendingIncome = fundTransactions
    .filter((t) => t.transaction_type === 'LENDING_INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const disbursements = fundTransactions
    .filter((t) => t.transaction_type === 'LOAN_DISBURSEMENT')
    .reduce((s, t) => s + t.amount, 0);

  const totalInflows = capitalIn + principalCollected + lendingIncome;
  const totalOutflows = disbursements + metrics.monthlyExpenses;

  // Overdue buckets
  const overdueLoans = loans.filter((l) => l.status === 'OVERDUE');
  const overdueTotal = overdueLoans.reduce((sum, l) => sum + l.outstanding_amount, 0);

  return (
    <View style={styles.container}>
      {/* Report Switcher Header */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {[
            { key: 'CASH_FLOW', label: '💵 Cash Flow Statement' },
            { key: 'PROFIT', label: '📊 Income & Net Profit' },
            { key: 'OVERDUE', label: '⚠️ Overdue Aging' },
          ].map((r) => {
            const isSelected = activeReport === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[styles.reportChip, isSelected && styles.selectedReportChip]}
                onPress={() => setActiveReport(r.key as any)}
              >
                <Text style={[styles.reportChipText, isSelected && styles.selectedReportText]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Cash Flow Statement */}
        {activeReport === 'CASH_FLOW' && (
          <FadeInView delay={100}>
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Cash Flow Statement</Text>
              <Text style={styles.reportSub}>Current Period • Fund Circulation Movement</Text>

              {/* Inflows Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderIn}>🟢 Cash Inflows (Reinvested & Received)</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Principal Recycled to Cash Pool</Text>
                  <Text style={styles.valIn}>+{formatINR(principalCollected)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Lending Contract Revenue</Text>
                  <Text style={styles.valIn}>+{formatINR(lendingIncome)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>New Capital Injections</Text>
                  <Text style={styles.valIn}>+{formatINR(capitalIn)}</Text>
                </View>
                <View style={[styles.row, styles.subtotalRow]}>
                  <Text style={styles.subtotalLabel}>Total Cash Inflows</Text>
                  <Text style={styles.subtotalValIn}>+{formatINR(totalInflows)}</Text>
                </View>
              </View>

              {/* Outflows Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderOut}>🔴 Cash Outflows (Disbursements & Expenses)</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>New Loans Disbursed</Text>
                  <Text style={styles.valOut}>−{formatINR(disbursements)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Operating Expenses Logged</Text>
                  <Text style={styles.valOut}>−{formatINR(metrics.monthlyExpenses)}</Text>
                </View>
                <View style={[styles.row, styles.subtotalRow]}>
                  <Text style={styles.subtotalLabel}>Total Cash Outflows</Text>
                  <Text style={styles.subtotalValOut}>−{formatINR(totalOutflows)}</Text>
                </View>
              </View>

              {/* Net Cash Position */}
              <View style={styles.netClosingCard}>
                <View>
                  <Text style={styles.closingLabel}>AVAILABLE CASH IN SYSTEM</Text>
                  <Text style={styles.closingSub}>Physical Cash + Bank + UPI</Text>
                </View>
                <Text style={styles.closingVal}>{formatINR(metrics.availableCash)}</Text>
              </View>
            </View>
          </FadeInView>
        )}

        {/* 2. Profit & Loss Statement */}
        {activeReport === 'PROFIT' && (
          <FadeInView delay={100}>
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Income & Net Profit</Text>
              <Text style={styles.reportSub}>Operational Margin & Lending Yield</Text>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderIn}>📈 Lending Revenue</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Daily Shopkeeper Loan Fees</Text>
                  <Text style={styles.valIn}>{formatINR(metrics.monthlyIncome * 0.55)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Weekly Common Loan Interest</Text>
                  <Text style={styles.valIn}>{formatINR(metrics.monthlyIncome * 0.45)}</Text>
                </View>
                <View style={[styles.row, styles.subtotalRow]}>
                  <Text style={styles.subtotalLabel}>Gross Lending Income</Text>
                  <Text style={styles.subtotalValIn}>{formatINR(metrics.monthlyIncome)}</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderOut}>📉 Operational Overhead</Text>
                {expenses.map((e) => (
                  <View key={e.id} style={styles.row}>
                    <Text style={styles.label}>{e.category_name.replace('_', ' ')}</Text>
                    <Text style={styles.valOut}>−{formatINR(e.amount)}</Text>
                  </View>
                ))}
                <View style={[styles.row, styles.subtotalRow]}>
                  <Text style={styles.subtotalLabel}>Total Operating Costs</Text>
                  <Text style={styles.subtotalValOut}>−{formatINR(metrics.monthlyExpenses)}</Text>
                </View>
              </View>

              {/* Net Bottom Line */}
              <View style={[styles.netProfitCard, metrics.netProfit >= 0 ? styles.profitCardGood : styles.profitCardBad]}>
                <View>
                  <Text style={styles.profitLabel}>NET OPERATING PROFIT</Text>
                  <Text style={styles.profitSub}>Lending Income − Operating Expenses</Text>
                </View>
                <Text
                  style={[
                    styles.profitVal,
                    { color: metrics.netProfit >= 0 ? colors.successText : colors.dangerText },
                  ]}
                >
                  {formatINR(metrics.netProfit)}
                </Text>
              </View>
            </View>
          </FadeInView>
        )}

        {/* 3. Overdue Aging Analysis */}
        {activeReport === 'OVERDUE' && (
          <FadeInView delay={100}>
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Delinquency & Overdue Aging</Text>
              <Text style={styles.reportSub}>Portfolio at Risk & Overdue Tracking</Text>

              <View style={styles.overdueTotalBanner}>
                <Text style={styles.overdueTotalLabel}>TOTAL ARREARS AT RISK</Text>
                <Text style={styles.overdueTotalAmount}>{formatINR(overdueTotal)}</Text>
                <Text style={styles.overdueTotalSub}>{overdueLoans.length} Loans Past Due Date</Text>
              </View>

              <Text style={styles.bucketHeading}>Delinquent Loan Accounts</Text>
              {overdueLoans.length === 0 ? (
                <View style={styles.emptyOverdue}>
                  <Text style={styles.emptyOverdueText}>✓ Zero Overdue Loans! Perfect portfolio health.</Text>
                </View>
              ) : (
                overdueLoans.map((loan) => (
                  <View key={loan.id} style={styles.overdueItem}>
                    <View style={styles.overdueTop}>
                      <View>
                        <Text style={styles.overdueName}>{loan.customer_name}</Text>
                        <Text style={styles.overduePhone}>📞 {loan.customer_phone}</Text>
                      </View>
                      <Badge label="OVERDUE" variant="danger" size="sm" />
                    </View>

                    <View style={styles.overdueRow}>
                      <Text style={styles.overdueLabel}>Loan #{loan.loan_number}</Text>
                      <Text style={styles.overdueAmount}>{formatINR(loan.outstanding_amount)} Due</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  reportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  selectedReportChip: {
    backgroundColor: colors.primaryDark,
  },
  reportChipText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#475569',
  },
  selectedReportText: {
    color: '#FFFFFF',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  reportSub: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginBottom: spacing.md,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderIn: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#065F46',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionHeaderOut: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#991B1B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: '#475569',
  },
  valIn: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.successText,
  },
  valOut: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.dangerText,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    marginTop: 4,
  },
  subtotalLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  subtotalValIn: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy,
    color: colors.successText,
  },
  subtotalValOut: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy,
    color: colors.dangerText,
  },
  netClosingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  closingLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  closingSub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  closingVal: {
    fontSize: 22,
    fontWeight: typography.weights.heavy,
    color: '#FFFFFF',
  },
  netProfitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 2,
  },
  profitCardGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  profitCardBad: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  profitLabel: {
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  profitSub: {
    fontSize: 9,
    color: '#64748B',
  },
  profitVal: {
    fontSize: 22,
    fontWeight: typography.weights.heavy,
  },
  overdueTotalBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  overdueTotalLabel: {
    fontSize: 10,
    color: '#991B1B',
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  overdueTotalAmount: {
    fontSize: 28,
    fontWeight: typography.weights.heavy,
    color: colors.dangerText,
    marginVertical: 2,
  },
  overdueTotalSub: {
    fontSize: typography.sizes.xs,
    color: '#B91C1C',
  },
  bucketHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginBottom: spacing.sm,
  },
  emptyOverdue: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.md,
  },
  emptyOverdueText: {
    color: colors.successText,
    fontWeight: typography.weights.semibold,
    fontSize: 12,
  },
  overdueItem: {
    backgroundColor: '#FFFBFB',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  overdueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  overdueName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  overduePhone: {
    fontSize: 10,
    color: '#64748B',
  },
  overdueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overdueLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  overdueAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.heavy,
    color: colors.dangerText,
  },
});
