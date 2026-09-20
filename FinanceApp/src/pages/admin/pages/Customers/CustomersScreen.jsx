import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import apiService from '../../../../services/apiService';
import { BorrowerLogModal } from '../Reports/BorrowerLogModal';
import { IssueLoanModal } from '../IssueLoan/IssueLoanModal';
import styles from './CustomersStyles';

let emptyAnimation;
try {
  emptyAnimation = require('../../../../animation/Customer_care.json');
} catch (e) {
  emptyAnimation = null;
}

// Category Tabs Definition
const CATEGORY_TABS = [
  { id: 'ALL', label: 'All', icon: 'account-group-outline' },
  { id: 'WEEKLY', label: 'Weekly', icon: 'calendar-week' },
  { id: 'SHOP', label: 'Merchant (Daily)', icon: 'storefront-outline' },
  { id: 'MONTHLY', label: 'Business (EMI)', icon: 'chart-line' },
];

// Status Filters Definition
const STATUS_FILTERS = [
  { id: 'ALL', label: 'All', color: '#6B46C1' },
  { id: 'ACTIVE', label: 'Active Loans', color: '#059669' },
  { id: 'OVERDUE', label: 'Overdue', color: '#DC2626' },
  { id: 'DUE_TODAY', label: 'Due Today', color: '#D97706' },
  { id: 'NO_LOAN', label: 'No Active Loan', color: '#6B7280' },
];

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

// Skeleton for 3 Top Metric Cards
const MetricCardSkeleton = () => (
  <View style={styles.metricCardProper}>
    <View style={styles.metricTopProper}>
      <SkeletonBox width={45} height={10} borderRadius={3} />
      <SkeletonBox width={20} height={20} borderRadius={10} />
    </View>
    <SkeletonBox width="80%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
    <SkeletonBox width="50%" height={10} borderRadius={3} style={{ marginTop: 6 }} />
  </View>
);

// Skeleton for Borrower Card
const BorrowerCardSkeleton = () => (
  <View style={styles.recordCard}>
    <View style={styles.cardHeader}>
      <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 10 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width={140} height={15} borderRadius={4} />
        <SkeletonBox width={95} height={11} borderRadius={3} />
      </View>
      <SkeletonBox width={60} height={22} borderRadius={10} />
    </View>
    <View style={[styles.schemeStrip, { borderColor: '#F3F4F6' }]}>
      <SkeletonBox width="100%" height={12} borderRadius={3} style={{ marginBottom: 6 }} />
      <SkeletonBox width="100%" height={5} borderRadius={3} />
    </View>
    <View style={styles.amountContainer}>
      <View style={styles.amountCol}>
        <SkeletonBox width={50} height={9} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.amountDivider} />
      <View style={styles.amountCol}>
        <SkeletonBox width={40} height={9} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.amountDivider} />
      <View style={styles.amountCol}>
        <SkeletonBox width={50} height={9} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
    </View>
    <View style={styles.cardFooter}>
      <SkeletonBox width={65} height={32} borderRadius={8} />
      <SkeletonBox width={65} height={32} borderRadius={8} />
      <SkeletonBox width="50%" height={32} borderRadius={8} style={{ flex: 1 }} />
    </View>
  </View>
);

