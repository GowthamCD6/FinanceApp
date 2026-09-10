import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { formatINR, formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { FadeInView } from '../../animations/FadeInView';
import Icon from '../../components/common/Icon';
import AddCapitalModal from '../../components/modals/AddCapitalModal';

export const SuperAdminFund = ({ onOpenAudit }) => {
  const { fundTransactions, fundMetrics, addCapital } = useApp();
  const [showCapitalModal, setShowCapitalModal] = useState(false);

  // Dynamic central fund metrics
  const totalCapital = fundMetrics?.totalCapital || 1200000;
  const initialCapital = 1000000;
  const additionalCapital = Math.max(0, totalCapital - initialCapital);
  const currentlyLent = fundMetrics?.moneyCurrentlyLent || 760000;
  const availableCash = fundMetrics?.availableCash || 240000;
  const principalRecovered = fundMetrics?.principalRecovered || 520000;
  const lendingIncome = fundMetrics?.thisMonthIncome || 85000;
  const expenses = fundMetrics?.thisMonthExpenses || 20000;
  const netProfit = fundMetrics?.netProfit || (lendingIncome - expenses);

  // Split of Available Cash across Accounts
  const cashOnHand = Math.round(availableCash * 0.45);
  const bankBalance = Math.round(availableCash * 0.40);
  const upiBalance = availableCash - cashOnHand - bankBalance;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Banner with Actions */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.eyebrow}>CENTRAL TREASURY</Text>
          <Text style={styles.pageTitle}>Central Fund Vault</Text>
        </View>
        <TouchableOpacity 
          style={styles.addCapBtn} 
          onPress={() => setShowCapitalModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addCapBtnText}>Add Capital</Text>
        </TouchableOpacity>
      </View>

      {/* Main Available Pool Card */}
      <FadeInView delay={100}>
        <View style={styles.poolCard}>
          <Text style={styles.poolLabel}>TOTAL AVAILABLE CASH POOL</Text>
          <Text style={styles.poolVal}>{formatINR(availableCash)}</Text>
          <Text style={styles.poolSub}>
            Ready for instant new loan originations and continuous capital circulation
          </Text>

          <View style={styles.accountSplits}>
            <View style={styles.accPill}>
              <View style={styles.accIconBox}>
                <Icon name="collections" size={14} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.accName}>Cash Drawer</Text>
                <Text style={styles.accAmt}>{formatINR(cashOnHand)}</Text>
              </View>
            </View>
            <View style={styles.accPill}>
              <View style={styles.accIconBox}>
                <Icon name="fund" size={14} color="#059669" />
              </View>
              <View>
                <Text style={styles.accName}>Bank Main</Text>
                <Text style={styles.accAmt}>{formatINR(bankBalance)}</Text>
              </View>
            </View>
            <View style={styles.accPill}>
              <View style={styles.accIconBox}>
                <Icon name="phone" size={14} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.accName}>UPI QR Pool</Text>
                <Text style={styles.accAmt}>{formatINR(upiBalance)}</Text>
              </View>
            </View>
          </View>
        </View>
      </FadeInView>

      {/* Audit Shortcut Banner */}
      <FadeInView delay={150}>
        <TouchableOpacity 
          style={styles.auditBanner} 
          onPress={() => onOpenAudit && onOpenAudit()}
          activeOpacity={0.8}
        >
          <View style={styles.auditLeft}>
            <View style={styles.auditIconBox}>
              <Icon name="reports" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.auditTitle}>Inspect Central Audit Ledger</Text>
              <Text style={styles.auditSub}>View timeline of all {fundTransactions.length} inflows, disbursements & expenses</Text>
            </View>
          </View>
          <Icon name="arrow-right" size={15} color="#2563EB" />
        </TouchableOpacity>
      </FadeInView>

      {/* Fund Overview Ledger */}
      <FadeInView delay={200}>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>CAPITAL RE-CIRCULATION</Text>
          <Text style={styles.cardTitle}>Fund Balance Sheet</Text>

          <View style={styles.statsTable}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Initial Founder Capital</Text>
              <Text style={styles.rowVal}>{formatINR(initialCapital)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Additional Capital Injected</Text>
              <Text style={styles.rowVal}>+{formatINR(additionalCapital)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Capital Pool</Text>
              <Text style={styles.totalVal}>{formatINR(totalCapital)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Capital Currently Lent Out</Text>
              <Text style={[styles.rowVal, { color: '#2563EB' }]}>{formatINR(currentlyLent)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Principal Recovered</Text>
              <Text style={[styles.rowVal, { color: '#059669' }]}>+{formatINR(principalRecovered)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Lending Fee Income</Text>
              <Text style={[styles.rowVal, { color: '#7C3AED' }]}>+{formatINR(lendingIncome)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Operating Expenses Paid</Text>
              <Text style={[styles.rowVal, { color: '#DC2626' }]}>−{formatINR(expenses)}</Text>
            </View>

            <View style={[styles.row, styles.profitRow]}>
              <Text style={styles.profitLabel}>Net Operating Profit</Text>
              <Text style={styles.profitVal}>+{formatINR(netProfit)}</Text>
            </View>
          </View>
        </View>
      </FadeInView>

      {/* Circulation Flow Rule */}
      <FadeInView delay={250}>
        <View style={styles.circCard}>
          <View style={styles.circHeader}>
            <Icon name="refresh" size={16} color="#2563EB" />
            <Text style={styles.circTitle}>Continuous Circulation Principle</Text>
          </View>
          <Text style={styles.circDesc}>
            When a borrower settles an installment, the principal portion instantly recycles into Available Cash. 
            The lending contract fee (10% or 12.5%) accumulates as operating profit. 
            Capital is never idle—it is immediately mobilized into subsequent borrower loan cycles.
          </Text>
        </View>
      </FadeInView>

      {/* Recent Ledger Stream (Last 5) */}
      <FadeInView delay={300}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Recent Treasury Ledger</Text>
          <TouchableOpacity onPress={() => onOpenAudit && onOpenAudit()}>
            <Text style={styles.viewAllText}>View All ({fundTransactions.length}) →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {fundTransactions.slice(0, 6).map((tx) => {
            const isIn = tx.direction === 'IN';
            return (
              <View key={tx.id} style={styles.txItem}>
                <View style={styles.txLeft}>
                  <Text style={styles.txDate}>{formatDate(tx.date || '2026-09-08')}</Text>
                  <Text style={styles.txItemTitle}>{tx.title}</Text>
                  <Text style={styles.txItemDesc}>{tx.description}</Text>
                </View>
                <Text style={[styles.txItemAmount, { color: isIn ? '#059669' : '#DC2626' }]}>
                  {isIn ? '+' : '−'}{formatINR(tx.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      </FadeInView>

      {/* Capital Injection Modal */}
      <AddCapitalModal
        visible={showCapitalModal}
        onClose={() => setShowCapitalModal(false)}
        onAddCapital={(amt, desc) => addCapital(amt, desc)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 70 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 1.1 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  addCapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addCapBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  poolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  poolLabel: { fontSize: 11, fontWeight: '800', color: '#2563EB', letterSpacing: 1 },
  poolVal: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginVertical: 4 },
  poolSub: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  accountSplits: { flexDirection: 'row', gap: 8 },
  accPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accName: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', fontWeight: '700' },
  accAmt: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 1 },
  auditBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  auditLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  auditIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  auditTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  auditSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEyebrow: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 1.1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 2, marginBottom: 12 },
  statsTable: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 12, color: '#64748B' },
  rowVal: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  totalRow: { backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, marginVertical: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  totalLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  totalVal: { fontSize: 14, fontWeight: '900', color: '#2563EB' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 },
  profitRow: { backgroundColor: '#ECFDF5', padding: 8, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#A7F3D0' },
  profitLabel: { fontSize: 13, fontWeight: '800', color: '#059669' },
  profitVal: { fontSize: 14, fontWeight: '900', color: '#059669' },
  circCard: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 14 },
  circHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  circTitle: { fontSize: 13, fontWeight: '800', color: '#2563EB' },
  circDesc: { fontSize: 11, color: '#334155', lineHeight: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  viewAllText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  txList: { gap: 8 },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txLeft: { flex: 1 },
  txDate: { fontSize: 9, color: '#64748B' },
  txItemTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginTop: 1 },
  txItemDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  txItemAmount: { fontSize: 13, fontWeight: '800' },
});

export default SuperAdminFund;
