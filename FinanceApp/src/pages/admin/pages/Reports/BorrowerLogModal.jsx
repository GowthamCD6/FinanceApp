import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../components/HeaderComponent/Header';
import { apiService } from '../../../../services/apiService';
import { formatINR, formatDate } from '../../../../utils/helpers';

// Helper for local date string
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Shimmering Skeleton Box Element
const SkeletonBox = ({ width, height, borderRadius = 6, style }) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E2E8F0',
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

// Skeleton for Profile Card
const ProfileCardSkeleton = () => (
  <View style={styles.profileCard}>
    <View style={styles.profileTop}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <SkeletonBox width={140} height={16} borderRadius={4} />
        <SkeletonBox width={100} height={12} borderRadius={3} />
      </View>
      <SkeletonBox width={38} height={38} borderRadius={12} />
    </View>
    <View style={[styles.metricsContainer, { backgroundColor: '#F8FAFC' }]}>
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <SkeletonBox width={35} height={10} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} />
      </View>
      <View style={styles.metricSep} />
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <SkeletonBox width={30} height={10} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} />
      </View>
      <View style={styles.metricSep} />
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <SkeletonBox width={45} height={10} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} />
      </View>
    </View>
  </View>
);

// Skeleton for Installment Card
const InstallmentCardSkeleton = () => (
  <View style={styles.simpleInstCard}>
    <View style={styles.instLeftCol}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <SkeletonBox width={60} height={14} borderRadius={4} />
        <SkeletonBox width={45} height={14} borderRadius={6} />
      </View>
      <SkeletonBox width={100} height={11} borderRadius={3} style={{ marginTop: 6 }} />
      <SkeletonBox width={110} height={12} borderRadius={3} style={{ marginTop: 6 }} />
    </View>
    <View style={styles.instRightCol}>
      <SkeletonBox width={85} height={32} borderRadius={10} />
    </View>
  </View>
);

// Friendly Status Helper
const getStatusStyle = (status) => {
  switch (status) {
    case 'PAID':
      return {
        badgeBg: '#ECFDF5',
        textColor: '#059669',
        borderColor: '#A7F3D0',
        stripeColor: '#10B981',
        label: 'Paid',
      };
    case 'OVERDUE':
      return {
        badgeBg: '#FEF2F2',
        textColor: '#DC2626',
        borderColor: '#FECACA',
        stripeColor: '#EF4444',
        label: 'Late',
      };
    case 'PARTIAL':
      return {
        badgeBg: '#EFF6FF',
        textColor: '#2563EB',
        borderColor: '#BFDBFE',
        stripeColor: '#3B82F6',
        label: 'Partial',
      };
    case 'UNPAID':
    default:
      return {
        badgeBg: '#FFFBEB',
        textColor: '#D97706',
        borderColor: '#FDE68A',
        stripeColor: '#F59E0B',
        label: 'Due',
      };
  }
};

