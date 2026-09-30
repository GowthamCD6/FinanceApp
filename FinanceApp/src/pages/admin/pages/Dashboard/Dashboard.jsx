import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import apiService from '../../../../services/apiService';
import styles from './DashboardStyles';

// ===== ANIMATED SKELETON PLACEHOLDER COMPONENT =====
const SkeletonItem = ({ width, height, borderRadius = 8, style }) => {
  const animatedOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animatedOpacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E2E8F0',
          opacity: animatedOpacity,
        },
        style,
      ]}
    />
  );
};

// ===== COMPLETE DASHBOARD SKELETON VIEW =====
const DashboardSkeletonView = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* 1. Vault Card Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 8 }}>
            <SkeletonItem width={160} height={12} borderRadius={4} />
            <SkeletonItem width={140} height={28} borderRadius={6} />
            <SkeletonItem width={110} height={12} borderRadius={4} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <SkeletonItem width={75} height={34} borderRadius={10} />
            <SkeletonItem width={75} height={34} borderRadius={10} />
          </View>
        </View>
        <SkeletonItem width="100%" height={38} borderRadius={10} />
      </View>

      {/* 2. Profit Pool Card Skeleton */}
      <View style={[styles.skeletonCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 8 }}>
            <SkeletonItem width={140} height={12} borderRadius={4} />
            <SkeletonItem width={120} height={24} borderRadius={6} />
          </View>
          <SkeletonItem width={90} height={32} borderRadius={8} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <SkeletonItem width="48%" height={38} borderRadius={10} />
          <SkeletonItem width="48%" height={38} borderRadius={10} />
        </View>
      </View>

      {/* 3. Quick Actions Grid Skeleton */}
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonGridItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <SkeletonItem width={38} height={38} borderRadius={10} />
              <View style={{ gap: 6, flex: 1 }}>
                <SkeletonItem width={70} height={13} borderRadius={4} />
                <SkeletonItem width={50} height={10} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 4. Portfolio Metrics 2x2 Skeleton */}
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonGridItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonItem width={80} height={10} borderRadius={4} />
              <SkeletonItem width={22} height={22} borderRadius={11} />
            </View>
            <SkeletonItem width={100} height={18} borderRadius={4} />
            <SkeletonItem width={70} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* 5. Today's Target Card Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonItem width={150} height={14} borderRadius={4} />
          <SkeletonItem width={70} height={20} borderRadius={6} />
        </View>
        <SkeletonItem width="100%" height={8} borderRadius={4} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonItem width={80} height={12} borderRadius={4} />
          <SkeletonItem width={80} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

