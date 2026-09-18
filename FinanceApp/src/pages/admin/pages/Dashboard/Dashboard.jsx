import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Inline MetricCard
const MetricCard = ({ title, value, change, isPositive, color = '#2563EB', subtitle, iconName }) => {
  const iconMap = {
    fund: 'cash-multiple',
    trending: 'trending-up',
    collections: 'wallet-outline',
    calendar: 'calendar-clock',
  };
  return (
    <View style={metricCardStyles.card}>
      <View style={metricCardStyles.topRow}>
        <Text style={metricCardStyles.title} numberOfLines={1}>{title}</Text>
        {iconName ? (
          <View style={[metricCardStyles.iconBox, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={iconMap[iconName] || 'chart-line'} size={14} color={color} />
          </View>
        ) : null}
      </View>
      <Text style={metricCardStyles.value} numberOfLines={1}>{value}</Text>
      {change ? (
        <Text
          style={[
            metricCardStyles.change,
            isPositive !== undefined && { color: isPositive ? '#059669' : '#DC2626' },
          ]}
          numberOfLines={1}
        >
          {change}
        </Text>
      ) : subtitle ? (
        <Text style={metricCardStyles.subtitle} numberOfLines={1}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const metricCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  change: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
});

export const AdminDashboard = ({
  onNavigate,
  onOpenAddUser,
  onOpenDisburse,
  onOpenCollect,
  onOpenExpense,
  onOpenCapital,
  onOpenSettlement,
  onOpenLedger,
}) => {
  const {
    fundMetrics,
    loans,
    customers,
    currentOrganization,
    loading,
    refreshData,
  } = useApp();

  // Find due loans for today (weekly and daily)
  const dueTodayLoans = loans.filter(
    (l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID' || l.status === 'OVERDUE'
  ).slice(0, 5);

  const todayTargetProgress = fundMetrics.todayTarget > 0
    ? Math.min(1, fundMetrics.todayCollected / fundMetrics.todayTarget)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} colors={['#2563EB']} />
      }
    >
      {/* 1. Header Hero Banner */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{currentOrganization?.name || 'APEX MICROFINANCE'}</Text>
          </View>
          <Text style={styles.title}>Admin Control Center</Text>
          <Text style={styles.subtitle}>Daily Collections, Lending Capital & Borrower Ledgers</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={refreshData} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={14} color="#2563EB" />
          <Text style={styles.refreshBtnText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Vault Liquidity & Day Settlement Quick Card */}
      <View style={styles.vaultCard}>
        <View style={styles.vaultTop}>
          <View>
            <Text style={styles.vaultTitle}>BRANCH CASH VAULT & FLOAT</Text>
            <Text style={styles.vaultAmount}>₹3,45,000</Text>
            <Text style={styles.vaultSub}>Available lending liquidity in safe</Text>
          </View>
          <View style={styles.vaultBtnCol}>
            <TouchableOpacity
              style={styles.btnInject}
              onPress={onOpenCapital}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bank" size={12} color="#059669" />
              <Text style={styles.btnInjectText}>+ Capital</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnExpense}
              onPress={onOpenExpense}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="receipt" size={12} color="#DC2626" />
              <Text style={styles.btnExpenseText}>- Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settlementBar}
          onPress={onOpenSettlement}
          activeOpacity={0.85}
        >
          <View style={styles.settlementLeft}>
            <MaterialCommunityIcons name="lock" size={14} color="#0F172A" />
            <Text style={styles.settlementText}>Day-End Cash Reconciliation & Vault Lock</Text>
          </View>
          <Text style={styles.settlementArrow}>Review →</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Quick Operations Strip */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
          onPress={onOpenDisburse}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#2563EB' }]}>
            <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#1E40AF' }]}>Disburse Loan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
          onPress={() => onOpenCollect && onOpenCollect(dueTodayLoans[0] || null)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#059669' }]}>
            <MaterialCommunityIcons name="wallet" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#065F46' }]}>Collect EMI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#FAF5FF', borderColor: '#DDD6FE' }]}
          onPress={onOpenAddUser}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#7C3AED' }]}>
            <MaterialCommunityIcons name="account-group" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#6B21A8' }]}>Add Borrower</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Core Financial Metric Cards (Solid #0F172A figures) */}
      <Text style={styles.sectionTitle}>Capital Accounting & Profit</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Principal Given"
            value={formatINR(fundMetrics.totalPrincipalGiven)}
            change="Capital Disbursed"
            color="#2563EB"
            subtitle="To Active Borrowers"
            iconName="fund"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Interest Profit"
            value={formatINR(fundMetrics.totalContractedInterest)}
            change="Contracted Profit"
            isPositive={true}
            color="#059669"
            subtitle="Contracted Return"
            iconName="trending"
          />
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Recovered Cash"
            value={formatINR(fundMetrics.totalRecoveredCash)}
            change="Inflows Realized"
            isPositive={true}
            color="#059669"
            subtitle="Repayments Collected"
            iconName="collections"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Outstanding Due"
            value={formatINR(fundMetrics.outstandingTotal)}
            change="Circulating"
            color="#D97706"
            subtitle="Ledger Balance"
            iconName="calendar"
          />
        </View>
      </View>

      {/* 4. Today's Collection Performance Banner */}
      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <View>
            <Text style={styles.todayTitle}>Today's Collection Target</Text>
            <Text style={styles.todaySubtitle}>Field recovery vs scheduled daily installments</Text>
          </View>
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>{Math.round(todayTargetProgress * 100)}% Recovered</Text>
          </View>
        </View>

        <View style={styles.todayProgressTrack}>
          <View style={[styles.todayProgressFill, { width: `${todayTargetProgress * 100}%` }]} />
        </View>

        <View style={styles.todayStatsRow}>
          <View>
            <Text style={styles.todayStatLabel}>Recovered Today</Text>
            <Text style={[styles.todayStatVal, { color: '#059669' }]}>
              {formatINR(fundMetrics.todayCollected)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.todayStatLabel}>Daily Target Due</Text>
            <Text style={styles.todayStatVal}>
              {formatINR(fundMetrics.todayTarget)}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Due Today Borrower Queue */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Due Today Collection Queue</Text>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('customers')} activeOpacity={0.7}>
          <Text style={styles.sectionActionText}>View All Borrowers →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dueList}>
        {dueTodayLoans.length === 0 ? (
          <View style={styles.emptyDueCard}>
            <Text style={styles.emptyDueText}>All daily collections for today are balanced! 🎉</Text>
          </View>
        ) : (
          dueTodayLoans.map((loan) => (
            <TouchableOpacity
              key={loan.id}
              style={styles.dueCard}
              onPress={() => onOpenLedger && onOpenLedger(loan)}
              activeOpacity={0.8}
            >
              <View style={styles.dueLeft}>
                <View style={styles.dueAvatar}>
                  <Text style={styles.dueAvatarText}>
                    {(loan.customer_name || 'B').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.dueBorrowerName}>{loan.customer_name || 'Borrower Account'}</Text>
                  <Text style={styles.dueLoanSub}>
                    {loan.repayment_frequency || 'WEEKLY'} • {loan.loan_code || `LN-${loan.id}`}
                  </Text>
                </View>
              </View>

              <View style={styles.dueRight}>
                <Text style={styles.dueAmount}>{formatINR(loan.emi_amount || 1000)}</Text>
                <TouchableOpacity
                  style={styles.btnQuickCollect}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (onOpenCollect) onOpenCollect(loan);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnQuickCollectText}>Collect</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  actionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricHalf: {
    flex: 1,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  todaySubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  todayBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  todayProgressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  todayProgressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  todayStatVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  dueList: {
    gap: 8,
  },
  emptyDueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  emptyDueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  dueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  dueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dueAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  dueBorrowerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  dueLoanSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  dueRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dueAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  btnQuickCollect: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnQuickCollectText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  vaultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaultTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  vaultAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  vaultSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  vaultBtnCol: {
    flexDirection: 'row',
    gap: 6,
  },
  btnInject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnInjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  btnExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnExpenseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  settlementBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  settlementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  settlementText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  settlementArrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
});

export default AdminDashboard;
