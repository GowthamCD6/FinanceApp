import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';

const UserMyLoans = ({ onSelectLoan }) => {
  const { loans, customers } = useApp();

  // Kumar's loans
  const customer = customers.find((c) => ((c?.name || c?.full_name || '')).toLowerCase().includes('kumar')) || customers[0] || {};
  const userLoans = loans.filter((l) => (l.customerId || l.customer_id) === customer?.id);

  const activeLoans = userLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const completedLoans = userLoans.filter((l) => l.status === 'COMPLETED');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Loans</Text>
        <Text style={styles.subtitle}>Active borrowings and past completed loan cycles</Text>
      </View>

      {/* ACTIVE LOANS */}
      <Text style={styles.sectionHeader}>Current Active Loan</Text>
      {activeLoans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>You currently have no active loan.</Text>
        </View>
      ) : (
        activeLoans.map((loan) => (
          <TouchableOpacity 
            key={loan.id} 
            style={[styles.loanCard, styles.activeCard]}
            onPress={() => onSelectLoan && onSelectLoan(loan.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.loanNumber}>Loan #{loan.loanNumber || loan.loan_number || '004'}</Text>
                <Text style={styles.loanType}>{loan.type || loan.loan_type} Loan ({loan.duration || loan.total_installments} {loan.type === 'WEEKLY' ? 'Weeks' : 'Days'})</Text>
              </View>
              <Badge label={loan.status} variant="primary" />
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Borrowed Amount</Text>
                <Text style={styles.statVal}>{formatINR(loan.principal || loan.principal_amount)}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Total Repayment</Text>
                <Text style={styles.statVal}>{formatINR(loan.totalRepayment || loan.total_repayment_amount)}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Remaining Dues</Text>
                <Text style={[styles.statVal, { color: '#D97706' }]}>
                  {formatINR(loan.remainingAmount || loan.outstanding_amount || ((loan.totalRepayment || loan.total_repayment_amount) - (loan.paidAmount || loan.total_paid || 0)))}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.paidSummary}>
                Paid: {formatINR(loan.paidAmount || loan.total_paid || 0)} of {formatINR(loan.totalRepayment || loan.total_repayment_amount)}
              </Text>
              <View style={styles.viewRow}>
                <Text style={styles.viewLink}>View Schedule</Text>
                <Icon name="arrow-right" size={12} color="#2563EB" />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* PREVIOUS COMPLETED LOANS (#001, #002, #003) */}
      <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Previous Completed Loans</Text>
      {completedLoans.map((loan, idx) => (
        <View key={loan.id} style={styles.loanCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.loanNumber}>Loan #{loan.loanNumber || loan.loan_number || `00${idx + 1}`}</Text>
              <Text style={styles.loanType}>{loan.type || loan.loan_type} Loan ({loan.duration || loan.total_installments} {loan.type === 'WEEKLY' ? 'Weeks' : 'Days'})</Text>
            </View>
            <Badge label="COMPLETED" variant="success" />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Principal</Text>
              <Text style={styles.statVal}>{formatINR(loan.principal || loan.principal_amount)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Repaid</Text>
              <Text style={[styles.statVal, { color: '#059669' }]}>{formatINR(loan.totalRepayment || loan.total_repayment_amount)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Performance</Text>
              <Text style={[styles.statVal, { color: '#059669' }]}>100% Paid</Text>
            </View>
          </View>
        </View>
      ))}
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  loanType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidSummary: {
    fontSize: 11,
    color: '#64748B',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewLink: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});

export default UserMyLoans;
