import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import AdjustCreditLimitModal from '../../components/modals/AdjustCreditLimitModal';

const SuperAdminCustomerDetail = ({ customerId, onBack, onNavigateToLoan }) => {
  const { customers, loans } = useApp();

  const customer = customers.find((c) => c.id === customerId) || customers[0] || { name: 'Customer', phone: '9876543210' };
  const [creditLimit, setCreditLimit] = useState(customer?.credit_limit || 50000);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [customerStatus, setCustomerStatus] = useState(customer?.status || 'ACTIVE');

  // All loans associated with this borrower
  const customerLoans = loans.filter((l) => (l.customer_id || l.customerId) === customer?.id);

  const totalBorrowed = customerLoans.reduce((sum, l) => sum + (l.principal_amount !== undefined ? l.principal_amount : (l.principal || 0)), 0);
  const totalRepaid = customerLoans.reduce((sum, l) => sum + (l.total_paid !== undefined ? l.total_paid : (l.paidAmount || 0)), 0);
  const totalOutstanding = customerLoans.reduce((sum, l) => sum + (l.outstanding_amount !== undefined ? l.outstanding_amount : (l.remainingAmount || 0)), 0);
  const totalProfitEarned = customerLoans.reduce((sum, l) => sum + (l.total_income_collected !== undefined ? l.total_income_collected : (l.incomeCollected || 0)), 0);

  const toggleCustomerStatus = () => {
    const nextStatus = customerStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    Alert.alert(
      'Update Borrower Status',
      `Are you sure you want to change status to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setCustomerStatus(nextStatus);
            Alert.alert('Status Updated', `Borrower status updated to ${nextStatus}.`);
          },
        },
      ]
    );
  };

  const isShopkeeper = customer.customer_type === 'SHOPKEEPER';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={13} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back to Borrowers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.statusToggleBtn, { backgroundColor: customerStatus === 'ACTIVE' ? '#FEF2F2' : '#ECFDF5', borderColor: customerStatus === 'ACTIVE' ? '#FEE2E2' : '#A7F3D0' }]}
          onPress={toggleCustomerStatus}
          activeOpacity={0.7}
        >
          <Text style={[styles.statusToggleText, { color: customerStatus === 'ACTIVE' ? '#DC2626' : '#059669' }]}>
            {customerStatus === 'ACTIVE' ? 'Block Borrower' : 'Unblock Borrower'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarBox, { backgroundColor: isShopkeeper ? '#EFF6FF' : '#F1F5F9' }]}>
            <Icon name={isShopkeeper ? 'shop' : 'user'} size={20} color={isShopkeeper ? '#2563EB' : '#64748B'} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.customerName}>{customer.name || customer.full_name}</Text>
              <Badge 
                label={customerStatus} 
                variant={customerStatus === 'ACTIVE' ? 'success' : 'danger'} 
                size="sm"
              />
            </View>
            <Text style={styles.customerType}>
              {isShopkeeper ? 'Shopkeeper Merchant (Daily 25 Days)' : 'Regular Client (Weekly 10 Wks)'}
            </Text>
            <Text style={styles.contactText}>Phone: {customer.phone} • {customer.city || 'Ahmedabad'}</Text>
          </View>
        </View>

        {customer.shop_name && (
          <View style={styles.shopBox}>
            <Text style={styles.shopLabel}>Shop Name:</Text>
            <Text style={styles.shopVal}>{customer.shop_name}</Text>
          </View>
        )}
      </View>

      {/* Financial Exposure & Profit Contribution */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>LIFETIME METRICS</Text>
        <Text style={styles.sectionTitle}>Borrower Financial Contribution</Text>

        <View style={styles.grid2x2}>
          <View style={styles.metricBox}>
            <Text style={styles.mLabel}>Total Borrowed</Text>
            <Text style={styles.mVal}>{formatINR(totalBorrowed)}</Text>
            <Text style={styles.mSub}>{customerLoans.length} Loans Issued</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.mLabel}>Total Repaid</Text>
            <Text style={[styles.mVal, { color: '#059669' }]}>{formatINR(totalRepaid)}</Text>
            <Text style={styles.mSub}>Principal + Fees</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.mLabel}>Current Outstanding</Text>
            <Text style={[styles.mVal, { color: totalOutstanding > 0 ? '#D97706' : '#64748B' }]}>
              {formatINR(totalOutstanding)}
            </Text>
            <Text style={styles.mSub}>Active Dues</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.mLabel}>Profit Contributed</Text>
            <Text style={[styles.mVal, { color: '#2563EB' }]}>+{formatINR(totalProfitEarned)}</Text>
            <Text style={styles.mSub}>To Central Fund</Text>
          </View>
        </View>
      </View>

      {/* Credit Governance & Limits */}
      <View style={styles.sectionCard}>
        <View style={styles.limitHeaderRow}>
          <View>
            <Text style={styles.sectionEyebrow}>CREDIT LINE GOVERNANCE</Text>
            <Text style={styles.sectionTitle}>Authorized Credit Facility</Text>
          </View>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => setShowLimitModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Adjust Limit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.limitDisplayBox}>
          <Text style={styles.limitDisplayText}>{formatINR(creditLimit)}</Text>
          <Text style={styles.limitDisplaySub}>
            Available Limit: {formatINR(Math.max(0, creditLimit - totalOutstanding))}
          </Text>
        </View>
      </View>

      {/* Complete Loan Lifecycle Chain */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>LOAN LIFECYCLE HISTORY</Text>
        <Text style={styles.sectionTitle}>Borrowing Progression Chains</Text>

        {customerLoans.length === 0 ? (
          <Text style={styles.emptyText}>No loans recorded for this borrower.</Text>
        ) : (
          customerLoans.map((l, idx) => {
            const isCompleted = l.status === 'COMPLETED';
            const isOverdue = l.status === 'OVERDUE';
            const loanNum = l.loan_number || l.loanNumber || `#00${idx + 1}`;
            const princ = l.principal_amount !== undefined ? l.principal_amount : (l.principal || 0);
            const repay = l.total_repayment_amount !== undefined ? l.total_repayment_amount : (l.totalRepayment || 1);
            const paid = l.total_paid !== undefined ? l.total_paid : (l.paidAmount || 0);

            return (
              <TouchableOpacity
                key={l.id || idx}
                style={[styles.loanCard, isOverdue && styles.loanCardOverdue]}
                onPress={() => onNavigateToLoan && onNavigateToLoan(l.id || l)}
                activeOpacity={0.7}
              >
                <View style={styles.loanCardTop}>
                  <View>
                    <View style={styles.loanNumRow}>
                      <Text style={styles.loanCardNum}>{loanNum}</Text>
                      {(l.parent_loan_id || l.parentLoanId) && (
                        <View style={styles.repeatBadge}>
                          <Text style={styles.repeatBadgeText}>Repeat of #{l.parent_loan_id || l.parentLoanId}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.loanCardType}>{l.repayment_frequency || l.type || 'WEEKLY'} • {l.total_installments || l.duration || 10} Installments</Text>
                  </View>
                  <Badge 
                    label={l.status || 'ACTIVE'} 
                    variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'primary'} 
                    size="sm"
                  />
                </View>

                <View style={styles.loanCardDetails}>
                  <View>
                    <Text style={styles.detailLabel}>Principal</Text>
                    <Text style={styles.detailVal}>{formatINR(princ)}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Total Contract</Text>
                    <Text style={[styles.detailVal, { color: '#2563EB' }]}>{formatINR(repay)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.detailLabel}>Paid Amount</Text>
                    <Text style={[styles.detailVal, { color: isCompleted ? '#059669' : '#0F172A' }]}>
                      {formatINR(paid)}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanCardFooter}>
                  <Text style={styles.dateMeta}>Disbursed: {formatDate(l.disbursement_date || '2026-01-01')}</Text>
                  <View style={styles.inspectRow}>
                    <Text style={styles.tapToViewText}>Inspect Loan</Text>
                    <Icon name="arrow-right" size={11} color="#2563EB" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Adjust Credit Limit Modal */}
      <AdjustCreditLimitModal
        visible={showLimitModal}
        customer={customer}
        currentLimit={creditLimit}
        onClose={() => setShowLimitModal(false)}
        onSaveLimit={({ newLimit }) => setCreditLimit(newLimit)}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
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
  statusToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroCard: {
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  customerType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  shopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  shopLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  shopVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionCard: {
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
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 14,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  mVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  mSub: {
    fontSize: 10,
    color: '#64748B',
  },
  limitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  editBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  editBtnText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  limitDisplayBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  limitDisplayText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  limitDisplaySub: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loanCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  loanCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loanCardNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  repeatBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  repeatBadgeText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '700',
  },
  loanCardType: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  loanCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  loanCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateMeta: {
    fontSize: 10,
    color: '#64748B',
  },
  inspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToViewText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 14,
  },
});

export default SuperAdminCustomerDetail;
