import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { FadeInView } from '../../animations/FadeInView';
import Icon from '../../components/common/Icon';

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
          <FadeInView delay={100}>
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

                <Icon name="arrow-right" size={14} color="#94A3B8" style={{ transform: [{ rotate: '90deg' }] }} />

                <View style={styles.flowStep}>
                  <Text style={styles.stepTitle}>2. Borrower Loans Disbursed</Text>
                  <Text style={[styles.stepAmount, { color: '#2563EB' }]}>−₹7,60,000 Active Principal</Text>
                  <Text style={styles.stepDesc}>Earning 10% (Weekly) & 12.5% (Daily)</Text>
                </View>

                <Icon name="arrow-right" size={14} color="#94A3B8" style={{ transform: [{ rotate: '90deg' }] }} />

                <View style={styles.flowStep}>
                  <Text style={styles.stepTitle}>3. Installment Recoveries Recycled</Text>
                  <Text style={[styles.stepAmount, { color: '#059669' }]}>+₹5,20,000 Recovered</Text>
                  <Text style={styles.stepDesc}>Principal ₹4,72,000 (Recycled) + Fee Income ₹48,000</Text>
                </View>

                <Icon name="arrow-right" size={14} color="#94A3B8" style={{ transform: [{ rotate: '90deg' }] }} />

                <View style={styles.flowStep}>
                  <Text style={styles.stepTitle}>4. Central Fund Pool Recharged</Text>
                  <Text style={[styles.stepAmount, { color: '#D97706' }]}>₹2,40,000 Available Cash</Text>
                  <Text style={styles.stepDesc}>Ready for immediate new loan originations</Text>
                </View>
              </View>
            </View>
          </FadeInView>
        )}

        {/* 2. COLLECTION REPORT */}
        {activeReport === 'COLLECTIONS' && (
          <FadeInView delay={100}>
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
          </FadeInView>
        )}

        {/* 3. OUTSTANDING REPORT */}
        {activeReport === 'OUTSTANDING' && (
          <FadeInView delay={100}>
            <View style={styles.card}>
              <Text style={styles.reportEyebrow}>PORTFOLIO AT RISK (PAR)</Text>
              <Text style={styles.reportTitle}>Outstanding Balances by Borrower</Text>
              <Text style={styles.reportSub}>Active balances awaiting collection</Text>

              {loans.filter((l) => (l.outstanding_amount || l.remainingAmount || 0) > 0).map((l, idx) => (
                <View key={l.id || idx} style={styles.outItem}>
                  <View style={styles.outHeader}>
                    <Text style={styles.outCust}>{l.customer_name || l.customerName} ({l.loan_number || l.loanNumber})</Text>
                    <Badge label={l.status} variant={l.status === 'OVERDUE' ? 'danger' : 'primary'} size="sm" />
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
          </FadeInView>
        )}

        {/* 4. LOAN REPORT */}
        {activeReport === 'LOANS' && (
          <FadeInView delay={100}>
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
          </FadeInView>
        )}

        {/* 5. PROFIT REPORT */}
        {activeReport === 'PROFIT' && (
          <FadeInView delay={100}>
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
          </FadeInView>
        )}

        {/* 6. CASH FLOW */}
        {activeReport === 'CASH_FLOW' && (
          <FadeInView delay={100}>
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
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  chipsScroll: { paddingHorizontal: 14, gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  content: { padding: 14, paddingBottom: 70 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reportEyebrow: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 1.1 },
  reportTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  reportSub: { fontSize: 11, color: '#64748B', marginBottom: 14 },
  flowChain: { gap: 8, alignItems: 'center' },
  flowStep: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  stepAmount: { fontSize: 16, fontWeight: '900', color: '#2563EB', marginTop: 2 },
  stepDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  summaryTable: { gap: 6 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  tLabel: { fontSize: 12, color: '#64748B' },
  tVal: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  subtotal: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, marginTop: 4 },
  subLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  subVal: { fontSize: 15, fontWeight: '900', color: '#2563EB' },
  profitHighlight: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, marginTop: 6, borderLeftWidth: 4, borderLeftColor: '#059669', borderWidth: 1, borderColor: '#A7F3D0' },
  profitHighlightLabel: { fontSize: 13, fontWeight: '800', color: '#059669' },
  profitHighlightVal: { fontSize: 16, fontWeight: '900', color: '#059669' },
  outItem: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  outHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  outCust: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  outNums: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  outNumText: { fontSize: 11, color: '#64748B' },
});

export default SuperAdminReports;
