import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Switch,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import { apiService } from '../../../../../services/apiService';
import styles from './InterestRatesSty';

const moneyLendingAnimation = require('../../../../../animation/MoneyLending.json');

const ALL_WEEKDAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

const SkeletonBox = ({ width, height, borderRadius = 8, style }) => {
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

export const InterestRatesModal = ({ visible, onClose, onBack }) => {
  const { currentOrganization } = useApp();
  const orgId = currentOrganization?.id || 1;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSchemeId, setActiveSchemeId] = useState('weekly');

  // Scheme form configuration state
  const [configState, setConfigState] = useState({
    // Weekly Scheme
    weekly_loan_enabled: true,
    weekly_interest_rate: '25',
    weekly_tenure_weeks: '10',
    weekly_min_amount: '2000',
    weekly_max_amount: '5000',
    weekly_collection_days: ['MON', 'WED', 'FRI'],
    weekly_collection_grace_days: '2',

    // Daily Scheme
    daily_loan_enabled: true,
    daily_interest_rate: '25',
    daily_tenure_days: '100',
    daily_min_amount: '10000',
    daily_max_amount: '15000',
    daily_operating_days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],

    // Monthly Scheme
    monthly_loan_enabled: true,
    monthly_interest_rate: '25',
    monthly_tenure_months: '12',
    monthly_min_amount: '25000',
    monthly_max_amount: '500000',
    monthly_collection_start_day: '1',
    monthly_collection_end_day: '5',
    monthly_collection_grace_days: '3',
  });

  const handleDismiss = () => {
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

  // Fetch Lending Configuration
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLendingConfig(orgId);
      if (data) {
        setConfigState({
          weekly_loan_enabled: Boolean(data.weekly_loan_enabled ?? true),
          weekly_interest_rate: String(data.weekly_interest_rate ?? 25.0),
          weekly_tenure_weeks: String(data.weekly_tenure_weeks ?? 10),
          weekly_min_amount: String(data.weekly_min_amount ?? 2000),
          weekly_max_amount: String(data.weekly_max_amount ?? 5000),
          weekly_collection_days: data.weekly_collection_days
            ? data.weekly_collection_days.split(',').map((d) => d.trim()).filter(Boolean)
            : ['MON', 'WED', 'FRI'],
          weekly_collection_grace_days: String(data.weekly_collection_grace_days ?? 2),

          daily_loan_enabled: Boolean(data.daily_loan_enabled ?? true),
          daily_interest_rate: String(data.daily_interest_rate ?? 25.0),
          daily_tenure_days: String(data.daily_tenure_days ?? 100),
          daily_min_amount: String(data.daily_min_amount ?? 10000),
          daily_max_amount: String(data.daily_max_amount ?? 15000),
          daily_operating_days: data.daily_operating_days
            ? data.daily_operating_days.split(',').map((d) => d.trim()).filter(Boolean)
            : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],

          monthly_loan_enabled: Boolean(data.monthly_loan_enabled ?? true),
          monthly_interest_rate: String(data.monthly_interest_rate ?? 25.0),
          monthly_tenure_months: String(data.monthly_tenure_months ?? 12),
          monthly_min_amount: String(data.monthly_min_amount ?? 25000),
          monthly_max_amount: String(data.monthly_max_amount ?? 500000),
          monthly_collection_start_day: String(data.monthly_collection_start_day ?? 1),
          monthly_collection_end_day: String(data.monthly_collection_end_day ?? 5),
          monthly_collection_grace_days: String(data.monthly_collection_grace_days ?? 3),
        });
      }
    } catch (err) {
      console.warn('Error loading lending config for interest rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [orgId]);

  // Schemes metadata for Division Chips
  const schemesList = useMemo(() => [
    {
      id: 'weekly',
      name: 'Borrower (Weekly)',
      subtitle: 'Weekly Micro-Loan',
      icon: 'account-group',
      rate: `${configState.weekly_interest_rate}% Flat`,
      color: '#6B46C1',
      bg: '#F5F3FF',
    },
    {
      id: 'daily',
      name: 'Merchant (Daily)',
      subtitle: 'Daily Recovery Cycle',
      icon: 'store',
      rate: `${configState.daily_interest_rate}% Flat`,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      id: 'monthly',
      name: 'Business (Monthly)',
      subtitle: 'Monthly EMI Cycle',
      icon: 'chart-line',
      rate: `${configState.monthly_interest_rate}% p.a.`,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
  ], [configState]);

  // Toggle days handler
  const handleToggleDay = (dayKey, scheme) => {
    const field = scheme === 'weekly' ? 'weekly_collection_days' : 'daily_operating_days';
    const currentDays = configState[field] || [];

    if (currentDays.includes(dayKey)) {
      if (currentDays.length <= 1) {
        Alert.alert('Validation Error', 'At least 1 operating day must remain selected');
        return;
      }
      setConfigState((prev) => ({
        ...prev,
        [field]: currentDays.filter((d) => d !== dayKey),
      }));
    } else {
      const updated = [...currentDays, dayKey];
      const sorted = ALL_WEEKDAYS.filter((w) => updated.includes(w.key)).map((w) => w.key);
      setConfigState((prev) => ({
        ...prev,
        [field]: sorted,
      }));
    }
  };

  // Dynamic preview calculation
  const previewCalculation = useMemo(() => {
    if (activeSchemeId === 'weekly') {
      const p = Number(configState.weekly_min_amount) || 2000;
      const rate = Number(configState.weekly_interest_rate) || 25;
      const tenure = Number(configState.weekly_tenure_weeks) || 10;
      const interest = Math.round(p * (rate / 100));
      const total = p + interest;
      const installment = tenure > 0 ? Math.round(total / tenure) : 0;
      return {
        samplePrincipal: p,
        rateText: `${rate}% Flat`,
        tenureText: `${tenure} Weeks`,
        interestText: `₹${interest.toLocaleString()}`,
        totalText: `₹${total.toLocaleString()}`,
        dueText: `₹${installment.toLocaleString()} / week`,
        formula: `Weekly Due = [₹${p.toLocaleString()} + (${rate}% Flat Interest)] ÷ ${tenure} Weeks`,
      };
    }

    if (activeSchemeId === 'daily') {
      const p = Number(configState.daily_min_amount) || 10000;
      const rate = Number(configState.daily_interest_rate) || 25;
      const tenure = Number(configState.daily_tenure_days) || 100;
      const interest = Math.round(p * (rate / 100));
      const total = p + interest;
      const installment = tenure > 0 ? Math.round(total / tenure) : 0;
      return {
        samplePrincipal: p,
        rateText: `${rate}% Flat`,
        tenureText: `${tenure} Days`,
        interestText: `₹${interest.toLocaleString()}`,
        totalText: `₹${total.toLocaleString()}`,
        dueText: `₹${installment.toLocaleString()} / day`,
        formula: `Daily Due = [₹${p.toLocaleString()} + (${rate}% Flat Interest)] ÷ ${tenure} Days`,
      };
    }

    // Monthly
    const p = Number(configState.monthly_min_amount) || 25000;
    const rate = Number(configState.monthly_interest_rate) || 25;
    const tenure = Number(configState.monthly_tenure_months) || 12;
    const interest = Math.round(p * (rate / 100) * (tenure / 12));
    const total = p + interest;
    const installment = tenure > 0 ? Math.round(total / tenure) : 0;
    return {
      samplePrincipal: p,
      rateText: `${rate}% p.a.`,
      tenureText: `${tenure} Months`,
      interestText: `₹${interest.toLocaleString()}`,
      totalText: `₹${total.toLocaleString()}`,
      dueText: `₹${installment.toLocaleString()} / mo`,
      formula: `Monthly EMI = [₹${p.toLocaleString()} + (${rate}% p.a. Interest × ${tenure}/12)] ÷ ${tenure} Months`,
    };
  }, [activeSchemeId, configState]);

  // Save changes to backend
  const handleSaveConfig = async () => {
    // Basic validation
    if (activeSchemeId === 'weekly') {
      const rate = Number(configState.weekly_interest_rate);
      const tenure = Number(configState.weekly_tenure_weeks);
      const minA = Number(configState.weekly_min_amount);
      const maxA = Number(configState.weekly_max_amount);
      if (isNaN(rate) || rate < 0) return Alert.alert('Validation Error', 'Enter a valid weekly interest rate');
      if (isNaN(tenure) || tenure <= 0) return Alert.alert('Validation Error', 'Enter valid tenure weeks');
      if (isNaN(minA) || isNaN(maxA) || minA <= 0 || maxA < minA) {
        return Alert.alert('Validation Error', 'Maximum loan amount must exceed minimum amount');
      }
    } else if (activeSchemeId === 'daily') {
      const rate = Number(configState.daily_interest_rate);
      const tenure = Number(configState.daily_tenure_days);
      const minA = Number(configState.daily_min_amount);
      const maxA = Number(configState.daily_max_amount);
      if (isNaN(rate) || rate < 0) return Alert.alert('Validation Error', 'Enter a valid daily interest rate');
      if (isNaN(tenure) || tenure <= 0) return Alert.alert('Validation Error', 'Enter valid tenure days');
      if (isNaN(minA) || isNaN(maxA) || minA <= 0 || maxA < minA) {
        return Alert.alert('Validation Error', 'Maximum loan amount must exceed minimum amount');
      }
    } else if (activeSchemeId === 'monthly') {
      const rate = Number(configState.monthly_interest_rate);
      const tenure = Number(configState.monthly_tenure_months);
      const minA = Number(configState.monthly_min_amount);
      const maxA = Number(configState.monthly_max_amount);
      if (isNaN(rate) || rate < 0) return Alert.alert('Validation Error', 'Enter a valid monthly interest rate');
      if (isNaN(tenure) || tenure <= 0) return Alert.alert('Validation Error', 'Enter valid tenure months');
      if (isNaN(minA) || isNaN(maxA) || minA <= 0 || maxA < minA) {
        return Alert.alert('Validation Error', 'Maximum loan amount must exceed minimum amount');
      }
    }

    setSaving(true);
    try {
      const payload = {
        weekly_loan_enabled: Boolean(configState.weekly_loan_enabled),
        weekly_interest_rate: Number(configState.weekly_interest_rate),
        weekly_tenure_weeks: Number(configState.weekly_tenure_weeks),
        weekly_min_amount: Number(configState.weekly_min_amount),
        weekly_max_amount: Number(configState.weekly_max_amount),
        weekly_collection_days: configState.weekly_collection_days.join(','),
        weekly_collection_grace_days: Math.max(0, Number(configState.weekly_collection_grace_days) || 0),

        daily_loan_enabled: Boolean(configState.daily_loan_enabled),
        daily_interest_rate: Number(configState.daily_interest_rate),
        daily_tenure_days: Number(configState.daily_tenure_days),
        daily_min_amount: Number(configState.daily_min_amount),
        daily_max_amount: Number(configState.daily_max_amount),
        daily_operating_days: configState.daily_operating_days.join(','),

        monthly_loan_enabled: Boolean(configState.monthly_loan_enabled),
        monthly_interest_rate: Number(configState.monthly_interest_rate),
        monthly_tenure_months: Number(configState.monthly_tenure_months),
        monthly_min_amount: Number(configState.monthly_min_amount),
        monthly_max_amount: Number(configState.monthly_max_amount),
        monthly_collection_start_day: Math.min(28, Math.max(1, Number(configState.monthly_collection_start_day) || 1)),
        monthly_collection_end_day: Math.min(31, Math.max(1, Number(configState.monthly_collection_end_day) || 5)),
        monthly_collection_grace_days: Math.max(0, Number(configState.monthly_collection_grace_days) || 0),
      };

      await apiService.updateLendingConfig(orgId, payload);
      Alert.alert('Success', 'Interest rates and scheme settings updated successfully!');
    } catch (err) {
      console.error('Failed to update lending config:', err);
      Alert.alert('Error', err?.message || 'Failed to update settings. Please check server connection.');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <Header
        title="Interest Rates"
        onBack={handleDismiss}
        showBackButton={true}
        showDivider={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lottie Animation (160x160 clean centered) */}
          <View style={styles.animationContainer}>
            <LottieView
              source={moneyLendingAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* Scheme Category Selector Chips */}
          <View style={styles.divisionContainer}>
            <View style={styles.sectionHeadingRow}>
              <MaterialCommunityIcons name="layers-outline" size={18} color="#6B46C1" />
              <Text style={styles.sectionHeading}>Select Lending Scheme</Text>
            </View>
            <View style={styles.divisionRow}>
              {schemesList.map((scheme) => {
                const isSelected = activeSchemeId === scheme.id;
                return (
                  <TouchableOpacity
                    key={scheme.id}
                    style={[
                      styles.divisionChip,
                      isSelected && styles.divisionChipSelected,
                    ]}
                    onPress={() => setActiveSchemeId(scheme.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={scheme.icon}
                      size={24}
                      color={isSelected ? '#6B46C1' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.divisionChipTitle,
                        isSelected && styles.divisionChipTitleSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {scheme.id === 'weekly' ? 'Weekly' : scheme.id === 'daily' ? 'Daily' : 'Monthly'}
                    </Text>
                    <Text style={styles.divisionChipRate}>{scheme.rate}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {loading ? (
            <View style={{ marginTop: 10 }}>
              <SkeletonBox width="100%" height={56} style={{ marginBottom: 16 }} />
              <SkeletonBox width="100%" height={52} style={{ marginBottom: 16 }} />
              <SkeletonBox width="100%" height={52} style={{ marginBottom: 16 }} />
              <SkeletonBox width="100%" height={120} style={{ marginBottom: 16 }} />
            </View>
          ) : (
            <>
              {/* Form Section: Active Scheme Settings */}
              <View style={styles.formSection}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="tune" size={18} color="#6B46C1" />
                  <Text style={styles.sectionTitle}>
                    {activeSchemeId === 'weekly'
                      ? 'Weekly Scheme Parameters'
                      : activeSchemeId === 'daily'
                      ? 'Daily Merchant Parameters'
                      : 'Monthly Business Parameters'}
                  </Text>
                </View>

                {/* Status Toggle Card */}
                <View style={styles.toggleCard}>
                  <View style={styles.toggleLeft}>
                    <MaterialCommunityIcons
                      name={
                        (activeSchemeId === 'weekly'
                          ? configState.weekly_loan_enabled
                          : activeSchemeId === 'daily'
                          ? configState.daily_loan_enabled
                          : configState.monthly_loan_enabled)
                          ? 'check-circle'
                          : 'cancel'
                      }
                      size={22}
                      color={
                        (activeSchemeId === 'weekly'
                          ? configState.weekly_loan_enabled
                          : activeSchemeId === 'daily'
                          ? configState.daily_loan_enabled
                          : configState.monthly_loan_enabled)
                          ? '#059669'
                          : '#94A3B8'
                      }
                    />
                    <View>
                      <Text style={styles.toggleTitle}>Scheme Status</Text>
                      <Text style={styles.toggleSubtitle}>
                        {(activeSchemeId === 'weekly'
                          ? configState.weekly_loan_enabled
                          : activeSchemeId === 'daily'
                          ? configState.daily_loan_enabled
                          : configState.monthly_loan_enabled)
                          ? 'Active & available for loan origination'
                          : 'Disabled for new borrowers'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={
                      activeSchemeId === 'weekly'
                        ? configState.weekly_loan_enabled
                        : activeSchemeId === 'daily'
                        ? configState.daily_loan_enabled
                        : configState.monthly_loan_enabled
                    }
                    onValueChange={(val) => {
                      if (activeSchemeId === 'weekly') {
                        setConfigState((prev) => ({ ...prev, weekly_loan_enabled: val }));
                      } else if (activeSchemeId === 'daily') {
                        setConfigState((prev) => ({ ...prev, daily_loan_enabled: val }));
                      } else {
                        setConfigState((prev) => ({ ...prev, monthly_loan_enabled: val }));
                      }
                    }}
                    trackColor={{ false: '#E2E8F0', true: '#DDD6FE' }}
                    thumbColor={
                      (activeSchemeId === 'weekly'
                        ? configState.weekly_loan_enabled
                        : activeSchemeId === 'daily'
                        ? configState.daily_loan_enabled
                        : configState.monthly_loan_enabled)
                        ? '#6B46C1'
                        : '#94A3B8'
                    }
                  />
                </View>

                {/* Row: Interest Rate & Tenure */}
                <View style={styles.rowTwoInputs}>
                  {/* Interest Rate */}
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="percent" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>Interest Rate</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={
                        activeSchemeId === 'weekly'
                          ? configState.weekly_interest_rate
                          : activeSchemeId === 'daily'
                          ? configState.daily_interest_rate
                          : configState.monthly_interest_rate
                      }
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9.]/g, '');
                        if (activeSchemeId === 'weekly') {
                          setConfigState((prev) => ({ ...prev, weekly_interest_rate: cleaned }));
                        } else if (activeSchemeId === 'daily') {
                          setConfigState((prev) => ({ ...prev, daily_interest_rate: cleaned }));
                        } else {
                          setConfigState((prev) => ({ ...prev, monthly_interest_rate: cleaned }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 25"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Tenure */}
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="calendar-range" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>
                          {activeSchemeId === 'weekly'
                            ? 'Weeks'
                            : activeSchemeId === 'daily'
                            ? 'Days'
                            : 'Months'}
                        </Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={
                        activeSchemeId === 'weekly'
                          ? configState.weekly_tenure_weeks
                          : activeSchemeId === 'daily'
                          ? configState.daily_tenure_days
                          : configState.monthly_tenure_months
                      }
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '');
                        if (activeSchemeId === 'weekly') {
                          setConfigState((prev) => ({ ...prev, weekly_tenure_weeks: cleaned }));
                        } else if (activeSchemeId === 'daily') {
                          setConfigState((prev) => ({ ...prev, daily_tenure_days: cleaned }));
                        } else {
                          setConfigState((prev) => ({ ...prev, monthly_tenure_months: cleaned }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 10"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Row: Min Loan & Max Loan Amount */}
                <View style={styles.rowTwoInputs}>
                  {/* Min Amount */}
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="currency-inr" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>Min Loan (₹)</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={
                        activeSchemeId === 'weekly'
                          ? configState.weekly_min_amount
                          : activeSchemeId === 'daily'
                          ? configState.daily_min_amount
                          : configState.monthly_min_amount
                      }
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '');
                        if (activeSchemeId === 'weekly') {
                          setConfigState((prev) => ({ ...prev, weekly_min_amount: cleaned }));
                        } else if (activeSchemeId === 'daily') {
                          setConfigState((prev) => ({ ...prev, daily_min_amount: cleaned }));
                        } else {
                          setConfigState((prev) => ({ ...prev, monthly_min_amount: cleaned }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 2000"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Max Amount */}
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="cash-multiple" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>Max Loan (₹)</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={
                        activeSchemeId === 'weekly'
                          ? configState.weekly_max_amount
                          : activeSchemeId === 'daily'
                          ? configState.daily_max_amount
                          : configState.monthly_max_amount
                      }
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '');
                        if (activeSchemeId === 'weekly') {
                          setConfigState((prev) => ({ ...prev, weekly_max_amount: cleaned }));
                        } else if (activeSchemeId === 'daily') {
                          setConfigState((prev) => ({ ...prev, daily_max_amount: cleaned }));
                        } else {
                          setConfigState((prev) => ({ ...prev, monthly_max_amount: cleaned }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 5000"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Operating / Collection Days (Weekly & Daily) */}
                {(activeSchemeId === 'weekly' || activeSchemeId === 'daily') && (
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>
                          {activeSchemeId === 'weekly'
                            ? 'Weekly Collection Days'
                            : 'Daily Operating Days'}
                        </Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                      <View style={styles.badgeText}>
                        <Text style={styles.badgeContent}>
                          {(activeSchemeId === 'weekly'
                            ? configState.weekly_collection_days
                            : configState.daily_operating_days
                          ).length}{' '}
                          Days Active
                        </Text>
                      </View>
                    </View>
                    <View style={styles.daysRow}>
                      {ALL_WEEKDAYS.map((d) => {
                        const activeList =
                          activeSchemeId === 'weekly'
                            ? configState.weekly_collection_days
                            : configState.daily_operating_days;
                        const isSelected = activeList.includes(d.key);
                        return (
                          <TouchableOpacity
                            key={d.key}
                            style={[styles.dayPill, isSelected && styles.dayPillActive]}
                            onPress={() => handleToggleDay(d.key, activeSchemeId)}
                            activeOpacity={0.7}
                          >
                            {isSelected && (
                              <MaterialCommunityIcons
                                name="check"
                                size={14}
                                color="#FFFFFF"
                                style={{ marginRight: 2 }}
                              />
                            )}
                            <Text
                              style={[
                                styles.dayPillText,
                                isSelected && styles.dayPillTextActive,
                              ]}
                            >
                              {d.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Monthly Collection Window */}
                {activeSchemeId === 'monthly' && (
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="calendar-month" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>Monthly Collection Window (Dates)</Text>
                        <Text style={styles.requiredStar}>*</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TextInput
                        style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                        value={configState.monthly_collection_start_day}
                        onChangeText={(val) =>
                          setConfigState((prev) => ({
                            ...prev,
                            monthly_collection_start_day: val.replace(/[^0-9]/g, ''),
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="Day 1"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={{ fontWeight: '700', color: '#6B7280' }}>to</Text>
                      <TextInput
                        style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                        value={configState.monthly_collection_end_day}
                        onChangeText={(val) =>
                          setConfigState((prev) => ({
                            ...prev,
                            monthly_collection_end_day: val.replace(/[^0-9]/g, ''),
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="Day 5"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                )}

                {/* Grace Buffer Days (Weekly & Monthly) */}
                {activeSchemeId !== 'daily' && (
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <View style={styles.labelLeft}>
                        <MaterialCommunityIcons name="timer-sand" size={16} color="#000000" />
                        <Text style={styles.inputLabel}>Collection Grace Buffer (Days)</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={
                        activeSchemeId === 'weekly'
                          ? configState.weekly_collection_grace_days
                          : configState.monthly_collection_grace_days
                      }
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '');
                        if (activeSchemeId === 'weekly') {
                          setConfigState((prev) => ({
                            ...prev,
                            weekly_collection_grace_days: cleaned,
                          }));
                        } else {
                          setConfigState((prev) => ({
                            ...prev,
                            monthly_collection_grace_days: cleaned,
                          }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 2"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}

                {/* Dynamic Real-Time EMI / Installment Preview Box */}
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <MaterialCommunityIcons name="calculator-variant" size={16} color="#6B46C1" />
                    <Text style={styles.previewTitle}>Live Repayment Calculation Model</Text>
                  </View>
                  <View style={styles.previewGrid}>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Sample Loan</Text>
                      <Text style={styles.previewValue}>
                        ₹{previewCalculation.samplePrincipal.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Interest</Text>
                      <Text style={styles.previewValue}>{previewCalculation.interestText}</Text>
                    </View>
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Total Due</Text>
                      <Text style={styles.previewValue}>{previewCalculation.totalText}</Text>
                    </View>
                    <View style={[styles.previewItem, styles.previewHighlight]}>
                      <Text style={[styles.previewLabel, { color: '#6B46C1' }]}>Installment</Text>
                      <Text style={styles.previewValueHighlight}>{previewCalculation.dueText}</Text>
                    </View>
                  </View>
                  <Text style={styles.formulaFootnote}>
                    {previewCalculation.formula}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <View style={styles.actionWrap}>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSaveConfig}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="check-circle-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.saveButtonText}>
                        Save & Update {activeSchemeId === 'weekly' ? 'Weekly' : activeSchemeId === 'daily' ? 'Daily' : 'Monthly'} Scheme
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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

export default InterestRatesModal;
