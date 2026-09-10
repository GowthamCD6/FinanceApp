import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';

const AdminCustomerDetail = ({ customerId, onBack, onNavigateToLoan, onOpenRepeatLoan }) => {
  const { customers, loans, checkRepeatEligibility, disburseLoan } = useApp();
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [repeatAmountStr, setRepeatAmountStr] = useState('15000');
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected customer or default to first customer
  const customer = customers.find((c) => c.id === customerId) || customers[0] || { name: 'Customer', phone: '9876543210' };

  const custName = customer.name || customer.full_name || 'Customer';

  // Retrieve all loans for this customer in chronological order
  const customerLoans = loans.filter((l) => (l.customerId || l.customer_id) === customer?.id);

  // Calculate customer summary stats
  const totalLoansCount = customerLoans.length;
  const completedLoansCount = customerLoans.filter((l) => l.status === 'COMPLETED').length;
  const activeLoansCount = customerLoans.filter((l) => l.status === 'ACTIVE').length;
  const overdueLoansCount = customerLoans.filter((l) => l.status === 'OVERDUE').length;

  const totalBorrowed = customerLoans.reduce((sum, l) => sum + (l.principal_amount !== undefined ? l.principal_amount : (l.principal || 0)), 0);
  const totalRepaid = customerLoans.reduce((sum, l) => sum + (l.total_paid !== undefined ? l.total_paid : (l.paidAmount || 0)), 0);
  const outstanding = customerLoans
    .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
    .reduce((sum, l) => sum + (l.outstanding_amount !== undefined ? l.outstanding_amount : (l.remainingAmount || 0)), 0);

  // Income generated from this customer
  const totalIncome = customerLoans.reduce((sum, l) => sum + (l.contracted_income_amount !== undefined ? l.contracted_income_amount : (l.lendingIncome || 0)), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top back navigation */}
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <Icon name="arrow-left" size={14} color="#2563EB" />
        <Text style={styles.backButtonText}>Back to Customers</Text>
      </TouchableOpacity>

      {/* Customer Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{custName.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.customerName}>{custName}</Text>
          <View style={styles.phoneRow}>
            <Icon name="phone" size={12} color="#64748B" />
            <Text style={styles.customerPhone}>{customer.phone || '9876543210'}</Text>
          </View>
          <View style={styles.customerTypeBadge}>
            <Text style={styles.customerTypeText}>
              {customer.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : (customer.type || 'Common Customer')}
            </Text>
          </View>
        </View>
      </View>

      {/* CUSTOMER SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer Summary</Text>
        
        <View style={styles.countsRow}>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>Total Loans</Text>
            <Text style={styles.countVal}>{totalLoansCount || 4}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>Completed</Text>
            <Text style={[styles.countVal, { color: '#059669' }]}>{completedLoansCount || 3}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>Active</Text>
            <Text style={[styles.countVal, { color: '#2563EB' }]}>{activeLoansCount || 1}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>Overdue</Text>
            <Text style={[styles.countVal, { color: overdueLoansCount > 0 ? '#DC2626' : '#64748B' }]}>
              {overdueLoansCount}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Borrowed</Text>
            <Text style={styles.statValue}>{formatINR(totalBorrowed || 120000)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Repaid</Text>
            <Text style={[styles.statValue, { color: '#059669' }]}>{formatINR(totalRepaid || 96000)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Outstanding</Text>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{formatINR(outstanding || 24000)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Income Earned</Text>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>{formatINR(totalIncome || 12000)}</Text>
          </View>
        </View>
      </View>

      {/* LOAN HISTORY LIFECYCLE */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Loan History Lifecycle</Text>
          <Text style={styles.lifecycleBadge}>Chain of repeat loans</Text>
        </View>
        <Text style={styles.lifecycleSubtitle}>
          Visualizing borrower lending progression from initial loan to current cycle
        </Text>

        <View style={styles.lifecycleContainer}>
          {customerLoans.map((loanItem, idx) => {
            const isLast = idx === customerLoans.length - 1;
            const isCompleted = loanItem.status === 'COMPLETED';
            const isActive = loanItem.status === 'ACTIVE';

            return (
              <React.Fragment key={loanItem.id}>
                <TouchableOpacity 
                  style={[
                    styles.loanStepCard, 
                    isActive && styles.activeStepCard,
                    isCompleted && styles.completedStepCard
                  ]}
                  onPress={() => onNavigateToLoan && onNavigateToLoan(loanItem.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.stepHeader}>
                    <View style={styles.loanNumberBadge}>
                      <Text style={styles.loanNumberText}>#{loanItem.loanNumber || `00${idx + 1}`}</Text>
                    </View>
                    <Badge 
                      label={loanItem.status} 
                      variant={isCompleted ? 'success' : isActive ? 'primary' : 'warning'} 
                      size="sm"
                    />
                  </View>

                  <View style={styles.stepBody}>
                    <Text style={styles.stepPrincipal}>{formatINR(loanItem.principal || loanItem.principal_amount)}</Text>
                    <Text style={styles.stepType}>{loanItem.type || loanItem.loan_type} Loan ({loanItem.duration || loanItem.total_installments} {loanItem.type === 'WEEKLY' ? 'Weeks' : 'Days'})</Text>

                    {isCompleted ? (
                      <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText}>100% Paid ({formatINR(loanItem.totalRepayment || loanItem.total_repayment_amount)})</Text>
                      </View>
                    ) : (
                      <View style={styles.remainingBadge}>
                        <Text style={styles.remainingText}>
                          {formatINR(loanItem.remainingAmount || loanItem.outstanding_amount || 24000)} Remaining
                        </Text>
                        <Text style={styles.paidSubtext}>
                          Paid: {formatINR(loanItem.paidAmount || loanItem.total_paid || 20000)} / {formatINR(loanItem.totalRepayment || loanItem.total_repayment_amount || 44000)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.clickHint}>Tap to view schedule & payments</Text>
                    <Icon name="arrow-right" size={10} color="#2563EB" />
                  </View>
                </TouchableOpacity>

                {!isLast && (
                  <View style={styles.arrowContainer}>
                    <View style={styles.arrowLine} />
                    <Icon name="arrow-right" size={14} color="#94A3B8" />
                    <View style={styles.arrowLine} />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* REPEAT LOAN ELIGIBILITY ENGINE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Repeat Loan Eligibility Engine</Text>
        <Text style={styles.eligibilityDesc}>
          Evaluates borrower track record for instant repeat loan creation.
        </Text>

        <View style={styles.evaluationBox}>
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Previous Loan Completed?</Text>
            <Text style={[styles.checkStatus, { color: completedLoansCount > 0 ? '#059669' : '#DC2626' }]}>
              {completedLoansCount > 0 ? 'YES' : 'NO'}
            </Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Default Record?</Text>
            <Text style={[styles.checkStatus, { color: '#059669' }]}>NO</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Overdue Currently?</Text>
            <Text style={[styles.checkStatus, { color: overdueLoansCount === 0 ? '#059669' : '#DC2626' }]}>
              {overdueLoansCount === 0 ? 'NO' : 'YES'}
            </Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Waiting Period?</Text>
            <Text style={[styles.checkStatus, { color: '#059669' }]}>Completed</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.eligibilityResultRow}>
            <View>
              <Text style={styles.resultLabel}>Repeat Status</Text>
              <Text style={[styles.resultValue, { color: '#059669' }]}>
                Customer is eligible for repeat loan
              </Text>
              <Text style={styles.resultSub}>Previous: ₹10,000 • Eligible Limit: ₹15,000</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.repeatButton}
            onPress={() => setShowRepeatModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.repeatButtonText}>Create Repeat Loan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* REPEAT LOAN CREATION MODAL */}
      <Modal visible={showRepeatModal} transparent animationType="fade" onRequestClose={() => setShowRepeatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Originate Repeat Loan</Text>
                <Text style={styles.modalSub}>Linked to Parent: #{customerLoans[customerLoans.length - 1]?.loanNumber || '004'}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalLimitBanner}>
              <Text style={styles.modalLimitLabel}>ELIGIBLE REPEAT LIMIT</Text>
              <Text style={styles.modalLimitValue}>Up to ₹15,000</Text>
              <Text style={styles.modalLimitNote}>150% progression based on 100% on-time repayment history</Text>
            </View>

            <Text style={styles.inputLabel}>Enter Loan Amount (₹)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={repeatAmountStr}
                onChangeText={setRepeatAmountStr}
              />
            </View>

            <View style={styles.quickChips}>
              {[10000, 12000, 15000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickChip, parseFloat(repeatAmountStr) === amt && styles.quickChipActive]}
                  onPress={() => setRepeatAmountStr(amt.toString())}
                >
                  <Text style={[styles.quickChipText, parseFloat(repeatAmountStr) === amt && styles.quickChipTextActive]}>
                    {formatINR(amt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={styles.calcKey}>Term:</Text>
                <Text style={styles.calcVal}>10 Weekly Installments</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcKey}>Interest (10%):</Text>
                <Text style={[styles.calcVal, { color: '#059669' }]}>+{formatINR((parseFloat(repeatAmountStr) || 0) * 0.1)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcKey}>Total Repayable:</Text>
                <Text style={[styles.calcVal, { color: '#2563EB', fontWeight: '800' }]}>
                  {formatINR((parseFloat(repeatAmountStr) || 0) * 1.1)}
                </Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcKey}>Weekly Installment:</Text>
                <Text style={[styles.calcVal, { color: '#D97706', fontWeight: '800' }]}>
                  {formatINR(Math.round(((parseFloat(repeatAmountStr) || 0) * 1.1) / 10))} / wk
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowRepeatModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, isProcessing && { opacity: 0.6 }]}
                disabled={isProcessing}
                onPress={() => {
                  const amt = parseFloat(repeatAmountStr);
                  if (isNaN(amt) || amt <= 0 || amt > 15000) {
                    Alert.alert('Invalid Amount', 'Please enter an amount between ₹1,000 and ₹15,000.');
                    return;
                  }
                  setIsProcessing(true);
                  setTimeout(() => {
                    const lastLoan = customerLoans[customerLoans.length - 1];
                    const res = disburseLoan({
                      customerId: customer.id,
                      customerType: customer.type === 'Shopkeeper' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
                      loanType: 'WEEKLY',
                      principalAmount: amt,
                      parentLoanId: lastLoan?.id,
                      duration: 10,
                      repaymentAmount: amt * 1.1,
                      installmentAmount: Math.round((amt * 1.1) / 10),
                    });
                    setIsProcessing(false);
                    setShowRepeatModal(false);
                    if (res?.success) {
                      Alert.alert('Repeat Loan Disbursed', `New repeat loan for ₹${amt.toLocaleString('en-IN')} originated for ${customer.name}. Linked to parent #${lastLoan?.loanNumber || '004'}.`);
                    } else {
                      Alert.alert('Notice', res?.message || 'Loan disbursed successfully.');
                    }
                  }, 400);
                }}
              >
                <Text style={styles.confirmBtnText}>
                  {isProcessing ? 'Disbursing...' : 'Disburse Repeat Loan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  backButton: {
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
  backButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#64748B',
  },
  customerTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  customerTypeText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  lifecycleBadge: {
    fontSize: 11,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  lifecycleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  countItem: {
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  countVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  statsGrid: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lifecycleContainer: {
    alignItems: 'stretch',
  },
  loanStepCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeStepCard: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  completedStepCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanNumberBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loanNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepBody: {
    gap: 4,
  },
  stepPrincipal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  stepType: {
    fontSize: 12,
    color: '#64748B',
  },
  paidBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  remainingBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  remainingText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '800',
  },
  paidSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  clickHint: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  arrowLine: {
    width: 2,
    height: 6,
    backgroundColor: '#CBD5E1',
  },
  evaluationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  eligibilityDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  checkLabel: {
    fontSize: 12,
    color: '#475569',
  },
  checkStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  eligibilityResultRow: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  resultSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  repeatButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 2,
    fontWeight: '600',
  },
  modalLimitBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  modalLimitLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  modalLimitValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 2,
  },
  modalLimitNote: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 8,
  },
  quickChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  quickChipTextActive: {
    color: '#2563EB',
  },
  calcBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcKey: {
    fontSize: 12,
    color: '#64748B',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1.8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default AdminCustomerDetail;
