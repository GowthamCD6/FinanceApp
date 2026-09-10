import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import MetricCard from '../../components/common/MetricCard';
import Icon from '../../components/common/Icon';
import DigitalReceiptModal from '../../components/modals/DigitalReceiptModal';

const UserDashboard = ({ onNavigate }) => {
  const { 
    loans = [], 
    customers = [], 
    customerPortalStats = {}, 
    payCustomerNextDue 
  } = useApp();

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  // Customer Kumar ('cust-1') data
  const customer = customers.find((c) => (c.name || c.full_name || '').toLowerCase().includes('kumar')) || customers[0];
  const userLoans = loans.filter((l) => (l.customerId || l.customer_id) === customer?.id);
  const activeLoan = userLoans.find((l) => l.status === 'ACTIVE') || userLoans[userLoans.length - 1];

  // Reactive stats from AppContext
  const totalLoanTaken = customerPortalStats.totalLoanTaken || 50000;
  const totalPaid = customerPortalStats.totalPaid || 32000;
  const remaining = customerPortalStats.remaining !== undefined ? customerPortalStats.remaining : 18000;
  const nextPayment = customerPortalStats.nextPayment !== undefined ? customerPortalStats.nextPayment : 2000;
  const dueDate = customerPortalStats.dueDate || '15 Sep 2026';
  const progressPercent = customerPortalStats.progress || Math.round((totalPaid / totalLoanTaken) * 100);

  const handlePay = (method = 'UPI') => {
    if (remaining <= 0) {
      Alert.alert('Loan Cleared', 'Your loan has been fully settled! No pending installments.');
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      try {
        const res = payCustomerNextDue(method);
        setIsPaying(false);

        if (res && res.success) {
          setActiveReceipt({
            receiptNumber: res.receiptNumber,
            customerName: customer?.full_name || customer?.name || 'Kumar',
            loanNumber: activeLoan?.loanNumber || activeLoan?.loan_number || 'LN-004',
            amount: res.amount,
            paymentMethod: method,
            date: res.date,
            principal: Math.round(res.amount * 0.9),
            income: Math.round(res.amount * 0.1),
          });
        }
      } catch (err) {
        setIsPaying(false);
        Alert.alert('Error', 'Payment processing failed. Please try again.');
      }
    }, 400);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Personalized Greeting */}
      <View style={styles.greetingBox}>
        <View>
          <Text style={styles.greetingSubtitle}>BORROWER PORTAL</Text>
          <Text style={styles.greetingTitle}>Good Morning, Kumar</Text>
          <Text style={styles.greetingMeta}>Phone: +91 98765 43210 • Common Customer</Text>
        </View>
        <View style={styles.activeTag}>
          <Text style={styles.activeTagText}>
            {remaining > 0 ? 'Active Borrower' : 'Fully Settled'}
          </Text>
        </View>
      </View>

      {/* LOAN SUMMARY METRICS */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Total Loan Taken"
            value={formatINR(totalLoanTaken)}
            change="Across cycles #001-#004"
            color="#2563EB"
            iconName="loans"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Total Repaid"
            value={formatINR(totalPaid)}
            change="Re-circulated to fund"
            isPositive={true}
            color="#059669"
            iconName="check"
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Remaining Balance"
            value={formatINR(remaining)}
            change="Active loan dues"
            isPositive={false}
            color="#D97706"
            iconName="receipt"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Next Installment"
            value={formatINR(nextPayment)}
            change={`Due: ${dueDate}`}
            color="#7C3AED"
            iconName="calendar"
          />
        </View>
      </View>

      {/* QUICK PAYMENT ACTION CARD */}
      {remaining > 0 && (
        <View style={styles.paymentActionCard}>
          <View style={styles.payHeader}>
            <View>
              <Text style={styles.payHeaderSub}>FAST REPAYMENT</Text>
              <Text style={styles.payHeaderTitle}>Pay Due Installment ({formatINR(nextPayment)})</Text>
            </View>
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>Due: {dueDate}</Text>
            </View>
          </View>

          <Text style={styles.payPromptText}>
            Payments are instantly credited to the Central Fund pool and generate an official digital receipt.
          </Text>

          <View style={styles.payBtnRow}>
            <TouchableOpacity
              style={[styles.payBtn, styles.payBtnUPI]}
              disabled={isPaying}
              onPress={() => handlePay('UPI')}
              activeOpacity={0.8}
            >
              <View style={styles.btnContent}>
                <Text style={styles.payBtnText}>
                  {isPaying ? 'Processing...' : `Pay ${formatINR(nextPayment)} via UPI`}
                </Text>
                <Text style={styles.payBtnSubText}>GPay / PhonePe / Paytm</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.payBtn, styles.payBtnCash]}
              disabled={isPaying}
              onPress={() => handlePay('CASH')}
              activeOpacity={0.8}
            >
              <View style={styles.btnContent}>
                <Text style={styles.payBtnTextCash}>Record Cash</Text>
                <Text style={styles.payBtnSubTextCash}>Handed to Collector</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PAYMENT PROGRESS CARD */}
      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.cardTitle}>Repayment Progress</Text>
          <Text style={styles.progressPercentage}>{progressPercent}%</Text>
        </View>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelLeft}>Paid: {formatINR(totalPaid)}</Text>
          <Text style={styles.progressLabelRight}>Total: {formatINR(totalLoanTaken)}</Text>
        </View>

        <Text style={styles.progressNote}>
          Timely payments build your credit score, making you eligible for higher repeat loan limits up to ₹1,00,000.
        </Text>
      </View>

      {/* ACTIVE LOAN SNAPSHOT */}
      <View style={styles.card}>
        <View style={styles.activeLoanHeader}>
          <View>
            <Text style={styles.activeLoanTag}>CURRENT RUNNING LOAN</Text>
            <Text style={styles.activeLoanNumber}>Loan #{activeLoan?.loanNumber || activeLoan?.loan_number || '004'}</Text>
          </View>
          <View style={[styles.statusBadge, remaining === 0 && { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.statusBadgeText, remaining === 0 && { color: '#059669' }]}>
              {remaining > 0 ? 'ACTIVE' : 'COMPLETED'}
            </Text>
          </View>
        </View>

        <View style={styles.activeLoanDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Loan Amount:</Text>
            <Text style={styles.detailVal}>{formatINR(activeLoan?.principal || activeLoan?.principal_amount || 40000)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Installment Type:</Text>
            <Text style={styles.detailVal}>Weekly ({activeLoan?.duration || activeLoan?.total_installments || 10} Weeks)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Next Due Amount:</Text>
            <Text style={[styles.detailVal, { color: '#2563EB', fontWeight: '800' }]}>{formatINR(nextPayment)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Next Due Date:</Text>
            <Text style={[styles.detailVal, { color: '#D97706', fontWeight: '800' }]}>{dueDate}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.scheduleActionBtn}
          onPress={() => onNavigate && onNavigate('schedule')}
          activeOpacity={0.8}
        >
          <Text style={styles.scheduleActionBtnText}>View Full Repayment Schedule</Text>
          <Icon name="arrow-right" size={13} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* QUICK LINKS */}
      <View style={styles.quickGrid}>
        <TouchableOpacity 
          style={styles.quickBtn}
          onPress={() => onNavigate && onNavigate('loans')}
          activeOpacity={0.8}
        >
          <View style={styles.quickIconBox}>
            <Icon name="loans" size={16} color="#2563EB" />
          </View>
          <Text style={styles.quickBtnTitle}>My Loan Cycles</Text>
          <Text style={styles.quickBtnSub}>View #001 to #004 history</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickBtn}
          onPress={() => onNavigate && onNavigate('payments')}
          activeOpacity={0.8}
        >
          <View style={styles.quickIconBox}>
            <Icon name="receipt" size={16} color="#059669" />
          </View>
          <Text style={styles.quickBtnTitle}>Payment Receipts</Text>
          <Text style={styles.quickBtnSub}>Digital vouchers & history</Text>
        </TouchableOpacity>
      </View>

      {/* DIGITAL RECEIPT MODAL */}
      <DigitalReceiptModal
        visible={!!activeReceipt}
        receiptData={activeReceipt}
        onClose={() => setActiveReceipt(null)}
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
    padding: 16,
    paddingBottom: 70,
  },
  greetingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  greetingSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  greetingMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  activeTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricHalf: {
    flex: 1,
  },
  paymentActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  payHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payHeaderSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },
  payHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dueBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  payPromptText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  payBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  payBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnUPI: {
    flex: 3,
    backgroundColor: '#2563EB',
  },
  payBtnCash: {
    flex: 2,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnContent: {
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  payBtnSubText: {
    color: '#BFDBFE',
    fontSize: 10,
    marginTop: 2,
  },
  payBtnTextCash: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  payBtnSubTextCash: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  barBackground: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabelLeft: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  progressLabelRight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressNote: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  activeLoanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activeLoanTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  activeLoanNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  activeLoanDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 12,
    color: '#64748B',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  scheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  scheduleActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
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
  quickIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  quickBtnSub: {
    fontSize: 11,
    color: '#64748B',
  },
});

export default UserDashboard;
