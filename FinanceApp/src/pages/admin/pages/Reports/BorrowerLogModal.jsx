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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../components/HeaderComponent/Header';
import { apiService } from '../../../../services/apiService';
import { formatINR, formatDate } from '../../../../utils/helpers';
import { EditLoanModal, DeleteLoanModal } from '../../../../components/loans/LoanModals';

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

// In-memory ledger cache for instant 0ms access
const loanLedgerCache = new Map();

export const BorrowerLogModal = ({
  visible,
  onClose,
  borrower,
  onPaymentSuccess,
  onOpenIssueLoan,
}) => {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PAID'
  const [modeUpdating, setModeUpdating] = useState(false);

  // Payment Recording Modal State
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [isLastDatePayment, setIsLastDatePayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit and Delete Loan Modal States
  const [editLoanVisible, setEditLoanVisible] = useState(false);
  const [deleteLoanVisible, setDeleteLoanVisible] = useState(false);

  // Fast & Protected Loan Ledger Loader with Stale-While-Revalidate
  const loadLoanLedger = useCallback(async (skipCache = false) => {
    if (!borrower?.loanId) return;

    // 1. Check in-memory cache first for instant response
    if (!skipCache && loanLedgerCache.has(borrower.loanId)) {
      setLoanData(loanLedgerCache.get(borrower.loanId));
      setLoading(false);
    } else if (!loanData && Array.isArray(borrower.records) && borrower.records.length > 0) {
      // 2. Preloaded data from parent report page available immediately
      setLoanData({
        id: borrower.loanId,
        loan_number: borrower.loanNumber,
        customer_name: borrower.customerName,
        customer_phone: borrower.customerPhone,
        shop_name: borrower.shopName,
        repayment_frequency: borrower.frequency,
        collection_mode: borrower.collection_mode || 'NORMAL',
        principal_amount: borrower.expectedAmount,
        total_repayment_amount: borrower.expectedAmount,
        installments: borrower.records || [],
      });
      setLoading(false);
    } else if (!loanData) {
      setLoading(true);
    }

    // 3. Fast protected background revalidation
    try {
      const data = await apiService.getLoanById(borrower.loanId);
      if (data) {
        loanLedgerCache.set(borrower.loanId, data);
        setLoanData(data);
      }
    } catch (err) {
      console.warn('Background ledger revalidation:', err.message);
      // Fallback securely to borrower data if loanData not yet set
      setLoanData((prev) => prev || {
        id: borrower.loanId,
        loan_number: borrower.loanNumber,
        customer_name: borrower.customerName,
        customer_phone: borrower.customerPhone,
        shop_name: borrower.shopName,
        repayment_frequency: borrower.frequency,
        collection_mode: borrower.collection_mode || 'NORMAL',
        principal_amount: borrower.expectedAmount,
        total_repayment_amount: borrower.expectedAmount,
        installments: borrower.records || [],
      });
    } finally {
      setLoading(false);
    }
  }, [borrower, loanData]);

  useEffect(() => {
    let isCurrent = true;

    if (visible && borrower) {
      setActiveFilter('ALL');

      // Immediate render from cache or preloaded data (0ms delay)
      const cached = loanLedgerCache.get(borrower.loanId);
      if (cached) {
        setLoanData(cached);
        setLoading(false);
      } else if (Array.isArray(borrower.records) && borrower.records.length > 0) {
        setLoanData({
          id: borrower.loanId,
          loan_number: borrower.loanNumber,
          customer_name: borrower.customerName,
          customer_phone: borrower.customerPhone,
          shop_name: borrower.shopName,
          repayment_frequency: borrower.frequency,
          collection_mode: borrower.collection_mode || 'NORMAL',
          principal_amount: borrower.expectedAmount,
          total_repayment_amount: borrower.expectedAmount,
          installments: borrower.records,
        });
        setLoading(false);
      } else {
        setLoading(true);
      }

      // Revalidate in background securely
      (async () => {
        try {
          const freshData = await apiService.getLoanById(borrower.loanId);
          if (isCurrent && freshData) {
            loanLedgerCache.set(borrower.loanId, freshData);
            setLoanData(freshData);
          }
        } catch (err) {
          if (isCurrent) console.warn('Background revalidation note:', err.message);
        } finally {
          if (isCurrent) setLoading(false);
        }
      })();
    } else {
      setLoanData(null);
    }

    return () => {
      isCurrent = false;
    };
  }, [visible, borrower]);

  // Determine Collection Mode
  const isLumpSum = (loanData?.collection_mode || borrower?.collection_mode) === 'LUMP_SUM_END';
  const rawInstallments = Array.isArray(loanData?.installments) ? loanData.installments : [];

  // Derived financial metrics
  const totalRepayable = parseFloat(loanData?.total_repayment_amount || borrower?.expectedAmount || 0);
  const totalPaid = rawInstallments.reduce((sum, i) => sum + parseFloat(i.paid_amount || 0), 0);
  const totalOutstanding = rawInstallments.reduce((sum, i) => {
    const bal = i.outstanding_amount !== undefined
      ? parseFloat(i.outstanding_amount || 0)
      : Math.max(0, parseFloat(i.scheduled_amount || 0) - parseFloat(i.paid_amount || 0));
    return sum + bal;
  }, 0);

  // Compute Maturity / Last Date
  const maturityDateStr = useMemo(() => {
    if (loanData?.maturity_date) return formatDate(loanData.maturity_date);
    if (rawInstallments.length > 0) {
      const lastInst = rawInstallments[rawInstallments.length - 1];
      if (lastInst?.due_date) return formatDate(lastInst.due_date);
    }
    return 'Final Maturity Date';
  }, [loanData, rawInstallments]);

  // Toggle Repayment Mode Handler (Normal vs Get Amount at Last Date)
  const handleToggleCollectionMode = async (newMode) => {
    if (!loanData?.id || modeUpdating) return;
    setModeUpdating(true);
    try {
      await apiService.updateLoanCollectionMode(loanData.id, newMode);
      loanLedgerCache.delete(loanData.id);
      setLoanData((prev) => ({ ...prev, collection_mode: newMode }));
      Alert.alert(
        'Collection Mode Updated',
        newMode === 'LUMP_SUM_END'
          ? `Loan set to "Get Amount at Last Date". Full settlement will be collected on the final date (${maturityDateStr}).`
          : 'Loan set to "Normal Installments". Standard regular periodic dues are active.'
      );
      await loadLoanLedger(true);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update collection mode.');
    } finally {
      setModeUpdating(false);
    }
  };

  // Open Installment Pay Modal
  const openPayModal = (inst, isLastDateFull = false) => {
    setSelectedInstallment(inst);
    setIsLastDatePayment(isLastDateFull);

    if (isLastDateFull && totalOutstanding > 0) {
      setPayAmount(String(totalOutstanding));
    } else {
      const bal = Number(
        inst?.outstanding_amount !== undefined
          ? inst.outstanding_amount
          : (inst?.balance || inst?.scheduled_amount || 0)
      );
      setPayAmount(String(bal > 0 ? bal : (inst?.scheduled_amount || '')));
    }
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
        notes: isLastDatePayment
          ? `Last Date settlement collected from ${loanData?.customer_name || borrower?.customerName}`
          : `Collected from ${loanData?.customer_name || borrower?.customerName}`,
      });

      setPayModalVisible(false);
      Alert.alert(
        'Payment Recorded! 🎉',
        isLastDatePayment
          ? `Final settlement of ${formatINR(parsedAmt)} successfully collected at the last date.`
          : `Collected ${formatINR(parsedAmt)} successfully.`
      );

      // Reload loan details in-place
      loanLedgerCache.delete(loanData.id);
      await loadLoanLedger(true);

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

        {/* Standard App Header Component with Pure White Theme */}
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
            {/* Borrower Overview Card */}
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

              {/* 3-Metric Summary: Total, Paid, Balance */}
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

              {/* Repayment Collection Mode Switcher Bar */}
              <View style={styles.modeBarContainer}>
                <View style={styles.modeBarHeader}>
                  <Text style={styles.modeBarLabel}>REPAYMENT METHOD</Text>
                  <Text style={styles.modeBarMaturity}>
                    Maturity: {maturityDateStr}
                  </Text>
                </View>

                <View style={styles.modeSwitchRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeSwitchBtn,
                      !isLumpSum && styles.modeSwitchBtnActive,
                    ]}
                    onPress={() => handleToggleCollectionMode('NORMAL')}
                    disabled={modeUpdating}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={!isLumpSum ? 'check-circle' : 'calendar-clock'}
                      size={14}
                      color={!isLumpSum ? '#6B46C1' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.modeSwitchText,
                        !isLumpSum && styles.modeSwitchTextActive,
                      ]}
                    >
                      Normal Dues
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeSwitchBtn,
                      isLumpSum && styles.modeSwitchBtnActive,
                    ]}
                    onPress={() => handleToggleCollectionMode('LUMP_SUM_END')}
                    disabled={modeUpdating}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={isLumpSum ? 'check-circle' : 'target'}
                      size={14}
                      color={isLumpSum ? '#6B46C1' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.modeSwitchText,
                        isLumpSum && styles.modeSwitchTextActive,
                      ]}
                    >
                      Get Amount at Last Date
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Loan Management Action Bar */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => setEditLoanVisible(true)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={14} color="#475569" />
                  <Text style={styles.actionBtnOutlineText}>Edit Terms</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnDanger}
                  onPress={() => setDeleteLoanVisible(true)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={14} color="#BE123C" />
                  <Text style={styles.actionBtnDangerText}>Delete</Text>
                </TouchableOpacity>

                {onOpenIssueLoan && (
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => onOpenIssueLoan(borrower)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="cash-plus" size={14} color="#6B46C1" />
                    <Text style={styles.actionBtnPrimaryText}>+ New Loan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* "Get Amount at Last Date" Quick-Collect Card (When in Lump-Sum Mode) */}
            {isLumpSum && totalOutstanding > 0 && (
              <View style={styles.lumpSumHeroCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="target" size={18} color="#6B46C1" />
                    <Text style={styles.lumpSumHeroTitle}>Get Amount at Last Date</Text>
                  </View>
                  <Text style={styles.lumpSumHeroSubtitle}>
                    Full loan settlement due on {maturityDateStr}
                  </Text>
                  <Text style={styles.lumpSumHeroAmount}>
                    Total Balance: <Text style={{ color: '#6B46C1', fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold' }}>{formatINR(totalOutstanding)}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.lumpSumHeroBtn}
                  onPress={() => {
                    const lastInst = rawInstallments.length > 0
                      ? rawInstallments[rawInstallments.length - 1]
                      : { scheduled_amount: totalOutstanding };
                    openPayModal(lastInst, true);
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="cash-check" size={18} color="#FFFFFF" />
                  <Text style={styles.lumpSumHeroBtnText}>Collect Full</Text>
                </TouchableOpacity>
              </View>
            )}

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

                const isLastInstallment = idx === installments.length - 1;
                const isLumpSumDeferred = isLumpSum && !isLastInstallment && !isPaid;
                const isLumpSumTarget = isLumpSum && isLastInstallment && !isPaid;

                const cycleName = frequencyLabel === 'DAILY'
                  ? `Day ${inst.installment_number || idx + 1}`
                  : frequencyLabel === 'MONTHLY'
                  ? `Month ${inst.installment_number || idx + 1}`
                  : `Week ${inst.installment_number || idx + 1}`;

                const paymentMethod = inst.payment_method || (loanData?.payments?.find((p) => Math.abs(parseFloat(p.amount) - parseFloat(inst.paid_amount || schedAmt)) < 0.01)?.payment_method) || 'CASH';
                const rawPaidDate = inst.effective_paid_date || inst.paid_at || (loanData?.payments?.find((p) => Math.abs(parseFloat(p.amount) - parseFloat(inst.paid_amount || schedAmt)) < 0.01)?.payment_date) || inst.due_date;
                const paidDateStr = rawPaidDate ? formatDate(rawPaidDate) : 'Completed';
                const dueDateStr = inst.due_date ? String(inst.due_date).slice(0, 10) : '';
                const isOverdue = !isPaid && !isLumpSumDeferred && (inst.status === 'OVERDUE' || (dueDateStr && dueDateStr < todayStr));

                return (
                  <View
                    key={inst.id || idx}
                    style={[
                      styles.simpleInstCard,
                      isOverdue && styles.simpleInstCardOverdue,
                      isLumpSumTarget && styles.simpleInstCardLumpSumTarget,
                    ]}
                  >
                    {/* Left Info: Day/Week & Method/Overdue/LumpSum, Due/Paid Date, Amount */}
                    <View style={styles.instLeftCol}>
                      <View style={styles.instHeaderRow}>
                        <Text style={[styles.instCycleTitle, isOverdue && { color: '#DC2626' }]}>
                          {cycleName}
                        </Text>

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

                        {isLumpSumTarget && (
                          <View style={styles.targetTag}>
                            <MaterialCommunityIcons name="target" size={11} color="#6B46C1" />
                            <Text style={styles.targetTagText}>LAST DATE</Text>
                          </View>
                        )}

                        {isLumpSumDeferred && (
                          <View style={styles.deferredTag}>
                            <MaterialCommunityIcons name="clock-outline" size={11} color="#64748B" />
                            <Text style={styles.deferredTagText}>DUE AT END</Text>
                          </View>
                        )}

                        {isOverdue && (
                          <View style={styles.overdueTag}>
                            <MaterialCommunityIcons name="alert-circle" size={11} color="#DC2626" />
                            <Text style={styles.overdueTagText}>OVERDUE</Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.instDueDateText,
                          isOverdue && { color: '#DC2626', fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold' },
                        ]}
                        numberOfLines={1}
                      >
                        {isPaid
                          ? `Paid: ${paidDateStr}`
                          : isLumpSumDeferred
                          ? `Deferred to maturity (${maturityDateStr})`
                          : isOverdue
                          ? `Due: ${inst.due_date ? formatDate(inst.due_date) : 'N/A'} (Late)`
                          : `Due: ${inst.due_date ? formatDate(inst.due_date) : 'N/A'}`}
                      </Text>

                      <Text style={styles.instAmountText}>
                        {isLumpSumTarget ? (
                          <>
                            Final Amount Due:{' '}
                            <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#6B46C1' }}>
                              {formatINR(totalOutstanding > 0 ? totalOutstanding : schedAmt)}
                            </Text>
                          </>
                        ) : isLumpSumDeferred ? (
                          <>
                            Scheduled (Deferred):{' '}
                            <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#64748B' }}>
                              {formatINR(schedAmt)}
                            </Text>
                          </>
                        ) : (
                          <>
                            Amount:{' '}
                            <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#111827' }}>
                              {formatINR(schedAmt)}
                            </Text>
                          </>
                        )}
                      </Text>
                    </View>

                    {/* Right Action / Paid Status */}
                    <View style={styles.instRightCol}>
                      {isPaid ? (
                        <View style={styles.paidPill}>
                          <MaterialCommunityIcons name="check-circle" size={14} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.paidPillText}>Paid</Text>
                        </View>
                      ) : isLumpSumDeferred ? (
                        <View style={styles.deferredPill}>
                          <MaterialCommunityIcons name="calendar-check" size={13} color="#6B46C1" style={{ marginRight: 3 }} />
                          <Text style={styles.deferredPillText}>Deferred</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.collectActionBtn,
                            isOverdue && styles.collectActionBtnOverdue,
                            isLumpSumTarget && { backgroundColor: '#6B46C1' },
                          ]}
                          onPress={() => openPayModal(inst, isLumpSumTarget)}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons
                            name={isLumpSumTarget ? 'target' : isOverdue ? 'alert-circle-outline' : 'cash'}
                            size={15}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.collectActionBtnText}>
                            {isLumpSumTarget
                              ? `Collect ${formatINR(totalOutstanding > 0 ? totalOutstanding : schedAmt)}`
                              : `Collect ${formatINR(bal > 0 ? bal : schedAmt)}`}
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

        {/* Easy Payment Confirmation Modal (Styled with Add User Clean Palette) */}
        <Modal
          visible={payModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPayModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.modalIconCircle}>
                    <MaterialCommunityIcons
                      name={isLastDatePayment ? 'target' : 'cash-multiple'}
                      size={20}
                      color="#6B46C1"
                    />
                  </View>
                  <Text style={styles.modalTitle}>
                    {isLastDatePayment ? 'Get Amount at Last Date' : 'Collect Payment'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPayModalVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalCustomerName}>
                Borrower:{' '}
                <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#111827' }}>
                  {loanData?.customer_name || borrower?.customerName}
                </Text>
              </Text>

              {/* Last Date Settlement Notice */}
              {isLastDatePayment && (
                <View style={styles.modalNoticeBox}>
                  <MaterialCommunityIcons name="information-outline" size={16} color="#6B46C1" />
                  <Text style={styles.modalNoticeText}>
                    Collecting full final settlement amount on maturity date ({maturityDateStr}).
                  </Text>
                </View>
              )}

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
                      <Text style={styles.modalSubmitText}>
                        {isLastDatePayment ? 'Settle at Last Date' : 'Confirm Payment'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Loan Terms Modal (Add User Matching Style) */}
        {loanData && (
          <EditLoanModal
            visible={editLoanVisible}
            onClose={() => setEditLoanVisible(false)}
            loan={loanData}
            customer={{
              name: borrower?.customerName || loanData?.customer_name,
              phone: borrower?.customerPhone || loanData?.customer_phone,
            }}
            onSuccess={() => {
              loadLoanLedger();
              if (onPaymentSuccess) onPaymentSuccess();
            }}
          />
        )}

        {/* Delete Loan Modal */}
        {loanData && (
          <DeleteLoanModal
            visible={deleteLoanVisible}
            onClose={() => setDeleteLoanVisible(false)}
            loan={loanData}
            customer={{
              name: borrower?.customerName || loanData?.customer_name,
              phone: borrower?.customerPhone || loanData?.customer_phone,
            }}
            onSuccess={() => {
              if (onPaymentSuccess) onPaymentSuccess();
              onClose();
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Root Theme Matching Outside Single Color Pure White
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  frequencyBadge: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  frequencyBadgeText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#6B46C1',
  },

  // Borrower Profile Card (Gray Card Pattern)
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  dotSeparator: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  shopText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
    flex: 1,
  },
  callActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },

  // 3 Metrics Container
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricSep: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  metricValue: {
    fontSize: 14,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Mode Bar Switcher
  modeBarContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeBarLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    letterSpacing: 0.3,
  },
  modeBarMaturity: {
    fontSize: 10,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 5,
  },
  modeSwitchBtnActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6B46C1',
  },
  modeSwitchText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  modeSwitchTextActive: {
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Overview Action Buttons
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#475569',
  },
  actionBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    paddingVertical: 8,
  },
  actionBtnDangerText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#BE123C',
  },
  actionBtnPrimary: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingVertical: 8,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#6B46C1',
  },

  // Lump Sum Hero Card (Quick-Collect Amount at Last Date)
  lumpSumHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  lumpSumHeroTitle: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  lumpSumHeroSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  lumpSumHeroAmount: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  lumpSumHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6B46C1',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  lumpSumHeroBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Filters
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Installment Card
  simpleInstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  simpleInstCardOverdue: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  simpleInstCardLumpSumTarget: {
    borderColor: '#818CF8',
    backgroundColor: '#FAF5FF',
    borderWidth: 1.5,
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
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  methodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  methodTagText: {
    fontSize: 10,
    color: '#059669',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  targetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C4B5FD',
    gap: 3,
  },
  targetTagText: {
    fontSize: 9,
    color: '#6D28D9',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deferredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 3,
  },
  deferredTagText: {
    fontSize: 9,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 3,
  },
  overdueTagText: {
    fontSize: 9,
    color: '#DC2626',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  instDueDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  instAmountText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  instRightCol: {
    marginLeft: 12,
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidPillText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deferredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  deferredPillText: {
    fontSize: 11,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  collectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  collectActionBtnOverdue: {
    backgroundColor: '#DC2626',
  },
  collectActionBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Empty State
  emptyStateBox: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#212121',
    marginTop: 10,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },

  // Payment Modal Styles
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
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalCustomerName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  modalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 14,
  },
  modalNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  inputLabel: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 6,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F5F5F5',
    marginBottom: 14,
    height: 48,
  },
  rupeeSymbol: {
    fontSize: 16,
    color: '#6B46C1',
    marginRight: 6,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  methodBtnActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#F5F3FF',
  },
  methodBtnText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  methodBtnTextActive: {
    color: '#6B46C1',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubmitText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
});

export default BorrowerLogModal;
