import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import MetricCard from '../../components/common/MetricCard';
import Icon from '../../components/common/Icon';

const AdminFund = () => {
  const { fundMetrics, fundTransactions } = useApp();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredTransactions = fundTransactions.filter((t) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'COLLECTIONS') return t.type === 'COLLECTION';
    if (activeTab === 'DISBURSEMENTS') return t.type === 'LOAN_DISBURSEMENT';
    if (activeTab === 'CAPITAL') return t.type === 'CAPITAL_IN';
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Central Fund & Cash Position</Text>
        <Text style={styles.subtitle}>Real-time liquidity and capital recycling</Text>
      </View>

      {/* Primary Circulation Metrics */}
      <View style={styles.metricsRow}>
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
            title="Currently Lent"
            value={formatINR(fundMetrics.moneyCurrentlyLent)}
            change="Out with Borrowers"
            color="#2563EB"
            subtitle="Circulating Capital"
            iconName="repeat"
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Principal Recovered"
            value={formatINR(520000)}
            change="Recycled Capital"
            isPositive={true}
            color="#059669"
            subtitle="Re-lent into Market"
            iconName="check"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Lending Income"
            value={formatINR(fundMetrics.thisMonthIncome)}
            change="Earned Interest"
            isPositive={true}
            color="#7C3AED"
            subtitle="Gross Revenue"
            iconName="reports"
          />
        </View>
      </View>

      {/* The Core Circulation Engine Visualizer */}
      <View style={styles.circulationCard}>
        <Text style={styles.cardHeaderTitle}>CENTRAL FUND CIRCULATION EQUATION</Text>
        <Text style={styles.formulaText}>
          Capital + Collections + Income - Disbursements - Expenses = Available Cash
        </Text>

        <View style={styles.stepGrid}>
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepName}>Disburse</Text>
            <Text style={styles.stepSub}>Cash Out</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#2563EB" />
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepName}>Collect</Text>
            <Text style={styles.stepSub}>Principal+Fee</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#2563EB" />
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepName}>Replenish</Text>
            <Text style={styles.stepSub}>Vault In</Text>
          </View>
          <Icon name="arrow-right" size={14} color="#2563EB" />
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>4</Text>
            <Text style={styles.stepName}>Re-Lend</Text>
            <Text style={styles.stepSub}>Repeat</Text>
          </View>
        </View>
      </View>

      {/* Transaction Filter Tabs */}
      <View style={styles.tabBar}>
        {['ALL', 'COLLECTIONS', 'DISBURSEMENTS', 'CAPITAL'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <View style={styles.txListCard}>
        <Text style={styles.cardTitle}>Recent Ledger Transactions</Text>
        {filteredTransactions.map((tx) => {
          const isOut = tx.direction === 'OUT';
          return (
            <View key={tx.id} style={styles.txItem}>
              <View style={[styles.txIconBox, { backgroundColor: isOut ? '#FEF2F2' : '#ECFDF5' }]}>
                <Icon name={isOut ? "arrow-right" : "check"} size={14} color={isOut ? "#DC2626" : "#059669"} />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txSub}>{tx.date} • {tx.description || tx.type}</Text>
              </View>
              <Text style={[styles.txAmt, { color: isOut ? '#DC2626' : '#059669' }]}>
                {isOut ? '−' : '+'}{formatINR(tx.amount)}
              </Text>
            </View>
          );
        })}
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
    paddingBottom: 70,
  },
  header: {
    marginBottom: 16,
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
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricHalf: {
    flex: 1,
  },
  circulationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 4,
  },
  formulaText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  stepGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  stepName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  stepSub: {
    fontSize: 9,
    color: '#64748B',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  txListCard: {
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
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  txSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txAmt: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AdminFund;
