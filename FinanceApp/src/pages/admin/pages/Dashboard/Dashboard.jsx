import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import MetricCard from '../../../../components/common/MetricCard';
import Icon from '../../../../components/common/Icon';

const AdminDashboard = ({ onNavigate, onOpenAddUser, onOpenManageUsers }) => {
  const { fundMetrics, loans, customers, currentOrganization } = useApp();

  const activeBorrowersCount = customers.filter((c) => (c.status || 'ACTIVE') === 'ACTIVE').length;
  const overdueLoans = loans.filter((l) => l.status === 'OVERDUE');
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{currentOrganization?.name || 'APEX MICROFINANCE'}</Text>
          </View>
          <Text style={styles.title}>Admin Control Center</Text>
          <Text style={styles.subtitle}>Daily Collections, Lending & User Governance</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>LIVE</Text>
        </View>
      </View>

      {/* QUICK ACTIONS ROW */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
          onPress={onOpenAddUser}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#2563EB' }]}>
            <Icon name="plus" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#1E40AF' }]}>Add User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
          onPress={onOpenManageUsers}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#059669' }]}>
            <Icon name="users" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#065F46' }]}>Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
          onPress={() => onNavigate && onNavigate('reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#D97706' }]}>
            <Icon name="reports" size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionBtnLabel, { color: '#92400E' }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* TODAY'S COLLECTION PERFORMANCE */}
      <Text style={styles.sectionTitle}>Daily Collection Target</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Today's Collected"
            value={formatINR(fundMetrics?.todayCollection || 14200)}
            change="Recovered Today"
            isPositive={true}
            color="#059669"
            subtitle="Field Collections"
            iconName="collections"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Scheduled Dues"
            value={formatINR(fundMetrics?.todayExpected || 18500)}
            change="Daily Target"
            color="#2563EB"
            subtitle="Today's Target"
            iconName="calendar"
          />
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Pending Recovery"
            value={formatINR(fundMetrics?.pendingCollection || 4300)}
            change="Requires Visit"
            isPositive={false}
            color="#D97706"
            subtitle="Immediate Action"
            iconName="receipt"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Active Borrowers"
            value={activeBorrowersCount.toString()}
            change={`${customers.length} total enrolled`}
            isPositive={true}
            color="#7C3AED"
            subtitle="Governed Clients"
            iconName="users"
          />
        </View>
      </View>

      {/* RECOVERY & CAPITAL STATS */}
      <Text style={styles.sectionTitle}>Portfolio Health</Text>
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioRow}>
          <View style={styles.portfolioStat}>
            <Text style={styles.statLabel}>ACTIVE RUNNING LOANS</Text>
            <Text style={[styles.statValue, { color: '#0284C7' }]}>{activeLoans.length}</Text>
            <Text style={styles.statSub}>10-Wk & 25-Day loans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.portfolioStat}>
            <Text style={styles.statLabel}>OVERDUE DEFAULTS</Text>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{overdueLoans.length}</Text>
            <Text style={styles.statSub}>Follow-up required</Text>
          </View>
        </View>
      </View>

      {/* CRITICAL URGENT FOLLOW-UPS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Urgent Field Follow-ups</Text>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('reports')}>
          <Text style={styles.viewAllText}>View Reports ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loans.slice(0, 4).map((loan) => {
          const isOverdue = loan.status === 'OVERDUE';
          return (
            <View key={loan.id} style={styles.urgentItem}>
              <View style={[styles.urgentIconBox, { backgroundColor: isOverdue ? '#FEE2E2' : '#F1F5F9' }]}>
                <Icon name={isOverdue ? 'receipt' : 'calendar'} size={16} color={isOverdue ? '#DC2626' : '#64748B'} />
              </View>
              <View style={styles.urgentDetails}>
                <Text style={styles.urgentName}>{loan.customerName || loan.customer_name || 'Borrower'}</Text>
                <Text style={styles.urgentMeta}>
                  {loan.loan_number || `LN-00${loan.id}`} • {loan.type || loan.loan_type || 'WEEKLY'}
                </Text>
              </View>
              <View style={styles.urgentAmountBox}>
                <Text style={styles.urgentAmount}>
                  {formatINR(loan.installment_amount || loan.next_payment_amount || 600)}
                </Text>
                <View style={[styles.dueBadge, { backgroundColor: isOverdue ? '#FEE2E2' : '#EFF6FF' }]}>
                  <Text style={[styles.dueBadgeText, { color: isOverdue ? '#DC2626' : '#2563EB' }]}>
                    {isOverdue ? 'OVERDUE' : 'DUE TODAY'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  roleTag: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricHalf: {
    flex: 1,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  urgentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  urgentDetails: {
    flex: 1,
  },
  urgentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  urgentMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  urgentAmountBox: {
    alignItems: 'flex-end',
  },
  urgentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  dueBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
});

export default AdminDashboard;
