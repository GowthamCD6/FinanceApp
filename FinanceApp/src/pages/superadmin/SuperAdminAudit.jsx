import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';

const SuperAdminAudit = ({ onBack, initialFilterQuery = '' }) => {
  const { fundTransactions, fundMetrics } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState(initialFilterQuery);

  const filterChips = [
    { key: 'ALL', label: 'All Activity' },
    { key: 'COLLECTION', label: 'Collections' },
    { key: 'LOAN_DISBURSEMENT', label: 'Disbursements' },
    { key: 'CAPITAL_IN', label: 'Capital Inflow' },
    { key: 'EXPENSE', label: 'Expenses' },
  ];

  const filteredTx = fundTransactions.filter((tx) => {
    if (filter !== 'ALL') {
      if (filter === 'COLLECTION' && tx.type !== 'COLLECTION') return false;
      if (filter === 'LOAN_DISBURSEMENT' && tx.type !== 'LOAN_DISBURSEMENT') return false;
      if (filter === 'CAPITAL_IN' && tx.type !== 'CAPITAL_IN') return false;
      if (filter === 'EXPENSE' && tx.type !== 'EXPENSE') return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = (tx.title || '').toLowerCase().includes(q);
      const descMatch = (tx.description || '').toLowerCase().includes(q);
      const methodMatch = (tx.paymentMethod || '').toLowerCase().includes(q);
      return titleMatch || descMatch || methodMatch;
    }
    return true;
  });

  const totalIn = fundTransactions
    .filter((tx) => tx.direction === 'IN')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalOut = fundTransactions
    .filter((tx) => tx.direction === 'OUT')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={13} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back to Fund</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central Audit Ledger</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>IMMUTABLE</Text>
        </View>
      </View>

      {/* KPI Flow Banner */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
          <Text style={styles.kpiLabel}>Total Inflows</Text>
          <Text style={[styles.kpiValue, { color: '#059669' }]}>+{formatINR(totalIn)}</Text>
          <Text style={styles.kpiSub}>Capital + Recoveries</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
          <Text style={styles.kpiLabel}>Total Outflows</Text>
          <Text style={[styles.kpiValue, { color: '#DC2626' }]}>−{formatINR(totalOut)}</Text>
          <Text style={styles.kpiSub}>Loans + Expenses</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={15} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by loan #, borrower, or note..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={14} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Scroll */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {filterChips.map((chip) => {
            const active = filter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(chip.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transaction Feed */}
      <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCountText}>{filteredTx.length} Transactions Recorded</Text>

        {filteredTx.map((tx, idx) => {
          const isIn = tx.direction === 'IN';
          const isCapital = tx.type === 'CAPITAL_IN';
          const isCollection = tx.type === 'COLLECTION';
          const isDisbursement = tx.type === 'LOAN_DISBURSEMENT';

          return (
            <View key={tx.id || idx} style={[styles.txCard, isIn ? styles.txCardIn : styles.txCardOut]}>
              <View style={styles.txTopRow}>
                <View style={styles.txTypeRow}>
                  <View style={[styles.txIconBox, { backgroundColor: isIn ? '#EFF6FF' : '#FEF2F2' }]}>
                    <Icon
                      name={isCapital ? 'fund' : isCollection ? 'collections' : isDisbursement ? 'loans' : 'receipt'}
                      size={15}
                      color={isIn ? '#2563EB' : '#DC2626'}
                    />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{tx.title || 'Central Fund Entry'}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.date || '2026-09-08')} • Ref #{tx.id}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, { color: isIn ? '#059669' : '#DC2626' }]}>
                    {isIn ? '+' : '−'}{formatINR(tx.amount || 0)}
                  </Text>
                  <Badge 
                    label={tx.paymentMethod || (isDisbursement ? 'CASH/BANK' : 'CASH')} 
                    variant="neutral" 
                    size="sm" 
                  />
                </View>
              </View>

              {/* Description & Component breakdown */}
              {tx.description && (
                <Text style={styles.txDesc}>{tx.description}</Text>
              )}

              {isCollection && (tx.principal !== undefined || tx.income !== undefined) && (
                <View style={styles.splitRow}>
                  <Text style={styles.splitText}>
                    Principal Recycled: <Text style={{ color: '#059669', fontWeight: '700' }}>+{formatINR(tx.principal || 0)}</Text>
                  </Text>
                  <Text style={styles.splitText}>
                    Fee Income: <Text style={{ color: '#2563EB', fontWeight: '700' }}>+{formatINR(tx.income || 0)}</Text>
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInput: {
    flex: 1,
    height: 38,
    color: '#0F172A',
    fontSize: 13,
  },
  chipsContainer: {
    marginVertical: 6,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  feedContent: {
    padding: 16,
    paddingBottom: 70,
  },
  resultCountText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '700',
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  txCardIn: {
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  txCardOut: {
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  txDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  txDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    paddingTop: 4,
  },
  splitText: {
    fontSize: 10,
    color: '#64748B',
  },
});

export default SuperAdminAudit;
