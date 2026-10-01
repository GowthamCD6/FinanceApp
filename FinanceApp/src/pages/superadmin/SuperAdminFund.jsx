import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR, formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Colors, Fonts } from '../../theme';
import AddCapitalModal from './modal/AddCapitalModal';

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
          <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addCapBtnText}>Add Capital</Text>
        </TouchableOpacity>
      </View>

      {/* Main Available Pool Card */}
      <View style={styles.poolCard}>
        <Text style={styles.poolLabel}>TOTAL AVAILABLE CASH POOL</Text>
        <Text style={styles.poolVal}>{formatINR(availableCash)}</Text>
        <Text style={styles.poolSub}>
          Ready for instant new loan originations and continuous capital circulation
        </Text>

        <View style={styles.accountSplits}>
          <View style={styles.accPill}>
            <View style={styles.accIconBox}>
              <MaterialCommunityIcons name="wallet-outline" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.accName}>Cash Drawer</Text>
              <Text style={styles.accAmt}>{formatINR(cashOnHand)}</Text>
            </View>
          </View>
          <View style={styles.accPill}>
            <View style={styles.accIconBox}>
              <MaterialCommunityIcons name="bank-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.accName}>Bank Main</Text>
              <Text style={styles.accAmt}>{formatINR(bankBalance)}</Text>
            </View>
          </View>
          <View style={styles.accPill}>
            <View style={styles.accIconBox}>
              <MaterialCommunityIcons name="cellphone" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.accName}>UPI QR Pool</Text>
              <Text style={styles.accAmt}>{formatINR(upiBalance)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Audit Shortcut Banner */}
      <TouchableOpacity 
        style={styles.auditBanner} 
        onPress={() => onOpenAudit && onOpenAudit()}
        activeOpacity={0.8}
      >
        <View style={styles.auditLeft}>
          <View style={styles.auditIconBox}>
            <MaterialCommunityIcons name="history" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.auditTitle}>Inspect Central Audit Ledger</Text>
            <Text style={styles.auditSub}>View timeline of all {fundTransactions.length} inflows, disbursements & expenses</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
      </TouchableOpacity>

      {/* Fund Overview Ledger */}
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
            <Text style={[styles.rowVal, { color: Colors.primary }]}>{formatINR(currentlyLent)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Principal Recovered</Text>
            <Text style={[styles.rowVal, { color: '#059669' }]}>+{formatINR(principalRecovered)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Lending Fee Income</Text>
            <Text style={[styles.rowVal, { color: Colors.primary }]}>+{formatINR(lendingIncome)}</Text>
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

      {/* Circulation Flow Rule */}
      <View style={styles.circCard}>
        <View style={styles.circHeader}>
          <MaterialCommunityIcons name="sync" size={18} color={Colors.primary} />
          <Text style={styles.circTitle}>Continuous Circulation Principle</Text>
        </View>
        <Text style={styles.circDesc}>
          When a borrower settles an installment, the principal portion instantly recycles into Available Cash. 
          The lending contract fee (10% or 12.5%) accumulates as operating profit. 
          Capital is never idle—it is immediately mobilized into subsequent borrower loan cycles.
        </Text>
      </View>

      {/* Recent Ledger Stream (Last 5) */}
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 70 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  eyebrow: { fontSize: 10, fontFamily: Fonts.gilroy.bold, color: Colors.primary, letterSpacing: 1.1 },
  pageTitle: { fontSize: 22, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginTop: 2 },
  addCapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addCapBtnText: { color: Colors.white, fontFamily: Fonts.gilroy.bold, fontSize: 12 },
  poolCard: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  poolLabel: { fontSize: 11, fontFamily: Fonts.gilroy.bold, color: Colors.primary, letterSpacing: 1 },
  poolVal: { fontSize: 32, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginVertical: 4 },
  poolSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, marginBottom: 16 },
  accountSplits: { flexDirection: 'row', gap: 8 },
  accPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  accIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.backgroundContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  accName: { fontSize: 9, fontFamily: Fonts.gilroy.bold, color: Colors.textSecondary },
  accAmt: { fontSize: 11, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginTop: 1 },
  auditBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.purpleTintLightest,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  auditLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  auditIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  auditTitle: { fontSize: 13, fontFamily: Fonts.gilroy.bold, color: Colors.primary },
  auditSub: { fontSize: 10, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, marginTop: 2 },
  card: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardEyebrow: { fontSize: 10, fontFamily: Fonts.gilroy.bold, color: Colors.primary, letterSpacing: 1.1 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginTop: 2, marginBottom: 12 },
  statsTable: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium },
  rowVal: { fontSize: 13, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary },
  totalRow: { backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.lightGray400 },
  totalLabel: { fontSize: 12, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary },
  totalVal: { fontSize: 15, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.lightGray400, marginVertical: 4 },
  profitRow: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  profitLabel: { fontSize: 12, fontFamily: Fonts.gilroy.bold, color: '#059669' },
  profitVal: { fontSize: 15, fontFamily: Fonts.gilroy.bold, color: '#059669' },
  circCard: {
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
    marginBottom: 14,
  },
  circHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  circTitle: { fontSize: 13, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary },
  circDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, lineHeight: 17 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 10 },
  sectionHeader: { fontSize: 12, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  viewAllText: { fontSize: 11, fontFamily: Fonts.gilroy.bold, color: Colors.primary },
  txList: { gap: 8 },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  txLeft: { flex: 1, marginRight: 10 },
  txDate: { fontSize: 9, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium },
  txItemTitle: { fontSize: 12, fontFamily: Fonts.gilroy.bold, color: Colors.textPrimary, marginTop: 2 },
  txItemDesc: { fontSize: 10, color: Colors.textSecondary, fontFamily: Fonts.gilroy.medium, marginTop: 1 },
  txItemAmount: { fontSize: 14, fontFamily: Fonts.gilroy.bold },
});

export default SuperAdminFund;
