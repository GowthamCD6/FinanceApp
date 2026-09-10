import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { formatINR } from '../utils/helpers';
import { FadeInView } from '../animations/FadeInView';
import { DisburseLoanModal } from '../components/modals/DisburseLoanModal';
import { Button } from '../components/common/Button';

interface DashboardScreenProps {
  onNavigateTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const { metrics, fundAccounts, currentUser, resetDemoData } = useApp();
  const [showDisburseModal, setShowDisburseModal] = useState<boolean>(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. The Central Circulation Status Banner */}
      <FadeInView delay={100}>
        <View style={styles.circulationBanner}>
          <View style={styles.circHeader}>
            <View>
              <Text style={styles.circEyebrow}>CENTRAL FUND CIRCULATION</Text>
              <Text style={styles.circTitle}>Recycling Capital Pool</Text>
            </View>
            <Badge label={`Velocity: ${metrics.circulationVelocity}x`} variant="primary" />
          </View>

          {/* Circulation Flow Diagram */}
          <View style={styles.flowContainer}>
            <View style={styles.flowNode}>
              <Text style={styles.flowIcon}>💰</Text>
              <Text style={styles.flowLabel}>Available Cash</Text>
              <Text style={styles.flowVal}>{formatINR(metrics.availableCash)}</Text>
            </View>

            <Text style={styles.flowArrow}>➔</Text>

            <View style={styles.flowNode}>
              <Text style={styles.flowIcon}>📑</Text>
              <Text style={styles.flowLabel}>Lent Principal</Text>
              <Text style={[styles.flowVal, { color: colors.secondaryDark }]}>
                {formatINR(metrics.outstandingPrincipal)}
              </Text>
            </View>

            <Text style={styles.flowArrow}>➔</Text>

            <View style={styles.flowNode}>
              <Text style={styles.flowIcon}>🔄</Text>
              <Text style={styles.flowLabel}>Recovered</Text>
              <Text style={[styles.flowVal, { color: colors.successText }]}>
                {formatINR(metrics.principalRecovered)}
              </Text>
            </View>
          </View>

          <Text style={styles.circExplainer}>
            Principal repayments continuously return to Available Cash for subsequent lending.
          </Text>
        </View>
      </FadeInView>

      {/* 2. Primary 5 Financial Numbers */}
      <FadeInView delay={200}>
        <Text style={styles.sectionHeading}>The Core Financial Ledger</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Available Cash"
            amount={metrics.availableCash}
            subtitle="Cash in Drawer + Bank + UPI"
            accentColor={colors.primaryDark}
            icon="💵"
            onPress={() => onNavigateTab('ledger')}
          />
          <MetricCard
            title="Outstanding Principal"
            amount={metrics.outstandingPrincipal}
            subtitle="Money Currently in Market"
            accentColor={colors.secondary}
            icon="🤝"
            onPress={() => onNavigateTab('loans')}
          />
          <MetricCard
            title="Lending Contract Income"
            amount={metrics.monthlyIncome}
            subtitle="Gross Income Earned"
            accentColor={colors.accent}
            icon="📈"
            trend="+100% Recycled"
            trendType="positive"
            onPress={() => onNavigateTab('reports')}
          />
          <MetricCard
            title="Operational Expenses"
            amount={metrics.monthlyExpenses}
            subtitle="Salaries, Transit & Rent"
            accentColor={colors.danger}
            icon="💸"
            onPress={() => onNavigateTab('ledger')}
          />
          <MetricCard
            title="Net Profit"
            amount={metrics.netProfit}
            subtitle="Lending Income − Operating Expenses"
            accentColor={metrics.netProfit >= 0 ? colors.success : colors.danger}
            icon="🏆"
            trend={metrics.netProfit >= 0 ? 'Surplus' : 'Deficit'}
            trendType={metrics.netProfit >= 0 ? 'positive' : 'negative'}
            onPress={() => onNavigateTab('reports')}
          />
        </View>
      </FadeInView>

      {/* 3. Quick Action Hub */}
      <FadeInView delay={300}>
        <Text style={styles.sectionHeading}>Quick Operations</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}
            onPress={() => setShowDisburseModal(true)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionTitle}>Disburse Loan</Text>
            <Text style={styles.actionSub}>Weekly or Daily advance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => onNavigateTab('route')}
          >
            <Text style={styles.actionIcon}>🛵</Text>
            <Text style={styles.actionTitle}>Daily Route</Text>
            <Text style={styles.actionSub}>Collect installments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}
            onPress={() => onNavigateTab('customers')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>Repeat Limits</Text>
            <Text style={styles.actionSub}>Check client eligibility</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
            onPress={() => onNavigateTab('ledger')}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionTitle}>Cash Drawer</Text>
            <Text style={styles.actionSub}>Daily reconciliation</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* 4. Fund Accounts Breakdown */}
      <FadeInView delay={400}>
        <Text style={styles.sectionHeading}>Active Cash Vaults & Wallets</Text>
        <View style={styles.accountsCard}>
          {fundAccounts.map((acc, index) => (
            <View
              key={acc.id}
              style={[
                styles.accountRow,
                index < fundAccounts.length - 1 && styles.accountBorder,
              ]}
            >
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{acc.account_name}</Text>
                <Badge label={acc.account_type} size="sm" variant="neutral" />
              </View>
              <Text style={styles.accountBalance}>{formatINR(acc.balance)}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Loan Disbursement Modal */}
      <DisburseLoanModal
        visible={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        onSuccess={() => onNavigateTab('loans')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  circulationBanner: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  circHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  circEyebrow: {
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    color: '#38BDF8',
    letterSpacing: 1,
  },
  circTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  flowNode: {
    alignItems: 'center',
    flex: 1,
  },
  flowIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  flowLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  flowVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#38BDF8',
    marginTop: 2,
  },
  flowArrow: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 4,
  },
  circExplainer: {
    fontSize: typography.sizes.xs,
    color: '#94A3B8',
    marginTop: spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionHeading: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  metricsGrid: {
    gap: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  accountsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accountBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#1E293B',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
  },
});