// Individual Borrower Card matching Loan Allotment & Portfolio Focus
const BorrowerCard = React.memo(({ item, onSelect, onCall, onWhatsApp, onDisburse }) => {
  const hasActiveLoan = Boolean(item.activeLoan && item.activeLoan.status !== 'COMPLETED' && item.activeLoan.status !== 'SETTLED');
  const isOverdue = item.activeLoan?.status === 'OVERDUE';
  const hasCompletedLoans = Number(item.completedLoansCount || 0) > 0;
  const initial = (item.name || item.full_name || 'B').charAt(0).toUpperCase();

  // Cycle Frequency String
  const cycleUnit = item.isShop ? 'Day' : item.isMonthly ? 'Mo' : 'Wk';

  // Status Styling
  let statusBadgeBg = '#F3F4F6';
  let statusBorder = '#E5E7EB';
  let statusTextColor = '#6B7280';
  let statusLabel = 'NO ACTIVE LOAN';
  let statusIcon = 'information-outline';

  if (isOverdue) {
    statusBadgeBg = '#FEF2F2';
    statusBorder = '#FECACA';
    statusTextColor = '#DC2626';
    statusLabel = 'OVERDUE LOAN';
    statusIcon = 'alert-circle-outline';
  } else if (hasActiveLoan) {
    statusBadgeBg = '#ECFDF5';
    statusBorder = '#A7F3D0';
    statusTextColor = '#059669';
    statusLabel = 'ACTIVE LOAN';
    statusIcon = 'check-decagram';
  } else if (hasCompletedLoans) {
    statusBadgeBg = '#EFF6FF';
    statusBorder = '#BFDBFE';
    statusTextColor = '#2563EB';
    statusLabel = `${item.completedLoansCount} SETTLED`;
    statusIcon = 'check-all';
  }

  return (
    <View style={styles.recordCard}>
      {/* Header: Avatar, Name, Phone & Status */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            item.isShop && styles.avatarShop,
            item.isMonthly && styles.avatarMonthly,
          ]}
        >
          {item.isShop ? (
            <MaterialCommunityIcons name="storefront" size={20} color="#059669" />
          ) : item.isMonthly ? (
            <MaterialCommunityIcons name="chart-line" size={20} color="#7C3AED" />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
        </View>

        <View style={styles.cardTitleBox}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.name || item.full_name || 'Borrower'}
            </Text>
            {item.isShop && (item.shop_name || item.occupation) ? (
              <View style={styles.shopPill}>
                <MaterialCommunityIcons name="tag-outline" size={10} color="#6B46C1" />
                <Text style={styles.shopPillText} numberOfLines={1}>
                  {item.shop_name || item.occupation}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone-outline" size={12} color="#6B7280" />
            <Text style={styles.phoneText}> {item.phone || 'No phone'}</Text>
            {item.address || item.city ? (
              <>
                <Text style={styles.dotSeparator}> • </Text>
                <MaterialCommunityIcons name="map-marker-outline" size={12} color="#6B7280" />
                <Text style={styles.phoneText} numberOfLines={1}>
                  {' '}{[item.address, item.city].filter(Boolean).join(', ')}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBadgeBg, borderColor: statusBorder },
          ]}
        >
          <MaterialCommunityIcons
            name={statusIcon}
            size={11}
            color={statusTextColor}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Loan Overview: Current Active Loan Amounts vs No Active Loan */}
      {hasActiveLoan ? (
        <>
          {/* 3-Column Amount Box: Principal, Cycle EMI, Outstanding Balance */}
          <View style={styles.amountContainer}>
            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Principal</Text>
              <Text style={styles.amountVal}>
                {formatINR(item.activeLoan?.principal_amount || item.totalRepayable || 0)}
              </Text>
            </View>

            <View style={styles.amountDivider} />

            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>EMI Amount</Text>
              <Text style={[styles.amountVal, { color: '#6B46C1' }]}>
                {formatINR(item.emiAmount)}<Text style={{ fontSize: 10, color: '#6B7280' }}>/{cycleUnit}</Text>
              </Text>
            </View>

            <View style={styles.amountDivider} />

            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Outstanding</Text>
              <Text
                style={[
                  styles.amountVal,
                  { color: item.remainingBalance > 0 ? (isOverdue ? '#DC2626' : '#111827') : '#059669' },
                ]}
              >
                {formatINR(item.remainingBalance)}
              </Text>
            </View>
          </View>

          {/* Completed Loans History Strip (if any) */}
          {hasCompletedLoans && (
            <View style={styles.completedLoansPill}>
              <MaterialCommunityIcons name="check-circle" size={12} color="#15803D" />
              <Text style={styles.completedLoansPillText}>
                {item.completedLoansCount} Past Loan{item.completedLoansCount > 1 ? 's' : ''} Completed
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.noLoanCard}>
          <View style={styles.noLoanTopRow}>
            <View style={styles.noLoanLeft}>
              <MaterialCommunityIcons name="shield-check-outline" size={15} color="#6B46C1" />
              <Text style={styles.noLoanText}>
                Credit Limit: <Text style={{ fontWeight: '800', color: '#111827' }}>{formatINR(item.credit_limit || 25000)}</Text>
              </Text>
            </View>
          </View>

          {hasCompletedLoans ? (
            <View style={[styles.completedLoansPill, { marginTop: 6 }]}>
              <MaterialCommunityIcons name="history" size={12} color="#15803D" />
              <Text style={styles.completedLoansPillText}>
                {item.completedLoansCount} Past Loan{item.completedLoansCount > 1 ? 's' : ''} Completed & Settled
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
              First-time borrower • Ready for loan allotment
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons Footer */}
      <View style={styles.cardFooter}>
        {item.phone ? (
          <>
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => onCall(item.phone)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="phone" size={14} color="#4B5563" />
              <Text style={styles.actionIconBtnText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionWhatsAppBtn}
              onPress={() => onWhatsApp(item)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="whatsapp" size={14} color="#059669" />
              <Text style={styles.actionWhatsAppBtnText}>Chat</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Allot / Issue Loan Button (Primary Action) */}
        <TouchableOpacity
          style={styles.disburseBtn}
          onPress={() => onDisburse(item)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="cash-plus"
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.disburseBtnText}>
            {hasActiveLoan ? '+ Allot Another Loan' : 'Issue Loan'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export const CustomersScreen = ({
  onOpenAddBorrower,
  onOpenAddUser,
  onOpenManageUsers,
}) => {
  const {
    customers: contextCustomers,
    loans: contextLoans,
    refreshData,
    lendingConfig,
  } = useApp();

  // Local Live Database State
  const [dbCustomers, setDbCustomers] = useState([]);
  const [dbLoans, setDbLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Ledger Detail Modal State
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowerLedgerVisible, setBorrowerLedgerVisible] = useState(false);

  // Issue Loan Modal State
  const [selectedCustomerForIssueLoan, setSelectedCustomerForIssueLoan] = useState(null);
  const [issueLoanModalVisible, setIssueLoanModalVisible] = useState(false);

  // Fetch Live Customers & Loans from Server
  const fetchLiveBorrowers = useCallback(async () => {
    try {
      setLoading(true);
      const [custRes, loansRes] = await Promise.all([
        apiService.getCustomers({ limit: '200' }).catch(() => []),
        apiService.getLoans().catch(() => []),
      ]);

      const custList = Array.isArray(custRes) ? custRes : (custRes?.customers || []);
      const loanList = Array.isArray(loansRes) ? loansRes : (loansRes?.loans || []);

      if (custList.length > 0) setDbCustomers(custList);
      if (loanList.length > 0) setDbLoans(loanList);
    } catch (e) {
      console.warn('Error fetching live borrowers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveBorrowers();
  }, [fetchLiveBorrowers]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshData) {
        await refreshData();
      }
      await fetchLiveBorrowers();
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, fetchLiveBorrowers]);

  // Active combined customers & loans (prefers live db list)
  const activeCustomersList = dbCustomers.length > 0 ? dbCustomers : (contextCustomers || []);
  const activeLoansList = dbLoans.length > 0 ? dbLoans : (contextLoans || []);

  // Enriched customers mapped with active loan records & metrics from database
  const enrichedCustomers = useMemo(() => {
    return activeCustomersList.map((c) => {
      const custLoans = activeLoansList.filter(
        (l) => String(l.customer_id) === String(c.id) || (c.phone && l.customer_phone === c.phone)
      );

      const activeLoan =
        custLoans.find(
          (l) =>
            (l.status === 'ACTIVE' ||
            l.status === 'DISBURSED' ||
            l.status === 'PARTIALLY_PAID' ||
            l.status === 'OVERDUE') &&
            (l.outstanding_amount === undefined || Number(l.outstanding_amount) > 0)
        ) || null;

      const completedLoans = custLoans.filter(
        (l) =>
          l.status === 'COMPLETED' ||
          l.status === 'SETTLED' ||
          (l.outstanding_amount !== undefined && Number(l.outstanding_amount) <= 0)
      );
      const completedLoansCount = completedLoans.length;

      const isShop =
        c.customer_type === 'SHOPKEEPER' ||
        Boolean(c.shop_name && c.shop_name.trim() !== '') ||
        c.category === 'DAILY_MERCHANT' ||
        c.category === 'SHOP' ||
        activeLoan?.repayment_frequency === 'DAILY';

      const isMonthly =
        c.category === 'MONTHLY' ||
        c.customer_type === 'MONTHLY_BORROWER' ||
        activeLoan?.repayment_frequency === 'MONTHLY';

      const inferredCategory = isShop ? 'SHOP' : isMonthly ? 'MONTHLY' : 'WEEKLY';
      const defaultInstallments = isShop ? 100 : isMonthly ? 12 : 10;
      const totalInstallments = Number(activeLoan?.total_installments || activeLoan?.tenure_installments || defaultInstallments);
      const totalRepayable = Number(activeLoan?.total_repayment_amount || 0);
      const emiAmount = Number(
        activeLoan?.emi_amount ||
        (totalRepayable > 0 && totalInstallments > 0
          ? Math.round(totalRepayable / totalInstallments)
          : isShop ? 125 : isMonthly ? 2600 : 1250)
      );
      const totalPaid = Number(activeLoan?.total_paid || activeLoan?.paid_amount || 0);
      const paidInstallments = activeLoan?.paid_installments !== undefined
        ? Number(activeLoan.paid_installments)
        : Math.min(totalInstallments, emiAmount > 0 ? Math.floor(totalPaid / emiAmount) : 0);

      const remainingBalance = activeLoan
        ? Math.max(0, Number(activeLoan.outstanding_amount ?? (totalRepayable - totalPaid)))
        : 0;

      return {
        ...c,
        name: c.name || c.full_name || 'Borrower',
        inferredCategory,
        isShop,
        isMonthly,
        isWeekly: !isShop && !isMonthly,
        activeLoan,
        completedLoans,
        completedLoansCount,
        totalInstallments,
        paidInstallments,
        emiAmount,
        totalRepayable,
        totalPaid,
        remainingBalance,
      };
    });
  }, [activeCustomersList, activeLoansList]);

  // Tab & Status Filtering
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((c) => {
      // 1. Category Tab Filter
      if (selectedTab === 'WEEKLY' && c.inferredCategory !== 'WEEKLY') return false;
      if (selectedTab === 'MONTHLY' && c.inferredCategory !== 'MONTHLY') return false;
      if (selectedTab === 'SHOP' && c.inferredCategory !== 'SHOP') return false;

      // 2. Status Filter
      const hasActive = Boolean(c.activeLoan && c.activeLoan.status !== 'COMPLETED');
      const isOverdue = c.activeLoan?.status === 'OVERDUE';
      if (selectedStatus === 'ACTIVE' && !hasActive) return false;
      if (selectedStatus === 'OVERDUE' && !isOverdue) return false;
      if (selectedStatus === 'NO_LOAN' && hasActive) return false;
      if (selectedStatus === 'DUE_TODAY' && (!hasActive || c.remainingBalance <= 0)) return false;

      // 3. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (c.name || c.full_name || '').toLowerCase().includes(q);
        const matchShop = (c.shop_name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        const matchCode = (c.customer_code || '').toLowerCase().includes(q);
        const matchLoan = (c.activeLoan?.loan_number || c.activeLoan?.loan_code || '').toLowerCase().includes(q);
        const matchAddress = (c.address || c.city || '').toLowerCase().includes(q);
        return matchName || matchShop || matchPhone || matchCode || matchLoan || matchAddress;
      }

      return true;
    });
  }, [enrichedCustomers, selectedTab, selectedStatus, search]);

  // Dynamic Metrics for Top 3 Cards
  const summaryMetrics = useMemo(() => {
    const totalCount = enrichedCustomers.length;
    const activeList = enrichedCustomers.filter((c) => c.activeLoan && c.activeLoan.status !== 'COMPLETED');
    const overdueList = enrichedCustomers.filter((c) => c.activeLoan?.status === 'OVERDUE');

    const totalActiveBalance = activeList.reduce((acc, c) => acc + (c.remainingBalance || 0), 0);
    const totalOverdueBalance = overdueList.reduce((acc, c) => acc + (c.remainingBalance || 0), 0);

    return {
      activeAmount: totalActiveBalance,
      activeCount: activeList.length,
      overdueAmount: totalOverdueBalance,
      overdueCount: overdueList.length,
      totalCount,
    };
  }, [enrichedCustomers]);

  // Tab Counts for category badges
  const tabCounts = useMemo(() => {
    return {
      ALL: enrichedCustomers.length,
      WEEKLY: enrichedCustomers.filter((c) => c.inferredCategory === 'WEEKLY').length,
      SHOP: enrichedCustomers.filter((c) => c.inferredCategory === 'SHOP').length,
      MONTHLY: enrichedCustomers.filter((c) => c.inferredCategory === 'MONTHLY').length,
    };
  }, [enrichedCustomers]);

  // Status Counts for pills
  const statusCounts = useMemo(() => {
    return {
      ALL: enrichedCustomers.length,
      ACTIVE: enrichedCustomers.filter((c) => c.activeLoan && c.activeLoan.status !== 'COMPLETED').length,
      OVERDUE: enrichedCustomers.filter((c) => c.activeLoan?.status === 'OVERDUE').length,
      DUE_TODAY: enrichedCustomers.filter((c) => c.activeLoan && c.remainingBalance > 0).length,
      NO_LOAN: enrichedCustomers.filter((c) => !c.activeLoan || c.activeLoan.status === 'COMPLETED').length,
    };
  }, [enrichedCustomers]);

  // Handlers
  const handleSelectBorrower = useCallback((borrower) => {
    // Map borrower into standard record object for BorrowerLogModal
    const record = {
      customerId: borrower.id,
      userId: borrower.user_id || borrower.id,
      customerName: borrower.name || borrower.full_name,
      customerPhone: borrower.phone,
      customerAddress: [borrower.address, borrower.city].filter(Boolean).join(', '),
      shopName: borrower.shop_name,
      loanId: borrower.activeLoan?.id,
      loanNumber: borrower.activeLoan?.loan_number || borrower.activeLoan?.loan_code || 'LOAN',
      frequency: borrower.activeLoan?.repayment_frequency || borrower.inferredCategory,
      balance: borrower.remainingBalance,
      expectedAmount: borrower.totalRepayable,
      paidAmount: borrower.totalPaid,
      status: borrower.activeLoan?.status || (borrower.remainingBalance > 0 ? 'ACTIVE' : 'PAID'),
    };
    setSelectedBorrower(record);
    setBorrowerLedgerVisible(true);
  }, []);

  const handleCall = useCallback((phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Unable to make call', 'Please verify device dialer permissions.');
      });
    }
  }, []);

  const handleWhatsApp = useCallback((customer) => {
    const phone = customer.phone?.replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert('No Phone Number', 'This borrower does not have a phone number registered.');
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const loanCode = customer.activeLoan?.loan_number || customer.activeLoan?.loan_code || 'Loan';
    const dueAmount = customer.remainingBalance > 0
      ? formatINR(customer.activeLoan?.emi_amount || customer.remainingBalance)
      : '₹0';
    const message = encodeURIComponent(
      `Hello ${customer.name || customer.full_name}, this is Apex Finance regarding your active loan (${loanCode}). Outstanding balance is ${dueAmount}. Thank you!`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
    });
  }, []);

  const handleDisburse = useCallback((customer) => {
    setSelectedCustomerForIssueLoan(customer);
    setIssueLoanModalVisible(true);
  }, []);

  // List Header Component matching Reports
  const renderListHeader = () => {
    return (
      <View>
        {/* 1. Summary Metric Dashboard (3 White Cards matching Reports) */}
        <View style={styles.metricsThreeRow}>
          {loading && !refreshing ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              {/* Card 1: Active Loans */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>ACTIVE LOANS</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#DCFCE7' }]}>
                    <MaterialCommunityIcons name="check-decagram" size={13} color="#059669" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#059669' }]} numberOfLines={1}>
                  {formatINR(summaryMetrics.activeAmount)}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  {summaryMetrics.activeCount} Active
                </Text>
              </View>

              {/* Card 2: Overdue / At Risk */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>OVERDUE</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#DC2626" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#DC2626' }]} numberOfLines={1}>
                  {formatINR(summaryMetrics.overdueAmount)}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  {summaryMetrics.overdueCount} Overdue
                </Text>
              </View>

              {/* Card 3: Total Registered */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>TOTAL</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <MaterialCommunityIcons name="calendar-clock" size={13} color="#6B46C1" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#111827' }]} numberOfLines={1}>
                  {summaryMetrics.totalCount}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  Registered Total
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 2. Status Filter Horizontal Pills */}
        <View style={styles.statusSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusContainer}
          >
            {STATUS_FILTERS.map((s) => {
              const active = selectedStatus === s.id;
              const count = statusCounts[s.id] || 0;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.statusPill,
                    active && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => setSelectedStatus(s.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      active && { color: '#FFFFFF' },
                    ]}
                  >
                    {s.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Search Bar with Quick Add Action */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { flex: 1 }]}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer name, phone, shop, city..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.headerIssueLoanBtn, { marginLeft: 8 }]}
            onPress={() => {
              setSelectedCustomerForIssueLoan(null);
              setIssueLoanModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cash-plus" size={16} color="#FFFFFF" />
            <Text style={styles.headerIssueLoanBtnText}>Issue Loan</Text>
          </TouchableOpacity>
          {onOpenAddUser && (
            <TouchableOpacity
              style={[styles.headerAddBtn, { marginLeft: 6 }]}
              onPress={onOpenAddUser}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="account-plus" size={16} color="#FFFFFF" />
              <Text style={styles.headerAddBtnText}>+ User</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. Clean Count Header */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>
            Customers ({filteredCustomers.length})
          </Text>
          <Text style={styles.recordsHeaderSub}>
            Allot & manage borrower loans
          </Text>
        </View>
      </View>
    );
  };

  // Empty State Component
  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View style={{ marginTop: 4 }}>
          <BorrowerCardSkeleton />
          <BorrowerCardSkeleton />
          <BorrowerCardSkeleton />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        {emptyAnimation ? (
          <LottieView
            source={emptyAnimation}
            autoPlay
            loop
            style={styles.emptyAnimation}
          />
        ) : (
          <MaterialCommunityIcons
            name="account-search-outline"
            size={70}
            color="#9CA3AF"
          />
        )}
        <Text style={styles.emptyTitle}>
          {search.trim() ? 'No Matching Borrowers' : 'No Borrowers in this Category'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {search.trim()
            ? `No matching borrowers found for "${search}".`
            : 'No borrowers found in the selected category or status filter.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main FlatList of Borrowers */}
      <FlatList
        data={loading && !refreshing ? [] : filteredCustomers}
        keyExtractor={(item) => String(item.id || item.customer_code || Math.random())}
        renderItem={({ item }) => (
          <BorrowerCard
            item={item}
            onSelect={handleSelectBorrower}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDisburse={handleDisburse}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B46C1']}
            tintColor="#6B46C1"
          />
        }
      />

      {/* Full-Screen Borrower Ledger Modal (matching Reports) */}
      <BorrowerLogModal
        visible={borrowerLedgerVisible}
        borrower={selectedBorrower}
        onClose={() => {
          setBorrowerLedgerVisible(false);
          setSelectedBorrower(null);
        }}
        onPaymentRecorded={() => {
          fetchLiveBorrowers();
        }}
        onOpenIssueLoan={(b) => {
          const target = b || selectedBorrower;
          setBorrowerLedgerVisible(false);
          setSelectedCustomerForIssueLoan(target);
          setIssueLoanModalVisible(true);
        }}
      />

      {/* Full-Screen Issue & Manage Loans Modal */}
      <IssueLoanModal
        visible={issueLoanModalVisible}
        borrower={selectedCustomerForIssueLoan}
        onClose={() => {
          setIssueLoanModalVisible(false);
          setSelectedCustomerForIssueLoan(null);
        }}
        onLoanIssued={() => {
          fetchLiveBorrowers();
          setIssueLoanModalVisible(false);
          setSelectedCustomerForIssueLoan(null);
        }}
      />
    </View>
  );
};

export default CustomersScreen;
