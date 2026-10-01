import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Colors, Fonts } from '../../theme';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: Colors.purpleTintLightest, border: Colors.purpleBorderLight, text: Colors.primary },
    success: { bg: Colors.successBg, border: '#A7F3D0', text: Colors.success },
    warning: { bg: Colors.amberBg, border: '#FDE68A', text: Colors.amberDark },
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

export const SuperAdminReports = () => {
  const { fundMetrics, loans, expenses, customers } = useApp();
  const [activeReport, setActiveReport] = useState('CIRCULATION');

  const reportTabs = [
    { key: 'CIRCULATION', label: 'Circulation Flow' },
    { key: 'COLLECTIONS', label: 'Collections' },
    { key: 'OUTSTANDING', label: 'Outstanding Dues' },
    { key: 'LOANS', label: 'Portfolio Mix' },
    { key: 'PROFIT', label: 'P&L Statement' },
    { key: 'CASH_FLOW', label: 'Cash Velocity' },
  ];

  return (
    <View style={styles.container}>
      {/* Report Selector Header */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {reportTabs.map((t) => {
            const active = activeReport === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveReport(t.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. FUND CIRCULATION REPORT */}
        {activeReport === 'CIRCULATION' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>FUND RE-CIRCULATION</Text>
            <Text style={styles.reportTitle}>Continuous Capital Velocity</Text>
            <Text style={styles.reportSub}>Continuous capital recycling into subsequent loans</Text>

            <View style={styles.flowChain}>
              <View style={styles.flowStep}>
                <Text style={styles.stepTitle}>1. Initial Equity Capital Pool</Text>
                <Text style={styles.stepAmount}>+₹10,00,000</Text>
                <Text style={styles.stepDesc}>Injected into Central Fund Cash Pool</Text>
              </View>

              <MaterialCommunityIcons name="arrow-down" size={18} color="#94A3B8" />

              <View style={styles.flowStep}>
                <Text style={styles.stepTitle}>2. Borrower Loans Disbursed</Text>
                <Text style={[styles.stepAmount, { color: Colors.primary }]}>−₹7,60,000 Active Principal</Text>
                <Text style={styles.stepDesc}>Earning 10% (Weekly) & 12.5% (Daily)</Text>
              </View>

              <MaterialCommunityIcons name="arrow-down" size={18} color="#94A3B8" />

              <View style={styles.flowStep}>
                <Text style={styles.stepTitle}>3. Installment Recoveries Recycled</Text>
                <Text style={[styles.stepAmount, { color: '#059669' }]}>+₹5,20,000 Recovered</Text>
                <Text style={styles.stepDesc}>Principal ₹4,72,000 (Recycled) + Fee Income ₹48,000</Text>
              </View>

              <MaterialCommunityIcons name="arrow-down" size={18} color="#94A3B8" />

              <View style={styles.flowStep}>
                <Text style={styles.stepTitle}>4. Central Fund Pool Recharged</Text>
                <Text style={[styles.stepAmount, { color: '#D97706' }]}>₹2,40,000 Available Cash</Text>
                <Text style={styles.stepDesc}>Ready for immediate new loan originations</Text>
              </View>
            </View>
          </View>
        )}

        {/* 2. COLLECTION REPORT */}
        {activeReport === 'COLLECTIONS' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>COLLECTION PERFORMANCE</Text>
            <Text style={styles.reportTitle}>Field Collections & Target Ratios</Text>
            <Text style={styles.reportSub}>Daily and monthly recovery efficiency</Text>

            <View style={styles.summaryTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Today's Field Collection</Text>
                <Text style={[styles.tVal, { color: '#059669' }]}>{formatINR(fundMetrics.todayCollection)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Today's Scheduled Target</Text>
                <Text style={styles.tVal}>{formatINR(fundMetrics.todayExpected)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Pending Collection Remaining</Text>
                <Text style={[styles.tVal, { color: '#DC2626' }]}>{formatINR(fundMetrics.pendingCollection)}</Text>
              </View>
              <View style={[styles.tableRow, styles.subtotal]}>
                <Text style={styles.subLabel}>This Month's Total Inflow</Text>
                <Text style={styles.subVal}>{formatINR(fundMetrics.thisMonthCollection)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 3. OUTSTANDING REPORT */}
        {activeReport === 'OUTSTANDING' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>PORTFOLIO AT RISK (PAR)</Text>
            <Text style={styles.reportTitle}>Outstanding Balances by Borrower</Text>
            <Text style={styles.reportSub}>Active balances awaiting collection</Text>

            {loans.filter((l) => (l.outstanding_amount || l.remainingAmount || 0) > 0).map((l, idx) => (
              <View key={l.id || idx} style={styles.outItem}>
                <View style={styles.outHeader}>
                  <Text style={styles.outCust}>{l.customer_name || l.customerName} ({l.loan_number || l.loanNumber})</Text>
                  <Badge label={l.status} variant={l.status === 'OVERDUE' ? 'danger' : 'primary'} />
                </View>
                <View style={styles.outNums}>
                  <Text style={styles.outNumText}>Contract: {formatINR(l.total_repayment_amount || l.totalRepayment)}</Text>
                  <Text style={styles.outNumText}>Paid: {formatINR(l.total_paid || l.paidAmount || 0)}</Text>
                  <Text style={[styles.outNumText, { color: '#D97706', fontWeight: '800' }]}>
                    Due: {formatINR(l.outstanding_amount || l.remainingAmount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 4. LOAN REPORT */}
        {activeReport === 'LOANS' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>PORTFOLIO COMPOSITION</Text>
            <Text style={styles.reportTitle}>Loan Status Distribution</Text>
            <Text style={styles.reportSub}>Overall portfolio distribution across tenors</Text>

            <View style={styles.summaryTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Active Running Loans</Text>
                <Text style={[styles.tVal, { color: Colors.primary }]}>{fundMetrics.activeLoans}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Completed / Settled Loans</Text>
                <Text style={[styles.tVal, { color: '#059669' }]}>{fundMetrics.completedLoans}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Overdue Delinquent Loans</Text>
                <Text style={[styles.tVal, { color: '#DC2626' }]}>{fundMetrics.overdueLoans}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Today's New Loans Disbursed</Text>
                <Text style={styles.tVal}>{fundMetrics.todayNewLoans}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 5. PROFIT REPORT */}
        {activeReport === 'PROFIT' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>FINANCIAL P&L</Text>
            <Text style={styles.reportTitle}>Profit & Loss Statement</Text>
            <Text style={styles.reportSub}>Lending Fee Revenue − Operating Expenses</Text>

            <View style={styles.summaryTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Lending Fee Contract Revenue</Text>
                <Text style={[styles.tVal, { color: '#059669' }]}>+{formatINR(fundMetrics.thisMonthIncome)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Operational Field Expenses</Text>
                <Text style={[styles.tVal, { color: '#DC2626' }]}>−{formatINR(fundMetrics.thisMonthExpenses)}</Text>
              </View>
              <View style={[styles.tableRow, styles.profitHighlight]}>
                <Text style={styles.profitHighlightLabel}>Net Operating Profit</Text>
                <Text style={styles.profitHighlightVal}>+{formatINR(fundMetrics.netProfit)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 6. CASH FLOW */}
        {activeReport === 'CASH_FLOW' && (
          <View style={styles.card}>
            <Text style={styles.reportEyebrow}>CASH VELOCITY</Text>
            <Text style={styles.reportTitle}>Monthly Cash Flow Statement</Text>
            <Text style={styles.reportSub}>Opening Cash + Inflows − Outflows = Closing Cash</Text>

            <View style={styles.summaryTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>Opening Cash Float</Text>
                <Text style={styles.tVal}>₹1,80,000</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>+ Principal Recoveries Recycled</Text>
                <Text style={[styles.tVal, { color: '#059669' }]}>+₹5,20,000</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>+ Lending Income</Text>
                <Text style={[styles.tVal, { color: '#059669' }]}>+₹85,000</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>− Loan Disbursements</Text>
                <Text style={[styles.tVal, { color: '#DC2626' }]}>−₹5,25,000</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tLabel}>− Operating Expenses</Text>
                <Text style={[styles.tVal, { color: '#DC2626' }]}>−₹20,000</Text>
              </View>
              <View style={[styles.tableRow, styles.profitHighlight]}>
                <Text style={styles.profitHighlightLabel}>Closing Available Cash</Text>
                <Text style={styles.profitHighlightVal}>{formatINR(fundMetrics.availableCash)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { backgroundColor: Colors.background, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.lightGray400 },
  chipsScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.backgroundContainer,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  chipActive: {
    backgroundColor: Colors.purpleTintLightest,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.gray200,
    fontFamily: Fonts.gilroy.bold,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  card: {
    backgroundColor: '#FFFFFF', // Pure White card as requested
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Box side line width and darkness from reference
  },
  reportEyebrow: {
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.1,
    fontFamily: Fonts.gilroy.bold,
  },
  reportTitle: {
    fontSize: 18,
    color: '#1E1B4B', // Sleek deep title color from reference
    marginTop: 2,
    fontFamily: Fonts.gilroy.bold,
  },
  reportSub: {
    fontSize: 12,
    color: '#64748B', // From reference
    marginBottom: 16,
    fontFamily: Fonts.gilroy.medium,
  },
  flowChain: { gap: 10, alignItems: 'center' },
  flowStep: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.gilroy.bold,
  },
  stepAmount: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 2,
    fontFamily: Fonts.gilroy.bold,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.gilroy.medium,
  },
  summaryTable: { gap: 6 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray400,
  },
  tLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  tVal: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.gilroy.bold,
  },
  subtotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
    paddingTop: 10,
    marginTop: 4,
  },
  subLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.gilroy.bold,
  },
  subVal: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Fonts.gilroy.bold,
  },
  profitHighlight: {
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  profitHighlightLabel: {
    fontSize: 13,
    color: '#059669',
    fontFamily: Fonts.gilroy.bold,
  },
  profitHighlightVal: {
    fontSize: 16,
    color: '#059669',
    fontFamily: Fonts.gilroy.bold,
  },
  outItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  outCust: {
    fontSize: 14,
    color: '#1E1B4B', // Sleek deep title color from reference
    fontFamily: Fonts.gilroy.bold,
  },
  outNums: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  outNumText: {
    fontSize: 12,
    color: '#64748B', // From reference
    fontFamily: Fonts.gilroy.medium,
  },
});

export default SuperAdminReports;
