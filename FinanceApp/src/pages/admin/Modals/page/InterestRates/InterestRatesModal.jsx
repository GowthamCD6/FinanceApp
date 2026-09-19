import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import { apiService } from '../../../../../services/apiService';
import Colors from '../../../../../theme/colors';

const ALL_WEEKDAYS = [
  { key: 'MON', label: 'Mon', full: 'Monday' },
  { key: 'TUE', label: 'Tue', full: 'Tuesday' },
  { key: 'WED', label: 'Wed', full: 'Wednesday' },
  { key: 'THU', label: 'Thu', full: 'Thursday' },
  { key: 'FRI', label: 'Fri', full: 'Friday' },
  { key: 'SAT', label: 'Sat', full: 'Saturday' },
  { key: 'SUN', label: 'Sun', full: 'Sunday' },
];

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
          backgroundColor: '#CBD5E1',
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

const SchemeCardSkeleton = () => (
  <View style={[customStyles.schemeCard, { gap: 14 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width={160} height={18} borderRadius={4} />
        <SkeletonBox width={110} height={12} borderRadius={4} />
      </View>
      <SkeletonBox width={44} height={24} borderRadius={12} />
    </View>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <SkeletonBox width="48%" height={56} borderRadius={10} />
      <SkeletonBox width="48%" height={56} borderRadius={10} />
    </View>
    <SkeletonBox width="100%" height={40} borderRadius={8} />
    <SkeletonBox width="100%" height={50} borderRadius={10} />
    <SkeletonBox width="100%" height={44} borderRadius={10} />
  </View>
);

export const InterestRatesModal = ({ visible, onClose, onBack }) => {
  const { currentOrganization } = useApp();
  const orgId = currentOrganization?.id || 1;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Main Lending Configuration State connected to Backend
  const [config, setConfig] = useState({
    daily_loan_enabled: true,
    daily_interest_rate: 10.0,
    daily_tenure_days: 100,
    daily_min_amount: 2000,
    daily_max_amount: 100000,
    daily_operating_days: 'MON,TUE,WED,THU,FRI,SAT',

    weekly_loan_enabled: true,
    weekly_interest_rate: 10.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 5000,
    weekly_max_amount: 150000,
    weekly_collection_days: 'MON,WED,FRI',
    weekly_collection_grace_days: 2,

    monthly_loan_enabled: true,
    monthly_interest_rate: 18.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 10000,
    monthly_max_amount: 500000,
    monthly_collection_start_day: 1,
    monthly_collection_end_day: 5,
    monthly_collection_grace_days: 3,
  });

  // Edit Modal Form State
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editTenure, setEditTenure] = useState('');
  const [editMinAmount, setEditMinAmount] = useState('');
  const [editMaxAmount, setEditMaxAmount] = useState('');
  const [editDays, setEditDays] = useState([]);
  const [editGraceDays, setEditGraceDays] = useState('');
  const [editEnabled, setEditEnabled] = useState(true);
  const [editStartDay, setEditStartDay] = useState('');
  const [editEndDay, setEditEndDay] = useState('');

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getLendingConfig(orgId);
      if (data) {
        setConfig({
          daily_loan_enabled: Boolean(data.daily_loan_enabled ?? true),
          daily_interest_rate: Number(data.daily_interest_rate ?? 10.0),
          daily_tenure_days: Number(data.daily_tenure_days ?? 100),
          daily_min_amount: Number(data.daily_min_amount ?? 2000),
          daily_max_amount: Number(data.daily_max_amount ?? 100000),
          daily_operating_days: data.daily_operating_days || 'MON,TUE,WED,THU,FRI,SAT',

          weekly_loan_enabled: Boolean(data.weekly_loan_enabled ?? true),
          weekly_interest_rate: Number(data.weekly_interest_rate ?? 10.0),
          weekly_tenure_weeks: Number(data.weekly_tenure_weeks ?? 10),
          weekly_min_amount: Number(data.weekly_min_amount ?? 5000),
          weekly_max_amount: Number(data.weekly_max_amount ?? 150000),
          weekly_collection_days: data.weekly_collection_days || 'MON,WED,FRI',
          weekly_collection_grace_days: Number(data.weekly_collection_grace_days ?? 2),

          monthly_loan_enabled: Boolean(data.monthly_loan_enabled ?? true),
          monthly_interest_rate: Number(data.monthly_interest_rate ?? 18.0),
          monthly_tenure_months: Number(data.monthly_tenure_months ?? 12),
          monthly_min_amount: Number(data.monthly_min_amount ?? 10000),
          monthly_max_amount: Number(data.monthly_max_amount ?? 500000),
          monthly_collection_start_day: Number(data.monthly_collection_start_day ?? 1),
          monthly_collection_end_day: Number(data.monthly_collection_end_day ?? 5),
          monthly_collection_grace_days: Number(data.monthly_collection_grace_days ?? 3),
        });
      }
    } catch (error) {
      console.warn('Error loading lending config from server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [orgId]);

  const handleDismiss = () => {
    setShowEditModal(false);
    if (onClose) onClose();
    if (onBack) onBack();
  };

  // Structured schemes data for cards
  const schemes = useMemo(() => {
    return [
      {
        id: 'daily',
        title: '1. Daily Merchant Scheme',
        category: 'Daily Cycle',
        icon: 'store',
        color: '#059669',
        bgColor: '#ECFDF5',
        trackColor: '#A7F3D0',
        enabled: config.daily_loan_enabled,
        interestRate: config.daily_interest_rate,
        rateLabel: '% Flat',
        tenure: config.daily_tenure_days,
        tenureUnit: 'Days',
        minAmount: config.daily_min_amount,
        maxAmount: config.daily_max_amount,
        operatingDays: config.daily_operating_days,
        parsedDays: config.daily_operating_days
          ? config.daily_operating_days.split(',').map((d) => d.trim()).filter(Boolean)
          : [],
        graceDays: 0,
        formula: `Daily Due = [Principal + (Principal × ${config.daily_interest_rate}%)] ÷ ${config.daily_tenure_days} Days`,
      },
      {
        id: 'weekly',
        title: '2. Weekly Micro-Loan Scheme',
        category: 'Weekly Cycle',
        icon: 'calendar-week',
        color: '#2563EB',
        bgColor: '#EFF6FF',
        trackColor: '#BFDBFE',
        enabled: config.weekly_loan_enabled,
        interestRate: config.weekly_interest_rate,
        rateLabel: '% Flat',
        tenure: config.weekly_tenure_weeks,
        tenureUnit: 'Weeks',
        minAmount: config.weekly_min_amount,
        maxAmount: config.weekly_max_amount,
        operatingDays: config.weekly_collection_days,
        parsedDays: config.weekly_collection_days
          ? config.weekly_collection_days.split(',').map((d) => d.trim()).filter(Boolean)
          : [],
        graceDays: config.weekly_collection_grace_days,
        formula: `Weekly Due = [Principal + (Principal × ${config.weekly_interest_rate}%)] ÷ ${config.weekly_tenure_weeks} Weeks`,
      },
      {
        id: 'monthly',
        title: '3. Monthly Business Scheme',
        category: 'Monthly EMI',
        icon: 'chart-line',
        color: '#7C3AED',
        bgColor: '#F3E8FF',
        trackColor: '#DDD6FE',
        enabled: config.monthly_loan_enabled,
        interestRate: config.monthly_interest_rate,
        rateLabel: '% p.a.',
        tenure: config.monthly_tenure_months,
        tenureUnit: 'Months',
        minAmount: config.monthly_min_amount,
        maxAmount: config.monthly_max_amount,
        operatingDays: `Day ${config.monthly_collection_start_day} to Day ${config.monthly_collection_end_day}`,
        startDay: config.monthly_collection_start_day,
        endDay: config.monthly_collection_end_day,
        graceDays: config.monthly_collection_grace_days,
        formula: `Monthly EMI = [Principal + (Principal × ${config.monthly_interest_rate}% × (${config.monthly_tenure_months}/12))] ÷ ${config.monthly_tenure_months} Months`,
      },
    ];
  }, [config]);

  // Fast direct Active/Deactive Toggle on Card
  const handleToggleActive = async (schemeId, currentStatus) => {
    const nextStatus = !currentStatus;
    const updatedConfig = { ...config };

    if (schemeId === 'daily') updatedConfig.daily_loan_enabled = nextStatus;
    else if (schemeId === 'weekly') updatedConfig.weekly_loan_enabled = nextStatus;
    else if (schemeId === 'monthly') updatedConfig.monthly_loan_enabled = nextStatus;

    setConfig(updatedConfig);

    try {
      await apiService.updateLendingConfig(orgId, updatedConfig);
    } catch (error) {
      console.error('Error toggling scheme status:', error);
      setConfig(config); // rollback
      Alert.alert('Error', 'Could not update scheme status. Check server connection.');
    }
  };

  // Open Edit Modal for specific scheme
  const handleOpenEdit = (scheme) => {
    setSelectedScheme(scheme);
    setEditInterestRate(String(scheme.interestRate));
    setEditTenure(String(scheme.tenure));
    setEditMinAmount(String(scheme.minAmount));
    setEditMaxAmount(String(scheme.maxAmount));
    setEditGraceDays(String(scheme.graceDays || 0));
    setEditEnabled(Boolean(scheme.enabled));

    if (scheme.id === 'daily' || scheme.id === 'weekly') {
      const daysArr = scheme.operatingDays
        ? scheme.operatingDays.split(',').map((d) => d.trim()).filter(Boolean)
        : [];
      setEditDays(daysArr);
    } else if (scheme.id === 'monthly') {
      setEditStartDay(String(scheme.startDay || 1));
      setEditEndDay(String(scheme.endDay || 5));
    }

    setShowEditModal(true);
  };

  // Toggle operating day selection in edit modal
  const handleToggleDay = (dayKey) => {
    if (editDays.includes(dayKey)) {
      if (editDays.length <= 1) {
        Alert.alert('Validation Error', 'At least 1 operating day must remain selected');
        return;
      }
      setEditDays(editDays.filter((d) => d !== dayKey));
    } else {
      const updated = [...editDays, dayKey];
      const sorted = ALL_WEEKDAYS.filter((w) => updated.includes(w.key)).map((w) => w.key);
      setEditDays(sorted);
    }
  };

  // Save scheme edit to backend
  const confirmEdit = async () => {
    if (!selectedScheme) return;

    const rate = Number(editInterestRate);
    const tenure = Number(editTenure);
    const minA = Number(editMinAmount);
    const maxA = Number(editMaxAmount);

    if (isNaN(rate) || rate < 0) {
      Alert.alert('Validation Error', 'Please enter a valid interest rate percentage');
      return;
    }
    if (isNaN(tenure) || tenure <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid loan tenure');
      return;
    }
    if (minA <= 0 || maxA < minA) {
      Alert.alert('Validation Error', 'Maximum loan amount must be greater than minimum amount');
      return;
    }

    setIsSaving(true);
    let updatedConfig = { ...config };

    if (selectedScheme.id === 'daily') {
      updatedConfig = {
        ...updatedConfig,
        daily_loan_enabled: editEnabled,
        daily_interest_rate: rate,
        daily_tenure_days: tenure,
        daily_min_amount: minA,
        daily_max_amount: maxA,
        daily_operating_days: editDays.join(','),
      };
    } else if (selectedScheme.id === 'weekly') {
      updatedConfig = {
        ...updatedConfig,
        weekly_loan_enabled: editEnabled,
        weekly_interest_rate: rate,
        weekly_tenure_weeks: tenure,
        weekly_min_amount: minA,
        weekly_max_amount: maxA,
        weekly_collection_days: editDays.join(','),
        weekly_collection_grace_days: Math.max(0, Number(editGraceDays) || 0),
      };
    } else if (selectedScheme.id === 'monthly') {
      updatedConfig = {
        ...updatedConfig,
        monthly_loan_enabled: editEnabled,
        monthly_interest_rate: rate,
        monthly_tenure_months: tenure,
        monthly_min_amount: minA,
        monthly_max_amount: maxA,
        monthly_collection_start_day: Math.min(28, Math.max(1, Number(editStartDay) || 1)),
        monthly_collection_end_day: Math.min(31, Math.max(1, Number(editEndDay) || 5)),
        monthly_collection_grace_days: Math.max(0, Number(editGraceDays) || 0),
      };
    }

    try {
      await apiService.updateLendingConfig(orgId, updatedConfig);
      setConfig(updatedConfig);
      Alert.alert('Success', `${selectedScheme.title} updated successfully`);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating scheme:', error);
      Alert.alert('Error', error?.message || 'Failed to update lending scheme. Please check network connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <Header
        title="Interest Rates & Schemes"
        onBack={handleDismiss}
        showBackButton={true}
        showDivider={true}
      />

      {/* Main Content Area */}
      <ScrollView
        style={customStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <>
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
          </>
        ) : (
          schemes.map((scheme) => {
            return (
              <View
                key={scheme.id}
                style={[
                  customStyles.schemeCard,
                  !scheme.enabled && customStyles.schemeCardDisabled,
                ]}
              >
                {/* Scheme Header Row with direct Active/Deactive Switch */}
                <View style={customStyles.cardHeaderRow}>
                  <View style={[customStyles.schemeIconWrap, { backgroundColor: scheme.bgColor }]}>
                    <MaterialCommunityIcons
                      name={scheme.icon}
                      size={24}
                      color={scheme.color}
                    />
                  </View>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={customStyles.schemeTitleRow}>
                      <Text style={customStyles.schemeTitleText}>{scheme.title}</Text>
                      <View style={[customStyles.cycleBadge, { backgroundColor: scheme.bgColor }]}>
                        <Text style={[customStyles.cycleBadgeText, { color: scheme.color }]}>
                          {scheme.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={customStyles.schemeSubText}>
                      {scheme.id === 'daily'
                        ? 'Daily merchant loan & collection recovery cycle'
                        : scheme.id === 'weekly'
                        ? 'Weekly micro-lending & group loan cycle'
                        : 'Monthly business EMI & commercial loans'}
                    </Text>
                  </View>

                  {/* Direct Toggle Switch on Card */}
                  <View style={customStyles.switchWrap}>
                    <Switch
                      value={scheme.enabled}
                      onValueChange={() => handleToggleActive(scheme.id, scheme.enabled)}
                      trackColor={{ false: '#E5E7EB', true: scheme.trackColor }}
                      thumbColor={scheme.enabled ? scheme.color : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        customStyles.switchStatusText,
                        { color: scheme.enabled ? scheme.color : '#9CA3AF' },
                      ]}
                    >
                      {scheme.enabled ? 'ACTIVE' : 'DISABLED'}
                    </Text>
                  </View>
                </View>

                {/* Key Metrics Grid (Rate, Tenure, Limits) */}
                <View style={customStyles.statsGrid}>
                  {/* Stat 1: Rate & Tenure */}
                  <View style={customStyles.statCell}>
                    <View style={customStyles.statCellHeader}>
                      <MaterialCommunityIcons name="percent" size={15} color="#4B5563" />
                      <Text style={customStyles.statCellLabel}>Rate & Tenure</Text>
                    </View>
                    <Text style={customStyles.statCellValue}>
                      {scheme.interestRate}{scheme.rateLabel} • {scheme.tenure} {scheme.tenureUnit}
                    </Text>
                  </View>

                  {/* Stat 2: Loan Limit Range */}
                  <View style={customStyles.statCell}>
                    <View style={customStyles.statCellHeader}>
                      <MaterialCommunityIcons name="cash-multiple" size={15} color="#4B5563" />
                      <Text style={customStyles.statCellLabel}>Loan Limit Range</Text>
                    </View>
                    <Text style={customStyles.statCellValue}>
                      ₹{scheme.minAmount.toLocaleString()} - ₹{scheme.maxAmount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Weekdays Multi-Pills Section on Card (for Daily & Weekly) */}
                {(scheme.id === 'daily' || scheme.id === 'weekly') && (
                  <View style={customStyles.daysSection}>
                    <View style={customStyles.daysHeaderRow}>
                      <MaterialCommunityIcons name="calendar-clock" size={16} color={scheme.color} />
                      <Text style={customStyles.daysHeading}>
                        {scheme.id === 'daily' ? 'Operating Collection Days' : 'Weekly Collection Days'}
                      </Text>
                      <Text style={customStyles.daysCountText}>
                        ({scheme.parsedDays.length} days active)
                      </Text>
                    </View>

                    <View style={customStyles.cardDaysRow}>
                      {ALL_WEEKDAYS.map((d) => {
                        const isSelected = scheme.parsedDays.includes(d.key);
                        return (
                          <View
                            key={d.key}
                            style={[
                              customStyles.cardDayPill,
                              isSelected && {
                                backgroundColor: scheme.bgColor,
                                borderColor: scheme.color,
                                borderWidth: 1.5,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                customStyles.cardDayPillText,
                                isSelected && { color: scheme.color, fontWeight: '700' },
                              ]}
                            >
                              {d.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Monthly Window & Grace Buffer info */}
                {scheme.id === 'monthly' && (
                  <View style={customStyles.daysSection}>
                    <View style={customStyles.daysHeaderRow}>
                      <MaterialCommunityIcons name="calendar-month" size={16} color="#7C3AED" />
                      <Text style={customStyles.daysHeading}>Monthly Collection Window & Grace</Text>
                    </View>
                    <Text style={customStyles.monthlyInfoText}>
                      Billing Window: <Text style={{ fontWeight: '700', color: '#1F2937' }}>Day {scheme.startDay} to Day {scheme.endDay}</Text>
                      {' • '}
                      Grace: <Text style={{ fontWeight: '700', color: '#1F2937' }}>{scheme.graceDays} Days Buffer</Text>
                    </Text>
                  </View>
                )}

                {/* Weekly Grace Buffer Tag if applicable */}
                {scheme.id === 'weekly' && scheme.graceDays > 0 && (
                  <View style={customStyles.graceRow}>
                    <MaterialCommunityIcons name="timer-sand" size={15} color="#6B7280" />
                    <Text style={customStyles.graceText}>
                      Collection Grace Buffer: <Text style={{ fontWeight: '700', color: '#1F2937' }}>{scheme.graceDays} Days</Text>
                    </Text>
                  </View>
                )}

                {/* Calculation Formula Box */}
                <View style={customStyles.formulaContainer}>
                  <Text style={customStyles.formulaText}>
                    <Text style={{ fontWeight: '700', color: scheme.color }}>Formula: </Text>
                    {scheme.formula}
                  </Text>
                </View>

                {/* Action Footer: Edit Scheme Button */}
                <TouchableOpacity
                  style={customStyles.editCardButton}
                  onPress={() => handleOpenEdit(scheme)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color="#0066FF" />
                  <Text style={customStyles.editCardButtonText}>Edit Configuration</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ===== EDIT SCHEME MODAL (Matching Manage Users Theme) ===== */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={customStyles.centeredModalOverlay}
        >
          <View style={customStyles.modalContainer}>
            {/* Modal Header with Back Arrow */}
            <View style={customStyles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
              <Text style={customStyles.modalTitle}>
                Edit {selectedScheme?.title.replace(/^[0-9.]+\s*/, '') || 'Scheme'}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={customStyles.modalHeaderSeparator} />

            <ScrollView
              style={customStyles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Scheme Status Toggle */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Scheme Status</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={customStyles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      customStyles.typeOption,
                      editEnabled && customStyles.typeOptionActive,
                    ]}
                    onPress={() => setEditEnabled(true)}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={editEnabled ? '#3B82F6' : '#6B7280'}
                    />
                    <Text
                      style={[
                        customStyles.typeOptionText,
                        editEnabled && { color: '#3B82F6' },
                      ]}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      customStyles.typeOption,
                      !editEnabled && customStyles.typeOptionActive,
                    ]}
                    onPress={() => setEditEnabled(false)}
                  >
                    <MaterialCommunityIcons
                      name="cancel"
                      size={18}
                      color={!editEnabled ? '#EF4444' : '#6B7280'}
                    />
                    <Text
                      style={[
                        customStyles.typeOptionText,
                        !editEnabled && { color: '#EF4444' },
                      ]}
                    >
                      Disabled
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Interest Rate */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="percent"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>
                    Interest Rate ({selectedScheme?.rateLabel || '%'})
                  </Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editInterestRate}
                  onChangeText={setEditInterestRate}
                  keyboardType="numeric"
                  placeholder="e.g. 10.0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Default Tenure */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>
                    Default Tenure ({selectedScheme?.tenureUnit || 'Units'})
                  </Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editTenure}
                  onChangeText={(val) => setEditTenure(val.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="e.g. 100"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Min Loan Amount */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Minimum Loan Amount (₹)</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editMinAmount}
                  onChangeText={(val) => setEditMinAmount(val.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="e.g. 2000"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Max Loan Amount */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Maximum Loan Amount (₹)</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editMaxAmount}
                  onChangeText={(val) => setEditMaxAmount(val.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="e.g. 100000"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Operating Days for Daily / Weekly (with proper theme & spacing) */}
              {(selectedScheme?.id === 'daily' || selectedScheme?.id === 'weekly') && (
                <View style={[customStyles.inputGroup, customStyles.daySelectionGroup]}>
                  <View style={customStyles.labelContainer}>
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={20}
                      color="#000000"
                    />
                    <Text style={styles.inputLabel}>
                      {selectedScheme?.id === 'daily' ? 'Operating Days' : 'Weekly Collection Days'}
                    </Text>
                    <Text style={styles.requiredStar}>*</Text>
                  </View>
                  <View style={customStyles.daysRow}>
                    {ALL_WEEKDAYS.map((d) => {
                      const isSelected = editDays.includes(d.key);
                      return (
                        <TouchableOpacity
                          key={d.key}
                          style={[
                            customStyles.dayPill,
                            isSelected && customStyles.dayPillActive,
                          ]}
                          onPress={() => handleToggleDay(d.key)}
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
                              customStyles.dayPillText,
                              isSelected && customStyles.dayPillTextActive,
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

              {/* Billing Window for Monthly */}
              {selectedScheme?.id === 'monthly' && (
                <View style={customStyles.inputGroup}>
                  <View style={customStyles.labelContainer}>
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={20}
                      color="#000000"
                    />
                    <Text style={styles.inputLabel}>Monthly Billing Window (Dates)</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                      value={editStartDay}
                      onChangeText={(val) => setEditStartDay(val.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      placeholder="Day 1"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={{ fontWeight: '700', color: '#6B7280' }}>to</Text>
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                      value={editEndDay}
                      onChangeText={(val) => setEditEndDay(val.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      placeholder="Day 5"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              )}

              {/* Grace Buffer */}
              {selectedScheme?.id !== 'daily' && (
                <View style={customStyles.inputGroup}>
                  <View style={customStyles.labelContainer}>
                    <MaterialCommunityIcons
                      name="timer-sand"
                      size={20}
                      color="#000000"
                    />
                    <Text style={styles.inputLabel}>Collection Grace Buffer (Days)</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editGraceDays}
                    onChangeText={(val) => setEditGraceDays(val.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholder="e.g. 2"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Actions with Proper Padding & Gilroy Font */}
            <View style={customStyles.modalActions}>
              <TouchableOpacity
                style={[customStyles.saveButtonFull, isSaving && { opacity: 0.7 }]}
                onPress={confirmEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={[customStyles.buttonText, { color: '#FFFFFF' }]}>
                      Update Scheme
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  requiredStar: {
    fontSize: 15,
    color: '#EF4444',
    marginLeft: 2,
  },
  textInput: {
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

const customStyles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  schemeCardDisabled: {
    opacity: 0.65,
    backgroundColor: '#FAFAFA',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  schemeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  schemeTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  cycleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cycleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  schemeSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  switchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  switchStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statCellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  statCellValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  daysSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  daysHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  daysCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardDayPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardDayPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  monthlyInfoText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  graceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  graceText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  formulaContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formulaText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  editCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editCardButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066FF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Modal Styles (From Manage Users)
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalHeaderSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  daySelectionGroup: {
    marginBottom: 24, // Generous spacing below day selection
    paddingBottom: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  typeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  dayPillActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
    marginTop: -5,
  },
  saveButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0066FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
});

export default InterestRatesModal;
