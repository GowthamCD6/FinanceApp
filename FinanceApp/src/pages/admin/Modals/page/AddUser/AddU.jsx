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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import { apiService } from '../../../../../services/apiService';
import Colors from '../../../../../theme/colors';
import styles from './AddUsty';

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
    occupation: '',
    shop_name: '',
    work_profession: '',
    credit_limit: '5000',
    issue_initial_loan: true,
    initial_loan_amount: '2000',
    interest_rate: '25',
    tenure: '10',
    frequency: 'WEEKLY',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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
      color: '#2563EB',
      bg: '#EFF6FF',
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
      color: '#7C3AED',
      bg: '#F3E8FF',
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

  const handleDismiss = () => {
    setFormData({
      name: '',
      phone: '',
      occupation: '',
      shop_name: '',
      work_profession: '',
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

    if (isShop && !formData.shop_name.trim()) {
      errs.shop_name = 'Shop / Stall name is required';
    }
    if (isWeekly && !formData.occupation.trim()) {
      errs.occupation = 'Occupation / Trade is required';
    }
    if (isMonthly && !formData.work_profession.trim()) {
      errs.work_profession = 'Work / Profession is required';
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

      const resolvedOccupation = isShop
        ? formData.shop_name.trim()
        : isMonthly
        ? formData.work_profession.trim()
        : formData.occupation.trim();

      const payload = {
        organizationId: orgId,
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        role: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        occupation: resolvedOccupation,
        shop_name: isShop ? formData.shop_name.trim() : null,
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
    <View style={styles.container}>
      <Header
        title="Onboard New Borrower"
        onBack={handleDismiss}
        showBackButton={true}
        showDivider={true}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Division Selector */}
          <View style={styles.divisionContainer}>
            <Text style={styles.sectionHeading}>Select Borrower Lending Division *</Text>
            <View style={styles.divisionRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryCode === cat.category_code;
                return (
                  <TouchableOpacity
                    key={cat.category_code}
                    style={[
                      styles.divisionChip,
                      isSelected && { borderColor: cat.color, backgroundColor: cat.bg },
                    ]}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name={cat.icon} size={20} color={isSelected ? cat.color : '#64748B'} />
                    <Text style={[styles.divisionChipTitle, isSelected && { color: cat.color }]}>
                      {cat.name}
                    </Text>
                    <Text style={styles.divisionChipRate}>{cat.default_interest_rate}% Flat</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Borrower Personal Details */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Borrower Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Borrower Full Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                placeholder="e.g. Ramesh Krishnan"
                placeholderTextColor={Colors.gray100}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData((s) => ({ ...s, name: text }));
                  if (errors.name) setErrors((e) => ({ ...e, name: null }));
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Phone Number (10 Digits) *</Text>
              <TextInput
                style={[styles.textInput, errors.phone && styles.inputError]}
                placeholder="e.g. 9876543210"
                placeholderTextColor={Colors.gray100}
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

            {/* Dynamic Profession / Shop Input */}
            {isShop ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Shop / Stall Name *</Text>
                <TextInput
                  style={[styles.textInput, errors.shop_name && styles.inputError]}
                  placeholder="e.g. Sri Balaji General Store"
                  placeholderTextColor={Colors.gray100}
                  value={formData.shop_name}
                  onChangeText={(text) => {
                    setFormData((s) => ({ ...s, shop_name: text }));
                    if (errors.shop_name) setErrors((e) => ({ ...e, shop_name: null }));
                  }}
                />
                {errors.shop_name && <Text style={styles.errorText}>{errors.shop_name}</Text>}
              </View>
            ) : isMonthly ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Work / Profession *</Text>
                <TextInput
                  style={[styles.textInput, errors.work_profession && styles.inputError]}
                  placeholder="e.g. Software Engineer / Retail Manager"
                  placeholderTextColor={Colors.gray100}
                  value={formData.work_profession}
                  onChangeText={(text) => {
                    setFormData((s) => ({ ...s, work_profession: text }));
                    if (errors.work_profession) setErrors((e) => ({ ...e, work_profession: null }));
                  }}
                />
                {errors.work_profession && <Text style={styles.errorText}>{errors.work_profession}</Text>}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Occupation / Trade *</Text>
                <TextInput
                  style={[styles.textInput, errors.occupation && styles.inputError]}
                  placeholder="e.g. Tailor, Fabrication Worker, Driver"
                  placeholderTextColor={Colors.gray100}
                  value={formData.occupation}
                  onChangeText={(text) => {
                    setFormData((s) => ({ ...s, occupation: text }));
                    if (errors.occupation) setErrors((e) => ({ ...e, occupation: null }));
                  }}
                />
                {errors.occupation && <Text style={styles.errorText}>{errors.occupation}</Text>}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Approved Credit Limit (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50000"
                placeholderTextColor={Colors.gray100}
                value={formData.credit_limit}
                keyboardType="numeric"
                onChangeText={(text) => setFormData((s) => ({ ...s, credit_limit: text }))}
              />
            </View>
          </View>

          {/* Credit Policy & 1st Loan Origination */}
          <View style={styles.formCard}>
            <View style={styles.formCardHeaderRow}>
              <Text style={styles.formCardTitle}>Credit Policy & Loan Origination</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData((s) => ({ ...s, issue_initial_loan: !s.issue_initial_loan }))}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={formData.issue_initial_loan ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.checkboxLabel}>Issue 1st Loan Now</Text>
              </TouchableOpacity>
            </View>

            {formData.issue_initial_loan && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Initial Loan Principal (₹) *</Text>
                  <TextInput
                    style={[styles.textInput, errors.initial_loan_amount && styles.inputError]}
                    placeholder="e.g. 2000"
                    placeholderTextColor={Colors.gray100}
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
                    <Text style={styles.inputLabel}>Interest Rate (%) *</Text>
                    <TextInput
                      style={[styles.textInput, errors.interest_rate && styles.inputError]}
                      placeholder="e.g. 25"
                      placeholderTextColor={Colors.gray100}
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
                    <Text style={styles.inputLabel}>Tenure ({tenureUnit}) *</Text>
                    <TextInput
                      style={[styles.textInput, errors.tenure && styles.inputError]}
                      placeholder={`e.g. ${activeCategory.tenure_installments}`}
                      placeholderTextColor={Colors.gray100}
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
                      <MaterialCommunityIcons name="receipt" size={15} color="#4F46E5" />
                      <Text style={styles.previewTitle}>Live Loan Breakdown ({activeCategory.repayment_frequency})</Text>
                    </View>

                    <View style={styles.previewGrid}>
                      <View style={styles.previewItem}>
                        <Text style={styles.previewLabel}>Principal</Text>
                        <Text style={styles.previewValue}>₹{principalAmount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.previewItem}>
                        <Text style={styles.previewLabel}>Repayable ({flatRate}%)</Text>
                        <Text style={styles.previewValue}>₹{totalRepayable.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={[styles.previewItem, styles.previewHighlight]}>
                        <Text style={styles.previewLabel}>Installment Due</Text>
                        <Text style={styles.previewValueHighlight}>
                          ₹{installmentAmount.toLocaleString('en-IN')} / {tenureUnitSingular}
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
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-plus" size={20} color={Colors.white} />
                  <Text style={styles.createButtonText}>
                    Save & Onboard Borrower ({activeCategory.repayment_frequency})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
