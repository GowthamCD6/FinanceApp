import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import MetricCard from '../../components/common/MetricCard';
import Icon from '../../components/common/Icon';

const AdminDashboard = ({ navigation, onNavigate }) => {
  const { fundMetrics, loans, customers } = useApp();

  const handleNavigate = (page, params) => {
    if (onNavigate) {
      onNavigate(page, params);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.roleTag}>FIELD & DESK OPERATIONS</Text>
          <Text style={styles.title}>Admin Operations Hub</Text>
          <Text style={styles.subtitle}>Daily Collections, Lending & Cash Circulation</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>TODAY</Text>
        </View>
      </View>

      {/* TODAY'S FOCUS SECTION */}
      <Text style={styles.sectionTitle}>Today's Collection Work</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Today's Collection"
            value={formatINR(fundMetrics.todayCollection)}
            change="Collected so far"
            isPositive={true}
            color="#059669"
            subtitle="Field Collections"
            iconName="collections"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Today's Expected"
            value={formatINR(fundMetrics.todayExpected)}
            change="Target Schedule"
            color="#2563EB"
            subtitle="Scheduled Dues"
            iconName="calendar"
          />
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Pending Collection"
            value={formatINR(fundMetrics.pendingCollection)}
            change="8 installments left"
            isPositive={false}
            color="#D97706"
            subtitle="Immediate Follow-up"
            iconName="receipt"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Today's New Loans"
            value={fundMetrics.todayNewLoans.toString()}
            change="4 Disbursed"
            isPositive={true}
            color="#7C3AED"
            subtitle="Weekly & Daily"
            iconName="loans"
          />
        </View>
      </View>

      {/* LOAN PORTFOLIO METRICS */}
      <Text style={styles.sectionTitle}>Portfolio Status</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Active Loans"
            value={fundMetrics.activeLoans.toString()}
            change="Earning Interest"
            color="#0284C7"
            subtitle="Currently Running"
            iconName="loans"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Overdue Loans"
            value={fundMetrics.overdueLoans.toString()}
            change="Requires Action"
            isPositive={false}
            color="#DC2626"
            subtitle="Past Due Date"
            iconName="shield"
          />
        </View>
      </View>

      {/* FUND & CASH STATUS */}
      <Text style={styles.sectionTitle}>Circulation Position</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Available Cash"
            value={formatINR(fundMetrics.availableCash)}
            change="Ready for Lending"
            isPositive={true}
            color="#059669"
            subtitle="Central Cash Vault"
            iconName="fund"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Money Currently Lent"
            value={formatINR(fundMetrics.moneyCurrentlyLent)}
            change="Active Principal"
            color="#4F46E5"
            subtitle="Circulating Capital"
            iconName="repeat"
          />
        </View>
      </View>

      {/* QUICK OPERATIONAL ACTIONS */}
      <Text style={styles.sectionTitle}>Daily Operations</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => handleNavigate('collections')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="collections" size={18} color="#059669" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Collect Payment</Text>
            <Text style={styles.actionDesc}>1-tap collection, receipt issuance & auto fund recharge</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => handleNavigate('loans', { openNewLoan: true })}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="plus" size={18} color="#2563EB" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>New Loan Disburse</Text>
            <Text style={styles.actionDesc}>Weekly (10 wk) / Daily (25 d) loan origination</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => handleNavigate('customers')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
            <Icon name="customers" size={18} color="#D97706" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Customer Profiles</Text>
            <Text style={styles.actionDesc}>Borrower history & repeat loan eligibility</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => handleNavigate('day_end_settlement')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="lock" size={18} color="#059669" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Day-End Cash Settlement</Text>
            <Text style={styles.actionDesc}>Reconcile daily cash, expenses & handover to vault</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* CENTRAL FUND CIRCULATION PRINCIPLE NOTICE */}
      <View style={styles.circulationCard}>
        <View style={styles.circHeader}>
          <Icon name="repeat" size={16} color="#2563EB" />
          <Text style={styles.circulationTitle}>Fund Circulation Active</Text>
        </View>
        <Text style={styles.circulationText}>
          Every ₹1,100 weekly repayment splits into ₹1,000 Principal Return + ₹100 Lending Income. 
          The principal is instantly returned to the central fund, replenishing Available Cash for immediate new loan disbursements.
        </Text>
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
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dateText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 18,
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricHalf: {
    flex: 1,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  circulationCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  circHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  circulationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  circulationText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
});

export default AdminDashboard;
