import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import { Colors, Fonts } from '../../theme';
import AdjustCreditLimitModal from './modal/AdjustCreditLimitModal';

// Inline Badge component
const Badge = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: { bg: Colors.purpleTintLightest, border: Colors.purpleBorderLight, text: Colors.primary },
    secondary: { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
    success: { bg: Colors.successBg, border: '#A7F3D0', text: Colors.success },
    warning: { bg: Colors.amberBg, border: '#FDE68A', text: Colors.amberDark },
    neutral: { bg: Colors.backgroundContainer, border: Colors.lightGray400, text: Colors.gray200 },
    danger: { bg: Colors.errorBg, border: '#FECACA', text: Colors.errorDanger },
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
    fontFamily: Fonts.gilroy.bold,
  },
});

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
          <MaterialCommunityIcons name="arrow-left" size={15} color="#2563EB" style={{ marginRight: 4 }} />
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
            <MaterialCommunityIcons name={isShopkeeper ? 'storefront-outline' : 'account-outline'} size={22} color={isShopkeeper ? '#2563EB' : '#64748B'} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.customerName}>{customer.name || customer.full_name}</Text>
              <Badge 
                label={customerStatus} 
                variant={customerStatus === 'ACTIVE' ? 'success' : 'danger'} 
              />
            </View>
            <Text style={styles.customerType}>
              {isShopkeeper ? 'Shopkeeper Merchant (Daily 25 Days)' : 'Regular Client (Weekly 10 Wks)'}
            </Text>
            <Text style={styles.contactText}>Phone: {customer.phone} • {customer.city || 'Ahmedabad'}</Text>
          </View>
        </View>

        {customer.shop_name ? (
          <View style={styles.shopBox}>
            <Text style={styles.shopLabel}>Shop Name:</Text>
            <Text style={styles.shopVal}>{customer.shop_name}</Text>
          </View>
        ) : null}
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
                    <MaterialCommunityIcons name="arrow-right" size={13} color="#2563EB" />
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
  },
  statusToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusToggleText: {
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
  },
  heroCard: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: Colors.purpleTintLightest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 18,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
  },
  customerType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    marginTop: 2,
  },
  shopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
  },
  shopLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  shopVal: {
    fontSize: 12,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.backgroundContainer, // Clean light gray card #F3F4F6
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400, // #E5E7EB
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.primary,
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  mLabel: {
    fontSize: 10,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  mVal: {
    fontSize: 16,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  mSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  limitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  editBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.purpleTintLightest,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  editBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: Fonts.gilroy.bold,
  },
  limitDisplayBox: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  limitDisplayText: {
    fontSize: 22,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
  },
  limitDisplaySub: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
    fontFamily: Fonts.gilroy.bold,
  },
  loanCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
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
    fontFamily: Fonts.gilroy.bold,
    color: Colors.primary,
  },
  repeatBadge: {
    backgroundColor: Colors.purpleTintLightest,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
  },
  repeatBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: Fonts.gilroy.bold,
  },
  loanCardType: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    marginTop: 2,
  },
  loanCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray400,
  },
  detailLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
  },
  inspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToViewText: {
    fontSize: 11,
    fontFamily: Fonts.gilroy.bold,
    color: Colors.primary,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.gilroy.medium,
    textAlign: 'center',
    paddingVertical: 14,
  },
});

export default SuperAdminCustomerDetail;