export const BorrowerLogModal = ({
  visible,
  onClose,
  borrower,
  onPaymentSuccess,
}) => {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PAID'

  // Payment Recording Modal State
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Fetch full loan details & all installments from server
  const loadLoanLedger = useCallback(async () => {
    if (!borrower?.loanId) return;
    setLoading(true);
    try {
      const data = await apiService.getLoanById(borrower.loanId);
      if (data) {
        setLoanData(data);
      } else {
        setLoanData({
          id: borrower.loanId,
          loan_number: borrower.loanNumber,
          customer_name: borrower.customerName,
          customer_phone: borrower.customerPhone,
          shop_name: borrower.shopName,
          repayment_frequency: borrower.frequency,
          principal_amount: borrower.expectedAmount,
          total_repayment_amount: borrower.expectedAmount,
          installments: borrower.records || [],
        });
      }
    } catch (err) {
      console.warn('Failed to load loan ledger from server:', err.message);
      setLoanData({
        id: borrower.loanId,
        loan_number: borrower.loanNumber,
        customer_name: borrower.customerName,
        customer_phone: borrower.customerPhone,
        shop_name: borrower.shopName,
        repayment_frequency: borrower.frequency,
        principal_amount: borrower.expectedAmount,
        total_repayment_amount: borrower.expectedAmount,
        installments: borrower.records || [],
      });
    } finally {
      setLoading(false);
    }
  }, [borrower]);

  useEffect(() => {
    if (visible && borrower) {
      setActiveFilter('ALL');
      loadLoanLedger();
    } else {
      setLoanData(null);
    }
  }, [visible, borrower, loadLoanLedger]);

  // Open Installment Pay Modal
  const openPayModal = (inst) => {
    setSelectedInstallment(inst);
    const bal = Number(
      inst.outstanding_amount !== undefined
        ? inst.outstanding_amount
        : (inst.balance || inst.scheduled_amount || 0)
    );
    setPayAmount(String(bal > 0 ? bal : (inst.scheduled_amount || '')));
    setPayMethod('CASH');
    setPayModalVisible(true);
  };

  // Confirm and Submit Installment Payment
  const handleConfirmPay = async () => {
    if (!selectedInstallment || !loanData) return;

    const parsedAmt = parseFloat(payAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.recordPayment({
        scheduleId: selectedInstallment.id || selectedInstallment.scheduleId,
        loanId: loanData.id,
        userId: loanData.user_id || loanData.customer_id,
        customerId: loanData.customer_id,
        amount: parsedAmt,
        paymentDate: formatDateStr(new Date()),
        paymentMethod: payMethod,
        referenceNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        notes: `Collected from ${loanData?.customer_name || borrower?.customerName}`,
      });

      setPayModalVisible(false);
      Alert.alert(
        'Payment Recorded! 🎉',
        `Collected ${formatINR(parsedAmt)} successfully.`
      );

      // Reload loan details in-place
      await loadLoanLedger();

      // Notify parent to refresh report dashboard
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Error submitting installment payment:', err);
      Alert.alert('Payment Failed', err.message || 'Failed to record collection on server.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = formatDateStr(new Date());

  // Filtered installments list
  const rawInstallments = Array.isArray(loanData?.installments) ? loanData.installments : [];

  const overdueInstCount = useMemo(() => {
    return rawInstallments.filter((i) => {
      const bal = i.outstanding_amount !== undefined
        ? parseFloat(i.outstanding_amount)
        : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
      const dueDate = i.due_date ? String(i.due_date).slice(0, 10) : '';
      return (i.status !== 'PAID' && bal > 0) && (i.status === 'OVERDUE' || (dueDate && dueDate < todayStr));
    }).length;
  }, [rawInstallments, todayStr]);

  const paidInstCount = useMemo(() => {
    return rawInstallments.filter((i) => {
      const bal = i.outstanding_amount !== undefined
        ? parseFloat(i.outstanding_amount)
        : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
      return i.status === 'PAID' || bal <= 0;
    }).length;
  }, [rawInstallments]);

  const allInstCount = rawInstallments.length;
  const pendingInstCount = Math.max(0, allInstCount - paidInstCount);

  const installments = useMemo(() => {
    if (activeFilter === 'ALL') return rawInstallments;

    if (activeFilter === 'OVERDUE') {
      return rawInstallments.filter((i) => {
        const bal = i.outstanding_amount !== undefined
          ? parseFloat(i.outstanding_amount)
          : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
        const dueDate = i.due_date ? String(i.due_date).slice(0, 10) : '';
        return (i.status !== 'PAID' && bal > 0) && (i.status === 'OVERDUE' || (dueDate && dueDate < todayStr));
      });
    }

    if (activeFilter === 'PAID') {
      return rawInstallments.filter((i) => {
        const bal = i.outstanding_amount !== undefined
          ? parseFloat(i.outstanding_amount)
          : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
        return i.status === 'PAID' || bal <= 0;
      });
    }

    if (activeFilter === 'UNPAID') {
      return rawInstallments.filter((i) => {
        const bal = i.outstanding_amount !== undefined
          ? parseFloat(i.outstanding_amount)
          : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
        return i.status !== 'PAID' && bal > 0;
      });
    }

    return rawInstallments;
  }, [rawInstallments, activeFilter, todayStr]);

  // Derived financial metrics
  const totalRepayable = parseFloat(loanData?.total_repayment_amount || borrower?.expectedAmount || 0);
  const totalPaid = rawInstallments.reduce((sum, i) => sum + parseFloat(i.paid_amount || 0), 0);
  const totalOutstanding = rawInstallments.reduce((sum, i) => {
    const bal = i.outstanding_amount !== undefined
      ? parseFloat(i.outstanding_amount || 0)
      : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
    return sum + bal;
  }, 0);

  const initial = borrower?.customerName ? borrower.customerName.charAt(0).toUpperCase() : 'B';
  const frequencyLabel = borrower?.frequency || loanData?.repayment_frequency || 'DAILY';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Standard App Header Component */}
        <Header
          title={borrower?.customerName || 'Customer History'}
          onBack={onClose}
          showBackButton={true}
          rightComponent={
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyBadgeText}>{frequencyLabel}</Text>
            </View>
          }
        />

        {loading ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ProfileCardSkeleton />
            <View style={{ marginTop: 4 }}>
              <InstallmentCardSkeleton />
              <InstallmentCardSkeleton />
              <InstallmentCardSkeleton />
              <InstallmentCardSkeleton />
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Simple Borrower Overview Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.customerName} numberOfLines={1}>
                    {borrower?.customerName}
                  </Text>
                  <View style={styles.contactRow}>
                    <MaterialCommunityIcons name="phone" size={13} color="#6B7280" />
                    <Text style={styles.phoneText}> {borrower?.customerPhone || 'No phone'}</Text>
                    {borrower?.shopName ? (
                      <>
                        <Text style={styles.dotSeparator}> • </Text>
                        <Text style={styles.shopText} numberOfLines={1}>{borrower?.shopName}</Text>
                      </>
                    ) : null}
                  </View>
                </View>

                {borrower?.customerPhone ? (
                  <TouchableOpacity
                    style={styles.callActionBtn}
                    onPress={() => Linking.openURL(`tel:${borrower.customerPhone}`)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="phone" size={18} color="#6B46C1" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Simple 3-Metric Summary: Total, Paid, Balance */}
              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TOTAL</Text>
                  <Text style={styles.metricValue}>{formatINR(totalRepayable)}</Text>
                </View>

                <View style={styles.metricSep} />

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>PAID</Text>
                  <Text style={[styles.metricValue, { color: '#059669' }]}>
                    {formatINR(totalPaid)}
                  </Text>
                </View>

                <View style={styles.metricSep} />

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>BALANCE</Text>
                  <Text style={[styles.metricValue, { color: totalOutstanding > 0 ? '#DC2626' : '#059669' }]}>
                    {formatINR(totalOutstanding)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter Tabs: All, Overdue, Due, Paid */}
            <View style={styles.filterTabs}>
              {[
                { key: 'ALL', label: `All (${allInstCount})`, color: '#6B46C1' },
                { key: 'OVERDUE', label: `Overdue (${overdueInstCount})`, color: '#DC2626' },
                { key: 'UNPAID', label: `Due (${pendingInstCount})`, color: '#D97706' },
                { key: 'PAID', label: `Paid (${paidInstCount})`, color: '#059669' },
              ].map((tab) => {
                const active = activeFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabButton,
                      active && { backgroundColor: tab.color, shadowColor: tab.color },
                    ]}
                    onPress={() => setActiveFilter(tab.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Installments List */}
            {installments.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <MaterialCommunityIcons name="check-circle-outline" size={44} color="#10B981" />
                <Text style={styles.emptyStateTitle}>All Paid Up!</Text>
                <Text style={styles.emptyStateSubtitle}>
                  No pending dues under this filter.
                </Text>
              </View>
            ) : (
              installments.map((inst, idx) => {
                const bal = inst.outstanding_amount !== undefined
                  ? parseFloat(inst.outstanding_amount || 0)
                  : Math.max(0, parseFloat(inst.scheduled_amount || 0) - parseFloat(inst.paid_amount || 0));
                const schedAmt = parseFloat(inst.scheduled_amount || 0);
                const isPaid = inst.status === 'PAID' || bal <= 0;

                const cycleName = frequencyLabel === 'DAILY'
                  ? `Day ${inst.installment_number || idx + 1}`
                  : frequencyLabel === 'MONTHLY'
                  ? `Month ${inst.installment_number || idx + 1}`
                  : `Week ${inst.installment_number || idx + 1}`;

                const paymentMethod = inst.payment_method || (loanData?.payments?.find(p => Math.abs(parseFloat(p.amount) - parseFloat(inst.paid_amount || schedAmt)) < 0.01)?.payment_method) || 'CASH';
                const rawPaidDate = inst.effective_paid_date || inst.paid_at || (loanData?.payments?.find(p => Math.abs(parseFloat(p.amount) - parseFloat(inst.paid_amount || schedAmt)) < 0.01)?.payment_date) || inst.due_date;
                const paidDateStr = rawPaidDate ? formatDate(rawPaidDate) : 'Completed';
                const dueDateStr = inst.due_date ? String(inst.due_date).slice(0, 10) : '';
                const isOverdue = !isPaid && (inst.status === 'OVERDUE' || (dueDateStr && dueDateStr < todayStr));

                return (
                  <View key={inst.id || idx} style={[styles.simpleInstCard, isOverdue && styles.simpleInstCardOverdue]}>
                    {/* Left Info: Day/Week & Method/Overdue, Due/Paid Date, Amount */}
                    <View style={styles.instLeftCol}>
                      <View style={styles.instHeaderRow}>
                        <Text style={[styles.instCycleTitle, isOverdue && { color: '#DC2626' }]}>{cycleName}</Text>
                        {isPaid && (
                          <View style={styles.methodTag}>
                            <MaterialCommunityIcons
                              name={paymentMethod === 'UPI' ? 'cellphone' : paymentMethod === 'BANK_TRANSFER' ? 'bank' : 'cash'}
                              size={11}
                              color="#059669"
                            />
                            <Text style={styles.methodTagText}>{paymentMethod}</Text>
                          </View>
                        )}
                        {isOverdue && (
                          <View style={styles.overdueTag}>
                            <MaterialCommunityIcons name="alert-circle" size={11} color="#DC2626" />
                            <Text style={styles.overdueTagText}>OVERDUE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.instDueDateText, isOverdue && { color: '#DC2626', fontWeight: '700' }]} numberOfLines={1}>
                        {isPaid
                          ? `Paid: ${paidDateStr}`
                          : isOverdue
                          ? `Due: ${inst.due_date ? formatDate(inst.due_date) : 'N/A'} (Late)`
                          : `Due: ${inst.due_date ? formatDate(inst.due_date) : 'N/A'}`}
                      </Text>
                      <Text style={styles.instAmountText}>
                        Amount: <Text style={{ fontWeight: '800', color: '#111827' }}>{formatINR(schedAmt)}</Text>
                      </Text>
                    </View>

                    {/* Right Action / Paid Status */}
                    <View style={styles.instRightCol}>
                      {isPaid ? (
                        <View style={styles.paidPill}>
                          <MaterialCommunityIcons name="check-circle" size={14} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.paidPillText}>Paid</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.collectActionBtn, isOverdue && styles.collectActionBtnOverdue]}
                          onPress={() => openPayModal(inst)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons name={isOverdue ? "alert-circle-outline" : "cash"} size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.collectActionBtnText}>
                            Collect {formatINR(bal > 0 ? bal : schedAmt)}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Easy Payment Confirmation Modal */}
        <Modal
          visible={payModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPayModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Collect Payment</Text>
                <TouchableOpacity onPress={() => setPayModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalCustomerName}>
                Customer: <Text style={{ fontWeight: '800', color: '#111827' }}>{loanData?.customer_name || borrower?.customerName}</Text>
              </Text>

              {/* Amount Input */}
              <Text style={styles.inputLabel}>Amount (₹)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={payAmount}
                  onChangeText={setPayAmount}
                  placeholder="Enter amount"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Payment Method Selector */}
              <Text style={styles.inputLabel}>Paid By</Text>
              <View style={styles.methodRow}>
                {[
                  { key: 'CASH', label: 'Cash', icon: 'cash' },
                  { key: 'UPI', label: 'GPay / UPI', icon: 'qrcode-scan' },
                  { key: 'BANK_TRANSFER', label: 'Bank', icon: 'bank' },
                ].map((m) => {
                  const active = payMethod === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[styles.methodBtn, active && styles.methodBtnActive]}
                      onPress={() => setPayMethod(m.key)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={m.icon}
                        size={16}
                        color={active ? '#6B46C1' : '#6B7280'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.methodBtnText, active && styles.methodBtnTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setPayModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleConfirmPay}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.modalSubmitText}>Confirm</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    paddingRight: 10,
  },
  backIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  frequencyBadge: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  frequencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dotSeparator: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  shopText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },
  callActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricSep: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  // Filters
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    gap: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Simple Installment Card
  simpleInstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  instLeftCol: {
    flex: 1,
  },
  instHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instCycleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  methodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  methodTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  instDueDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  instAmountText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  instRightCol: {
    marginLeft: 12,
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  simpleInstCardOverdue: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 3,
  },
  overdueTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  collectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  collectActionBtnOverdue: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  collectActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Empty State
  emptyStateBox: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalCustomerName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 14,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 10,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  methodBtnActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3E8FF',
  },
  methodBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodBtnTextActive: {
    color: '#6B46C1',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BorrowerLogModal;