export const AdminDashboard = ({
  onNavigate,
  onOpenAddUser,
  onOpenDisburse,
  onOpenCollect,
  onOpenSettlement,
  onOpenLedger,
}) => {
  const {
    fundMetrics,
    loans,
    customers,
    currentOrganization,
    currentUser,
    loggedInUser,
    loading: contextLoading,
    refreshData: contextRefreshData,
  } = useApp();

  const [liveFund, setLiveFund] = useState({
    availableCash: 345000,
    totalCapital: 1200000,
    outstandingPrincipal: 330000,
    lendingIncome: 85000,
    operatingExpenses: 25000,
    netProfit: 60000,
    availableProfitPool: 60000,
    totalProfitWithdrawn: 0,
    totalProfitReinvested: 0,
  });
  const [loadingFund, setLoadingFund] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Capital Injection Modal State
  const [capitalModalVisible, setCapitalModalVisible] = useState(false);
  const [capitalAmount, setCapitalAmount] = useState('100000');
  const [capitalSource, setCapitalSource] = useState('BANK'); // 'BANK' | 'CASH'
  const [capitalDescription, setCapitalDescription] = useState('Initial branch vault float');
  const [submittingCapital, setSubmittingCapital] = useState(false);

  // Profit Control Modal State
  const [profitModalVisible, setProfitModalVisible] = useState(false);
  const [profitActionMode, setProfitActionMode] = useState('REINVEST'); // 'REINVEST' | 'WITHDRAW'
  const [profitAmount, setProfitAmount] = useState('');
  const [profitWithdrawMethod, setProfitWithdrawMethod] = useState('BANK_TRANSFER');
  const [profitDescription, setProfitDescription] = useState('');
  const [submittingProfit, setSubmittingProfit] = useState(false);

  // Expense Modal State
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Office');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Fetch Live Fund Summary from server
  const fetchLiveFund = useCallback(async () => {
    try {
      const data = await apiService.getFundSummary();
      if (data) {
        setLiveFund({
          availableCash: Number(data.availableCash || 0),
          totalCapital: Number(data.totalCapital || 0),
          outstandingPrincipal: Number(data.outstandingPrincipal || 0),
          lendingIncome: Number(data.lendingIncome || 0),
          operatingExpenses: Number(data.operatingExpenses || 0),
          netProfit: Number(data.netProfit || 0),
          availableProfitPool: Number(data.availableProfitPool ?? (data.netProfit || 0)),
          totalProfitWithdrawn: Number(data.totalProfitWithdrawn || 0),
          totalProfitReinvested: Number(data.totalProfitReinvested || 0),
        });
      }
    } catch (e) {
      console.warn('Error fetching live fund summary:', e);
    } finally {
      setLoadingFund(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveFund();
  }, [fetchLiveFund]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (contextRefreshData) await contextRefreshData();
      await fetchLiveFund();
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [contextRefreshData, fetchLiveFund]);

  // Submit Capital Injection
  const handleInjectCapital = async () => {
    const amt = parseFloat(capitalAmount);
    if (isNaN(amt) || amt <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid capital injection amount.');
    }

    setSubmittingCapital(true);
    try {
      const desc = `${capitalDescription.trim() || 'Admin capital injection'} (${capitalSource === 'BANK' ? 'Bank Account' : 'Physical Cash Float'})`;
      await apiService.injectCapital(amt, desc);
      Alert.alert('Capital Injected', `Successfully added ${formatINR(amt)} to the Branch Vault!`);
      setCapitalModalVisible(false);
      await fetchLiveFund();
      if (contextRefreshData) contextRefreshData();
    } catch (e) {
      Alert.alert('Capital Injection Failed', e.message || 'Could not inject capital.');
    } finally {
      setSubmittingCapital(false);
    }
  };

  // Submit Profit Reinvestment / Withdrawal
  const handleProcessProfitAction = async () => {
    const amt = parseFloat(profitAmount);
    if (isNaN(amt) || amt <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
    }

    if (amt > liveFund.availableProfitPool) {
      return Alert.alert(
        'Exceeds Profit Pool',
        `Amount cannot exceed available realized profit pool of ${formatINR(liveFund.availableProfitPool)}.`
      );
    }

    setSubmittingProfit(true);
    try {
      if (profitActionMode === 'REINVEST') {
        const desc = profitDescription.trim() || 'Reinvest profit back into circulating net capital';
        await apiService.transferProfitToNetCapital(amt, desc);
        Alert.alert(
          'Profit Reinvested!',
          `Successfully transferred ${formatINR(amt)} of realized profit into active circulating Net Capital / Vault.`
        );
      } else {
        const desc = profitDescription.trim() || `Admin profit withdrawal via ${profitWithdrawMethod}`;
        await apiService.withdrawProfit(amt, desc, profitWithdrawMethod);
        Alert.alert(
          'Profit Withdrawn!',
          `Successfully recorded profit withdrawal of ${formatINR(amt)} (${profitWithdrawMethod}).`
        );
      }

      setProfitModalVisible(false);
      setProfitAmount('');
      await fetchLiveFund();
      if (contextRefreshData) contextRefreshData();
    } catch (e) {
      Alert.alert('Profit Action Failed', e.message || 'Error processing profit transaction.');
    } finally {
      setSubmittingProfit(false);
    }
  };

  // Submit Operational Expense
  const handleRecordExpense = async () => {
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
    }
    if (!expenseDescription.trim()) {
      return Alert.alert('Description Required', 'Please enter a short note for the expense.');
    }

    setSubmittingExpense(true);
    try {
      await apiService.recordExpense({
        category: expenseCategory,
        amount: amt,
        description: expenseDescription.trim(),
        accountName: 'Cash',
      });
      Alert.alert('Expense Recorded', `Recorded ${formatINR(amt)} under ${expenseCategory}. Vault cash updated.`);
      setExpenseModalVisible(false);
      setExpenseAmount('');
      setExpenseDescription('');
      await fetchLiveFund();
      if (contextRefreshData) contextRefreshData();
    } catch (e) {
      Alert.alert('Expense Failed', e.message || 'Error recording expense.');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Find due loans for today
  const dueTodayLoans = useMemo(() => {
    return (loans || [])
      .filter(
        (l) =>
          l.status === 'ACTIVE' ||
          l.status === 'DISBURSED' ||
          l.status === 'PARTIALLY_PAID' ||
          l.status === 'OVERDUE'
      )
      .slice(0, 6);
  }, [loans]);

  const activeLoansCount = useMemo(() => {
    return (loans || []).filter(
      (l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID'
    ).length;
  }, [loans]);

  const todayTargetProgress = useMemo(() => {
    if (!fundMetrics?.todayTarget || fundMetrics.todayTarget <= 0) return 0;
    return Math.min(1, (fundMetrics.todayCollected || 0) / fundMetrics.todayTarget);
  }, [fundMetrics]);

  const todayDateStr = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Formatted User Name (Proper Title Case)
  const adminName = useMemo(() => {
    const rawName = currentUser?.name || loggedInUser?.name || 'Administrator';
    return rawName
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }, [currentUser, loggedInUser]);

  const adminInitial = useMemo(() => {
    return (adminName.charAt(0) || 'A').toUpperCase();
  }, [adminName]);

  const isInitialLoading = loadingFund && !refreshing;
  const isVaultDeficit = (liveFund.availableCash || 0) < 0;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ===== TOP CLEAN PERSONAL GREETING HERO BAR ===== */}
      <View style={styles.heroGreetingRow}>
        <View style={styles.heroLeft}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{adminInitial}</Text>
          </View>
          <View style={styles.greetingCol}>
            <Text style={styles.greetingSalute}>Welcome back,</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              {adminName}
            </Text>
            <Text style={styles.heroDateSub}>{todayDateStr}</Text>
          </View>
        </View>

        <View style={styles.heroRight}>
          <Image
            source={require('../../../../assets/logo.png')}
            style={{ width: 28, height: 28, resizeMode: 'contain', marginRight: 6 }}
          />
          <View style={styles.orgPill}>
            <MaterialCommunityIcons name="shield-check" size={13} color="#6B46C1" />
            <Text style={styles.orgPillText} numberOfLines={1}>
              {currentOrganization?.name || 'Apex Finance'}
            </Text>
          </View>
        </View>
      </View>

      {/* ===== MAIN CONTENT OR SHIMMER SKELETON ===== */}
      {isInitialLoading ? (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <DashboardSkeletonView />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
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
        >
          {/* 1. Branch Vault Cash & Liquidity Card */}
          <View style={styles.vaultCard}>
            <View style={styles.vaultTop}>
              <View>
                <View style={styles.vaultLabelRow}>
                  <MaterialCommunityIcons name="safe" size={14} color="#64748B" />
                  <Text style={styles.vaultLabel}>BRANCH CASH VAULT</Text>
                </View>
                <Text style={[styles.vaultAmount, isVaultDeficit && { color: '#DC2626' }]}>
                  {formatINR(liveFund.availableCash)}
                </Text>
                <Text style={[styles.vaultSub, isVaultDeficit && { color: '#DC2626' }]}>
                  {isVaultDeficit ? '● Vault cash currently in deficit' : '● Physical cash ready for disbursals'}
                </Text>
              </View>

              <View style={styles.vaultActionBtns}>
                <TouchableOpacity
                  style={styles.btnInject}
                  onPress={() => setCapitalModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="bank-plus" size={14} color="#059669" />
                  <Text style={styles.btnInjectText}>+ Capital</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnExpense}
                  onPress={() => setExpenseModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="receipt" size={14} color="#DC2626" />
                  <Text style={styles.btnExpenseText}>- Expense</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settlementBar}
              onPress={onOpenSettlement}
              activeOpacity={0.85}
            >
              <View style={styles.settlementLeft}>
                <MaterialCommunityIcons name="lock-check" size={16} color="#6B46C1" />
                <Text style={styles.settlementText}>
                  Day-End Cash Reconciliation & Vault Lock
                </Text>
              </View>
              <Text style={styles.settlementArrow}>Review →</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Realized Profit Pool Card */}
          <View style={styles.profitPoolCard}>
            <View style={styles.profitTopRow}>
              <View>
                <Text style={styles.profitLabel}>REALIZED PROFIT POOL</Text>
                <Text style={styles.profitAmount}>
                  {formatINR(liveFund.availableProfitPool)}
                </Text>
                <Text style={styles.profitSub}>Accumulated interest earnings</Text>
              </View>

              <View style={styles.contractedBadge}>
                <Text style={styles.contractedLabel}>Contracted Profit</Text>
                <Text style={styles.contractedVal}>
                  +{formatINR(liveFund.lendingIncome)}
                </Text>
              </View>
            </View>

            <View style={styles.profitBtnRow}>
              <TouchableOpacity
                style={styles.btnReinvest}
                onPress={() => {
                  setProfitActionMode('REINVEST');
                  setProfitAmount(String(liveFund.availableProfitPool || ''));
                  setProfitModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="transfer-right" size={15} color="#FFFFFF" />
                <Text style={styles.btnReinvestText}>Reinvest to Capital</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnWithdraw}
                onPress={() => {
                  setProfitActionMode('WITHDRAW');
                  setProfitAmount(String(liveFund.availableProfitPool || ''));
                  setProfitModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="bank-transfer-out" size={15} color="#6B46C1" />
                <Text style={styles.btnWithdrawText}>Withdraw Profit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. 4-Card Quick Operations Grid */}
          <View style={styles.actionSection}>
            <View style={styles.actionGrid}>
              {/* Action 1: Collect Payment */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => onOpenCollect && onOpenCollect(dueTodayLoans[0] || null)}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>Collect EMI</Text>
                  <Text style={styles.actionSublabel}>Record payment</Text>
                </View>
              </TouchableOpacity>

              {/* Action 2: Onboard Borrower */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={onOpenAddUser}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialCommunityIcons name="account-plus-outline" size={20} color="#6B46C1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>Add Borrower</Text>
                  <Text style={styles.actionSublabel}>New customer</Text>
                </View>
              </TouchableOpacity>

              {/* Action 3: Disburse Loan */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={onOpenDisburse}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="cash-plus" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>Disburse Loan</Text>
                  <Text style={styles.actionSublabel}>Issue capital</Text>
                </View>
              </TouchableOpacity>

              {/* Action 4: Branch Expense */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setExpenseModalVisible(true)}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialCommunityIcons name="receipt" size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>Add Expense</Text>
                  <Text style={styles.actionSublabel}>Branch cost</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Portfolio Summary Metrics (2x2 Clean Cards) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Portfolio Summary</Text>
          </View>

          <View style={styles.metricGrid}>
            {/* Card 1: Outstanding Due Principal */}
            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>OUTSTANDING PRINCIPAL</Text>
                <View style={[styles.metricIconWrap, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color="#DC2626" />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: '#DC2626' }]} numberOfLines={1}>
                {formatINR(fundMetrics.outstandingTotal || liveFund.outstandingPrincipal)}
              </Text>
              <Text style={styles.metricSub}>Active capital in market</Text>
            </View>

            {/* Card 2: Total Net Capital */}
            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>NET CAPITAL</Text>
                <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="bank" size={13} color="#2563EB" />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: '#2563EB' }]} numberOfLines={1}>
                {formatINR(liveFund.totalCapital)}
              </Text>
              <Text style={styles.metricSub}>Branch equity fund</Text>
            </View>

            {/* Card 3: Recovered Inflows */}
            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>RECOVERED INFLOWS</Text>
                <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialCommunityIcons name="trending-up" size={13} color="#059669" />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: '#059669' }]} numberOfLines={1}>
                {formatINR(fundMetrics.totalRecoveredCash)}
              </Text>
              <Text style={styles.metricSub}>Principal + profit collected</Text>
            </View>

            {/* Card 4: Active Loans */}
            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>ACTIVE LOANS</Text>
                <View style={[styles.metricIconWrap, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialCommunityIcons name="account-group" size={13} color="#6B46C1" />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: '#6B46C1' }]} numberOfLines={1}>
                {activeLoansCount} Active
              </Text>
              <Text style={styles.metricSub}>Borrower accounts</Text>
            </View>
          </View>

          {/* 5. Today's Recovery Target Banner */}
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <View>
                <Text style={styles.todayTitle}>Today's Collection Target</Text>
                <Text style={styles.todaySubtitle}>
                  Field collection progress against scheduled dues
                </Text>
              </View>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>
                  {Math.round(todayTargetProgress * 100)}% Done
                </Text>
              </View>
            </View>

            <View style={styles.todayProgressTrack}>
              <View
                style={[
                  styles.todayProgressFill,
                  { width: `${todayTargetProgress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.todayStatsRow}>
              <View>
                <Text style={styles.todayStatLabel}>Collected Today</Text>
                <Text style={[styles.todayStatVal, { color: '#059669' }]}>
                  {formatINR(fundMetrics.todayCollected)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.todayStatLabel}>Target Scheduled</Text>
                <Text style={styles.todayStatVal}>
                  {formatINR(fundMetrics.todayTarget)}
                </Text>
              </View>
            </View>
          </View>

          {/* 6. Due Today Collection Queue */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Due Today Collection Queue</Text>
            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('customers')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dueList}>
            {dueTodayLoans.length === 0 ? (
              <View style={styles.emptyDueCard}>
                <Text style={styles.emptyDueText}>
                  All scheduled collections for today are settled! 🎉
                </Text>
              </View>
            ) : (
              dueTodayLoans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  style={styles.dueCard}
                  onPress={() => onOpenLedger && onOpenLedger(loan)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dueLeft}>
                    <View style={styles.dueAvatar}>
                      <Text style={styles.dueAvatarText}>
                        {(loan.customer_name || 'B').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dueBorrowerName} numberOfLines={1}>
                        {loan.customer_name || 'Borrower Account'}
                      </Text>
                      <Text style={styles.dueLoanSub}>
                        {loan.repayment_frequency || 'WEEKLY'} •{' '}
                        {loan.loan_code || loan.loan_number || `LN-${loan.id}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dueRight}>
                    <Text style={styles.dueAmount}>
                      {formatINR(loan.emi_amount || 1000)}
                    </Text>
                    <TouchableOpacity
                      style={styles.btnQuickCollect}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (onOpenCollect) onOpenCollect(loan);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnQuickCollectText}>Collect</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* ===== 1. INJECT CAPITAL MODAL ===== */}
      <Modal
        visible={capitalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCapitalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vault Capital</Text>
              <TouchableOpacity onPress={() => setCapitalModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Capital Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={capitalAmount}
                onChangeText={setCapitalAmount}
                keyboardType="numeric"
                placeholder="e.g. 100000"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Funding Source</Text>
              <View style={styles.sourceSelectorRow}>
                <TouchableOpacity
                  style={[styles.sourceChip, capitalSource === 'BANK' && styles.sourceChipActive]}
                  onPress={() => setCapitalSource('BANK')}
                >
                  <Text style={[styles.sourceChipText, capitalSource === 'BANK' && styles.sourceChipTextActive]}>
                    🏦 Bank Transfer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sourceChip, capitalSource === 'CASH' && styles.sourceChipActive]}
                  onPress={() => setCapitalSource('CASH')}
                >
                  <Text style={[styles.sourceChipText, capitalSource === 'CASH' && styles.sourceChipTextActive]}>
                    💵 Physical Cash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description / Notes</Text>
              <TextInput
                style={styles.textInput}
                value={capitalDescription}
                onChangeText={setCapitalDescription}
                placeholder="e.g. Branch vault cash injection"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={handleInjectCapital}
              disabled={submittingCapital}
              activeOpacity={0.85}
            >
              {submittingCapital ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="bank-plus" size={18} color="#FFFFFF" />
                  <Text style={styles.modalBtnPrimaryText}>Inject Capital to Vault</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== 2. PROFIT MANAGEMENT MODAL ===== */}
      <Modal
        visible={profitModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {profitActionMode === 'REINVEST' ? 'Reinvest Profit' : 'Withdraw Profit'}
              </Text>
              <TouchableOpacity onPress={() => setProfitModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#FAF5FF', padding: 12, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <Text style={{ fontSize: 11, color: '#6B46C1', fontWeight: '700' }}>AVAILABLE REALIZED PROFIT</Text>
              <Text style={{ fontSize: 20, color: '#581C87', fontWeight: '800', marginTop: 2 }}>
                {formatINR(liveFund.availableProfitPool)}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {profitActionMode === 'REINVEST' ? 'Reinvestment Amount (₹)' : 'Withdrawal Amount (₹)'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={profitAmount}
                onChangeText={setProfitAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {profitActionMode === 'WITHDRAW' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payout Method</Text>
                <View style={styles.sourceSelectorRow}>
                  <TouchableOpacity
                    style={[styles.sourceChip, profitWithdrawMethod === 'BANK_TRANSFER' && styles.sourceChipActive]}
                    onPress={() => setProfitWithdrawMethod('BANK_TRANSFER')}
                  >
                    <Text style={[styles.sourceChipText, profitWithdrawMethod === 'BANK_TRANSFER' && styles.sourceChipTextActive]}>
                      🏦 Bank
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.sourceChip, profitWithdrawMethod === 'CASH' && styles.sourceChipActive]}
                    onPress={() => setProfitWithdrawMethod('CASH')}
                  >
                    <Text style={[styles.sourceChipText, profitWithdrawMethod === 'CASH' && styles.sourceChipTextActive]}>
                      💵 Cash
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description / Reference</Text>
              <TextInput
                style={styles.textInput}
                value={profitDescription}
                onChangeText={setProfitDescription}
                placeholder={profitActionMode === 'REINVEST' ? 'e.g. Added to lending float' : 'e.g. Admin payout'}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={handleProcessProfitAction}
              disabled={submittingProfit}
              activeOpacity={0.85}
            >
              {submittingProfit ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={profitActionMode === 'REINVEST' ? 'transfer-right' : 'bank-transfer-out'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.modalBtnPrimaryText}>
                    {profitActionMode === 'REINVEST' ? 'Confirm Reinvestment' : 'Confirm Withdrawal'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== 3. RECORD EXPENSE MODAL ===== */}
      <Modal
        visible={expenseModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Branch Expense</Text>
              <TouchableOpacity onPress={() => setExpenseModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expense Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="numeric"
                placeholder="e.g. 500"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.sourceSelectorRow}>
                {['Office', 'Transport', 'Salary', 'Tea & Snacks'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.sourceChip, expenseCategory === cat && styles.sourceChipActive, { paddingHorizontal: 4 }]}
                    onPress={() => setExpenseCategory(cat)}
                  >
                    <Text style={[styles.sourceChipText, expenseCategory === cat && styles.sourceChipTextActive, { fontSize: 11 }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note / Reason</Text>
              <TextInput
                style={styles.textInput}
                value={expenseDescription}
                onChangeText={setExpenseDescription}
                placeholder="e.g. Field agent travel conveyance"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalBtnPrimary, { backgroundColor: '#DC2626' }]}
              onPress={handleRecordExpense}
              disabled={submittingExpense}
              activeOpacity={0.85}
            >
              {submittingExpense ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="receipt" size={18} color="#FFFFFF" />
                  <Text style={styles.modalBtnPrimaryText}>Record Expense (Deduct Vault)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminDashboard;
