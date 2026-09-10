import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { FadeInView } from '../../animations/FadeInView';
import Icon from '../../components/common/Icon';

export const SuperAdminDashboard = ({ onNavigate }) => {
  const { fundMetrics } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Executive Welcome & Mode Banner */}
      <FadeInView delay={100}>
        <View style={styles.roleBanner}>
          <View>
            <Text style={styles.roleEyebrow}>SUPER ADMIN • EXECUTIVE GOVERNANCE</Text>
            <Text style={styles.roleTitle}>Central Fund & Master Portfolio</Text>
          </View>
          <Badge label="Complete Access" variant="primary" />
        </View>
      </FadeInView>

      {/* Central Circulation Mechanism Card */}
      <FadeInView delay={180}>
        <View style={styles.circCard}>
          <View style={styles.circHeader}>
            <Icon name="refresh" size={16} color="#2563EB" />
            <Text style={styles.circHeading}>Central Fund Circulation Mechanism</Text>
          </View>
          <View style={styles.circRow}>
            <View style={styles.circCol}>
              <Text style={styles.circLabel}>Total Capital</Text>
              <Text style={styles.circVal}>{formatINR(fundMetrics.totalCapital)}</Text>
            </View>
            <Icon name="arrow-right" size={14} color="#94A3B8" />
            <View style={styles.circCol}>
              <Text style={styles.circLabel}>Available Cash</Text>
              <Text style={[styles.circVal, { color: '#059669' }]}>
                {formatINR(fundMetrics.availableCash)}
              </Text>
            </View>
            <Icon name="arrow-right" size={14} color="#94A3B8" />
            <View style={styles.circCol}>
              <Text style={styles.circLabel}>Currently Lent</Text>
              <Text style={[styles.circVal, { color: '#2563EB' }]}>
                {formatINR(fundMetrics.moneyCurrentlyLent)}
              </Text>
            </View>
          </View>
          <Text style={styles.circSub}>
            Principal recovered from installments is recycled directly into Available Cash for subsequent lending cycles.
          </Text>
        </View>
      </FadeInView>

      {/* Key Super Admin Figures */}
      <FadeInView delay={250}>
        <Text style={styles.sectionTitle}>Portfolio Balance Sheet</Text>
        <View style={styles.metricsList}>
          <MetricCard
            title="Total Capital Pool"
            amount={fundMetrics.totalCapital}
            subtitle="Equity & Initial Business Pool"
            accentColor="#475569"
            iconName="fund"
            onPress={() => onNavigate && onNavigate('fund')}
          />
          <MetricCard
            title="Available Liquid Cash"
            amount={fundMetrics.availableCash}
            subtitle="Cash in Drawer, Bank & UPI Float"
            accentColor="#059669"
            iconName="collections"
            onPress={() => onNavigate && onNavigate('fund')}
          />
          <MetricCard
            title="Money Currently Lent"
            amount={fundMetrics.moneyCurrentlyLent}
            subtitle="Total Principal Disbursed"
            accentColor="#2563EB"
            iconName="loans"
            onPress={() => onNavigate && onNavigate('loans')}
          />
          <MetricCard
            title="Outstanding Principal"
            amount={fundMetrics.outstandingPrincipal}
            subtitle="Principal Awaiting Recovery"
            accentColor="#D97706"
            iconName="reports"
            onPress={() => onNavigate && onNavigate('loans')}
          />
        </View>
      </FadeInView>

      {/* Collections & Profitability */}
      <FadeInView delay={320}>
        <Text style={styles.sectionTitle}>Cash Flow & Profit Performance</Text>
        <View style={styles.metricsList}>
          <MetricCard
            title="Today's Collection"
            amount={fundMetrics.todayCollection}
            subtitle="Collected Today from Field"
            accentColor="#059669"
            iconName="collections"
            onPress={() => onNavigate && onNavigate('collections')}
          />
          <MetricCard
            title="This Month Collection"
            amount={fundMetrics.thisMonthCollection}
            subtitle="Cumulative Monthly Inflow"
            accentColor="#0284C7"
            iconName="calendar"
            onPress={() => onNavigate && onNavigate('reports')}
          />
          <MetricCard
            title="Lending Contract Fees"
            amount={fundMetrics.thisMonthIncome}
            subtitle="10% Weekly & 12.5% Daily Fees"
            accentColor="#7C3AED"
            iconName="reports"
            onPress={() => onNavigate && onNavigate('reports')}
          />
          <MetricCard
            title="Operating Expenses"
            amount={fundMetrics.thisMonthExpenses}
            subtitle="Transport, Staff & Office"
            accentColor="#DC2626"
            iconName="receipt"
            onPress={() => onNavigate && onNavigate('expenses')}
          />
          <MetricCard
            title="Net Operating Profit"
            amount={fundMetrics.netProfit}
            subtitle="Lending Income − Operating Expenses"
            accentColor="#059669"
            iconName="chart"
            trend="+Profit Margin"
            trendType="positive"
            onPress={() => onNavigate && onNavigate('reports')}
          />
        </View>
      </FadeInView>

      {/* Loan Status Snapshot */}
      <FadeInView delay={400}>
        <Text style={styles.sectionTitle}>Loan Portfolio Health</Text>
        <View style={styles.healthRow}>
          <View style={[styles.healthCard, { borderTopColor: '#2563EB' }]}>
            <Text style={styles.healthNum}>{fundMetrics.activeLoans}</Text>
            <Text style={styles.healthLabel}>Active Loans</Text>
          </View>
          <View style={[styles.healthCard, { borderTopColor: '#059669' }]}>
            <Text style={[styles.healthNum, { color: '#059669' }]}>{fundMetrics.completedLoans}</Text>
            <Text style={styles.healthLabel}>Completed</Text>
          </View>
          <View style={[styles.healthCard, { borderTopColor: '#DC2626' }]}>
            <Text style={[styles.healthNum, { color: '#DC2626' }]}>{fundMetrics.overdueLoans}</Text>
            <Text style={styles.healthLabel}>Overdue</Text>
          </View>
        </View>
      </FadeInView>

      {/* Super Admin Quick Navigation Controls */}
      <FadeInView delay={480}>
        <Text style={styles.sectionTitle}>Operational Hubs</Text>
        <View style={styles.controlsGrid}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => onNavigate && onNavigate('customers')} activeOpacity={0.7}>
            <Icon name="customers" size={20} color="#2563EB" />
            <Text style={styles.controlTitle}>Borrowers</Text>
            <Text style={styles.controlSub}>Profiles & Repeat Cycles</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => onNavigate && onNavigate('loans')} activeOpacity={0.7}>
            <Icon name="loans" size={20} color="#2563EB" />
            <Text style={styles.controlTitle}>Master Loans</Text>
            <Text style={styles.controlSub}>Weekly & Daily Portfolio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => onNavigate && onNavigate('fund')} activeOpacity={0.7}>
            <Icon name="fund" size={20} color="#2563EB" />
            <Text style={styles.controlTitle}>Central Vault</Text>
            <Text style={styles.controlSub}>Cash, Bank & Audit Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => onNavigate && onNavigate('reports')} activeOpacity={0.7}>
            <Icon name="reports" size={20} color="#2563EB" />
            <Text style={styles.controlTitle}>Executive Reports</Text>
            <Text style={styles.controlSub}>P&L, Cash Velocity & PAR</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 70 },
  roleBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roleEyebrow: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 0.8 },
  roleTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 3 },
  circCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  circHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  circHeading: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  circRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  circCol: { alignItems: 'center', flex: 1 },
  circLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  circVal: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  circSub: { fontSize: 11, color: '#64748B', marginTop: 10, textAlign: 'center', lineHeight: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 14, marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  metricsList: { gap: 6 },
  healthRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  healthCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  healthNum: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  healthLabel: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center', fontWeight: '600' },
  controlsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  controlTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 6 },
  controlSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
});

export default SuperAdminDashboard;
