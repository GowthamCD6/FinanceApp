import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../context/AppContext';
import { apiService } from '../../../../services/apiService';
import { formatINR, formatDate } from '../../../../utils/helpers';
import styles from './IssueLoanStyles';

const lendingAnimation = require('../../../../animation/MoneyLending.json');

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 25000, 50000];

export const IssueLoanModal = ({
  visible,
  borrower,
  onClose,
  onLoanIssued,
}) => {
  const { currentOrganization, customers: contextCustomers, refreshData } = useApp();
  const orgId = currentOrganization?.id || 1;

  // Active Selected Borrower State
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [isPickingBorrower, setIsPickingBorrower] = useState(false);
  const [borrowerSearchQuery, setBorrowerSearchQuery] = useState('');
  const [allRegisteredBorrowers, setAllRegisteredBorrowers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [selectedLoanTab, setSelectedLoanTab] = useState('ACTIVE'); // 'ACTIVE' | 'COMPLETED'
  const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Lending Config loaded from server
  const [lendingConfig, setLendingConfig] = useState({
    daily_interest_rate: 25.0,
    daily_tenure_days: 100,
    daily_min_amount: 10000,
    daily_max_amount: 15000,

    weekly_interest_rate: 25.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 2000,
    weekly_max_amount: 5000,

    monthly_interest_rate: 25.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 25000,
    monthly_max_amount: 500000,
  });

  const [selectedCategoryCode, setSelectedCategoryCode] = useState('CAT-BORROWER-WK');

  const [formData, setFormData] = useState({
    principal_amount: '5000',
    interest_rate: '25',
    tenure: '10',
    frequency: 'WEEKLY',
    funding_source: 'VAULT', // 'VAULT' | 'HANDS_ON'
  });

  const [errors, setErrors] = useState({});

  // Categories definition (Matching AddU)
  const categories = useMemo(() => [
    {
      category_code: 'CAT-BORROWER-WK',
      name: 'Borrower (Weekly)',
      customer_type: 'COMMON_CUSTOMER',
      repayment_frequency: 'WEEKLY',
      default_min_loan: Number(lendingConfig.weekly_min_amount) || 2000,
      default_max_loan: Number(lendingConfig.weekly_max_amount) || 5000,
      default_interest_rate: Number(lendingConfig.weekly_interest_rate) || 25.0,
      tenure_installments: Number(lendingConfig.weekly_tenure_weeks) || 10,
      icon: 'account-group',
      color: '#6B46C1',
      bg: '#F5F3FF',
    },
    {
      category_code: 'CAT-MERCHANT-DLY',
      name: 'Merchant (Daily)',
      customer_type: 'SHOPKEEPER',
      repayment_frequency: 'DAILY',
      default_min_loan: Number(lendingConfig.daily_min_amount) || 10000,
      default_max_loan: Number(lendingConfig.daily_max_amount) || 15000,
      default_interest_rate: Number(lendingConfig.daily_interest_rate) || 25.0,
      tenure_installments: Number(lendingConfig.daily_tenure_days) || 100,
      icon: 'store',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      category_code: 'CAT-BORROWER-MO',
      name: 'Salaried (Monthly)',
      customer_type: 'COMMON_CUSTOMER',
      repayment_frequency: 'MONTHLY',
      default_min_loan: Number(lendingConfig.monthly_min_amount) || 25000,
      default_max_loan: Number(lendingConfig.monthly_max_amount) || 500000,
      default_interest_rate: Number(lendingConfig.monthly_interest_rate) || 25.0,
      tenure_installments: Number(lendingConfig.monthly_tenure_months) || 12,
      icon: 'calendar-month',
      color: '#2563EB',
      bg: '#EFF6FF',
    },
  ], [lendingConfig]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.category_code === selectedCategoryCode) || categories[0];
  }, [categories, selectedCategoryCode]);

  const isShop = activeCategory.repayment_frequency === 'DAILY';
  const isMonthly = activeCategory.repayment_frequency === 'MONTHLY';
  const tenureUnit = isShop ? 'Days' : isMonthly ? 'Months' : 'Weeks';
  const tenureUnitSingular = isShop ? 'Day' : isMonthly ? 'Month' : 'Week';

  // Hardware Back button handling
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      if (isAddLoanModalOpen) {
        setIsAddLoanModalOpen(false);
        return true;
      }
      if (onClose) onClose();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, isAddLoanModalOpen, onClose]);

  // Fetch all registered borrowers for picker
  useEffect(() => {
    if (!visible) return;
    const loadAllBorrowers = async () => {
      try {
        const res = await apiService.getCustomers({ limit: '200' });
        const list = Array.isArray(res) ? res : (res?.customers || []);
        if (list.length > 0) {
          setAllRegisteredBorrowers(list);
        } else if (contextCustomers && contextCustomers.length > 0) {
          setAllRegisteredBorrowers(contextCustomers);
        }
      } catch (e) {
        if (contextCustomers && contextCustomers.length > 0) {
          setAllRegisteredBorrowers(contextCustomers);
        }
      }
    };
    loadAllBorrowers();
  }, [visible, contextCustomers]);

  // Fetch Lending Config from server
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const data = await apiService.getLendingConfig(orgId);
        if (data && isMounted) {
          setLendingConfig((prev) => ({
            ...prev,
            daily_interest_rate: Number(data.daily_interest_rate || 25.0),
            daily_tenure_days: Number(data.daily_tenure_days || 100),
            daily_min_amount: Number(data.daily_min_amount || 10000),
            daily_max_amount: Number(data.daily_max_amount || 15000),

            weekly_interest_rate: Number(data.weekly_interest_rate || 25.0),
            weekly_tenure_weeks: Number(data.weekly_tenure_weeks || 10),
            weekly_min_amount: Number(data.weekly_min_amount || 2000),
            weekly_max_amount: Number(data.weekly_max_amount || 5000),

            monthly_interest_rate: Number(data.monthly_interest_rate || 25.0),
            monthly_tenure_months: Number(data.monthly_tenure_months || 12),
            monthly_min_amount: Number(data.monthly_min_amount || 25000),
            monthly_max_amount: Number(data.monthly_max_amount || 500000),
          }));
        }
      } catch (err) {
        console.warn('Using default lending config for IssueLoan:', err);
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [orgId]);

  // Fetch borrower's live loans from server
  const fetchBorrowerLoans = useCallback(async (targetBorrower) => {
    if (!targetBorrower) return;
    try {
      setLoading(true);
      const bId = targetBorrower.id || targetBorrower.customer_id || targetBorrower.userId;
      const bPhone = targetBorrower.phone ? String(targetBorrower.phone).replace(/\D/g, '') : '';
      const bCode = targetBorrower.customer_code || targetBorrower.code;

      let allLoans = [];
      try {
        const resCust = await apiService.getLoans({ customerId: bId, limit: 100 });
        const list = Array.isArray(resCust) ? resCust : (resCust?.loans || []);
        if (list.length > 0) {
          allLoans = list;
        }
      } catch (e) {
        console.log('Direct customerId query error:', e);
      }

      if (allLoans.length === 0) {
        try {
          const resAll = await apiService.getLoans({ limit: 500 });
          allLoans = Array.isArray(resAll) ? resAll : (resAll?.loans || []);
        } catch (e) {
          console.warn('Error fetching all loans:', e);
        }
      }

      // Filter specifically for this borrower
      const matched = allLoans.filter((l) => {
        const cId = String(l.customer_id || l.customerId || l.user_id || '');
        const lPhone = String(l.customer_phone || l.phone || '').replace(/\D/g, '');
        const lCode = l.customer_code || '';

        const matchId = bId && (cId === String(bId));
        const matchPhone = bPhone && lPhone && (lPhone === bPhone || lPhone.endsWith(bPhone) || bPhone.endsWith(lPhone));
        const matchCode = bCode && lCode && (lCode === bCode);

        return matchId || matchPhone || matchCode;
      });

      if (matched.length === 0 && targetBorrower.activeLoan) {
        matched.push(targetBorrower.activeLoan);
      }

      setCustomerLoans(matched);
    } catch (e) {
      console.warn('Error fetching borrower loans:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBorrowerItem = useCallback((b) => {
    setSelectedBorrower(b);
    setIsPickingBorrower(false);
    fetchBorrowerLoans(b);

    let targetCat = categories[0];
    if (b.isShop || b.customer_type === 'SHOPKEEPER' || b.category === 'DAILY_MERCHANT' || b.category === 'SHOP') {
      targetCat = categories[1];
    } else if (b.isMonthly || b.customer_type === 'MONTHLY_BORROWER' || b.category === 'MONTHLY') {
      targetCat = categories[2];
    }

    setSelectedCategoryCode(targetCat.category_code);
    setFormData({
      principal_amount: String(targetCat.default_max_loan || targetCat.default_min_loan || 5000),
      interest_rate: String(targetCat.default_interest_rate || 25.0),
      tenure: String(targetCat.tenure_installments || 10),
      frequency: targetCat.repayment_frequency,
      funding_source: 'VAULT',
    });
    setErrors({});
  }, [categories, fetchBorrowerLoans]);

  // Sync initial borrower on modal open
  useEffect(() => {
    if (visible) {
      if (borrower) {
        selectBorrowerItem(borrower);
      } else {
        setIsPickingBorrower(true);
      }
    } else {
      setSelectedBorrower(null);
      setCustomerLoans([]);
      setIsAddLoanModalOpen(false);
    }
  }, [visible, borrower, selectBorrowerItem]);

  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
    setFormData((prev) => ({
      ...prev,
      principal_amount: String(cat.default_max_loan || cat.default_min_loan || 5000),
      interest_rate: String(cat.default_interest_rate || 25.0),
      tenure: String(cat.tenure_installments || 10),
      frequency: cat.repayment_frequency,
    }));
    setErrors({});
  };

  // Filter registered borrowers for search picker
  const filteredBorrowersList = useMemo(() => {
    if (!borrowerSearchQuery.trim()) return allRegisteredBorrowers;
    const q = borrowerSearchQuery.toLowerCase();
    return allRegisteredBorrowers.filter((b) => {
      const name = (b.name || b.full_name || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      const code = (b.customer_code || '').toLowerCase();
      const shop = (b.shop_name || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || code.includes(q) || shop.includes(q);
    });
  }, [allRegisteredBorrowers, borrowerSearchQuery]);

  // Split loans into active vs completed
  const { activeLoans, completedLoans } = useMemo(() => {
    const active = [];
    const completed = [];
    customerLoans.forEach((l) => {
      const isCompleted = l.status === 'COMPLETED' || l.status === 'SETTLED' || (l.outstanding_amount !== undefined && Number(l.outstanding_amount) <= 0);
      if (isCompleted) {
        completed.push(l);
      } else {
        active.push(l);
      }
    });
    return { activeLoans: active, completedLoans: completed };
  }, [customerLoans]);

  // Real-time Calculation
  const principalAmountNum = parseFloat(formData.principal_amount) || 0;
  const flatRateNum = parseFloat(formData.interest_rate) || activeCategory.default_interest_rate;
  const installmentCountNum = parseInt(formData.tenure, 10) || activeCategory.tenure_installments;
  const interestAmountNum = Math.round((principalAmountNum * flatRateNum) / 100);
  const totalRepayableNum = principalAmountNum + interestAmountNum;
  const installmentAmountNum = installmentCountNum > 0 ? Math.round(totalRepayableNum / installmentCountNum) : 0;

  const validate = () => {
    const errs = {};
    if (!selectedBorrower) {
      errs.borrower = 'Please select a borrower to allot loan';
    }
    if (!formData.principal_amount || principalAmountNum <= 0) {
      errs.principal_amount = 'Principal amount must be greater than 0';
    }
    if (formData.interest_rate === '' || isNaN(flatRateNum) || flatRateNum < 0) {
      errs.interest_rate = 'Valid interest rate is required';
    }
    if (!formData.tenure || installmentCountNum <= 0) {
      errs.tenure = `Tenure must be at least 1 ${tenureUnitSingular.toLowerCase()}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDisburseLoan = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        organizationId: orgId,
        customerId: selectedBorrower.id || selectedBorrower.customer_id || selectedBorrower.userId,
        customerName: selectedBorrower.name || selectedBorrower.full_name || 'Borrower',
        customer_type: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        principal: principalAmountNum,
        principalAmount: principalAmountNum,
        totalRepayment: totalRepayableNum,
        totalRepaymentAmount: totalRepayableNum,
        interestRate: flatRateNum,
        interest_rate: flatRateNum,
        tenure: installmentCountNum,
        duration: installmentCountNum,
        total_installments: installmentCountNum,
        frequency: activeCategory.repayment_frequency,
        repayment_frequency: activeCategory.repayment_frequency,
        installmentAmount: installmentAmountNum,
        contracted_income_amount: interestAmountNum,
        funding_source: formData.funding_source || 'VAULT',
      };

      const res = await apiService.createLoan(payload);
      const loanId = res?.id || res?.data?.id;

      if (loanId) {
        await apiService.approveLoan(loanId).catch(() => null);
        await apiService.disburseLoan(loanId, 1, formData.funding_source || 'VAULT').catch(() => null);
      }

      if (refreshData) refreshData();
      if (onLoanIssued) onLoanIssued();

      // Refresh local borrower loans and close inner allot modal
      fetchBorrowerLoans(selectedBorrower);
      setIsAddLoanModalOpen(false);

      Alert.alert(
        'Loan Disbursed & Activated!',
        `Successfully allotted ${formatINR(principalAmountNum)} (${activeCategory.repayment_frequency} cycle) to "${selectedBorrower.name || selectedBorrower.full_name}".`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error disbursing loan:', err);
      Alert.alert('Disbursement Failed', err?.message || 'Could not issue loan. Please check input parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const borrowerName = selectedBorrower?.name || selectedBorrower?.full_name || 'Select Borrower';
  const borrowerPhone = selectedBorrower?.phone || '';
  const creditLimit = Number(selectedBorrower?.credit_limit || 25000);

  return (
    <Modal visible={Boolean(visible)} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header
          title="Borrower Loans & Allotment"
          onBack={onClose}
          showBackButton={true}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Large Lottie Animation Header */}
          <View style={styles.animationContainer}>
            <LottieView
              source={lendingAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* 2. BORROWER SELECTION / SUMMARY CARD */}
          {isPickingBorrower || !selectedBorrower ? (
            <View style={styles.borrowerSelectCard}>
              <View style={styles.sectionHeadingRow}>
                <MaterialCommunityIcons name="account-search-outline" size={18} color="#6B46C1" />
                <Text style={styles.sectionHeadingTitle}>Select Borrower</Text>
              </View>

              <View style={styles.borrowerSearchBox}>
                <MaterialCommunityIcons name="magnify" size={18} color="#64748B" />
                <TextInput
                  style={styles.borrowerSearchInput}
                  placeholder="Search name, phone, shop..."
                  placeholderTextColor="#94A3B8"
                  value={borrowerSearchQuery}
                  onChangeText={setBorrowerSearchQuery}
                  autoFocus={!selectedBorrower}
                />
                {borrowerSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setBorrowerSearchQuery('')}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.borrowerDropdown} nestedScrollEnabled={true}>
                {filteredBorrowersList.slice(0, 20).map((b) => (
                  <TouchableOpacity
                    key={b.id || b.customer_code || Math.random()}
                    style={styles.borrowerDropdownItem}
                    onPress={() => selectBorrowerItem(b)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.borrowerDropdownAvatar}>
                      <Text style={styles.borrowerDropdownAvatarText}>
                        {(b.name || b.full_name || 'B').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.borrowerDropdownName}>{b.name || b.full_name}</Text>
                      <Text style={styles.borrowerDropdownSub}>
                        {b.phone || 'No phone'} {b.shop_name ? `• ${b.shop_name}` : ''}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.borrowerCard}>
              <View style={styles.borrowerHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{borrowerName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.borrowerName}>{borrowerName}</Text>
                  <View style={styles.borrowerPhoneRow}>
                    <MaterialCommunityIcons name="phone" size={12} color="#64748B" />
                    <Text style={styles.borrowerPhone}>{borrowerPhone || 'No phone'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeBorrowerBtn}
                  onPress={() => setIsPickingBorrower(true)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="account-switch" size={13} color="#6B46C1" />
                  <Text style={styles.changeBorrowerText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.borrowerMetaRow}>
                <View style={styles.borrowerMetaItem}>
                  <MaterialCommunityIcons name="shield-check" size={14} color="#059669" />
                  <Text style={styles.borrowerMetaText}>
                    Limit: <Text style={{ fontWeight: '800', color: '#111827' }}>{formatINR(creditLimit)}</Text>
                  </Text>
                </View>
                <View style={styles.borrowerMetaItem}>
                  <MaterialCommunityIcons name="history" size={14} color="#6B46C1" />
                  <Text style={styles.borrowerMetaText}>
                    Total Records: <Text style={{ fontWeight: '800', color: '#111827' }}>{customerLoans.length}</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 3. Primary Add Loan Trigger Button */}
          {selectedBorrower && (
            <TouchableOpacity
              style={styles.addLoanTriggerBtn}
              onPress={() => setIsAddLoanModalOpen(true)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="cash-plus" size={20} color="#FFFFFF" />
              <Text style={styles.addLoanTriggerBtnText}>+ Allot New Loan to Borrower</Text>
            </TouchableOpacity>
          )}

          {/* 4. Dual Tab Selector: Active Loans vs Completed Loans */}
          {selectedBorrower && (
            <>
              <View style={styles.tabBarContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, selectedLoanTab === 'ACTIVE' && styles.tabBtnActive]}
                  onPress={() => setSelectedLoanTab('ACTIVE')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="cash-clock"
                    size={16}
                    color={selectedLoanTab === 'ACTIVE' ? '#6B46C1' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      selectedLoanTab === 'ACTIVE' && styles.tabBtnTextActive,
                    ]}
                  >
                    Active Loans
                  </Text>
                  <View
                    style={[
                      styles.tabCountBadge,
                      selectedLoanTab === 'ACTIVE' && styles.tabCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        selectedLoanTab === 'ACTIVE' && styles.tabCountTextActive,
                      ]}
                    >
                      {activeLoans.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, selectedLoanTab === 'COMPLETED' && styles.tabBtnActive]}
                  onPress={() => setSelectedLoanTab('COMPLETED')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color={selectedLoanTab === 'COMPLETED' ? '#6B46C1' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      selectedLoanTab === 'COMPLETED' && styles.tabBtnTextActive,
                    ]}
                  >
                    Completed Loans
                  </Text>
                  <View
                    style={[
                      styles.tabCountBadge,
                      selectedLoanTab === 'COMPLETED' && styles.tabCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        selectedLoanTab === 'COMPLETED' && styles.tabCountTextActive,
                      ]}
                    >
                      {completedLoans.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 5. Tab Content Lists */}
              {loading ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#6B46C1" />
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
                    Loading loan records...
                  </Text>
                </View>
              ) : selectedLoanTab === 'ACTIVE' ? (
                activeLoans.length === 0 ? (
                  <View style={styles.emptyLoanHistory}>
                    <MaterialCommunityIcons name="hand-coin-outline" size={40} color="#94A3B8" />
                    <Text style={styles.emptyLoanHistoryTitle}>No Active Loans</Text>
                    <Text style={styles.emptyLoanHistorySub}>
                      This borrower has no active running loans. Tap "+ Allot New Loan to Borrower" above to disburse one.
                    </Text>
                  </View>
                ) : (
                  activeLoans.map((l, index) => {
                    const lPrincipal = Number(l.principal_amount || l.principal || 0);
                    const lRepayable = Number(l.total_repayment_amount || l.total_repayment || 0);
                    const lOutstanding = Number(l.outstanding_amount ?? (lRepayable - Number(l.total_paid || 0)));
                    const isOverdue = l.status === 'OVERDUE';

                    return (
                      <View key={l.id || index} style={[styles.loanItemCard, isOverdue && styles.loanItemCardOverdue]}>
                        <View style={styles.loanItemHeader}>
                          <View style={styles.loanItemCodeTag}>
                            <MaterialCommunityIcons name="file-document-outline" size={13} color="#6B46C1" />
                            <Text style={styles.loanItemCodeText}>
                              {l.loan_number || l.loan_code || `LOAN #${l.id || index + 1}`}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.loanStatusBadge,
                              isOverdue ? styles.loanStatusBadgeOverdue : styles.loanStatusBadgeActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.loanStatusBadgeText,
                                isOverdue ? styles.loanStatusBadgeTextOverdue : styles.loanStatusBadgeTextActive,
                              ]}
                            >
                              {l.status || 'ACTIVE'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.loanItemGrid}>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Principal</Text>
                            <Text style={styles.loanItemColVal}>{formatINR(lPrincipal)}</Text>
                          </View>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Repayable</Text>
                            <Text style={styles.loanItemColVal}>{formatINR(lRepayable)}</Text>
                          </View>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Outstanding</Text>
                            <Text
                              style={[
                                styles.loanItemColVal,
                                { color: lOutstanding > 0 ? (isOverdue ? '#DC2626' : '#111827') : '#059669' },
                              ]}
                            >
                              {formatINR(lOutstanding)}
                            </Text>
                          </View>
                        </View>

                        {l.disbursed_at && (
                          <Text style={styles.loanItemFooterDate}>
                            Disbursed on: {formatDate(l.disbursed_at)} ({l.repayment_frequency || 'WEEKLY'})
                          </Text>
                        )}
                      </View>
                    );
                  })
                )
              ) : (
                completedLoans.length === 0 ? (
                  <View style={styles.emptyLoanHistory}>
                    <MaterialCommunityIcons name="check-all" size={40} color="#94A3B8" />
                    <Text style={styles.emptyLoanHistoryTitle}>No Completed Loans</Text>
                    <Text style={styles.emptyLoanHistorySub}>
                      No settled or completed loans recorded yet for this borrower.
                    </Text>
                  </View>
                ) : (
                  completedLoans.map((l, index) => {
                    const lPrincipal = Number(l.principal_amount || l.principal || 0);
                    const lRepayable = Number(l.total_repayment_amount || l.total_repayment || 0);

                    return (
                      <View key={l.id || index} style={[styles.loanItemCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
                        <View style={styles.loanItemHeader}>
                          <View style={[styles.loanItemCodeTag, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="check-circle" size={13} color="#15803D" />
                            <Text style={[styles.loanItemCodeText, { color: '#15803D' }]}>
                              {l.loan_number || l.loan_code || `LOAN #${l.id || index + 1}`}
                            </Text>
                          </View>
                          <View style={[styles.loanStatusBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                            <Text style={[styles.loanStatusBadgeText, { color: '#15803D' }]}>
                              COMPLETED
                            </Text>
                          </View>
                        </View>

                        <View style={styles.loanItemGrid}>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Disbursed</Text>
                            <Text style={styles.loanItemColVal}>{formatINR(lPrincipal)}</Text>
                          </View>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Total Repaid</Text>
                            <Text style={[styles.loanItemColVal, { color: '#15803D' }]}>{formatINR(lRepayable)}</Text>
                          </View>
                          <View style={styles.loanItemCol}>
                            <Text style={styles.loanItemColLabel}>Status</Text>
                            <Text style={[styles.loanItemColVal, { color: '#15803D' }]}>Fully Settled</Text>
                          </View>
                        </View>

                        {l.disbursed_at && (
                          <Text style={[styles.loanItemFooterDate, { color: '#15803D' }]}>
                            Settled Loan • Disbursed {formatDate(l.disbursed_at)}
                          </Text>
                        )}
                      </View>
                    );
                  })
                )
              )}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 6. INNER MODAL: ALLOT NEW LOAN CONFIGURATION FORM */}
        <Modal
          visible={isAddLoanModalOpen}
          animationType="slide"
          onRequestClose={() => setIsAddLoanModalOpen(false)}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Inner Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Allot New Loan</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  For: {borrowerName} ({borrowerPhone})
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsAddLoanModalOpen(false)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Category / Scheme Selector (3 Chips matching AddU) */}
                <View style={styles.divisionContainer}>
                  <View style={styles.sectionHeadingRow}>
                    <MaterialCommunityIcons name="tune" size={18} color="#6B46C1" />
                    <Text style={styles.sectionHeadingTitle}>Loan Scheme & Category</Text>
                  </View>
                  <View style={styles.divisionRow}>
                    {categories.map((cat) => {
                      const isSelected = selectedCategoryCode === cat.category_code;
                      return (
                        <TouchableOpacity
                          key={cat.category_code}
                          style={[
                            styles.divisionChip,
                            isSelected && styles.divisionChipSelected,
                          ]}
                          onPress={() => handleSelectCategory(cat)}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name={cat.icon}
                            size={18}
                            color={isSelected ? '#6B46C1' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.divisionChipTitle,
                              isSelected && styles.divisionChipTitleSelected,
                            ]}
                          >
                            {cat.name.split(' ')[0]}
                          </Text>
                          <Text style={styles.divisionChipRate}>
                            {cat.default_interest_rate}% Flat
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Funding Source Selector */}
                <View style={styles.divisionContainer}>
                  <View style={styles.sectionHeadingRow}>
                    <MaterialCommunityIcons name="bank-transfer" size={18} color="#6B46C1" />
                    <Text style={styles.sectionHeadingTitle}>Disbursement Funding Source</Text>
                  </View>
                  <View style={styles.divisionRow}>
                    <TouchableOpacity
                      style={[
                        styles.divisionChip,
                        formData.funding_source === 'VAULT' && styles.divisionChipSelected,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, funding_source: 'VAULT' }))
                      }
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name="safe"
                        size={18}
                        color={formData.funding_source === 'VAULT' ? '#6B46C1' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.divisionChipTitle,
                          formData.funding_source === 'VAULT' && styles.divisionChipTitleSelected,
                        ]}
                      >
                        Vault Cash
                      </Text>
                      <Text style={styles.divisionChipRate}>Deduct Vault</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.divisionChip,
                        formData.funding_source === 'HANDS_ON' && styles.divisionChipSelected,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, funding_source: 'HANDS_ON' }))
                      }
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name="hand-coin"
                        size={18}
                        color={formData.funding_source === 'HANDS_ON' ? '#6B46C1' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.divisionChipTitle,
                          formData.funding_source === 'HANDS_ON' && styles.divisionChipTitleSelected,
                        ]}
                      >
                        Hands-On
                      </Text>
                      <Text style={styles.divisionChipRate}>Inject Cash</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Principal Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Principal Amount <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputBox, errors.principal_amount && styles.inputBoxError]}>
                    <MaterialCommunityIcons name="currency-inr" size={20} color="#6B46C1" />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 5000"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={formData.principal_amount}
                      onChangeText={(val) => {
                        setFormData((prev) => ({ ...prev, principal_amount: val }));
                        if (errors.principal_amount) setErrors((prev) => ({ ...prev, principal_amount: null }));
                      }}
                    />
                  </View>
                  {errors.principal_amount && (
                    <Text style={styles.errorText}>{errors.principal_amount}</Text>
                  )}

                  {/* Preset Quick Amount Chips */}
                  <View style={styles.presetChipsRow}>
                    {PRESET_AMOUNTS.map((amt) => {
                      const isSelected = Number(formData.principal_amount) === amt;
                      return (
                        <TouchableOpacity
                          key={amt}
                          style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                          onPress={() => {
                            setFormData((prev) => ({ ...prev, principal_amount: String(amt) }));
                            if (errors.principal_amount) setErrors((prev) => ({ ...prev, principal_amount: null }));
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}>
                            {formatINR(amt)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Interest Rate & Tenure Row */}
                <View style={styles.twoColumnRow}>
                  <View style={styles.columnHalf}>
                    <Text style={styles.label}>
                      Interest Rate (%) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputBox, errors.interest_rate && styles.inputBoxError]}>
                      <MaterialCommunityIcons name="percent" size={18} color="#6B46C1" />
                      <TextInput
                        style={styles.input}
                        placeholder="25"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={formData.interest_rate}
                        onChangeText={(val) => {
                          setFormData((prev) => ({ ...prev, interest_rate: val }));
                          if (errors.interest_rate) setErrors((prev) => ({ ...prev, interest_rate: null }));
                        }}
                      />
                    </View>
                    {errors.interest_rate && <Text style={styles.errorText}>{errors.interest_rate}</Text>}
                  </View>

                  <View style={styles.columnHalf}>
                    <Text style={styles.label}>
                      Tenure ({tenureUnit}) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputBox, errors.tenure && styles.inputBoxError]}>
                      <MaterialCommunityIcons name="calendar-clock" size={18} color="#6B46C1" />
                      <TextInput
                        style={styles.input}
                        placeholder="10"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={formData.tenure}
                        onChangeText={(val) => {
                          setFormData((prev) => ({ ...prev, tenure: val }));
                          if (errors.tenure) setErrors((prev) => ({ ...prev, tenure: null }));
                        }}
                      />
                    </View>
                    {errors.tenure && <Text style={styles.errorText}>{errors.tenure}</Text>}
                  </View>
                </View>

                {/* 5. Live Repayment & Income Summary Box */}
                <View style={styles.liveCalculationBox}>
                  <View style={styles.calcHeader}>
                    <MaterialCommunityIcons name="calculator" size={18} color="#6B46C1" />
                    <Text style={styles.calcTitle}>Repayment & Revenue Breakdown</Text>
                  </View>

                  <View style={styles.calcGrid}>
                    <View style={styles.calcItem}>
                      <Text style={styles.calcLabel}>Principal</Text>
                      <Text style={styles.calcValue}>{formatINR(principalAmountNum)}</Text>
                    </View>
                    <View style={styles.calcItem}>
                      <Text style={styles.calcLabel}>Total Repayable</Text>
                      <Text style={[styles.calcValue, { color: '#6B46C1' }]}>{formatINR(totalRepayableNum)}</Text>
                    </View>
                    <View style={styles.calcItem}>
                      <Text style={styles.calcLabel}>Installment ({activeCategory.repayment_frequency})</Text>
                      <Text style={[styles.calcValue, { color: '#059669' }]}>
                        {formatINR(installmentAmountNum)} / {tenureUnitSingular.toLowerCase()}
                      </Text>
                    </View>
                    <View style={styles.calcItem}>
                      <Text style={styles.calcLabel}>Contracted Revenue</Text>
                      <Text style={[styles.calcValue, { color: '#059669' }]}>
                        +{formatINR(interestAmountNum)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 6. Disburse Action Button */}
                <View style={styles.actionWrap}>
                  <TouchableOpacity
                    style={[styles.createButton, submitting && styles.createButtonDisabled]}
                    onPress={handleDisburseLoan}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="cash-check" size={22} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>
                          Disburse & Activate Loan ({formatINR(principalAmountNum)})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacing} />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

export default IssueLoanModal;
