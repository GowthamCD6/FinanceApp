import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR } from '../../../../utils/helpers';

export const CustomerLoansModal = ({
  visible,
  customer,
  onClose,
  onIssueLoan,
  onEditLoan,
  onDeleteLoan,
}) => {
  const [activeTab, setActiveTab] = useState('CURRENT'); // 'CURRENT' | 'COMPLETED'

  if (!customer) return null;

  const activeLoan = customer.activeLoan;
  const completedLoans = customer.completedLoans || [];
  const initial = (customer.name || customer.full_name || 'B').charAt(0).toUpperCase();

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Unable to make call', 'Please verify device dialer permissions.');
      });
    }
  };

  const handleWhatsApp = () => {
    const phone = customer.phone?.replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert('No Phone Number', 'This borrower does not have a phone number registered.');
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const loanCode = activeLoan?.loan_number || activeLoan?.loan_code || 'Loan';
    const dueAmount = customer.remainingBalance > 0
      ? formatINR(customer.activeLoan?.emi_amount || customer.remainingBalance)
      : '₹0';
    const message = encodeURIComponent(
      `Hello ${customer.name || customer.full_name}, this is Apex Finance regarding your account with us. Outstanding balance is ${dueAmount}. Thank you!`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
    });
  };

  const isOverdue = activeLoan?.status === 'OVERDUE';
  const cycleUnit = customer.isShop ? 'Day' : customer.isMonthly ? 'Month' : 'Week';

  const totalInstallments = Number(customer.totalInstallments || 10);
  const paidInstallments = Number(customer.paidInstallments || 0);
  const progressRatio = totalInstallments > 0 ? Math.min(1, paidInstallments / totalInstallments) : 0;
  const progressPct = Math.round(progressRatio * 100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.avatar,
                  customer.isShop && styles.avatarShop,
                  customer.isMonthly && styles.avatarMonthly,
                ]}
              >
                {customer.isShop ? (
                  <MaterialCommunityIcons name="storefront" size={22} color="#FFFFFF" />
                ) : customer.isMonthly ? (
                  <MaterialCommunityIcons name="chart-line" size={22} color="#FFFFFF" />
                ) : (
                  <Text style={styles.avatarInitial}>{initial}</Text>
                )}
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.customerName} numberOfLines={1}>
                  {customer.name || customer.full_name || 'Borrower Details'}
                </Text>
                <View style={styles.headerSubRow}>
                  {customer.phone ? (
                    <Text style={styles.phoneText}>{customer.phone}</Text>
                  ) : (
                    <Text style={styles.phoneText}>No phone</Text>
                  )}
                  {customer.shop_name ? (
                    <>
                      <Text style={styles.dotSeparator}> • </Text>
                      <Text style={styles.shopText} numberOfLines={1}>{customer.shop_name}</Text>
                    </>
                  ) : customer.address || customer.city ? (
                    <>
                      <Text style={styles.dotSeparator}> • </Text>
                      <Text style={styles.shopText} numberOfLines={1}>
                        {[customer.address, customer.city].filter(Boolean).join(', ')}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Header Right Actions */}
            <View style={styles.headerActions}>
              {customer.phone ? (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleCall(customer.phone)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="phone" size={16} color="#6B46C1" />
                </TouchableOpacity>
              ) : null}

              {customer.phone ? (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                  onPress={handleWhatsApp}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="whatsapp" size={16} color="#059669" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dual Segmented Tabs: Current Loan vs Completed Loans */}
          <View style={styles.tabBarContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CURRENT' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CURRENT')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="clock-time-four-outline"
                size={16}
                color={activeTab === 'CURRENT' ? '#6B46C1' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabBtnText, activeTab === 'CURRENT' && styles.tabBtnTextActive]}>
                Current Loan
              </Text>
              {activeLoan && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'COMPLETED' && styles.tabBtnActive]}
              onPress={() => setActiveTab('COMPLETED')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={16}
                color={activeTab === 'COMPLETED' ? '#6B46C1' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabBtnText, activeTab === 'COMPLETED' && styles.tabBtnTextActive]}>
                Completed Loans ({completedLoans.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'CURRENT' ? (
              activeLoan ? (
                <View style={styles.loanDetailContent}>
                  {/* Scheme & Status Banner */}
                  <View style={styles.loanBanner}>
                    <View style={styles.schemeInfo}>
                      <MaterialCommunityIcons
                        name={
                          customer.isShop
                            ? 'storefront-outline'
                            : customer.isMonthly
                            ? 'chart-line'
                            : 'calendar-week'
                        }
                        size={18}
                        color="#6B46C1"
                      />
                      <Text style={styles.schemeTitle}>
                        {customer.isShop
                          ? 'Merchant Daily Loan'
                          : customer.isMonthly
                          ? 'Business EMI Loan'
                          : 'Weekly Borrower Loan'}
                      </Text>
                      {(activeLoan.loan_number || activeLoan.loan_code) && (
                        <View style={styles.loanCodePill}>
                          <Text style={styles.loanCodeText}>
                            #{activeLoan.loan_number || activeLoan.loan_code}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={[
                        styles.statusTag,
                        isOverdue
                          ? { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
                          : { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={isOverdue ? 'alert-circle' : 'check-decagram'}
                        size={12}
                        color={isOverdue ? '#DC2626' : '#059669'}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={[
                          styles.statusTagText,
                          { color: isOverdue ? '#DC2626' : '#059669' },
                        ]}
                      >
                        {activeLoan.status || (isOverdue ? 'OVERDUE' : 'ACTIVE')}
                      </Text>
                    </View>
                  </View>

                  {/* 4-Metric Grid */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricGridItem}>
                      <Text style={styles.metricGridLabel}>Principal</Text>
                      <Text style={styles.metricGridValue}>
                        {formatINR(activeLoan.principal_amount || customer.totalRepayable || 0)}
                      </Text>
                    </View>

                    <View style={styles.metricGridItem}>
                      <Text style={styles.metricGridLabel}>Total Repayable</Text>
                      <Text style={styles.metricGridValue}>
                        {formatINR(customer.totalRepayable || 0)}
                      </Text>
                    </View>

                    <View style={styles.metricGridItem}>
                      <Text style={styles.metricGridLabel}>Cycle EMI</Text>
                      <Text style={[styles.metricGridValue, { color: '#6B46C1' }]}>
                        {formatINR(customer.emiAmount)}
                        <Text style={styles.cycleUnitText}>/{cycleUnit}</Text>
                      </Text>
                    </View>

                    <View style={styles.metricGridItem}>
                      <Text style={styles.metricGridLabel}>Outstanding</Text>
                      <Text
                        style={[
                          styles.metricGridValue,
                          { color: customer.remainingBalance > 0 ? (isOverdue ? '#DC2626' : '#1E1B4B') : '#059669' },
                        ]}
                      >
                        {formatINR(customer.remainingBalance)}
                      </Text>
                    </View>
                  </View>

                  {/* Installments Progress Bar */}
                  <View style={styles.progressCard}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={styles.progressLabel}>Installments Paid</Text>
                      <Text style={styles.progressRatio}>
                        {paidInstallments} of {totalInstallments} ({progressPct}%)
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                    <View style={styles.progressFooterRow}>
                      <Text style={styles.progressSubtext}>
                        Paid: <Text style={{ fontWeight: '700', color: '#059669' }}>{formatINR(customer.totalPaid || 0)}</Text>
                      </Text>
                      <Text style={styles.progressSubtext}>
                        Remaining: <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>{formatINR(customer.remainingBalance)}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Loan Parameters Details List */}
                  <View style={styles.detailsListCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailRowLabel}>Repayment Frequency</Text>
                      <Text style={styles.detailRowVal}>
                        {activeLoan.repayment_frequency || customer.inferredCategory}
                      </Text>
                    </View>

                    {activeLoan.interest_rate !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailRowLabel}>Interest Rate</Text>
                        <Text style={styles.detailRowVal}>{activeLoan.interest_rate}%</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailRowLabel}>Disbursement Date</Text>
                      <Text style={styles.detailRowVal}>
                        {activeLoan.disbursement_date
                          ? String(activeLoan.disbursement_date).slice(0, 10)
                          : 'N/A'}
                      </Text>
                    </View>

                    {activeLoan.next_due_date ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailRowLabel}>Next Due Date</Text>
                        <Text style={[styles.detailRowVal, isOverdue && { color: '#DC2626', fontWeight: '700' }]}>
                          {String(activeLoan.next_due_date).slice(0, 10)}
                        </Text>
                      </View>
                    ) : null}

                    {activeLoan.notes ? (
                      <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.detailRowLabel}>Notes</Text>
                        <Text style={[styles.detailRowVal, { flex: 1, textAlign: 'right' }]}>
                          {activeLoan.notes}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Operational Management Actions */}
                  <View style={styles.loanActionButtonsRow}>
                    <TouchableOpacity
                      style={styles.editLoanBtn}
                      onPress={() => {
                        onClose();
                        if (onEditLoan) onEditLoan(customer);
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#6B46C1" />
                      <Text style={styles.editLoanBtnText}>Edit Terms</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteLoanBtn}
                      onPress={() => {
                        onClose();
                        if (onDeleteLoan) onDeleteLoan(customer);
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                      <Text style={styles.deleteLoanBtnText}>Delete Loan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyLoanCard}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons
                      name="credit-card-off-outline"
                      size={36}
                      color="#6B46C1"
                    />
                  </View>
                  <Text style={styles.emptyLoanTitle}>No Active Loan</Text>
                  <Text style={styles.emptyLoanSubtitle}>
                    This borrower currently does not have any active or running loan.
                  </Text>
                  <View style={styles.creditLimitBox}>
                    <MaterialCommunityIcons name="shield-check-outline" size={16} color="#059669" />
                    <Text style={styles.creditLimitText}>
                      Credit Limit: <Text style={{ fontWeight: '800', color: '#111827' }}>{formatINR(customer.credit_limit || 25000)}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.issueLoanCtaBtn}
                    onPress={() => {
                      onClose();
                      if (onIssueLoan) onIssueLoan(customer);
                    }}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="cash-plus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.issueLoanCtaBtnText}>Issue New Loan</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              /* Completed Loans Tab */
              completedLoans.length > 0 ? (
                <View style={styles.completedLoansList}>
                  {completedLoans.map((loan, idx) => (
                    <View key={loan.id || idx} style={styles.completedLoanItemCard}>
                      <View style={styles.completedItemHeader}>
                        <View style={styles.completedItemTitleBox}>
                          <Text style={styles.completedLoanTitle}>
                            #{loan.loan_number || loan.loan_code || `LOAN-${loan.id || idx + 1}`}
                          </Text>
                          <Text style={styles.completedLoanFreq}>
                            {loan.repayment_frequency || 'Settled Loan'}
                          </Text>
                        </View>
                        <View style={styles.settledBadge}>
                          <MaterialCommunityIcons name="check-circle" size={13} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.settledBadgeText}>SETTLED</Text>
                        </View>
                      </View>

                      <View style={styles.completedMetricsRow}>
                        <View style={styles.completedMetricCol}>
                          <Text style={styles.completedMetricLabel}>Principal</Text>
                          <Text style={styles.completedMetricVal}>
                            {formatINR(loan.principal_amount || loan.total_repayment_amount || 0)}
                          </Text>
                        </View>

                        <View style={styles.completedMetricCol}>
                          <Text style={styles.completedMetricLabel}>Total Repaid</Text>
                          <Text style={[styles.completedMetricVal, { color: '#059669' }]}>
                            {formatINR(loan.total_repayment_amount || loan.paid_amount || loan.principal_amount || 0)}
                          </Text>
                        </View>

                        <View style={styles.completedMetricCol}>
                          <Text style={styles.completedMetricLabel}>Tenure</Text>
                          <Text style={styles.completedMetricVal}>
                            {loan.total_installments || loan.tenure_installments || 10} Inst.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.completedDatesRow}>
                        <MaterialCommunityIcons name="calendar-check-outline" size={13} color="#64748B" />
                        <Text style={styles.completedDatesText}>
                          Disbursed: {loan.disbursement_date ? String(loan.disbursement_date).slice(0, 10) : 'Archived'} • 100% Repaid
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyLoanCard}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons
                      name="history"
                      size={36}
                      color="#6B46C1"
                    />
                  </View>
                  <Text style={styles.emptyLoanTitle}>No Completed Loans</Text>
                  <Text style={styles.emptyLoanSubtitle}>
                    This borrower has no past settled loans yet. Once active loans are fully paid off, they will be archived here.
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarShop: {
    backgroundColor: '#059669',
  },
  avatarMonthly: {
    backgroundColor: '#2563EB',
  },
  avatarInitial: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: '#1E1B4B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  dotSeparator: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  shopText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dual Tabs
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  tabBtnTextActive: {
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginLeft: 6,
  },

  // Modal Body
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  loanDetailContent: {
    marginTop: 4,
  },
  loanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  schemeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  schemeTitle: {
    fontSize: 13,
    color: '#1E1B4B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  loanCodePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loanCodeText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // 4-Metric Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  metricGridItem: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricGridLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  metricGridValue: {
    fontSize: 16,
    color: '#1E1B4B',
    marginTop: 3,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  cycleUnitText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },

  // Progress Card
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  progressRatio: {
    fontSize: 12,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },

  // Details List
  detailsListCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  detailRowLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  detailRowVal: {
    fontSize: 12,
    color: '#1E1B4B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },

  // Actions Row
  loanActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  editLoanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 11,
    borderRadius: 10,
  },
  editLoanBtnText: {
    fontSize: 13,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deleteLoanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 10,
  },
  deleteLoanBtnText: {
    fontSize: 13,
    color: '#DC2626',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Empty State
  emptyLoanCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyLoanTitle: {
    fontSize: 15,
    color: '#1E1B4B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    marginBottom: 4,
  },
  emptyLoanSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  creditLimitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
  },
  creditLimitText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  issueLoanCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  issueLoanCtaBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Completed Loans List
  completedLoansList: {
    gap: 10,
    marginTop: 4,
  },
  completedLoanItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completedItemTitleBox: {
    flex: 1,
  },
  completedLoanTitle: {
    fontSize: 13,
    color: '#1E1B4B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  completedLoanFreq: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  settledBadgeText: {
    fontSize: 10,
    color: '#059669',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  completedMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completedMetricCol: {
    alignItems: 'center',
    flex: 1,
  },
  completedMetricLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  completedMetricVal: {
    fontSize: 12,
    color: '#1E1B4B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  completedDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  completedDatesText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

export default CustomerLoansModal;
