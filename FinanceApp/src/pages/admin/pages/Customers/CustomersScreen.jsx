import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import apiService from '../../../../services/apiService';

// Primary Category Tabs
const CATEGORY_TABS = [
  { id: 'WEEKLY', label: 'Weekly', icon: 'calendar-week', sub: '10 Wks' },
  { id: 'MONTHLY', label: 'Monthly', icon: 'calendar-month', sub: 'EMI' },
  { id: 'SHOP', label: 'Shopkeeper', icon: 'storefront-outline', sub: 'Daily' },
  { id: 'ALL', label: 'All', icon: 'account-group-outline', sub: 'All' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active Loans' },
  { id: 'DUE_TODAY', label: 'Due Today' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'NO_LOAN', label: 'No Active Loan' },
];

// Memoized Borrower Card for 60fps Smooth Virtualized Scrolling
const BorrowerCard = React.memo(({ customer, onSelect, onCall, onWhatsApp, onCollect, onDisburse }) => {
  const hasActiveLoan = Boolean(customer.activeLoan && customer.activeLoan.status !== 'COMPLETED');
  const isOverdue = customer.activeLoan?.status === 'OVERDUE';
  const progressRatio = customer.totalInstallments > 0 ? Math.min(1, customer.paidInstallments / customer.totalInstallments) : 0;
  const progressPct = Math.round(progressRatio * 100);
  const initial = (customer.name || customer.full_name || 'B').charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.borrowerCard}
      onPress={() => onSelect(customer)}
      activeOpacity={0.85}
    >
      {/* Card Header: Avatar, Name & Status Badge */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatarBox, customer.isShop && styles.avatarBoxShop]}>
          {customer.isShop ? (
            <MaterialCommunityIcons name="storefront" size={20} color="#FFFFFF" />
          ) : (
            <Text style={styles.avatarLetter}>{initial}</Text>
          )}
        </View>

        <View style={styles.nameBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.borrowerName} numberOfLines={1}>
              {customer.name || customer.full_name || 'Borrower'}
            </Text>
            {customer.isShop && (customer.shop_name || customer.occupation) ? (
              <View style={styles.shopPill}>
                <MaterialCommunityIcons name="tag-outline" size={10} color="#6B46C1" />
                <Text style={styles.shopPillText} numberOfLines={1}>
                  {customer.shop_name || customer.occupation}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.borrowerMeta} numberOfLines={1}>
            {customer.phone || 'No phone'} {customer.address || customer.city ? `• ${customer.address || customer.city}` : ''}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isOverdue
              ? styles.statusBadgeOverdue
              : hasActiveLoan
              ? styles.statusBadgeActive
              : styles.statusBadgeNoLoan,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              isOverdue
                ? { color: '#DC2626' }
                : hasActiveLoan
                ? { color: '#059669' }
                : { color: '#6B7280' },
            ]}
          >
            {isOverdue ? 'OVERDUE' : hasActiveLoan ? 'ACTIVE' : 'NO LOAN'}
          </Text>
        </View>
      </View>

      {/* Contract & Progress Strip */}
      {hasActiveLoan ? (
        <View style={styles.contractStrip}>
          <View style={styles.contractHeaderRow}>
            <View style={styles.schemeTagBox}>
              <MaterialCommunityIcons
                name={customer.isShop ? 'store' : customer.isMonthly ? 'calendar-month' : 'calendar-week'}
                size={12}
                color="#6B46C1"
              />
              <Text style={styles.schemeTagText}>
                {customer.activeLoan?.repayment_frequency || customer.inferredCategory} ({customer.activeLoan?.interest_rate || 25}% FLAT)
              </Text>
              <Text style={styles.loanCodeText}>
                ({customer.activeLoan?.loan_number || customer.activeLoan?.loan_code || 'LOAN'})
              </Text>
            </View>

            <Text style={styles.progressCounterText}>
              {customer.paidInstallments}/{customer.totalInstallments} ({progressPct}%)
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPct}%` },
                isOverdue && { backgroundColor: '#DC2626' },
              ]}
            />
          </View>

          {/* Financial Numbers Row */}
          <View style={styles.financialNumbersRow}>
            <View>
              <Text style={styles.finLabel}>EMI Installment</Text>
              <Text style={styles.finEmiValue}>
                {formatINR(customer.emiAmount)}
                <Text style={styles.finFreqUnit}>/{customer.isShop ? 'day' : customer.isMonthly ? 'mo' : 'wk'}</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.finLabel}>Remaining Due</Text>
              <Text style={[styles.finDueValue, isOverdue && { color: '#DC2626' }]}>
                {formatINR(customer.remainingBalance)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.eligibleLoanStrip}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#6B46C1" />
          <Text style={styles.eligibleLoanText}>
            No active loan contract. Eligible for new disbursement.
          </Text>
        </View>
      )}

      {/* Quick Action Buttons (Call, WhatsApp, Collect, Disburse) */}
      <View style={styles.cardActionsRow}>
        {customer.phone ? (
          <TouchableOpacity
            style={styles.actionBtnCall}
            onPress={() => onCall(customer.phone)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="phone" size={14} color="#6B46C1" />
            <Text style={styles.actionBtnCallText}>Call</Text>
          </TouchableOpacity>
        ) : null}

        {customer.phone ? (
          <TouchableOpacity
            style={styles.actionBtnWhatsApp}
            onPress={() => onWhatsApp(customer)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="whatsapp" size={14} color="#00A884" />
            <Text style={styles.actionBtnWhatsAppText}>WhatsApp</Text>
          </TouchableOpacity>
        ) : null}

        {hasActiveLoan ? (
          <TouchableOpacity
            style={styles.actionBtnCollect}
            onPress={() => onCollect(customer)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="wallet-outline" size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnCollectText}>
              Collect {formatINR(customer.emiAmount)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionBtnDisburse}
            onPress={() => onDisburse(customer)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cash-plus" size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnDisburseText}>Issue Loan</Text>
          </TouchableOpacity>
        )}
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
    addCustomer,
    collectPayment,
    disburseLoan,
    defaultCategories,
    lendingConfig,
    updateDefaultCategory,
    currentOrganization,
  } = useApp();

  // Local Live Database State
  const [dbCustomers, setDbCustomers] = useState([]);
  const [dbLoans, setDbLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('WEEKLY');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showInterestRatesModal, setShowInterestRatesModal] = useState(false);
  const [activeCustomerForAction, setActiveCustomerForAction] = useState(null);

  // Form States for Add Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustType, setNewCustType] = useState('WEEKLY');
  const [newCustShopName, setNewCustShopName] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [isSubmittingCust, setIsSubmittingCust] = useState(false);

  // Form States for Quick Collect
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState('CASH');
  const [isSubmittingCollect, setIsSubmittingCollect] = useState(false);

  // Form States for Quick Disburse
  const [disburseAmount, setDisburseAmount] = useState('10000');
  const [disburseFreq, setDisburseFreq] = useState('WEEKLY');
  const [disburseTenure, setDisburseTenure] = useState('10');
  const [disburseInterestRate, setDisburseInterestRate] = useState('25');
  const [isSubmittingDisburse, setIsSubmittingDisburse] = useState(false);

  // Form States for Editing Category Interest Rates
  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState(null);
  const [editInterestRate, setEditInterestRate] = useState('25');
  const [editTenure, setEditTenure] = useState('10');
  const [editMinLoan, setEditMinLoan] = useState('2000');
  const [editMaxLoan, setEditMaxLoan] = useState('100000');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

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

  // Live Category Interest Rates Map
  const categoryRateMap = useMemo(() => {
    const weeklyCat = (defaultCategories || []).find((c) => c.repayment_frequency === 'WEEKLY' || c.category_code === 'CAT-BORROWER-WK');
    const dailyCat = (defaultCategories || []).find((c) => c.repayment_frequency === 'DAILY' || c.category_code === 'CAT-MERCHANT-DLY');
    const monthlyCat = (defaultCategories || []).find((c) => c.repayment_frequency === 'MONTHLY' || c.category_code === 'CAT-BORROWER-MO');

    return {
      WEEKLY: {
        rate: Number(weeklyCat?.default_interest_rate ?? lendingConfig?.weekly_interest_rate ?? 25),
        tenure: Number(weeklyCat?.tenure_installments ?? lendingConfig?.weekly_tenure_weeks ?? 10),
        minLoan: Number(weeklyCat?.default_min_loan ?? 2000),
        maxLoan: Number(weeklyCat?.default_max_loan ?? 50000),
        catObj: weeklyCat,
      },
      DAILY: {
        rate: Number(dailyCat?.default_interest_rate ?? lendingConfig?.daily_interest_rate ?? 25),
        tenure: Number(dailyCat?.tenure_installments ?? lendingConfig?.daily_tenure_days ?? 100),
        minLoan: Number(dailyCat?.default_min_loan ?? 5000),
        maxLoan: Number(dailyCat?.default_max_loan ?? 100000),
        catObj: dailyCat,
      },
      MONTHLY: {
        rate: Number(monthlyCat?.default_interest_rate ?? lendingConfig?.monthly_interest_rate ?? 25),
        tenure: Number(monthlyCat?.tenure_installments ?? lendingConfig?.monthly_tenure_months ?? 12),
        minLoan: Number(monthlyCat?.default_min_loan ?? 10000),
        maxLoan: Number(monthlyCat?.default_max_loan ?? 500000),
        catObj: monthlyCat,
      },
    };
  }, [defaultCategories, lendingConfig]);

  // Enriched customers mapped with active loan records & metrics from database
  const enrichedCustomers = useMemo(() => {
    return activeCustomersList.map((c) => {
      const custLoans = activeLoansList.filter(
        (l) => String(l.customer_id) === String(c.id) || (c.phone && l.customer_phone === c.phone)
      );

      const activeLoan =
        custLoans.find(
          (l) =>
            l.status === 'ACTIVE' ||
            l.status === 'DISBURSED' ||
            l.status === 'PARTIALLY_PAID' ||
            l.status === 'OVERDUE'
        ) || custLoans[0] || null;

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

      const defaultInstallments = isShop ? (categoryRateMap.DAILY.tenure || 100) : isMonthly ? (categoryRateMap.MONTHLY.tenure || 12) : (categoryRateMap.WEEKLY.tenure || 10);
      const totalInstallments = Number(activeLoan?.total_installments || activeLoan?.tenure_installments || defaultInstallments);
      const totalRepayable = Number(activeLoan?.total_repayment_amount || 0);
      const emiAmount = Number(activeLoan?.emi_amount || (totalRepayable > 0 && totalInstallments > 0 ? Math.round(totalRepayable / totalInstallments) : (isShop ? 125 : isMonthly ? 2600 : 1250)));
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
        totalInstallments,
        paidInstallments,
        emiAmount,
        totalRepayable,
        remainingBalance,
      };
    });
  }, [activeCustomersList, activeLoansList, categoryRateMap]);

  // Tab Counts for Badges
  const tabCounts = useMemo(() => {
    return {
      WEEKLY: enrichedCustomers.filter((c) => c.inferredCategory === 'WEEKLY').length,
      MONTHLY: enrichedCustomers.filter((c) => c.inferredCategory === 'MONTHLY').length,
      SHOP: enrichedCustomers.filter((c) => c.inferredCategory === 'SHOP').length,
      ALL: enrichedCustomers.length,
    };
  }, [enrichedCustomers]);

  // Tab & Search Filtering
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

  // Category Summary Metrics
  const categoryMetrics = useMemo(() => {
    const list = filteredCustomers;
    const activeCount = list.filter((c) => c.activeLoan && c.activeLoan.status !== 'COMPLETED').length;
    const totalOutstanding = list.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);

    return {
      count: list.length,
      activeCount,
      totalOutstanding,
    };
  }, [filteredCustomers]);

  // Phone Call Quick Action
  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Unable to make call', 'Please verify device dialer permissions.');
      });
    }
  };

  // WhatsApp Quick Action
  const handleWhatsApp = (customer) => {
    const phone = customer.phone?.replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert('No Phone Number', 'This borrower does not have a phone number registered.');
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const loanCode = customer.activeLoan?.loan_number || customer.activeLoan?.loan_code || 'Loan';
    const dueAmount = customer.remainingBalance > 0 ? formatINR(customer.activeLoan?.emi_amount || customer.remainingBalance) : '₹0';
    const message = encodeURIComponent(
      `Hello ${customer.name || customer.full_name}, this is Apex Finance regarding your active loan (${loanCode}). Outstanding installment balance is ${dueAmount}. Thank you!`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
    });
  };

  // Open Collect Dialog
  const handleOpenCollect = (customer) => {
    setActiveCustomerForAction(customer);
    const initialAmt = customer.emiAmount > 0 && customer.remainingBalance >= customer.emiAmount
      ? String(customer.emiAmount)
      : String(customer.remainingBalance || '');
    setCollectAmount(initialAmt);
    setCollectMethod('CASH');
    setShowCollectModal(true);
  };

  // Submit Collect Payment
  const handleSubmitCollect = async () => {
    if (!activeCustomerForAction?.id) return;
    const amt = parseFloat(collectAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive collection amount.');
      return;
    }

    try {
      setIsSubmittingCollect(true);
      const paymentData = {
        customerId: activeCustomerForAction.id,
        loanId: activeCustomerForAction.activeLoan?.id,
        amount: amt,
        paymentMethod: collectMethod,
        paymentDate: new Date().toISOString().slice(0, 10),
        referenceNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        notes: `Collected via Mobile Admin Panel (${collectMethod})`,
      };

      if (collectPayment) {
        await collectPayment(paymentData);
      } else {
        await apiService.recordPayment(paymentData);
      }

      Alert.alert('Payment Recorded', `Successfully collected ${formatINR(amt)} via ${collectMethod}!`);
      setShowCollectModal(false);
      setActiveCustomerForAction(null);
      await fetchLiveBorrowers();
    } catch (err) {
      Alert.alert('Collection Failed', err.message || 'Error processing payment.');
    } finally {
      setIsSubmittingCollect(false);
    }
  };

  // Open Disburse Dialog
  const handleOpenDisburse = (customer) => {
    setActiveCustomerForAction(customer);
    if (customer.inferredCategory === 'SHOP') {
      setDisburseFreq('DAILY');
      setDisburseAmount('10000');
      setDisburseTenure(String(categoryRateMap.DAILY.tenure || 100));
      setDisburseInterestRate(String(categoryRateMap.DAILY.rate || 25));
    } else if (customer.inferredCategory === 'MONTHLY') {
      setDisburseFreq('MONTHLY');
      setDisburseAmount('25000');
      setDisburseTenure(String(categoryRateMap.MONTHLY.tenure || 12));
      setDisburseInterestRate(String(categoryRateMap.MONTHLY.rate || 25));
    } else {
      setDisburseFreq('WEEKLY');
      setDisburseAmount('10000');
      setDisburseTenure(String(categoryRateMap.WEEKLY.tenure || 10));
      setDisburseInterestRate(String(categoryRateMap.WEEKLY.rate || 25));
    }
    setShowDisburseModal(true);
  };

  // Submit Disburse
  const handleSubmitDisburse = async () => {
    if (!activeCustomerForAction?.id) {
      Alert.alert('Error', 'Borrower account reference missing.');
      return;
    }

    const principal = Number(disburseAmount);
    const tenure = Number(disburseTenure);
    const rate = Number(disburseInterestRate);

    if (isNaN(principal) || principal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid loan principal amount.');
      return;
    }

    try {
      setIsSubmittingDisburse(true);
      const interestAmount = Math.round((principal * rate) / 100);
      const totalRepayment = principal + interestAmount;
      const emi = Math.round(totalRepayment / tenure);

      const loanPayload = {
        customerId: activeCustomerForAction.id,
        customer_id: activeCustomerForAction.id,
        principalAmount: principal,
        principal_amount: principal,
        contractedIncome: interestAmount,
        interest_amount: interestAmount,
        interestRate: rate,
        interest_rate: rate,
        totalRepaymentAmount: totalRepayment,
        total_repayment_amount: totalRepayment,
        totalInstallments: tenure,
        total_installments: tenure,
        repaymentFrequency: disburseFreq,
        repayment_frequency: disburseFreq,
        emiAmount: emi,
        emi_amount: emi,
        disbursementMethod: 'CASH',
        notes: `Assigned via Mobile Admin Panel (${disburseFreq} @ ${rate}%)`,
      };

      if (disburseLoan) {
        await disburseLoan(loanPayload);
      } else {
        const created = await apiService.createLoan(loanPayload);
        if (created?.id) {
          await apiService.approveLoan(created.id);
          await apiService.disburseLoan(created.id);
        }
      }

      Alert.alert('Loan Disbursed', `Successfully issued ${formatINR(principal)} (${disburseFreq} @ ${rate}% flat) to ${activeCustomerForAction.name}!`);
      setShowDisburseModal(false);
      setActiveCustomerForAction(null);
      await fetchLiveBorrowers();
    } catch (err) {
      Alert.alert('Disbursement Error', err.message || 'Failed to create loan.');
    } finally {
      setIsSubmittingDisburse(false);
    }
  };

  // Create New Customer
  const handleCreateCustomer = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter both full name and phone number.');
      return;
    }

    try {
      setIsSubmittingCust(true);
      const custData = {
        fullName: newCustName.trim(),
        full_name: newCustName.trim(),
        phone: newCustPhone.trim(),
        customerType: newCustType === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        customer_type: newCustType === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        shopName: newCustType === 'SHOPKEEPER' ? newCustShopName.trim() : null,
        shop_name: newCustType === 'SHOPKEEPER' ? newCustShopName.trim() : null,
        address: newCustAddress.trim(),
        organizationId: currentOrganization?.id || 1,
      };

      if (addCustomer) {
        await addCustomer(custData);
      } else {
        await apiService.createCustomer(custData);
      }

      Alert.alert('Success', `Registered ${newCustName.trim()} successfully!`);
      setShowAddModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustShopName('');
      setNewCustAddress('');
      await fetchLiveBorrowers();
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not register customer.');
    } finally {
      setIsSubmittingCust(false);
    }
  };

  // Open Edit Interest Rate Modal for a Category
  const handleOpenEditCategory = (catType) => {
    const configData = categoryRateMap[catType];
    setSelectedCategoryConfig({ catType, ...configData });
    setEditInterestRate(String(configData.rate || 25));
    setEditTenure(String(configData.tenure || 10));
    setEditMinLoan(String(configData.minLoan || 2000));
    setEditMaxLoan(String(configData.maxLoan || 100000));
    setShowInterestRatesModal(true);
  };

  // Save Category Interest Rate & Config to Server
  const handleSaveCategoryConfig = async () => {
    if (!selectedCategoryConfig) return;
    try {
      setIsSavingCategory(true);
      const code = selectedCategoryConfig.catObj?.category_code || (
        selectedCategoryConfig.catType === 'DAILY' ? 'CAT-MERCHANT-DLY' :
        selectedCategoryConfig.catType === 'MONTHLY' ? 'CAT-BORROWER-MO' : 'CAT-BORROWER-WK'
      );

      const payload = {
        default_interest_rate: parseFloat(editInterestRate) || 25.0,
        tenure_installments: parseInt(editTenure, 10) || 10,
        default_min_loan: parseFloat(editMinLoan) || 2000,
        default_max_loan: parseFloat(editMaxLoan) || 100000,
      };

      if (updateDefaultCategory) {
        await updateDefaultCategory(code, payload);
      } else {
        await apiService.updateDefaultCategory(code, payload);
      }

      Alert.alert('Configuration Updated', `${selectedCategoryConfig.catType} scheme interest rate updated to ${editInterestRate}% flat across the organization!`);
      setShowInterestRatesModal(false);
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Unable to update interest rate configuration.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Render FlatList Header (Controls, Scorecard, Tabs, Status Chips)
  const renderListHeader = () => {
    return (
      <View>
        {/* 1. TOP ACTION BAR: SEARCH, RATE SETTINGS & ADD */}
        <View style={styles.topActionBar}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search borrower, shop, phone..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Rate Governance Button */}
          <TouchableOpacity
            style={styles.btnInterestRates}
            onPress={() => handleOpenEditCategory(selectedTab === 'SHOP' ? 'DAILY' : selectedTab === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="percent" size={14} color="#6B46C1" />
            <Text style={styles.btnInterestRatesText}>
              {selectedTab === 'SHOP' ? categoryRateMap.DAILY.rate : selectedTab === 'MONTHLY' ? categoryRateMap.MONTHLY.rate : categoryRateMap.WEEKLY.rate}%
            </Text>
          </TouchableOpacity>

          {/* Add Borrower Button */}
          <TouchableOpacity
            style={styles.btnAddBorrower}
            onPress={() => (onOpenAddBorrower ? onOpenAddBorrower() : onOpenAddUser ? onOpenAddUser() : setShowAddModal(true))}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="account-plus" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.btnAddBorrowerText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* 2. PRIMARY CATEGORY TABS (WEEKLY, MONTHLY, SHOP, ALL) */}
        <View style={styles.categoryTabsContainer}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            const count = tabCounts[tab.id] || 0;
            const rate = tab.id === 'SHOP' ? categoryRateMap.DAILY.rate : tab.id === 'MONTHLY' ? categoryRateMap.MONTHLY.rate : categoryRateMap.WEEKLY.rate;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setSelectedTab(tab.id)}
                activeOpacity={0.8}
              >
                <View style={styles.tabHeaderRow}>
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={14}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                  />
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.categoryTabLabel, isActive && styles.categoryTabLabelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
                <Text style={[styles.categoryTabSub, isActive && styles.categoryTabSubActive]} numberOfLines={1}>
                  {tab.id === 'ALL' ? 'All' : `${rate}%`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. PROFILE-THEMED SCORECARD KPI SUMMARY STRIP */}
        <View style={styles.scorecardContainer}>
          <View style={styles.scorecardItem}>
            <Text style={styles.scorecardVal}>{categoryMetrics.count}</Text>
            <Text style={styles.scorecardLbl}>Borrowers</Text>
          </View>
          <View style={styles.scorecardDivider} />
          <View style={styles.scorecardItem}>
            <Text style={[styles.scorecardVal, { color: '#059669' }]}>{categoryMetrics.activeCount}</Text>
            <Text style={styles.scorecardLbl}>Active Loans</Text>
          </View>
          <View style={styles.scorecardDivider} />
          <View style={styles.scorecardItem}>
            <Text style={[styles.scorecardVal, { color: '#6B46C1' }]}>
              {formatINR(categoryMetrics.totalOutstanding)}
            </Text>
            <Text style={styles.scorecardLbl}>Outstanding</Text>
          </View>
        </View>

        {/* 4. SECONDARY STATUS FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusChipsRow}
          contentContainerStyle={styles.statusChipsContent}
        >
          {STATUS_FILTERS.map((s) => {
            const isActive = selectedStatus === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.statusChip, isActive && styles.statusChipActive]}
                onPress={() => setSelectedStatus(s.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#6B46C1" />
            <Text style={styles.loadingText}>Loading live borrower accounts...</Text>
          </View>
        )}
      </View>
    );
  };

  // Render Empty State
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconBox}>
          <MaterialCommunityIcons name="account-search-outline" size={32} color="#6B46C1" />
        </View>
        <Text style={styles.emptyTitle}>No {selectedTab.toLowerCase()} accounts found</Text>
        <Text style={styles.emptySub}>
          {search.trim()
            ? `No results match "${search}". Try adjusting your search query.`
            : `No borrowers found under ${selectedTab} category. Tap "Add" to register a new client.`}
        </Text>
        <TouchableOpacity
          style={styles.emptyAddBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.emptyAddBtnText}>Add New {selectedTab === 'SHOP' ? 'Shopkeeper' : 'Borrower'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <BorrowerCard
      customer={item}
      onSelect={setSelectedBorrower}
      onCall={handleCall}
      onWhatsApp={handleWhatsApp}
      onCollect={handleOpenCollect}
      onDisburse={handleOpenDisburse}
    />
  );

  const keyExtractor = (item, index) => {
    return String(item.id || item.customer_code || index);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* 5. VIRTUALIZED 60FPS FLATLIST */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B46C1']}
            tintColor="#6B46C1"
          />
        }
      />

      {/* ========================================================================= */}
      {/* 6. MODAL: EDIT CATEGORY INTEREST RATE & GOVERNANCE                        */}
      {/* ========================================================================= */}
      <Modal
        visible={showInterestRatesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInterestRatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedCategoryConfig?.catType} Scheme Interest Rate
                </Text>
                <Text style={styles.modalSub}>
                  Organization Default Lending Governance & Policies
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowInterestRatesModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>SELECT SCHEME TO CONFIGURE</Text>
              <View style={styles.formCategoryRow}>
                {['WEEKLY', 'DAILY', 'MONTHLY'].map((type) => {
                  const isSel = selectedCategoryConfig?.catType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.formCatBtn, isSel && styles.formCatBtnActive]}
                      onPress={() => handleOpenEditCategory(type)}
                    >
                      <Text style={[styles.formCatBtnText, isSel && styles.formCatBtnTextActive]}>
                        {type === 'DAILY' ? 'Shopkeeper' : type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>FLAT INTEREST RATE (%) *</Text>
              <TextInput
                style={[styles.formInput, { fontSize: 16, fontWeight: '800', color: '#6B46C1' }]}
                keyboardType="numeric"
                value={editInterestRate}
                onChangeText={setEditInterestRate}
                placeholder="25.0"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>
                DEFAULT TENURE ({selectedCategoryConfig?.catType === 'DAILY' ? 'DAYS' : selectedCategoryConfig?.catType === 'MONTHLY' ? 'MONTHS' : 'WEEKS'})
              </Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={editTenure}
                onChangeText={setEditTenure}
                placeholder="10"
                placeholderTextColor="#9CA3AF"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MIN LOAN (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={editMinLoan}
                    onChangeText={setEditMinLoan}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MAX LOAN (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={editMaxLoan}
                    onChangeText={setEditMaxLoan}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowInterestRatesModal(false)}
                disabled={isSavingCategory}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveCategoryConfig}
                disabled={isSavingCategory}
              >
                {isSavingCategory ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Policy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. MODAL: BORROWER DETAILS & FULL LEDGER                                  */}
      {/* ========================================================================= */}
      {selectedBorrower && (
        <Modal
          visible={Boolean(selectedBorrower)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedBorrower(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedBorrower.name || selectedBorrower.full_name}
                  </Text>
                  <Text style={styles.modalSub}>
                    {selectedBorrower.customer_code || 'CUST'} • {selectedBorrower.phone || 'No Phone'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedBorrower(null)}
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.profileMetaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Category</Text>
                    <Text style={[styles.metaVal, { color: '#6B46C1' }]}>
                      {selectedBorrower.inferredCategory === 'SHOP'
                        ? 'Shopkeeper (Daily)'
                        : selectedBorrower.inferredCategory === 'MONTHLY'
                        ? 'Monthly Client'
                        : 'Weekly Borrower (10 Wks)'}
                    </Text>
                  </View>
                  {selectedBorrower.isShop && (
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Shop Name</Text>
                      <Text style={styles.metaVal}>
                        {selectedBorrower.shop_name || 'Retail Business'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Address / Area</Text>
                    <Text style={styles.metaVal}>
                      {selectedBorrower.address || selectedBorrower.city || 'Chennai'}
                    </Text>
                  </View>
                </View>

                {selectedBorrower.activeLoan ? (
                  <View style={styles.ledgerBox}>
                    <View style={styles.ledgerHeaderRow}>
                      <Text style={styles.ledgerTitle}>ACTIVE LOAN CONTRACT</Text>
                      <Text style={styles.ledgerCode}>
                        {selectedBorrower.activeLoan.loan_number || selectedBorrower.activeLoan.loan_code}
                      </Text>
                    </View>

                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Principal Lent:</Text>
                      <Text style={styles.ledgerVal}>
                        {formatINR(selectedBorrower.activeLoan.principal_amount || 10000)}
                      </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Contracted Interest:</Text>
                      <Text style={[styles.ledgerVal, { color: '#059669', fontWeight: '800' }]}>
                        {selectedBorrower.activeLoan.interest_rate || 25}% Flat
                      </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Total Repayable:</Text>
                      <Text style={[styles.ledgerVal, { fontWeight: '800' }]}>
                        {formatINR(selectedBorrower.totalRepayable || selectedBorrower.activeLoan.total_repayment_amount)}
                      </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Total Paid:</Text>
                      <Text style={[styles.ledgerVal, { color: '#059669', fontWeight: '800' }]}>
                        {formatINR(selectedBorrower.activeLoan.total_paid || (selectedBorrower.paidInstallments * selectedBorrower.emiAmount))}
                      </Text>
                    </View>
                    <View style={[styles.ledgerRow, styles.ledgerDividerRow]}>
                      <Text style={[styles.ledgerLabel, { fontWeight: '700', color: '#111827' }]}>
                        Remaining Outstanding:
                      </Text>
                      <Text style={[styles.ledgerVal, { color: '#6B46C1', fontWeight: '900', fontSize: 14 }]}>
                        {formatINR(selectedBorrower.remainingBalance)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noLoanCard}>
                    <MaterialCommunityIcons name="cash-check" size={28} color="#6B46C1" />
                    <Text style={styles.noLoanCardTitle}>No Active Loan Running</Text>
                    <Text style={styles.noLoanCardSub}>
                      This borrower account is verified for a new disbursement.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                {selectedBorrower.phone ? (
                  <TouchableOpacity
                    style={styles.modalWhatsAppBtn}
                    onPress={() => handleWhatsApp(selectedBorrower)}
                  >
                    <MaterialCommunityIcons name="whatsapp" size={16} color="#00A884" style={{ marginRight: 4 }} />
                    <Text style={styles.modalWhatsAppBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                ) : null}

                {selectedBorrower.activeLoan ? (
                  <TouchableOpacity
                    style={styles.modalPrimaryActionBtn}
                    onPress={() => {
                      setSelectedBorrower(null);
                      handleOpenCollect(selectedBorrower);
                    }}
                  >
                    <MaterialCommunityIcons name="wallet-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryActionBtnText}>Collect Payment</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.modalPrimaryActionBtn}
                    onPress={() => {
                      setSelectedBorrower(null);
                      handleOpenDisburse(selectedBorrower);
                    }}
                  >
                    <MaterialCommunityIcons name="cash-plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryActionBtnText}>Disburse Loan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: REGISTER NEW BORROWER                                           */}
      {/* ========================================================================= */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register New Borrower</Text>
                <Text style={styles.modalSub}>Add client to organization portfolio</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>BORROWER CATEGORY</Text>
              <View style={styles.formCategoryRow}>
                {[
                  { key: 'WEEKLY', label: `Weekly (${categoryRateMap.WEEKLY.rate}%)` },
                  { key: 'SHOPKEEPER', label: `Shop (${categoryRateMap.DAILY.rate}%)` },
                  { key: 'MONTHLY', label: `Monthly (${categoryRateMap.MONTHLY.rate}%)` },
                ].map((item) => {
                  const isSel = newCustType === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.formCatBtn, isSel && styles.formCatBtnActive]}
                      onPress={() => setNewCustType(item.key)}
                    >
                      <Text style={[styles.formCatBtnText, isSel && styles.formCatBtnTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#9CA3AF"
                value={newCustName}
                onChangeText={setNewCustName}
              />

              <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={newCustPhone}
                onChangeText={setNewCustPhone}
              />

              {newCustType === 'SHOPKEEPER' && (
                <>
                  <Text style={styles.inputLabel}>SHOP / BUSINESS NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Sri Balaji Grocery Store"
                    placeholderTextColor="#9CA3AF"
                    value={newCustShopName}
                    onChangeText={setNewCustShopName}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>ADDRESS / ROUTE LOCATION</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Market Road, Chennai"
                placeholderTextColor="#9CA3AF"
                value={newCustAddress}
                onChangeText={setNewCustAddress}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
                disabled={isSubmittingCust}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateCustomer}
                disabled={isSubmittingCust}
              >
                {isSubmittingCust ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 9. MODAL: QUICK RECORD PAYMENT                                           */}
      {/* ========================================================================= */}
      <Modal
        visible={showCollectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCollectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Record Payment</Text>
                <Text style={styles.modalSub}>
                  {activeCustomerForAction?.name || 'Borrower'} • {activeCustomerForAction?.activeLoan?.loan_number || 'Loan'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCollectModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.collectDueSummaryBox}>
                <Text style={styles.collectDueLabel}>Remaining Balance</Text>
                <Text style={styles.collectDueVal}>
                  {formatINR(activeCustomerForAction?.remainingBalance || 0)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>COLLECTION AMOUNT (₹)</Text>
              <TextInput
                style={[styles.formInput, { fontSize: 18, fontWeight: '800', color: '#111827' }]}
                keyboardType="numeric"
                value={collectAmount}
                onChangeText={setCollectAmount}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>PAYMENT METHOD</Text>
              <View style={styles.formCategoryRow}>
                {['CASH', 'UPI', 'BANK_TRANSFER'].map((method) => {
                  const isSel = collectMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      style={[styles.formCatBtn, isSel && styles.formCatBtnActive]}
                      onPress={() => setCollectMethod(method)}
                    >
                      <Text style={[styles.formCatBtnText, isSel && styles.formCatBtnTextActive]}>
                        {method.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCollectModal(false)}
                disabled={isSubmittingCollect}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitCollect}
                disabled={isSubmittingCollect}
              >
                {isSubmittingCollect ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 10. MODAL: QUICK ISSUE NEW LOAN                                          */}
      {/* ========================================================================= */}
      <Modal
        visible={showDisburseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisburseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Issue New Loan</Text>
                <Text style={styles.modalSub}>
                  {activeCustomerForAction?.name || 'Borrower'} • Fast Disbursal
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDisburseModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>REPAYMENT FREQUENCY</Text>
              <View style={styles.formCategoryRow}>
                {[
                  { key: 'WEEKLY', label: `Weekly (${categoryRateMap.WEEKLY.rate}%)`, defaultTenure: String(categoryRateMap.WEEKLY.tenure || 10), defaultRate: String(categoryRateMap.WEEKLY.rate || 25) },
                  { key: 'DAILY', label: `Daily (${categoryRateMap.DAILY.rate}%)`, defaultTenure: String(categoryRateMap.DAILY.tenure || 100), defaultRate: String(categoryRateMap.DAILY.rate || 25) },
                  { key: 'MONTHLY', label: `Monthly (${categoryRateMap.MONTHLY.rate}%)`, defaultTenure: String(categoryRateMap.MONTHLY.tenure || 12), defaultRate: String(categoryRateMap.MONTHLY.rate || 25) },
                ].map((item) => {
                  const isSel = disburseFreq === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.formCatBtn, isSel && styles.formCatBtnActive]}
                      onPress={() => {
                        setDisburseFreq(item.key);
                        setDisburseTenure(item.defaultTenure);
                        setDisburseInterestRate(item.defaultRate);
                      }}
                    >
                      <Text style={[styles.formCatBtnText, isSel && styles.formCatBtnTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>PRINCIPAL AMOUNT (₹)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={disburseAmount}
                onChangeText={setDisburseAmount}
                placeholder="10000"
                placeholderTextColor="#9CA3AF"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TENURE ({disburseFreq === 'DAILY' ? 'DAYS' : disburseFreq === 'MONTHLY' ? 'MONTHS' : 'WEEKS'})</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={disburseTenure}
                    onChangeText={setDisburseTenure}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>INTEREST RATE (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={disburseInterestRate}
                    onChangeText={setDisburseInterestRate}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDisburseModal(false)}
                disabled={isSubmittingDisburse}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitDisburse}
                disabled={isSubmittingDisburse}
              >
                {isSubmittingDisburse ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Disburse Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  listContent: {
    paddingBottom: 90,
  },

  // 1. Top Action Bar
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    marginLeft: 6,
    paddingVertical: 0,
  },
  btnInterestRates: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnInterestRatesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B46C1',
    marginLeft: 4,
  },
  btnAddBorrower: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  btnAddBorrowerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 2. Primary Category Tabs
  categoryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  categoryTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  categoryTabLabelActive: {
    color: '#FFFFFF',
  },
  categoryTabSub: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 1,
  },
  categoryTabSubActive: {
    color: '#E9D5FF',
  },

  // 3. Scorecard KPI Summary Strip (Profile Theme)
  scorecardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 10,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  scorecardItem: {
    alignItems: 'center',
    flex: 1,
  },
  scorecardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  scorecardLbl: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  scorecardDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F0F0F0',
  },

  // 4. Secondary Status Filter Chips
  statusChipsRow: {
    marginTop: 10,
  },
  statusChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusChipActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Loading
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // 5. Borrower Card
  borrowerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarBoxShop: {
    backgroundColor: '#8B5CF6',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  borrowerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  shopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    gap: 2,
  },
  shopPillText: {
    fontSize: 10,
    color: '#6B46C1',
    fontWeight: '600',
  },
  borrowerMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBadgeNoLoan: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Contract Strip
  contractStrip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginTop: 10,
  },
  contractHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schemeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
  },
  loanCodeText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 2,
  },
  financialNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  finEmiValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  finFreqUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  finDueValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B46C1',
  },

  // Eligible Strip
  eligibleLoanStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  eligibleLoanText: {
    fontSize: 11,
    color: '#6B46C1',
    fontWeight: '600',
  },

  // Card Actions
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    gap: 4,
  },
  actionBtnCallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
  },
  actionBtnWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E6F9F5',
    gap: 4,
  },
  actionBtnWhatsAppText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A884',
  },
  actionBtnCollect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnCollectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnDisburse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnDisburseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal Shared Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'android' ? 20 : 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  formCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  formCatBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  formCatBtnActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3E8FF',
  },
  formCatBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  formCatBtnTextActive: {
    color: '#6B46C1',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F9F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalWhatsAppBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A884',
  },
  modalPrimaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalPrimaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Details Modal Specific
  profileMetaGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  metaCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  ledgerBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  ledgerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  ledgerCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  ledgerDividerRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 6,
    paddingTop: 6,
  },
  ledgerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  ledgerVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  noLoanCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noLoanCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  noLoanCardSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  collectDueSummaryBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  collectDueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B46C1',
  },
  collectDueVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6B46C1',
    marginTop: 2,
  },
});

export default CustomersScreen;
