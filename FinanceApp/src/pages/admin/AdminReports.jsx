import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import MetricCard from '../../components/common/MetricCard';
import Icon from '../../components/common/Icon';

const AdminReports = ({ onOpenSettlement }) => {
  const { fundMetrics, loans, customers, expenses, updateCustomerStatus } = useApp();
  const [activeReport, setActiveReport] = useState('COLLECTIONS');
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Report filters
  const reportsList = [
    { id: 'COLLECTIONS', label: 'Collections' },
    { id: 'OUTSTANDING', label: 'Outstanding' },
    { id: 'LOANS', label: 'Loans' },
    { id: 'PROFIT', label: 'Profit' },
    { id: 'USER_STATUS', label: 'User Status' },
  ];

  const handleStatusChange = (customerId, newStatus, customerName) => {
    updateCustomerStatus(customerId, newStatus, 'Admin updated status via reports');
    setStatusFeedback(`${customerName} is now ${newStatus}`);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Outstanding calculations
  const outstandingLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Operational Reports</Text>
            <Text style={styles.subtitle}>Field collections, loan portfolio & operating profit</Text>
          </View>
          {onOpenSettlement && (
            <TouchableOpacity 
              style={styles.settlementBannerBtn} 
              onPress={onOpenSettlement}
              activeOpacity={0.8}
            >
              <Icon name="lock" size={13} color="#065F46" />
              <Text style={styles.settlementBannerBtnText}>Day-End Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {reportsList.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.tabChip, activeReport === r.id && styles.tabChipActive]}
            onPress={() => setActiveReport(r.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeReport === r.id && styles.tabTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 1. COLLECTIONS REPORT */}
      {activeReport === 'COLLECTIONS' && (
        <View style={styles.reportSection}>
          <Text style={styles.sectionHeader}>COLLECTION PERFORMANCE</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Today's Collection"
                value={formatINR(fundMetrics.todayCollection)}
                change="Field Recoveries"
                isPositive={true}
                color="#059669"
                iconName="collections"
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Pending Today"
                value={formatINR(fundMetrics.pendingCollection)}
                change="8 Dues Pending"
                isPositive={false}
                color="#D97706"
                iconName="receipt"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Collection Periods</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Today</Text>
              <Text style={styles.val}>{formatINR(fundMetrics.todayCollection)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>This Week</Text>
              <Text style={styles.val}>{formatINR(142000)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>This Month</Text>
              <Text style={styles.val}>{formatINR(fundMetrics.thisMonthCollection)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 2. OUTSTANDING REPORT */}
      {activeReport === 'OUTSTANDING' && (
        <View style={styles.reportSection}>
          <Text style={styles.sectionHeader}>OUTSTANDING PORTFOLIO</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Total Outstanding"
                value={formatINR(fundMetrics.outstandingPrincipal)}
                change="Active Borrowers"
                color="#D97706"
                iconName="loans"
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Overdue Count"
                value={fundMetrics.overdueLoans.toString()}
                change="Delinquent Dues"
                isPositive={false}
                color="#DC2626"
                iconName="shield"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delinquent & Active Accounts</Text>
            {outstandingLoans.map((l) => {
              const cust = customers.find((c) => c.id === (l.customerId || l.customer_id)) || { name: 'Customer' };
              const remaining = l.outstanding_amount !== undefined ? l.outstanding_amount : (l.remainingAmount || (l.totalRepayment - l.paidAmount));

              return (
                <View key={l.id} style={styles.outRow}>
                  <View>
                    <Text style={styles.outCust}>{cust.name || cust.full_name} (Loan #{l.loanNumber || l.loan_number})</Text>
                    <Text style={styles.outSub}>Original: {formatINR(l.principal || l.principal_amount)} • Paid: {formatINR(l.paidAmount || l.total_paid || 0)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.outRemain}>{formatINR(remaining)}</Text>
                    <Text style={[styles.outStatus, { color: l.status === 'OVERDUE' ? '#DC2626' : '#2563EB' }]}>
                      {l.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 3. LOANS REPORT */}
      {activeReport === 'LOANS' && (
        <View style={styles.reportSection}>
          <Text style={styles.sectionHeader}>LOAN PORTFOLIO BREAKDOWN</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Active Loans"
                value={fundMetrics.activeLoans.toString()}
                change="Running Portfolios"
                color="#2563EB"
                iconName="loans"
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Completed Loans"
                value={fundMetrics.completedLoans.toString()}
                change="Successfully Repaid"
                isPositive={true}
                color="#059669"
                iconName="check"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portfolio Classification</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Weekly Loans (Common Borrowers)</Text>
              <Text style={styles.val}>64 Active</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Daily Loans (Shopkeepers)</Text>
              <Text style={styles.val}>18 Active</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Today Disbursed</Text>
              <Text style={[styles.val, { color: '#7C3AED' }]}>4 New Loans</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Overdue / Default Risk</Text>
              <Text style={[styles.val, { color: '#DC2626' }]}>8 Loans</Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. PROFIT REPORT */}
      {activeReport === 'PROFIT' && (
        <View style={styles.reportSection}>
          <Text style={styles.sectionHeader}>PROFIT & LOSS STATEMENT</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Net Profit"
                value={formatINR(fundMetrics.netProfit)}
                change="This Month"
                isPositive={true}
                color="#059669"
                iconName="fund"
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Lending Income"
                value={formatINR(fundMetrics.thisMonthIncome)}
                change="Gross Fees"
                isPositive={true}
                color="#2563EB"
                iconName="reports"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Month Income vs Outflow</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Lending Income (Interest/Fee)</Text>
              <Text style={[styles.val, { color: '#059669' }]}>+{formatINR(fundMetrics.thisMonthIncome)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Operating Expenses</Text>
              <Text style={[styles.val, { color: '#DC2626' }]}>-{formatINR(fundMetrics.thisMonthExpenses)}</Text>
            </View>
            <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.label, { fontWeight: '700', color: '#0F172A' }]}>Net Profit</Text>
              <Text style={[styles.val, { fontWeight: '800', color: '#059669', fontSize: 16 }]}>
                {formatINR(fundMetrics.netProfit)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 5. USER / CUSTOMER STATUS REPORT & GOVERNANCE */}
      {activeReport === 'USER_STATUS' && (
        <View style={styles.reportSection}>
          <View style={styles.statusSectionHeader}>
            <View>
              <Text style={styles.sectionHeader}>USER & BORROWER GOVERNANCE</Text>
              <Text style={styles.statusSectionSub}>Audit accounts and update active lending status</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{customers.length} Accounts</Text>
            </View>
          </View>

          {statusFeedback && (
            <View style={styles.feedbackBanner}>
              <Icon name="check" size={14} color="#065F46" />
              <Text style={styles.feedbackText}>{statusFeedback}</Text>
            </View>
          )}

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Icon name="search" size={15} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, phone or code..."
              placeholderTextColor="#94A3B8"
              value={userSearch}
              onChangeText={setUserSearch}
            />
          </View>

          {/* Filter Chips */}
          <View style={styles.statusFilterRow}>
            {['ALL', 'ACTIVE', 'UNDER_REVIEW', 'BLOCKED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusFilterChip, statusFilter === st && styles.statusFilterChipActive]}
                onPress={() => setStatusFilter(st)}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusFilterText, statusFilter === st && styles.statusFilterTextActive]}>
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Customer cards */}
          {customers
            .filter((c) => {
              if (statusFilter !== 'ALL' && (c.status || 'ACTIVE') !== statusFilter) return false;
              if (userSearch) {
                const q = userSearch.toLowerCase();
                const matchName = (c.name || '').toLowerCase().includes(q);
                const matchPhone = (c.phone || '').includes(q);
                const matchCode = (c.customer_code || c.code || '').toLowerCase().includes(q);
                return matchName || matchPhone || matchCode;
              }
              return true;
            })
            .map((c) => {
              const currentStatus = c.status || 'ACTIVE';
              const isBlocked = currentStatus === 'BLOCKED';
              const isUnderReview = currentStatus === 'UNDER_REVIEW';
              const isActive = currentStatus === 'ACTIVE';

              return (
                <View key={c.id} style={styles.userStatusCard}>
                  <View style={styles.userCardTop}>
                    <View style={styles.userCardInfo}>
                      <Text style={styles.userCardCode}>{c.customer_code || `CUST-00${c.id}`}</Text>
                      <Text style={styles.userCardName}>{c.name || c.full_name}</Text>
                      <Text style={styles.userCardPhone}>{c.phone} • {c.occupation || 'Merchant'}</Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      isActive && styles.statusPillActive,
                      isUnderReview && styles.statusPillReview,
                      isBlocked && styles.statusPillBlocked,
                    ]}>
                      <Text style={[
                        styles.statusPillText,
                        isActive && styles.statusTextActive,
                        isUnderReview && styles.statusTextReview,
                        isBlocked && styles.statusTextBlocked,
                      ]}>
                        {currentStatus.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userCardMetrics}>
                    <View>
                      <Text style={styles.userMetricLabel}>Active Loans</Text>
                      <Text style={styles.userMetricVal}>{c.active_loans || 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.userMetricLabel}>Outstanding</Text>
                      <Text style={[styles.userMetricVal, { color: '#2563EB' }]}>
                        {formatINR(c.outstanding || 0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userMetricLabel}>Credit Limit</Text>
                      <Text style={styles.userMetricVal}>{formatINR(c.creditLimit || 30000)}</Text>
                    </View>
                  </View>

                  {/* Quick Action Buttons for Status Update */}
                  <View style={styles.statusActionsRow}>
                    <TouchableOpacity
                      style={[styles.statusBtn, isActive ? styles.statusBtnCurrent : styles.statusBtnActive]}
                      onPress={() => handleStatusChange(c.id, 'ACTIVE', c.name || c.full_name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.statusBtnText, isActive && styles.statusBtnCurrentText]}>
                        {isActive ? '✓ Active' : 'Set Active'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.statusBtn, isUnderReview ? styles.statusBtnCurrent : styles.statusBtnReview]}
                      onPress={() => handleStatusChange(c.id, 'UNDER_REVIEW', c.name || c.full_name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.statusBtnText, isUnderReview && styles.statusBtnCurrentText]}>
                        {isUnderReview ? '✓ Review' : 'Put on Review'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.statusBtn, isBlocked ? styles.statusBtnCurrent : styles.statusBtnBlocked]}
                      onPress={() => handleStatusChange(c.id, 'BLOCKED', c.name || c.full_name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.statusBtnText, isBlocked && styles.statusBtnCurrentText]}>
                        {isBlocked ? '✓ Blocked' : 'Block Defaulter'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
        </View>
      )}
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
    paddingBottom: 70,
  },
  header: {
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settlementBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  settlementBannerBtnText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  reportSection: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricHalf: {
    flex: 1,
  },
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
  },
  val: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  outRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  outCust: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  outSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  outRemain: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  outStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  statusSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  statusFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusFilterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
  },
  userStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    elevation: 1,
  },
  userCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  userCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  userCardPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillReview: {
    backgroundColor: '#FFFBEB',
  },
  statusPillBlocked: {
    backgroundColor: '#FEF2F2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextReview: {
    color: '#D97706',
  },
  statusTextBlocked: {
    color: '#DC2626',
  },
  userCardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  userMetricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  userMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusBtnReview: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusBtnBlocked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBtnCurrent: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBtnCurrentText: {
    color: '#FFFFFF',
  },
});

export default AdminReports;
