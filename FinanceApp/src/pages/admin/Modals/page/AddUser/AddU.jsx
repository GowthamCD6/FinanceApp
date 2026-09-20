import React, { useState, useEffect, useMemo } from 'react';
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
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import { apiService } from '../../../../../services/apiService';
import Colors from '../../../../../theme/colors';
import styles from './AddUsty';

const addUserAnimation = require('../../../../../animation/Add-user.json');

export const AddU = ({ visible, onClose, onBack, onUserAdded }) => {
  const { currentOrganization, refreshData } = useApp();
  const orgId = currentOrganization?.id || 1;

  // Dynamic Lending Config loaded from DB / server
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
    name: '',
    phone: '',
    birth_year: '',
    credit_limit: '5000',
    issue_initial_loan: true,
    initial_loan_amount: '2000',
    interest_rate: '25',
    tenure: '10',
    frequency: 'WEEKLY',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleDismiss = () => {
    setFormData({
      name: '',
      phone: '',
      birth_year: '',
      credit_limit: '5000',
      issue_initial_loan: true,
      initial_loan_amount: '2000',
      interest_rate: '25',
      tenure: '10',
      frequency: 'WEEKLY',
    });
    setErrors({});
    if (onClose) onClose();
    if (onBack) onBack();
  };

  // Hardware Back button handling
  useEffect(() => {
    const backAction = () => {
      handleDismiss();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Fetch Lending Config from API
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
        console.warn('Using default lending config for AddUser:', err);
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [orgId]);

  // Categories definition
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
  const isWeekly = !isShop && !isMonthly;

  const tenureUnit = isShop ? 'Days' : isMonthly ? 'Months' : 'Weeks';
  const tenureUnitSingular = isShop ? 'Day' : isMonthly ? 'Month' : 'Week';

  const birthYearNum = parseInt(formData.birth_year, 10);
  const currentYear = new Date().getFullYear();
  const calculatedAge = (!isNaN(birthYearNum) && birthYearNum >= 1920 && birthYearNum <= currentYear)
    ? (currentYear - birthYearNum)
    : null;

  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
    setFormData((prev) => ({
      ...prev,
      credit_limit: String(cat.default_max_loan),
      initial_loan_amount: String(cat.default_min_loan),
      interest_rate: String(cat.default_interest_rate),
      tenure: String(cat.tenure_installments),
      frequency: cat.repayment_frequency,
    }));
  };

  // Real-time Calculations
  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const flatRate = parseFloat(formData.interest_rate) || activeCategory.default_interest_rate;
  const installmentCount = parseInt(formData.tenure, 10) || activeCategory.tenure_installments;
  const interestAmount = Math.round((principalAmount * flatRate) / 100);
  const totalRepayable = principalAmount + interestAmount;
  const installmentAmount = installmentCount > 0 ? Math.round(totalRepayable / installmentCount) : 0;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';

    const cleanPhone = (formData.phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Enter valid 10-digit mobile number';
    }

    if (formData.birth_year) {
      const yearNum = parseInt(formData.birth_year, 10);
      const curYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > curYear) {
        errs.birth_year = 'Enter a valid 4-digit birth year';
      }
    }

    if (formData.issue_initial_loan) {
      if (!formData.initial_loan_amount || parseFloat(formData.initial_loan_amount) <= 0) {
        errs.initial_loan_amount = 'Initial principal must be > 0';
      }
      if (formData.interest_rate === '' || isNaN(Number(formData.interest_rate)) || Number(formData.interest_rate) < 0) {
        errs.interest_rate = 'Valid interest rate is required';
      }
      if (!formData.tenure || parseInt(formData.tenure, 10) <= 0) {
        errs.tenure = `Tenure must be at least 1 ${tenureUnitSingular.toLowerCase()}`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const principal = parseFloat(formData.initial_loan_amount) || activeCategory.default_min_loan;
      const freq = activeCategory.repayment_frequency;
      const birthYearVal = formData.birth_year ? parseInt(formData.birth_year, 10) : null;

      const payload = {
        organizationId: orgId,
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        birth_year: birthYearVal,
        date_of_birth: birthYearVal ? `${birthYearVal}-01-01` : null,
        role: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        credit_limit: parseFloat(formData.credit_limit) || activeCategory.default_max_loan,
        initial_loan: formData.issue_initial_loan
          ? {
              principal,
              total_installments: installmentCount,
              frequency: freq,
              interest_rate: flatRate,
            }
          : null,
      };

      const res = await apiService.createUser(payload);
      const customerCode = res?.customerCode || res?.data?.customerCode || res?.data?.customer_code || 'CUST-ONBOARDED';

      if (refreshData) refreshData();
      if (onUserAdded) onUserAdded(res);

      Alert.alert(
        'Borrower Onboarded!',
        `Successfully onboarded "${formData.name.trim()}" with Code: ${customerCode}`,
        [{ text: 'OK', onPress: handleDismiss }]
      );
    } catch (err) {
      console.error('Error onboarding user:', err);
      Alert.alert('Onboarding Failed', err?.message || 'Failed to onboard borrower. Check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Add User"
        onBack={handleDismiss}
        showBackButton={true}
      />

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
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              source={addUserAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* Division Selector */}
          <View style={styles.divisionContainer}>
            <View style={styles.sectionHeadingRow}>
              <MaterialCommunityIcons name="layers-outline" size={18} color="#6B46C1" />
              <Text style={styles.sectionHeading}>Lending Scheme *</Text>
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
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name={cat.icon} size={22} color={isSelected ? '#6B46C1' : '#64748B'} />
                    <Text style={[styles.divisionChipTitle, isSelected && styles.divisionChipTitleSelected]}>
                      {cat.name}
                    </Text>
                    <Text style={styles.divisionChipRate}>{cat.default_interest_rate}% Flat</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Borrower Personal Details */}
          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#6B46C1" />
              <Text style={styles.sectionTitle}>Borrower Information</Text>
            </View>

            {/* Name Field */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <View style={styles.labelLeft}>
                  <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
              </View>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                placeholder="Enter borrower full name"
                placeholderTextColor="#A0A0A0"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData((s) => ({ ...s, name: text }));
                  if (errors.name) setErrors((e) => ({ ...e, name: null }));
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Phone Field */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <View style={styles.labelLeft}>
                  <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
              </View>
              <TextInput
                style={[styles.textInput, errors.phone && styles.inputError]}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#A0A0A0"
                value={formData.phone}
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(text) => {
                  const clean = text.replace(/\D/g, '').slice(0, 10);
                  setFormData((s) => ({ ...s, phone: clean }));
                  if (errors.phone) setErrors((e) => ({ ...e, phone: null }));
                }}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Birth Year / Age Field */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <View style={styles.labelLeft}>
                  <MaterialCommunityIcons name="calendar-account" size={16} color="#6B7280" />
                  <Text style={styles.inputLabel}>Year of Birth</Text>
                </View>
                {calculatedAge !== null && (
                  <View style={styles.ageBadge}>
                    <Text style={styles.ageBadgeText}>Age: {calculatedAge} Yrs</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[styles.textInput, errors.birth_year && styles.inputError]}
                placeholder="Enter birth year (e.g. 1992)"
                placeholderTextColor="#A0A0A0"
                value={formData.birth_year}
                keyboardType="numeric"
                maxLength={4}
                onChangeText={(text) => {
                  const clean = text.replace(/\D/g, '').slice(0, 4);
                  setFormData((s) => ({ ...s, birth_year: clean }));
                  if (errors.birth_year) setErrors((e) => ({ ...e, birth_year: null }));
                }}
              />
              {errors.birth_year && <Text style={styles.errorText}>{errors.birth_year}</Text>}
            </View>

            {/* Approved Credit Limit */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <View style={styles.labelLeft}>
                  <MaterialCommunityIcons name="credit-card-check-outline" size={16} color="#6B7280" />
                  <Text style={styles.inputLabel}>Approved Credit Limit (₹)</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50000"
                placeholderTextColor="#A0A0A0"
                value={formData.credit_limit}
                keyboardType="numeric"
                onChangeText={(text) => setFormData((s) => ({ ...s, credit_limit: text }))}
              />
            </View>
          </View>

          {/* Credit Policy & 1st Loan Origination */}
          <View style={styles.formSection}>
            <TouchableOpacity
              style={styles.loanToggleCard}
              onPress={() => setFormData((s) => ({ ...s, issue_initial_loan: !s.issue_initial_loan }))}
              activeOpacity={0.7}
            >
              <View style={styles.loanToggleLeft}>
                <MaterialCommunityIcons
                  name={formData.issue_initial_loan ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={24}
                  color={formData.issue_initial_loan ? '#6B46C1' : '#94A3B8'}
                />
                <View>
                  <Text style={styles.loanToggleTitle}>Issue Initial Loan Now</Text>
                  <Text style={styles.loanToggleSubtitle}>Originate first loan on onboarding</Text>
                </View>
              </View>
            </TouchableOpacity>

            {formData.issue_initial_loan && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <View style={styles.labelLeft}>
                      <MaterialCommunityIcons name="cash" size={16} color="#6B7280" />
                      <Text style={styles.inputLabel}>Initial Loan Principal (₹)</Text>
                      <Text style={styles.requiredStar}>*</Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.textInput, errors.initial_loan_amount && styles.inputError]}
                    placeholder="e.g. 2000"
                    placeholderTextColor="#A0A0A0"
                    value={formData.initial_loan_amount}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setFormData((s) => ({ ...s, initial_loan_amount: text }));
                      if (errors.initial_loan_amount) setErrors((e) => ({ ...e, initial_loan_amount: null }));
                    }}
                  />
                  {errors.initial_loan_amount && <Text style={styles.errorText}>{errors.initial_loan_amount}</Text>}
                </View>

                <View style={styles.rowTwoInputs}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="percent" size={16} color="#6B7280" />
                        <Text style={styles.inputLabel}>Interest (%)</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={[styles.textInput, errors.interest_rate && styles.inputError]}
                      placeholder="e.g. 25"
                      placeholderTextColor="#A0A0A0"
                      value={formData.interest_rate}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        setFormData((s) => ({ ...s, interest_rate: text }));
                        if (errors.interest_rate) setErrors((e) => ({ ...e, interest_rate: null }));
                      }}
                    />
                    {errors.interest_rate && <Text style={styles.errorText}>{errors.interest_rate}</Text>}
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                        <Text style={styles.inputLabel}>Tenure ({tenureUnit})</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={[styles.textInput, errors.tenure && styles.inputError]}
                      placeholder={`e.g. ${activeCategory.tenure_installments}`}
                      placeholderTextColor="#A0A0A0"
                      value={formData.tenure}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        setFormData((s) => ({ ...s, tenure: text }));
                        if (errors.tenure) setErrors((e) => ({ ...e, tenure: null }));
                      }}
                    />
                    {errors.tenure && <Text style={styles.errorText}>{errors.tenure}</Text>}
                  </View>
                </View>

                {/* Live Smart Preview Box */}
                {principalAmount > 0 && (
                  <View style={styles.previewBox}>
                    <View style={styles.previewHeader}>
                      <MaterialCommunityIcons name="calculator-variant-outline" size={16} color="#6B46C1" />
                      <Text style={styles.previewTitle}>Repayment Calculation ({activeCategory.repayment_frequency})</Text>
                    </View>

                    <View style={styles.previewGrid}>
                      <View style={styles.previewItem}>
                        <Text style={styles.previewLabel}>Principal</Text>
                        <Text style={styles.previewValue}>₹{principalAmount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.previewItem}>
                        <Text style={styles.previewLabel}>Total ({flatRate}%)</Text>
                        <Text style={styles.previewValue}>₹{totalRepayable.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={[styles.previewItem, styles.previewHighlight]}>
                        <Text style={styles.previewLabel}>Installment</Text>
                        <Text style={styles.previewValueHighlight}>
                          ₹{installmentAmount.toLocaleString('en-IN')}/{tenureUnitSingular.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.actionWrap}>
            <TouchableOpacity
              style={[styles.createButton, submitting && styles.createButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Save User</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (visible !== undefined) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleDismiss}>
        {content}
      </Modal>
    );
  }

  return content;
};

export default AddU;

