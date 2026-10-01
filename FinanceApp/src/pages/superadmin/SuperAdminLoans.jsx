import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import DisburseLoanModal from './modal/DisburseLoanModal';
import { Colors, Fonts } from '../../theme';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: Colors.purpleTintLightest, border: Colors.purpleBorderLight, text: Colors.primary },
    secondary: { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
    success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
    neutral: { bg: '#F1F5F9', border: '#CBD5E1', text: '#64748B' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  };
  const current = variantStyles[variant] || variantStyles.primary;

  return (
    <View style={[badgeStyles.badge, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[badgeStyles.text, { color: current.text }]}>{label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});

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
          <MaterialCommunityIcons name="magnify" size={18} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by loan #, borrower, or shop..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
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
            <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
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
            <View key={l.id || idx}>
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
                    {l.shop_name ? <Text style={styles.shopName}>{l.shop_name}</Text> : null}
                  </View>
                  <Badge
                    label={isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                    variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'primary'}
                  />
                </View>

                {/* Financial Summary */}
                <View style={styles.finRow}>
                  <View style={styles.finCol}>
                    <Text style={styles.finLbl}>Principal</Text>
                    <Text style={styles.finVal}>{formatINR(principal)}</Text>
                  </View>
                  <View style={styles.finCol}>
                    <Text style={styles.finLbl}>Income (15%)</Text>
                    <Text style={[styles.finVal, { color: '#059669' }]}>+{formatINR(income)}</Text>
                  </View>
                  <View style={styles.finCol}>
                    <Text style={styles.finLbl}>Total Repay</Text>
                    <Text style={styles.finVal}>{formatINR(totalRepay)}</Text>
                  </View>
                  <View style={styles.finCol}>
                    <Text style={styles.finLbl}>Outstanding</Text>
                    <Text style={[styles.finVal, { color: outstanding > 0 ? '#DC2626' : '#059669' }]}>
                      {formatINR(outstanding)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLbl}>Repayment Progress</Text>
                    <Text style={styles.progressPct}>{progress}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }, isCompleted && { backgroundColor: '#059669' }]} />
                  </View>
                </View>

                {/* Bottom Details */}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>
                    {freq} • {totalInst} Installments of {formatINR(instAmt)}
                  </Text>
                  <View style={styles.viewLinkRow}>
                    <Text style={styles.viewLink}>Inspect Loan</Text>
                    <MaterialCommunityIcons name="arrow-right" size={13} color="#2563EB" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
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
  container: { flex: 1, backgroundColor: Colors.background }, // Single uniform background
  topBar: { backgroundColor: Colors.background, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.lightGray400 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 38,
    color: '#0F172A',
    fontSize: 13,
    fontFamily: Fonts.gilroy.medium,
  },
  chipsScroll: { flexDirection: 'row', marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.backgroundContainer, marginRight: 8, borderWidth: 1, borderColor: Colors.lightGray400 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 11, fontWeight: '700', fontFamily: Fonts.gilroy.bold, color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontSize: 11, color: '#64748B', fontWeight: '700', fontFamily: Fonts.gilroy.bold },
  disburseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  disburseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Fonts.gilroy.bold,
  },
  listContent: { padding: 14, paddingBottom: 70 },
  card: {
    backgroundColor: Colors.backgroundContainer, // Gray card #F3F4F6
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.lightGray400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOverdue: { borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loanNumRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loanNum: { fontSize: 14, fontWeight: '800', fontFamily: Fonts.gilroy.bold, color: Colors.primary },
  repeatBadge: {
    backgroundColor: Colors.purpleTintLightest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  repeatBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700', fontFamily: Fonts.gilroy.bold },
  custName: { fontSize: 15, fontWeight: '800', fontFamily: Fonts.gilroy.bold, color: '#0F172A', marginTop: 2 },
  shopName: { fontSize: 11, color: '#64748B', fontFamily: Fonts.gilroy.regular },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.lightGray400 },
  subLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', fontFamily: Fonts.gilroy.medium },
  amountVal: { fontSize: 13, fontWeight: '800', fontFamily: Fonts.gilroy.bold, color: '#0F172A', marginTop: 2 },
  progressTrack: { height: 6, backgroundColor: Colors.white, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { fontSize: 10, color: '#64748B', fontFamily: Fonts.gilroy.regular },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.lightGray400 },
  scheduleMeta: { fontSize: 10, color: '#64748B', fontFamily: Fonts.gilroy.regular },
  viewLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewLink: { fontSize: 11, color: Colors.primary, fontWeight: '800', fontFamily: Fonts.gilroy.bold },
});

export default SuperAdminLoans;
