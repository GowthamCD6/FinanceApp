import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { FadeInView } from '../../animations/FadeInView';
import DisburseLoanModal from '../../components/modals/DisburseLoanModal';
import Icon from '../../components/common/Icon';

export const SuperAdminLoans = ({ onSelectLoan }) => {
  const { loans } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  const filteredLoans = loans.filter((l) => {
    if (filter === 'WEEKLY' && (l.loan_type !== 'WEEKLY' && l.type !== 'WEEKLY')) return false;
    if (filter === 'DAILY' && (l.loan_type !== 'DAILY' && l.type !== 'DAILY')) return false;
    if (filter === 'ACTIVE' && l.status !== 'ACTIVE') return false;
    if (filter === 'COMPLETED' && l.status !== 'COMPLETED') return false;
    if (filter === 'OVERDUE' && l.status !== 'OVERDUE') return false;
    if (filter === 'REPEAT' && !l.parent_loan_id && !l.parentLoanId) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const numMatch = (l.loan_number || l.loanNumber || '').toLowerCase().includes(q);
      const custMatch = (l.customer_name || l.customerName || '').toLowerCase().includes(q);
      const shopMatch = (l.shop_name || '').toLowerCase().includes(q);
      return numMatch || custMatch || shopMatch;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search and Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Icon name="search" size={15} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by loan #, borrower, or shop..."
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

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {[
            { key: 'ALL', label: 'All Loans' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'WEEKLY', label: 'Weekly (10 Wks)' },
            { key: 'DAILY', label: 'Daily (25 Days)' },
            { key: 'OVERDUE', label: 'Overdue' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'REPEAT', label: 'Repeat Cycles' },
          ].map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.actionRow}>
          <Text style={styles.countText}>{filteredLoans.length} Loans Listed</Text>
          <TouchableOpacity 
            style={styles.disburseBtn} 
            onPress={() => setShowDisburseModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.disburseBtnText}>Disburse Loan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loans List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredLoans.map((l, idx) => {
          const isCompleted = l.status === 'COMPLETED';
          const isOverdue = l.status === 'OVERDUE';
          const totalRepay = l.total_repayment_amount !== undefined ? l.total_repayment_amount : (l.totalRepayment || 1);
          const totalPaid = l.total_paid !== undefined ? l.total_paid : (l.paidAmount || 0);
          const outstanding = l.outstanding_amount !== undefined ? l.outstanding_amount : (l.remainingAmount || Math.max(0, totalRepay - totalPaid));
          const principal = l.principal_amount !== undefined ? l.principal_amount : (l.principal || 0);
          const income = l.contracted_income_amount !== undefined ? l.contracted_income_amount : (l.lendingIncome || 0);
          const loanNum = l.loan_number || l.loanNumber || `#00${idx + 1}`;
          const custName = l.customer_name || l.customerName || 'Customer';
          const instAmt = l.installment_amount || l.installmentAmount || 0;
          const totalInst = l.total_installments || l.duration || 10;
          const freq = l.repayment_frequency || l.type || 'WEEKLY';

          const progress = totalRepay > 0 
            ? Math.min(100, Math.round((totalPaid / totalRepay) * 100))
            : 0;

          return (
            <FadeInView key={l.id || idx} delay={idx * 30}>
              <TouchableOpacity
                style={[styles.card, isOverdue && styles.cardOverdue]}
                onPress={() => onSelectLoan && onSelectLoan(l.id || l)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.loanNumRow}>
                      <Text style={styles.loanNum}>{loanNum}</Text>
                      {(l.parent_loan_id || l.parentLoanId) && (
                        <View style={styles.repeatBadge}>
                          <Text style={styles.repeatBadgeText}>Repeat of #{l.parent_loan_id || l.parentLoanId}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.custName}>{custName}</Text>
                    {l.shop_name && <Text style={styles.shopName}>{l.shop_name}</Text>}
                  </View>
                  <Badge
                    label={l.status || 'ACTIVE'}
                    variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'primary'}
                    size="sm"
                  />
                </View>

                {/* Amount Row */}
                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.subLabel}>Principal</Text>
                    <Text style={styles.amountVal}>{formatINR(principal)}</Text>
                  </View>
                  <View>
                    <Text style={styles.subLabel}>Lending Fee</Text>
                    <Text style={[styles.amountVal, { color: '#059669' }]}>
                      +{formatINR(income)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.subLabel}>Total Contract</Text>
                    <Text style={[styles.amountVal, { color: '#2563EB' }]}>
                      {formatINR(totalRepay)}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isCompleted ? '#059669' : '#2563EB' }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>
                    {progress}% Recovered ({formatINR(totalPaid)})
                  </Text>
                  <Text style={[styles.progressText, { fontWeight: '700', color: outstanding > 0 ? '#D97706' : '#059669' }]}>
                    Remaining: {formatINR(outstanding)}
                  </Text>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.scheduleMeta}>
                    {freq} • {totalInst} Installments of {formatINR(instAmt)}
                  </Text>
                  <View style={styles.viewLinkRow}>
                    <Text style={styles.viewLink}>Inspect Loan</Text>
                    <Icon name="arrow-right" size={11} color="#2563EB" />
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
      </ScrollView>

      <DisburseLoanModal
        visible={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        onSuccess={() => setShowDisburseModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { backgroundColor: '#FFFFFF', padding: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 38,
    color: '#0F172A',
    fontSize: 13,
  },
  chipsScroll: { flexDirection: 'row', marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  disburseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  disburseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: { padding: 14, paddingBottom: 70 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOverdue: { borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loanNumRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loanNum: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  repeatBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  repeatBadgeText: { fontSize: 10, color: '#7C3AED', fontWeight: '700' },
  custName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  shopName: { fontSize: 11, color: '#64748B' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  subLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase' },
  amountVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { fontSize: 10, color: '#64748B' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  scheduleMeta: { fontSize: 10, color: '#64748B' },
  viewLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewLink: { fontSize: 11, color: '#2563EB', fontWeight: '800' },
});

export default SuperAdminLoans;
