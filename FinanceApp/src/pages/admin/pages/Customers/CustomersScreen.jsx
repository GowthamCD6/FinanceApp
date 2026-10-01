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
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import apiService from '../../../../services/apiService';
import { CustomerLoansModal } from './CustomerLoansModal';
import { IssueLoanModal } from '../IssueLoan/IssueLoanModal';
import { EditLoanModal, DeleteLoanModal } from '../../../../components/loans/LoanModals';
import styles from './CustomersStyles';

// Category Tabs Definition
const CATEGORY_TABS = [
  { id: 'ALL', label: 'All', icon: 'account-group-outline' },
  { id: 'WEEKLY', label: 'Weekly', icon: 'calendar-week' },
  { id: 'SHOP', label: 'Merchant (Daily)', icon: 'storefront-outline' },
  { id: 'MONTHLY', label: 'Business (EMI)', icon: 'chart-line' },
];

// Status Filters Definition (Current Loans & Completed Loans Focus)
const STATUS_FILTERS = [
  { id: 'ALL', label: 'All', color: '#6B46C1' },
  { id: 'ACTIVE', label: 'Current Loans', color: '#059669' },
  { id: 'COMPLETED', label: 'Completed Loans', color: '#2563EB' },
  { id: 'OVERDUE', label: 'Overdue', color: '#DC2626' },
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
const BorrowerCard = React.memo(({ item, onSelect, onCall, onWhatsApp, onDisburse, onEditLoan, onDeleteLoan }) => {
  const hasActiveLoan = Boolean(item.activeLoan && item.activeLoan.status !== 'COMPLETED' && item.activeLoan.status !== 'SETTLED');
  const isOverdue = item.activeLoan?.status === 'OVERDUE';
  const hasCompletedLoans = Number(item.completedLoansCount || 0) > 0;
  const initial = (item.name || item.full_name || 'B').charAt(0).toUpperCase();

  // Cycle Frequency String
  const cycleUnit = item.isShop ? 'Day' : item.isMonthly ? 'Mo' : 'Wk';
  const freqLabel = item.isShop ? 'Daily Merchant' : item.isMonthly ? 'Monthly Business' : 'Weekly Loan';
  const freqIcon = item.isShop ? 'storefront-outline' : item.isMonthly ? 'chart-line' : 'calendar-week';

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
    statusLabel = 'OVERDUE';
    statusIcon = 'alert-circle-outline';
  } else if (hasActiveLoan) {
    statusBadgeBg = '#ECFDF5';
    statusBorder = '#A7F3D0';
    statusTextColor = '#059669';
    statusLabel = 'ACTIVE';
    statusIcon = 'check-decagram';
  } else if (hasCompletedLoans) {
    statusBadgeBg = '#EFF6FF';
    statusBorder = '#BFDBFE';
    statusTextColor = '#2563EB';
    statusLabel = `${item.completedLoansCount} SETTLED`;
    statusIcon = 'check-all';
  }

  return (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => onSelect(item)}
      activeOpacity={0.88}
    >
      {/* 1. Header: Avatar, Name, Phone/Address & Status Badge */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            item.isShop && styles.avatarShop,
            item.isMonthly && styles.avatarMonthly,
          ]}
        >
          {item.isShop ? (
            <MaterialCommunityIcons name="storefront" size={20} color="#FFFFFF" />
          ) : item.isMonthly ? (
            <MaterialCommunityIcons name="chart-line" size={20} color="#FFFFFF" />
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

      {/* 2. Middle Loan Overview */}
      {hasActiveLoan ? (
        <>
          {/* Scheme & Code Info Bar */}
          <View style={styles.schemeStrip}>
            <View style={styles.schemeTag}>
              <MaterialCommunityIcons name={freqIcon} size={13} color="#6B46C1" />
              <Text style={styles.schemeTagText}>{freqLabel}</Text>
              {(item.activeLoan?.loan_number || item.activeLoan?.loan_code) && (
                <Text style={styles.loanCodeBadge}>
                  #{item.activeLoan.loan_number || item.activeLoan.loan_code}
                </Text>
              )}
            </View>

            {item.totalInstallments > 0 && (
              <Text style={styles.installmentProgressText}>
                Inst. {item.paidInstallments || 0}/{item.totalInstallments}
              </Text>
            )}
          </View>

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
                {item.completedLoansCount} Past Loan{item.completedLoansCount > 1 ? 's' : ''} Completed & Settled
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
            <Text style={styles.noLoanSchemeTag}>{freqLabel}</Text>
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

      {/* 3. Action Buttons Footer: Neatly Aligned Tools & Primary Action */}
      <View style={styles.cardFooter}>
        {/* Left Side: Compact Circular Actions */}
        <View style={styles.footerLeftActions}>
          {item.phone ? (
            <TouchableOpacity
              style={styles.circleActionBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onCall(item.phone);
              }}
              activeOpacity={0.7}
              accessibilityLabel="Call"
            >
              <MaterialCommunityIcons name="phone" size={15} color="#6B46C1" />
            </TouchableOpacity>
          ) : null}

          {item.phone ? (
            <TouchableOpacity
              style={[styles.circleActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onWhatsApp(item);
              }}
              activeOpacity={0.7}
              accessibilityLabel="WhatsApp"
            >
              <MaterialCommunityIcons name="whatsapp" size={16} color="#059669" />
            </TouchableOpacity>
          ) : null}

          {hasActiveLoan && (
            <TouchableOpacity
              style={[styles.circleActionBtn, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onEditLoan(item);
              }}
              activeOpacity={0.7}
              accessibilityLabel="Edit Loan"
            >
              <MaterialCommunityIcons name="pencil-outline" size={15} color="#475569" />
            </TouchableOpacity>
          )}

          {hasActiveLoan && (
            <TouchableOpacity
              style={[styles.circleActionBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onDeleteLoan(item);
              }}
              activeOpacity={0.7}
              accessibilityLabel="Delete Loan"
            >
              <MaterialCommunityIcons name="trash-can-outline" size={15} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Side: Primary CTA */}
        <View style={styles.footerRightActions}>
          {hasActiveLoan ? (
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => onSelect(item)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="card-account-details-outline" size={14} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>View Loans</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onDisburse(item);
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="cash-plus" size={15} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>Issue Loan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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

  // Customer Loans Modal State (Current Loan & Completed Loans)
  const [selectedCustomerForLoans, setSelectedCustomerForLoans] = useState(null);
  const [customerLoansVisible, setCustomerLoansVisible] = useState(false);

  // Issue Loan Modal State
  const [selectedCustomerForIssueLoan, setSelectedCustomerForIssueLoan] = useState(null);
  const [issueLoanModalVisible, setIssueLoanModalVisible] = useState(false);

  // Edit and Delete Loan Modal States
  const [selectedCustomerForEditLoan, setSelectedCustomerForEditLoan] = useState(null);
  const [editLoanModalVisible, setEditLoanModalVisible] = useState(false);
  const [selectedCustomerForDeleteLoan, setSelectedCustomerForDeleteLoan] = useState(null);
  const [deleteLoanModalVisible, setDeleteLoanModalVisible] = useState(false);


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
      const hasCompleted = Number(c.completedLoansCount || 0) > 0;
      if (selectedStatus === 'ACTIVE' && !hasActive) return false;
      if (selectedStatus === 'COMPLETED' && !hasCompleted) return false;
      if (selectedStatus === 'OVERDUE' && !isOverdue) return false;
      if (selectedStatus === 'NO_LOAN' && hasActive) return false;

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
      COMPLETED: enrichedCustomers.filter((c) => (c.completedLoansCount || 0) > 0).length,
      OVERDUE: enrichedCustomers.filter((c) => c.activeLoan?.status === 'OVERDUE').length,
      NO_LOAN: enrichedCustomers.filter((c) => !c.activeLoan || c.activeLoan.status === 'COMPLETED').length,
    };
  }, [enrichedCustomers]);

  // Handlers
  const handleSelectBorrower = useCallback((customer) => {
    setSelectedCustomerForLoans(customer);
    setCustomerLoansVisible(true);
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

  // List Header Component focused purely on Loan Card Creation and Existing Loan Cards
  const renderListHeader = () => {
    return (
      <View>
        {/* 1. Search Bar with Prominent Loan Card Creation Actions */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search borrower, mobile, shop..."
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

          {/* Create Loan Card Action Button */}
          <TouchableOpacity
            style={styles.headerIssueLoanBtn}
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
              style={styles.headerAddBtn}
              onPress={onOpenAddUser}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="account-plus" size={16} color="#FFFFFF" />
              <Text style={styles.headerAddBtnText}>+ User</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Loan Status Filter Horizontal Pills */}
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

        {/* 3. Existing Loan Cards Count Header */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>
            Loan Cards ({filteredCustomers.length})
          </Text>
          <Text style={styles.recordsHeaderSub}>
            {selectedTab === 'ALL'
              ? 'All existing loan cards'
              : `${selectedTab === 'WEEKLY' ? 'Weekly' : selectedTab === 'SHOP' ? 'Merchant Daily' : 'Business EMI'} loan cards`}
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
        <View style={styles.emptyIconContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons
              name={search.trim() ? "account-search-outline" : "folder-open-outline"}
              size={36}
              color="#6B46C1"
            />
          </View>
        </View>

        <Text style={styles.emptyTitle}>
          {search.trim() ? 'No Matching Borrowers' : 'No Borrowers Found'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {search.trim()
            ? `No matching borrowers found for "${search}". Try a different keyword or filter.`
            : 'No borrowers found in the selected category or status filter.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Attached Category Tab Bar for loan cards viewing */}
      <View style={styles.headerAttachedTabBar}>
        {CATEGORY_TABS.map((tab) => {
          const active = selectedTab === tab.id;
          const count = tabCounts[tab.id] || 0;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.headerAttachedTab}
              onPress={() => setSelectedTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContentRow}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={14}
                  color={active ? '#6B46C1' : '#6B7280'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.headerAttachedTabText,
                    active && styles.headerAttachedTabTextActive,
                  ]}
                >
                  {tab.label} ({count})
                </Text>
              </View>
              {active && <View style={styles.tabActiveBottomLine} />}
            </TouchableOpacity>
          );
        })}
      </View>

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
            onEditLoan={(cust) => {
              if (cust.activeLoan) {
                setSelectedCustomerForEditLoan(cust);
                setEditLoanModalVisible(true);
              }
            }}
            onDeleteLoan={(cust) => {
              if (cust.activeLoan) {
                setSelectedCustomerForDeleteLoan(cust);
                setDeleteLoanModalVisible(true);
              }
            }}
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

      {/* Customer Loans Modal (Current Loan & Completed Loans History) */}
      <CustomerLoansModal
        visible={customerLoansVisible}
        customer={selectedCustomerForLoans}
        onClose={() => {
          setCustomerLoansVisible(false);
          setSelectedCustomerForLoans(null);
        }}
        onIssueLoan={(cust) => {
          setCustomerLoansVisible(false);
          setSelectedCustomerForIssueLoan(cust);
          setIssueLoanModalVisible(true);
        }}
        onEditLoan={(cust) => {
          setCustomerLoansVisible(false);
          setSelectedCustomerForEditLoan(cust);
          setEditLoanModalVisible(true);
        }}
        onDeleteLoan={(cust) => {
          setCustomerLoansVisible(false);
          setSelectedCustomerForDeleteLoan(cust);
          setDeleteLoanModalVisible(true);
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


      {/* Edit Loan Modal */}
      {selectedCustomerForEditLoan?.activeLoan && (
        <EditLoanModal
          visible={editLoanModalVisible}
          onClose={() => {
            setEditLoanModalVisible(false);
            setSelectedCustomerForEditLoan(null);
          }}
          loan={selectedCustomerForEditLoan.activeLoan}
          customer={selectedCustomerForEditLoan}
          onSuccess={() => {
            fetchLiveBorrowers();
          }}
        />
      )}

      {/* Delete Loan Modal */}
      {selectedCustomerForDeleteLoan?.activeLoan && (
        <DeleteLoanModal
          visible={deleteLoanModalVisible}
          onClose={() => {
            setDeleteLoanModalVisible(false);
            setSelectedCustomerForDeleteLoan(null);
          }}
          loan={selectedCustomerForDeleteLoan.activeLoan}
          customer={selectedCustomerForDeleteLoan}
          onSuccess={() => {
            fetchLiveBorrowers();
          }}
        />
      )}
    </View>
  );
};

export default CustomersScreen;
