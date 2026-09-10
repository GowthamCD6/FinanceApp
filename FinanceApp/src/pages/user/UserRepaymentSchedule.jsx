import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';

const UserRepaymentSchedule = ({ onBack }) => {
  const { loans, customers } = useApp();

  const customer = customers.find((c) => ((c?.name || c?.full_name || '')).toLowerCase().includes('kumar')) || customers[0] || {};
  const userLoans = loans.filter((l) => (l.customerId || l.customer_id) === customer?.id);
  const activeLoan = userLoans.find((l) => l.status === 'ACTIVE') || userLoans[userLoans.length - 1];

  const schedule = activeLoan?.schedule || activeLoan?.installments || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top back action */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={14} color="#2563EB" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Repayment Schedule</Text>
        <Text style={styles.subtitle}>
          Loan #{activeLoan?.loanNumber || activeLoan?.loan_number || '004'} • {activeLoan?.type || activeLoan?.loan_type} Repayment Schedule
        </Text>
      </View>

      {/* Next Due Highlight Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerSub}>NEXT PAYMENT DUE</Text>
          <Text style={styles.bannerAmount}>₹2,000</Text>
          <Text style={styles.bannerDate}>Due on 15 Sep 2026</Text>
        </View>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Installment #3</Text>
        </View>
      </View>

      {/* SCHEDULE TABLE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Installment Timeline</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 0.8 }]}>Inst #</Text>
          <Text style={[styles.th, { flex: 1.8 }]}>Due Date</Text>
          <Text style={[styles.th, { flex: 1.4 }]}>Amount</Text>
          <Text style={[styles.th, { flex: 1.4, textAlign: 'right' }]}>Status</Text>
        </View>

        {/* Table Rows */}
        {schedule.length > 0 ? (
          schedule.map((row, idx) => {
            const instNum = row.installmentNumber || row.installment_number || (idx + 1);
            const dueDt = row.dueDate || row.due_date || '2026-09-15';
            const expAmt = row.expectedAmount !== undefined ? row.expectedAmount : (row.expected_amount || 2000);
            const isPaid = row.status === 'PAID';
            const isNext = instNum === 3;

            return (
              <View 
                key={row.id || instNum} 
                style={[
                  styles.tableRow, 
                  isNext && styles.nextTableRow,
                  isPaid && styles.paidTableRow
                ]}
              >
                <Text style={[styles.td, { flex: 0.8, fontWeight: '800', color: '#0F172A' }]}>
                  #{instNum}
                </Text>
                <Text style={[styles.td, { flex: 1.8, color: '#64748B' }]}>
                  {formatDate(dueDt)}
                </Text>
                <Text style={[styles.td, { flex: 1.4, fontWeight: '700', color: '#0F172A' }]}>
                  {formatINR(expAmt)}
                </Text>
                <View style={[styles.td, { flex: 1.4, alignItems: 'flex-end' }]}>
                  <Badge 
                    label={isPaid ? 'PAID' : isNext ? 'DUE SOON' : 'UPCOMING'} 
                    variant={isPaid ? 'success' : isNext ? 'warning' : 'neutral'} 
                    size="sm"
                  />
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No schedule generated.</Text>
        )}
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoTitleRow}>
          <Icon name="shield" size={14} color="#2563EB" />
          <Text style={styles.infoTitle}>Payment Tip</Text>
        </View>
        <Text style={styles.infoText}>
          Paying on or before the due date keeps your credit score pristine and unlocks higher loan amounts for your next cycle.
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
    paddingBottom: 70,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
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
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  bannerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },
  bannerAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  bannerDate: {
    fontSize: 12,
    color: '#475569',
  },
  bannerTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nextTableRow: {
    backgroundColor: 'rgba(217, 119, 6, 0.06)',
  },
  paidTableRow: {
    backgroundColor: 'rgba(5, 150, 105, 0.03)',
  },
  td: {
    fontSize: 12,
  },
  noDataText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});

export default UserRepaymentSchedule;
