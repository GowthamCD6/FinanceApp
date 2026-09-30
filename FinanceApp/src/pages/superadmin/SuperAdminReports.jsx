import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' },
    success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
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
                <Text style={[styles.stepAmount, { color: '#2563EB' }]}>−₹7,60,000 Active Principal</Text>
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
                <Text style={[styles.tVal, { color: '#2563EB' }]}>{fundMetrics.activeLoans}</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  chipsScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6B46C1',
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  chipTextActive: {
    color: '#6B46C1',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  reportEyebrow: {
    fontSize: 10,
    color: '#6B46C1',
    letterSpacing: 1.1,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  reportTitle: {
    fontSize: 18,
    color: '#212121',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  reportSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
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
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  stepAmount: {
    fontSize: 16,
    color: '#6B46C1',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  stepDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  summaryTable: { gap: 6 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  tVal: {
    fontSize: 13,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  subtotal: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 4,
  },
  subLabel: {
    fontSize: 13,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  subVal: {
    fontSize: 15,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  profitHighlightVal: {
    fontSize: 16,
    color: '#059669',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  outNums: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  outNumText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
});

export default SuperAdminReports;
