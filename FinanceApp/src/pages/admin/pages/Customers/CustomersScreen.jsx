import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import apiService from '../../../../services/apiService';

// Primary Category Tabs
const CATEGORY_TABS = [
  { id: 'WEEKLY', label: 'Weekly', icon: 'calendar-week', sub: '10 Wks Scheme' },
  { id: 'MONTHLY', label: 'Monthly', icon: 'calendar-month', sub: 'Monthly EMI' },
  { id: 'SHOP', label: 'Shopkeeper', icon: 'storefront-outline', sub: 'Daily Merchant' },
  { id: 'ALL', label: 'All', icon: 'account-group-outline', sub: 'All Borrowers' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active Loans' },
  { id: 'DUE_TODAY', label: 'Due Today' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'NO_LOAN', label: 'No Active Loan' },
];

export const CustomersScreen = ({
  onOpenAddUser,
  onOpenManageUsers,
}) => {
  const {
    customers,
    loans,
    refreshData,
    addCustomer,
    collectPayment,
    disburseLoan,
    defaultCategories,
    lendingConfig,
    updateDefaultCategory,
    updateLendingConfig,
    currentOrganization,
    isServerConnected,
  } = useApp();

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

  // Synchronize category with active tab when opening add modal or disburse
  useEffect(() => {
    if (selectedTab === 'SHOP') {
      setNewCustType('SHOPKEEPER');
      setDisburseFreq('DAILY');
      setDisburseTenure(String(categoryRateMap.DAILY.tenure || 100));
      setDisburseInterestRate(String(categoryRateMap.DAILY.rate || 25));
    } else if (selectedTab === 'MONTHLY') {
      setNewCustType('MONTHLY');
      setDisburseFreq('MONTHLY');
      setDisburseTenure(String(categoryRateMap.MONTHLY.tenure || 12));
      setDisburseInterestRate(String(categoryRateMap.MONTHLY.rate || 25));
    } else {
      setNewCustType('WEEKLY');
      setDisburseFreq('WEEKLY');
      setDisburseTenure(String(categoryRateMap.WEEKLY.tenure || 10));
      setDisburseInterestRate(String(categoryRateMap.WEEKLY.rate || 25));
    }
  }, [selectedTab, categoryRateMap]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshData) {
        await refreshData();
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  // Enriched customers mapped with active loan records & metrics from database
  const enrichedCustomers = useMemo(() => {
    return (customers || []).map((c) => {
      const custLoans = (loans || []).filter(
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

      // Determine frequency / category
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

      const isWeekly = !isShop && !isMonthly;

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
        inferredCategory,
        isShop,
        isMonthly,
        isWeekly,
        activeLoan,
        totalInstallments,
        paidInstallments,
        emiAmount,
        totalRepayable,
        remainingBalance,
      };
    });
  }, [customers, loans, categoryRateMap]);

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
    const totalTarget = list.reduce((sum, c) => sum + (c.activeLoan ? c.emiAmount : 0), 0);

    return {
      count: list.length,
      activeCount,
      totalOutstanding,
      totalTarget,
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
      `Hello ${customer.name || 'Sir/Madam'}, this is a friendly reminder regarding your ${customer.inferredCategory} account (${loanCode}). Your scheduled installment of ${dueAmount} is due. Thank you!`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`).catch(() => {
      Alert.alert('WhatsApp Unavailable', 'WhatsApp application is not installed on this device.');
    });
  };

  // Submit Add New Customer
  const handleCreateCustomer = async () => {
    if (!newCustName.trim()) {
      Alert.alert('Validation Error', 'Please enter the borrower or merchant name.');
      return;
    }
    if (!newCustPhone.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    try {
      setIsSubmittingCust(true);
      const payload = {
        name: newCustName.trim(),
        full_name: newCustName.trim(),
        phone: newCustPhone.trim(),
        customer_type: newCustType === 'SHOPKEEPER' ? 'SHOPKEEPER' : newCustType === 'MONTHLY' ? 'COMMON_CUSTOMER' : 'COMMON_CUSTOMER',
        category_code: newCustType === 'SHOPKEEPER' ? 'CAT-MERCHANT-DLY' : newCustType === 'MONTHLY' ? 'CAT-BORROWER-MO' : 'CAT-BORROWER-WK',
        shop_name: newCustType === 'SHOPKEEPER' ? (newCustShopName.trim() || `${newCustName.trim()}'s Store`) : null,
        address: newCustAddress.trim() || 'Chennai Main Road',
        status: 'ACTIVE',
      };

      if (addCustomer) {
        await addCustomer(payload);
      } else {
        await apiService.createCustomer(payload);
        if (refreshData) await refreshData();
      }

      Alert.alert('Success', `${newCustName} has been registered successfully!`);
      setShowAddModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustShopName('');
      setNewCustAddress('');
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not create borrower.');
    } finally {
      setIsSubmittingCust(false);
    }
  };

  // Open Quick Collect Dialog
  const handleOpenCollect = (customer) => {
    setActiveCustomerForAction(customer);
    const emi = customer.activeLoan?.emi_amount || customer.emiAmount || 1000;
    setCollectAmount(String(emi));
    setShowCollectModal(true);
  };

  // Submit Quick Collect
  const handleSubmitCollect = async () => {
    if (!activeCustomerForAction?.activeLoan?.id) {
      Alert.alert('Error', 'No active loan contract found for this borrower.');
      return;
    }
    const amt = Number(collectAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid collection amount.');
      return;
    }

    try {
      setIsSubmittingCollect(true);
      const loanId = activeCustomerForAction.activeLoan.id;
      if (collectPayment) {
        await collectPayment(loanId, amt, collectMethod);
      } else {
        await apiService.collectPayment(loanId, amt, collectMethod);
        if (refreshData) await refreshData();
      }

      Alert.alert('Payment Recorded', `Successfully collected ${formatINR(amt)} via ${collectMethod}!`);
      setShowCollectModal(false);
      setActiveCustomerForAction(null);
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
        if (refreshData) await refreshData();
      }

      Alert.alert('Loan Disbursed', `Successfully issued ${formatINR(principal)} (${disburseFreq} @ ${rate}% flat) to ${activeCustomerForAction.name}!`);
      setShowDisburseModal(false);
      setActiveCustomerForAction(null);
    } catch (err) {
      Alert.alert('Disbursement Error', err.message || 'Failed to create loan.');
    } finally {
      setIsSubmittingDisburse(false);
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
        if (refreshData) await refreshData();
      }

      Alert.alert('Configuration Updated', `${selectedCategoryConfig.catType} scheme interest rate updated to ${editInterestRate}% flat across the organization!`);
      setShowInterestRatesModal(false);
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Unable to update interest rate configuration.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP ACTION BAR: SEARCH, INTEREST RATE SETTINGS & ADD */}
      <View style={styles.topActionBar}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search borrower, shop, phone, area..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Interest Rates & Lending Governance Button */}
        <TouchableOpacity
          style={styles.btnInterestRates}
          onPress={() => handleOpenEditCategory(selectedTab === 'SHOP' ? 'DAILY' : selectedTab === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="percent" size={15} color="#2842C4" />
          <Text style={styles.btnInterestRatesText}>
            {selectedTab === 'SHOP' ? categoryRateMap.DAILY.rate : selectedTab === 'MONTHLY' ? categoryRateMap.MONTHLY.rate : categoryRateMap.WEEKLY.rate}%
          </Text>
        </TouchableOpacity>

        {/* Add Borrower Button */}
        <TouchableOpacity
          style={styles.btnAddBorrower}
          onPress={() => (onOpenAddUser ? onOpenAddUser() : setShowAddModal(true))}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="account-plus" size={15} color="#FFFFFF" />
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
                  size={15}
                  color={isActive ? '#2842C4' : '#64748B'}
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
                {tab.id === 'ALL' ? 'All Records' : `${rate}% Flat`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. CATEGORY KPI SUMMARY STRIP */}
      <View style={styles.kpiSummaryStrip}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Total Accounts</Text>
          <Text style={styles.kpiValue}>{categoryMetrics.count}</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Active Contracts</Text>
          <Text style={[styles.kpiValue, { color: '#059669' }]}>{categoryMetrics.activeCount}</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Total Outstanding</Text>
          <Text style={[styles.kpiValue, { color: '#2842C4' }]}>
            {formatINR(categoryMetrics.totalOutstanding)}
          </Text>
        </View>
      </View>

      {/* 4. SECONDARY STATUS FILTER CHIPS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusChipsRow} contentContainerStyle={styles.statusChipsContent}>
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

      {/* 5. LIVE BORROWER LIST */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2842C4']}
            tintColor="#2842C4"
          />
        }
      >
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="account-search-outline" size={32} color="#94A3B8" />
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
              <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Add New {selectedTab === 'SHOP' ? 'Shopkeeper' : 'Borrower'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCustomers.map((c) => {
            const hasActiveLoan = Boolean(c.activeLoan && c.activeLoan.status !== 'COMPLETED');
            const isOverdue = c.activeLoan?.status === 'OVERDUE';
            const progressRatio = c.totalInstallments > 0 ? Math.min(1, c.paidInstallments / c.totalInstallments) : 0;
            const progressPct = Math.round(progressRatio * 100);

            return (
              <TouchableOpacity
                key={c.id || c.customer_code}
                style={styles.borrowerCard}
                onPress={() => setSelectedBorrower(c)}
                activeOpacity={0.92}
              >
                {/* Header Row: Avatar, Name & Category Badge */}
                <View style={styles.cardHeader}>
                  <View style={[styles.avatarBox, c.isShop && styles.avatarBoxShop]}>
                    {c.isShop ? (
                      <MaterialCommunityIcons name="storefront" size={20} color="#D97706" />
                    ) : (
                      <Text style={styles.avatarLetter}>
                        {(c.name || c.full_name || 'B').charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.nameBlock}>
                    <View style={styles.titleRow}>
                      <Text style={styles.borrowerName} numberOfLines={1}>
                        {c.name || c.full_name || 'Borrower'}
                      </Text>
                      {c.isShop && (c.shop_name || c.occupation) && (
                        <View style={styles.shopPill}>
                          <MaterialCommunityIcons name="tag-outline" size={10} color="#D97706" />
                          <Text style={styles.shopPillText} numberOfLines={1}>
                            {c.shop_name || c.occupation}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.borrowerMeta} numberOfLines={1}>
                      {c.phone || 'No phone'} • {c.address || c.city || 'Chennai Main'}
                    </Text>
                  </View>

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
                          : { color: '#64748B' },
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
                          name={c.isShop ? 'store' : c.isMonthly ? 'calendar-month' : 'calendar-week'}
                          size={12}
                          color="#2842C4"
                        />
                        <Text style={styles.schemeTagText}>
                          {c.activeLoan?.repayment_frequency || c.inferredCategory} ({c.activeLoan?.interest_rate || 25}% FLAT)
                        </Text>
                        <Text style={styles.loanCodeText}>
                          ({c.activeLoan?.loan_number || c.activeLoan?.loan_code || 'LOAN'})
                        </Text>
                      </View>

                      <Text style={styles.progressCounterText}>
                        {c.paidInstallments}/{c.totalInstallments} {c.isShop ? 'Days' : c.isMonthly ? 'Mos' : 'Wks'} ({progressPct}%)
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
                          {formatINR(c.emiAmount)}
                          <Text style={styles.finFreqUnit}>/{c.isShop ? 'day' : c.isMonthly ? 'mo' : 'wk'}</Text>
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.finLabel}>Remaining Due</Text>
                        <Text style={[styles.finDueValue, isOverdue && { color: '#DC2626' }]}>
                          {formatINR(c.remainingBalance)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.eligibleLoanStrip}>
                    <MaterialCommunityIcons name="information-outline" size={14} color="#2563EB" />
                    <Text style={styles.eligibleLoanText}>
                      No active loan contract. Eligible for instant disbursement.
                    </Text>
                  </View>
                )}

                {/* Quick Action Buttons (Call, WhatsApp, Collect, Disburse) */}
                <View style={styles.cardActionsRow}>
                  {c.phone ? (
                    <TouchableOpacity
                      style={styles.actionBtnCall}
                      onPress={() => handleCall(c.phone)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="phone" size={13} color="#2842C4" />
                      <Text style={styles.actionBtnCallText}>Call</Text>
                    </TouchableOpacity>
                  ) : null}

                  {c.phone ? (
                    <TouchableOpacity
                      style={styles.actionBtnWhatsApp}
                      onPress={() => handleWhatsApp(c)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="whatsapp" size={13} color="#00A884" />
                      <Text style={styles.actionBtnWhatsAppText}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}

                  {hasActiveLoan ? (
                    <TouchableOpacity
                      style={styles.actionBtnCollect}
                      onPress={() => handleOpenCollect(c)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="wallet-outline" size={13} color="#FFFFFF" />
                      <Text style={styles.actionBtnCollectText}>
                        Collect {formatINR(c.emiAmount)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionBtnDisburse}
                      onPress={() => handleOpenDisburse(c)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="cash-plus" size={13} color="#FFFFFF" />
                      <Text style={styles.actionBtnDisburseText}>Issue Loan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
                <MaterialCommunityIcons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Category selector in modal */}
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

              {/* Interest Rate Input */}
              <Text style={styles.inputLabel}>FLAT INTEREST RATE (%) *</Text>
              <TextInput
                style={[styles.formInput, { fontSize: 16, fontWeight: '800', color: '#2842C4' }]}
                keyboardType="numeric"
                value={editInterestRate}
                onChangeText={setEditInterestRate}
                placeholder="25.0"
                placeholderTextColor="#94A3B8"
              />

              {/* Tenure Installments */}
              <Text style={styles.inputLabel}>
                DEFAULT TENURE ({selectedCategoryConfig?.catType === 'DAILY' ? 'DAYS' : selectedCategoryConfig?.catType === 'MONTHLY' ? 'MONTHS' : 'WEEKS'})
              </Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={editTenure}
                onChangeText={setEditTenure}
                placeholder="10"
                placeholderTextColor="#94A3B8"
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
              {/* Modal Header */}
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
                  <MaterialCommunityIcons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Meta details grid */}
                <View style={styles.profileMetaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Category</Text>
                    <Text style={[styles.metaVal, { color: '#2842C4' }]}>
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

                {/* Active Loan Contract Summary */}
                {selectedBorrower.activeLoan ? (
                  <View style={styles.ledgerBox}>
                    <View style={styles.ledgerHeaderRow}>
                      <Text style={styles.ledgerTitle}>ACTIVE LOAN CONTRACT</Text>
                      <Text style={styles.ledgerCode}>
                        {selectedBorrower.activeLoan.loan_number || selectedBorrower.activeLoan.loan_code}
                      </Text>
                    </View>

                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Principal Disbursed (Lent):</Text>
                      <Text style={styles.ledgerVal}>
                        {formatINR(selectedBorrower.activeLoan.principal_amount || 10000)}
                      </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Contracted Interest Rate:</Text>
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
                      <Text style={styles.ledgerLabel}>Total Paid Till Date:</Text>
                      <Text style={[styles.ledgerVal, { color: '#059669', fontWeight: '800' }]}>
                        {formatINR(selectedBorrower.activeLoan.total_paid || (selectedBorrower.paidInstallments * selectedBorrower.emiAmount))}
                      </Text>
                    </View>
                    <View style={[styles.ledgerRow, styles.ledgerDividerRow]}>
                      <Text style={[styles.ledgerLabel, { fontWeight: '700', color: '#1E293B' }]}>
                        Remaining Outstanding:
                      </Text>
                      <Text style={[styles.ledgerVal, { color: '#2842C4', fontWeight: '900', fontSize: 14 }]}>
                        {formatINR(selectedBorrower.remainingBalance)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noLoanCard}>
                    <MaterialCommunityIcons name="cash-check" size={28} color="#2842C4" />
                    <Text style={styles.noLoanCardTitle}>No Active Loan Running</Text>
                    <Text style={styles.noLoanCardSub}>
                      This borrower account is verified for a new disbursement.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer Actions */}
              <View style={styles.modalFooter}>
                {selectedBorrower.phone && (
                  <TouchableOpacity
                    style={styles.modalWhatsAppBtn}
                    onPress={() => handleWhatsApp(selectedBorrower)}
                  >
                    <MaterialCommunityIcons name="whatsapp" size={16} color="#00A884" />
                    <Text style={styles.modalWhatsAppBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                )}

                {selectedBorrower.activeLoan ? (
                  <TouchableOpacity
                    style={styles.modalPrimaryActionBtn}
                    onPress={() => {
                      const b = selectedBorrower;
                      setSelectedBorrower(null);
                      handleOpenCollect(b);
                    }}
                  >
                    <MaterialCommunityIcons name="wallet" size={16} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryActionBtnText}>Record Payment</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.modalPrimaryActionBtn}
                    onPress={() => {
                      const b = selectedBorrower;
                      setSelectedBorrower(null);
                      handleOpenDisburse(b);
                    }}
                  >
                    <MaterialCommunityIcons name="cash-plus" size={16} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryActionBtnText}>Disburse Loan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: ADD NEW BORROWER / SHOPKEEPER                                   */}
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
              <Text style={styles.modalTitle}>Register New Borrower</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Category Segment Selector */}
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

              {/* Full Name */}
              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#94A3B8"
                value={newCustName}
                onChangeText={setNewCustName}
              />

              {/* Phone */}
              <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={newCustPhone}
                onChangeText={setNewCustPhone}
              />

              {/* Shop Name (if shopkeeper) */}
              {newCustType === 'SHOPKEEPER' && (
                <>
                  <Text style={styles.inputLabel}>SHOP / BUSINESS NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Sri Balaji Grocery Store"
                    placeholderTextColor="#94A3B8"
                    value={newCustShopName}
                    onChangeText={setNewCustShopName}
                  />
                </>
              )}

              {/* Address / Location */}
              <Text style={styles.inputLabel}>ADDRESS / ROUTE LOCATION</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Market Road, Anna Nagar, Chennai"
                placeholderTextColor="#94A3B8"
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
                <MaterialCommunityIcons name="close" size={18} color="#64748B" />
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
                style={[styles.formInput, { fontSize: 18, fontWeight: '800', color: '#0F172A' }]}
                keyboardType="numeric"
                value={collectAmount}
                onChangeText={setCollectAmount}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
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
                style={[styles.modalSubmitBtn, { backgroundColor: '#059669' }]}
                onPress={handleSubmitCollect}
                disabled={isSubmittingCollect}
              >
                {isSubmittingCollect ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm Collection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 10. MODAL: DISBURSE / ISSUE LOAN CONTRACT                                */}
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
                <Text style={styles.modalTitle}>Issue Loan Contract</Text>
                <Text style={styles.modalSub}>
                  To: {activeCustomerForAction?.name || 'Borrower'} ({activeCustomerForAction?.inferredCategory})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDisburseModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#64748B" />
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
                placeholderTextColor="#94A3B8"
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
    backgroundColor: '#F8FAFC',
  },

  // 1. Top Action Bar
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    paddingVertical: 0,
  },
  btnInterestRates: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    height: 38,
    borderRadius: 9,
    gap: 2,
  },
  btnInterestRatesText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2842C4',
  },
  btnAddBorrower: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 9,
    gap: 4,
    shadowColor: '#2842C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  btnAddBorrowerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 2. Primary Category Tabs
  categoryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryTab: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#2842C4',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: '#2842C4',
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  categoryTabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  categoryTabLabelActive: {
    color: '#2842C4',
  },
  categoryTabSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  categoryTabSubActive: {
    color: '#4338CA',
  },

  // 3. Category KPI Strip
  kpiSummaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },

  // 4. Secondary Status Chips
  statusChipsRow: {
    maxHeight: 40,
    marginTop: 8,
    marginBottom: 4,
  },
  statusChipsContent: {
    paddingHorizontal: 14,
    gap: 6,
  },
  statusChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipActive: {
    backgroundColor: '#2842C4',
    borderColor: '#2842C4',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },

  // 5. Borrower Cards List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 10,
  },
  borrowerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarBoxShop: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2842C4',
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
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  shopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
    maxWidth: 120,
  },
  shopPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },
  borrowerMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
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
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Contract Strip
  contractStrip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  contractHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  schemeTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schemeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2842C4',
    letterSpacing: 0.3,
  },
  loanCodeText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  progressCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2842C4',
    borderRadius: 3,
  },
  financialNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  finEmiValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  finFreqUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  finDueValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2842C4',
    marginTop: 1,
  },

  eligibleLoanStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginBottom: 10,
  },
  eligibleLoanText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
  },

  // Card Action Buttons
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 4,
  },
  actionBtnCallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2842C4',
  },
  actionBtnWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 4,
  },
  actionBtnWhatsAppText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A884',
  },
  actionBtnCollect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    gap: 4,
    shadowColor: '#2842C4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnCollectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionBtnDisburse: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    gap: 4,
  },
  actionBtnDisburseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal Shared Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  formCategoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  formCatBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  formCatBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#2842C4',
  },
  formCatBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  formCatBtnTextActive: {
    color: '#2842C4',
    fontWeight: '800',
  },
  profileMetaGrid: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  ledgerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  ledgerCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2842C4',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  ledgerDividerRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 6,
    paddingTop: 6,
  },
  ledgerLabel: {
    fontSize: 11,
    color: '#475569',
  },
  ledgerVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  noLoanCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  noLoanCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  noLoanCardSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  collectDueSummaryBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  collectDueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  collectDueVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2842C4',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#2842C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    gap: 4,
  },
  modalWhatsAppBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A884',
  },
  modalPrimaryActionBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 8,
    backgroundColor: '#2842C4',
    gap: 6,
  },
  modalPrimaryActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CustomersScreen;
