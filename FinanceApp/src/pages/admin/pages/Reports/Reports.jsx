import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  RefreshControl,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { apiService } from '../../../../services/apiService';
import { formatINR, formatDate } from '../../../../utils/helpers';
import { useApp } from '../../../../context/AppContext';
import { BorrowerLogModal } from './BorrowerLogModal';

let revenueAnimation;
try {
  revenueAnimation = require('../../../../animation/Revenue.json');
} catch (e) {
  revenueAnimation = null;
}

// Date helpers
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekRange = (refDate = new Date()) => {
  const now = new Date(refDate);
  const day = now.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const distanceToMonday = (day + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday + 6);
  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
    monday,
    sunday,
  };
};

const getMonthRange = (refDate = new Date()) => {
  const first = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  const last = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  return {
    start: formatDateStr(first),
    end: formatDateStr(last),
    first,
    last,
  };
};

// Check if two dates are same calendar day
const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Format short date (e.g. "20 Sep")
const formatShortDate = (d) => {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Format day with weekday (e.g. "Sun, 20 Sep")
const formatDayDisplay = (d) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(d, today)) {
    return `Today (${formatShortDate(d)})`;
  }
  if (isSameDay(d, yesterday)) {
    return `Yesterday (${formatShortDate(d)})`;
  }
  if (isSameDay(d, tomorrow)) {
    return `Tomorrow (${formatShortDate(d)})`;
  }
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

// Format week display (e.g. "This Week (14 Sep – 20 Sep)" or "14 Sep – 20 Sep, 2026")
const formatWeekDisplay = (refDate) => {
  const today = new Date();
  const currentWeek = getWeekRange(today);
  const targetWeek = getWeekRange(refDate);

  const isCurrentWeek = currentWeek.start === targetWeek.start;
  const rangeStr = `${formatShortDate(targetWeek.monday)} – ${formatShortDate(targetWeek.sunday)}`;

  if (isCurrentWeek) {
    return `This Week (${rangeStr})`;
  }
  return `${rangeStr}, ${targetWeek.monday.getFullYear()}`;
};

// Format month display (e.g. "This Month (Sep 2026)" or "August 2026")
const formatMonthDisplay = (refDate) => {
  const today = new Date();
  const isCurrentMonth =
    refDate.getFullYear() === today.getFullYear() &&
    refDate.getMonth() === today.getMonth();

  const monthName = refDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  if (isCurrentMonth) {
    return `This Month (${refDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`;
  }
  return monthName;
};

// Friendly Status Helper
const getStatusStyle = (status) => {
  switch (status) {
    case 'PAID':
      return {
        badgeBg: '#ECFDF5',
        textColor: '#059669',
        borderColor: '#A7F3D0',
        label: 'PAID',
        icon: 'check-circle-outline',
      };
    case 'OVERDUE':
      return {
        badgeBg: '#FEF2F2',
        textColor: '#DC2626',
        borderColor: '#FECACA',
        label: 'OVERDUE',
        icon: 'alert-circle-outline',
      };
    case 'PARTIAL':
      return {
        badgeBg: '#EFF6FF',
        textColor: '#2563EB',
        borderColor: '#BFDBFE',
        label: 'PARTIAL',
        icon: 'clock-outline',
      };
    case 'UNPAID':
    default:
      return {
        badgeBg: '#FFFBEB',
        textColor: '#D97706',
        borderColor: '#FDE68A',
        label: 'UNPAID',
        icon: 'timer-sand',
      };
  }
};

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
    {/* Header row */}
    <View style={styles.cardHeader}>
      <SkeletonBox width={38} height={38} borderRadius={19} style={{ marginRight: 10 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width={130} height={14} borderRadius={4} />
        <SkeletonBox width={90} height={10} borderRadius={3} />
      </View>
      <SkeletonBox width={55} height={20} borderRadius={10} />
    </View>

    {/* Due strip */}
    <View style={[styles.dueInfoRow, { borderTopColor: '#F3F4F6' }]}>
      <SkeletonBox width={140} height={11} borderRadius={3} />
    </View>

    {/* 3-Column Amount Box */}
    <View style={styles.amountContainer}>
      <View style={styles.amountCol}>
        <SkeletonBox width={50} height={9} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.amountDivider} />
      <View style={styles.amountCol}>
        <SkeletonBox width={35} height={9} borderRadius={3} />
        <SkeletonBox width={55} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.amountDivider} />
      <View style={styles.amountCol}>
        <SkeletonBox width={55} height={9} borderRadius={3} />
        <SkeletonBox width={60} height={14} borderRadius={3} style={{ marginTop: 4 }} />
      </View>
    </View>

    {/* Action Footer */}
    <View style={styles.cardFooter}>
      <SkeletonBox width={65} height={32} borderRadius={8} />
      <SkeletonBox width="60%" height={32} borderRadius={8} style={{ flex: 1 }} />
    </View>
  </View>
);

// Professional Single Payment Record Card
const BorrowerCard = React.memo(({ item, onOpenLedger, onCall }) => {
  const statusStyle = getStatusStyle(item.status);
  const initial = item.customerName ? item.customerName.charAt(0).toUpperCase() : 'C';
  const balance = parseFloat(item.balance || 0);
  const isSettled = balance <= 0;

  return (
    <View style={styles.recordCard}>
      {/* Top Row: Customer Avatar, Info & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        <View style={styles.cardTitleBox}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.customerName}
          </Text>
          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone-outline" size={12} color="#6B7280" />
            <Text style={styles.phoneText}> {item.customerPhone || 'N/A'}</Text>
            {item.shopName ? (
              <>
                <Text style={styles.dotSeparator}> • </Text>
                <MaterialCommunityIcons name="store-outline" size={12} color="#6B7280" />
                <Text style={styles.shopText} numberOfLines={1}> {item.shopName}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusStyle.badgeBg,
              borderColor: statusStyle.borderColor,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={statusStyle.icon}
            size={11}
            color={statusStyle.textColor}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.statusBadgeText, { color: statusStyle.textColor }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Due Info Strip */}
      {item.dueDate ? (
        <View style={styles.dueInfoRow}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={13}
            color={item.status === 'OVERDUE' ? '#DC2626' : '#6B7280'}
          />
          <Text
            style={[
              styles.dueInfoText,
              item.status === 'OVERDUE' && { color: '#DC2626', fontWeight: '700' },
            ]}
          >
            Due: {formatDate(item.dueDate)} {item.installmentNumber ? `• Inst. #${item.installmentNumber}` : ''}
          </Text>
        </View>
      ) : null}

      {/* Amount Breakdown Row */}
      <View style={styles.amountContainer}>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Scheduled Due</Text>
          <Text style={styles.amountVal}>{formatINR(item.expectedAmount)}</Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amountVal, { color: '#059669' }]}>
            {formatINR(item.paidAmount)}
          </Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Balance Left</Text>
          <Text
            style={[
              styles.amountVal,
              { color: balance > 0 ? '#DC2626' : '#059669' },
            ]}
          >
            {formatINR(balance)}
          </Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.cardFooter}>
        {item.customerPhone ? (
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => onCall(item.customerPhone)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="phone" size={15} color="#6B46C1" />
            <Text style={styles.actionIconBtnText}>Call</Text>
          </TouchableOpacity>
        ) : null}

        {isSettled ? (
          <TouchableOpacity
            style={styles.settledBadge}
            onPress={() => onOpenLedger(item)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check-circle" size={14} color="#059669" />
            <Text style={styles.settledBadgeText}>Settled (View Log)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.collectBtn}
            onPress={() => onOpenLedger(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.collectBtnText}>
              Collect {formatINR(balance)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export const AdminReports = () => {
  const { currentUser } = useApp();

  // Filter States (Default to 'ALL' with empty dates so all active records load immediately)
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [frequencyFilter, setFrequencyFilter] = useState('ALL'); // 'ALL' | 'WEEKLY' | 'DAILY' | 'MONTHLY'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID'
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [report, setReport] = useState({
    period: { start: '', end: '' },
    summary: {
      expected: 0,
      collected: 0,
      outstanding: 0,
      paid_count: 0,
      unpaid_count: 0,
      partial_count: 0,
      overdue_count: 0,
      total_records: 0,
      recovery_rate: 0,
    },
    records: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Collect Payment Modal State
  const [collectModalVisible, setCollectModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [collectNotes, setCollectNotes] = useState('');
  const [collecting, setCollecting] = useState(false);

  // Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // Fetch Report Data from Backend API
  const fetchReport = useCallback(
    async (overrideStart, overrideEnd, overrideFreq, overrideStatus, isRefresh = false) => {
      const sDate = overrideStart !== undefined ? overrideStart : startDate;
      const eDate = overrideEnd !== undefined ? overrideEnd : endDate;
      const freq = overrideFreq !== undefined ? overrideFreq : frequencyFilter;
      const stat = overrideStatus !== undefined ? overrideStatus : statusFilter;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await apiService.getPaymentReport({
          startDate: sDate || undefined,
          endDate: eDate || undefined,
          frequency: freq,
          status: stat,
        });

        if (data) {
          setReport({
            period: data.period || { start: '', end: '' },
            summary: data.summary || {
              expected: 0,
              collected: 0,
              outstanding: 0,
              paid_count: 0,
              unpaid_count: 0,
              partial_count: 0,
              overdue_count: 0,
              total_records: 0,
              recovery_rate: 0,
            },
            records: Array.isArray(data.records) ? data.records : [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch live payment report:', err);
        Alert.alert(
          'Network Error',
          'Could not fetch latest reports from the server. Please pull to refresh or check your connection.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate, frequencyFilter, statusFilter]
  );

  // Calculate and apply date range for a given anchor date and frequency
  const applyDateRange = useCallback(
    (refDate, freq, stat = statusFilter) => {
      let s = '';
      let e = '';
      if (freq === 'DAILY') {
        const dayStr = formatDateStr(refDate);
        s = dayStr;
        e = dayStr;
      } else if (freq === 'WEEKLY') {
        const w = getWeekRange(refDate);
        s = w.start;
        e = w.end;
      } else if (freq === 'MONTHLY') {
        const m = getMonthRange(refDate);
        s = m.start;
        e = m.end;
      } else {
        s = '';
        e = '';
      }

      setStartDate(s);
      setEndDate(e);
      fetchReport(s, e, freq, stat, false);
    },
    [fetchReport, statusFilter]
  );

  // Initial Fetch on mount
  useEffect(() => {
    applyDateRange(anchorDate, frequencyFilter, statusFilter);
  }, []);

  // Frequency Filter Tab Selection Handler
  const handleFrequencySelect = useCallback(
    (freq) => {
      setFrequencyFilter(freq);
      applyDateRange(anchorDate, freq, statusFilter);
    },
    [anchorDate, applyDateRange, statusFilter]
  );

  // Status Filter Selection Handler
  const handleStatusSelect = useCallback(
    (stat) => {
      setStatusFilter(stat);
      fetchReport(startDate, endDate, frequencyFilter, stat, false);
    },
    [fetchReport, startDate, endDate, frequencyFilter]
  );

  // Date Shift Navigator Handlers (Previous / Next / Reset)
  const handlePrevDate = useCallback(() => {
    const next = new Date(anchorDate);
    if (frequencyFilter === 'DAILY') {
      next.setDate(next.getDate() - 1);
    } else if (frequencyFilter === 'WEEKLY') {
      next.setDate(next.getDate() - 7);
    } else if (frequencyFilter === 'MONTHLY') {
      next.setMonth(next.getMonth() - 1);
    }
    setAnchorDate(next);
    applyDateRange(next, frequencyFilter, statusFilter);
  }, [anchorDate, frequencyFilter, statusFilter, applyDateRange]);

  const handleNextDate = useCallback(() => {
    const next = new Date(anchorDate);
    if (frequencyFilter === 'DAILY') {
      next.setDate(next.getDate() + 1);
    } else if (frequencyFilter === 'WEEKLY') {
      next.setDate(next.getDate() + 7);
    } else if (frequencyFilter === 'MONTHLY') {
      next.setMonth(next.getMonth() + 1);
    }
    setAnchorDate(next);
    applyDateRange(next, frequencyFilter, statusFilter);
  }, [anchorDate, frequencyFilter, statusFilter, applyDateRange]);

  const handleResetToCurrent = useCallback(() => {
    const now = new Date();
    setAnchorDate(now);
    applyDateRange(now, frequencyFilter, statusFilter);
  }, [frequencyFilter, statusFilter, applyDateRange]);

  // Check if current anchor is active period (e.g. today / this week / this month)
  const isAnchorCurrent = useMemo(() => {
    const today = new Date();
    if (frequencyFilter === 'DAILY') {
      return isSameDay(anchorDate, today);
    }
    if (frequencyFilter === 'WEEKLY') {
      return getWeekRange(anchorDate).start === getWeekRange(today).start;
    }
    if (frequencyFilter === 'MONTHLY') {
      return anchorDate.getFullYear() === today.getFullYear() && anchorDate.getMonth() === today.getMonth();
    }
    return true;
  }, [anchorDate, frequencyFilter]);

  // Display text for date navigator center box
  const getDateDisplayText = useCallback(() => {
    if (frequencyFilter === 'DAILY') {
      return formatDayDisplay(anchorDate);
    }
    if (frequencyFilter === 'WEEKLY') {
      return formatWeekDisplay(anchorDate);
    }
    if (frequencyFilter === 'MONTHLY') {
      return formatMonthDisplay(anchorDate);
    }
    return 'All Active Records';
  }, [anchorDate, frequencyFilter]);

  // Group raw installments into unique borrower cards for the selected period/filter
  const borrowerCards = useMemo(() => {
    if (!report.records || report.records.length === 0) return [];

    const map = new Map();

    report.records.forEach((rec) => {
      const key = rec.loanId || rec.loanNumber || rec.customerId;
      if (!map.has(key)) {
        map.set(key, {
          key: String(key),
          loanId: rec.loanId,
          customerId: rec.customerId,
          userId: rec.userId,
          customerName: rec.customerName,
          customerPhone: rec.customerPhone,
          customerAddress: rec.customerAddress,
          shopName: rec.shopName,
          loanNumber: rec.loanNumber,
          frequency: rec.frequency,
          expectedAmount: 0,
          paidAmount: 0,
          balance: 0,
          installmentsCount: 0,
          unpaidCount: 0,
          overdueCount: 0,
          paidCount: 0,
          earliestDueDate: null,
          earliestUnpaidNumber: null,
          records: [],
        });
      }

      const card = map.get(key);
      card.expectedAmount += parseFloat(rec.expectedAmount || 0);
      card.paidAmount += parseFloat(rec.paidAmount || 0);
      card.balance += parseFloat(rec.balance || 0);
      card.installmentsCount += 1;
      card.records.push(rec);

      if (rec.status === 'PAID') {
        card.paidCount += 1;
      } else if (rec.status === 'OVERDUE') {
        card.overdueCount += 1;
        card.unpaidCount += 1;
      } else {
        card.unpaidCount += 1;
      }

      if (rec.status !== 'PAID' && (!card.earliestDueDate || rec.dueDate < card.earliestDueDate)) {
        card.earliestDueDate = rec.dueDate;
        card.earliestUnpaidNumber = rec.installmentNumber;
      }
    });

    const list = Array.from(map.values()).map((card) => {
      let status = 'UNPAID';
      let sortPriority = 2;

      if (card.balance <= 0) {
        status = 'PAID';
        sortPriority = 4;
      } else if (card.overdueCount > 0) {
        status = 'OVERDUE';
        sortPriority = 1;
      } else if (card.paidAmount > 0) {
        status = 'PARTIAL';
        sortPriority = 3;
      } else {
        status = 'UNPAID';
        sortPriority = 2;
      }

      return {
        ...card,
        status,
        sortPriority,
        dueDate: card.earliestDueDate || (card.records[0] ? card.records[0].dueDate : ''),
        installmentNumber: card.earliestUnpaidNumber || (card.records[0] ? card.records[0].installmentNumber : 1),
      };
    });

    list.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return list;
  }, [report.records]);

  // Client-Side Search Filtering over Borrower Cards
  const filteredBorrowers = useMemo(() => {
    if (!searchQuery.trim()) return borrowerCards;
    const q = searchQuery.toLowerCase().trim();
    return borrowerCards.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.customerPhone?.toLowerCase().includes(q) ||
        b.loanNumber?.toLowerCase().includes(q) ||
        b.shopName?.toLowerCase().includes(q)
    );
  }, [borrowerCards, searchQuery]);

  // Full-Screen Borrower Ledger Modal State
  const [borrowerLedgerVisible, setBorrowerLedgerVisible] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Open Full-Screen Borrower Ledger Modal
  const handleOpenBorrowerLedger = useCallback((borrower) => {
    setSelectedBorrower(borrower);
    setBorrowerLedgerVisible(true);
  }, []);

  // Open Collect Modal (Legacy / Quick Action)
  const openCollectModal = useCallback((record) => {
    setSelectedRecord(record);
    setCollectAmount(String(record.balance || record.expectedAmount || ''));
    setPaymentMethod('CASH');
    setCollectNotes(`Collection for ${record.customerName}`);
    setCollectModalVisible(true);
  }, []);

  // Open Detail Modal
  const openDetailModal = useCallback((record) => {
    setDetailRecord(record);
    setDetailModalVisible(true);
  }, []);

  // Submit Payment Collection to Backend
  const handleConfirmCollect = async () => {
    if (!selectedRecord) return;

    const parsedAmt = parseFloat(collectAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive payment amount.');
      return;
    }

    const maxDue = selectedRecord.balance || selectedRecord.expectedAmount;
    if (parsedAmt > maxDue + 0.01) {
      Alert.alert(
        'Amount Exceeded',
        `Payment cannot exceed outstanding balance of ${formatINR(maxDue)}.`
      );
      return;
    }

    setCollecting(true);
    try {
      await apiService.recordPayment({
        scheduleId: selectedRecord.scheduleId,
        loanId: selectedRecord.loanId,
        userId: selectedRecord.userId || selectedRecord.customerId,
        customerId: selectedRecord.customerId,
        amount: parsedAmt,
        paymentDate: formatDateStr(new Date()),
        paymentMethod: paymentMethod,
        referenceNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        notes: collectNotes,
      });

      setCollectModalVisible(false);
      Alert.alert(
        'Payment Recorded',
        `Successfully collected ${formatINR(parsedAmt)} for ${selectedRecord.customerName}.`
      );
      fetchReport(startDate, endDate, frequencyFilter, statusFilter, true);
    } catch (err) {
      console.error('Error recording payment:', err);
      Alert.alert('Collection Failed', err.message || 'Failed to record payment on server.');
    } finally {
      setCollecting(false);
    }
  };

  // Simplified Mom-Friendly Header
  const renderListHeader = () => {
    const totalPending =
      (report.summary.overdue_count || 0) +
      (report.summary.unpaid_count || 0) +
      (report.summary.partial_count || 0);

    return (
      <View>
        {/* Summary Metric Dashboard (Clean White Cards matching Borrower Card design) */}
        <View style={styles.metricsThreeRow}>
          {loading && !refreshing ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              {/* Card 1: To Collect */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>TO COLLECT</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#DC2626" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#DC2626' }]} numberOfLines={1}>
                  {formatINR(report.summary.outstanding)}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  {totalPending} Due
                </Text>
              </View>

              {/* Card 2: Collected */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>COLLECTED</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#DCFCE7' }]}>
                    <MaterialCommunityIcons name="check-decagram" size={13} color="#059669" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#059669' }]} numberOfLines={1}>
                  {formatINR(report.summary.collected)}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  {report.summary.paid_count || 0} Paid
                </Text>
              </View>

              {/* Card 3: Total */}
              <View style={styles.metricCardProper}>
                <View style={styles.metricTopProper}>
                  <Text style={styles.metricLabelProper}>TOTAL</Text>
                  <View style={[styles.metricIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <MaterialCommunityIcons name="calendar-clock" size={13} color="#6B46C1" />
                  </View>
                </View>
                <Text style={[styles.metricValueProper, { color: '#111827' }]} numberOfLines={1}>
                  {formatINR(report.summary.expected)}
                </Text>
                <Text style={styles.metricSubtextProper}>
                  {report.summary.total_records || 0} Total
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Status Filter Pills */}
        <View style={styles.statusSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusContainer}
          >
            {[
              { key: 'ALL', label: 'All', count: report.summary.total_records, color: '#6B46C1' },
              { key: 'OVERDUE', label: 'Overdue', count: report.summary.overdue_count, color: '#DC2626' },
              { key: 'UNPAID', label: 'To Collect', count: totalPending, color: '#D97706' },
              { key: 'PAID', label: 'Paid', count: report.summary.paid_count, color: '#059669' },
            ].map((s) => {
              const active = statusFilter === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusPill,
                    active && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => handleStatusSelect(s.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      active && { color: '#FFFFFF' },
                    ]}
                  >
                    {s.label} ({s.count || 0})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Clean Count Header */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>
            Customers ({filteredBorrowers.length})
          </Text>
        </View>
      </View>
    );
  };

  // Render Empty State or Skeletons
  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View style={{ marginTop: 6 }}>
          <BorrowerCardSkeleton />
          <BorrowerCardSkeleton />
          <BorrowerCardSkeleton />
          <BorrowerCardSkeleton />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        {revenueAnimation ? (
          <LottieView
            source={revenueAnimation}
            autoPlay
            loop
            style={styles.emptyLottie}
          />
        ) : (
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="file-document-outline" size={40} color="#6B46C1" />
          </View>
        )}
        <Text style={styles.emptyTitle}>No Payment Records Found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No records matching "${searchQuery}".`
            : 'No payment dues found for the selected period or filters.'}
        </Text>
        {(frequencyFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
          <TouchableOpacity
            style={styles.resetFilterBtn}
            onPress={() => {
              setFrequencyFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
              fetchReport('', '', 'ALL', 'ALL', false);
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="filter-remove" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.resetFilterText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render Single Borrower Card
  const renderItem = ({ item }) => (
    <BorrowerCard
      item={item}
      onOpenLedger={handleOpenBorrowerLedger}
      onOpenDetail={openDetailModal}
      onCall={(phone) => Linking.openURL(`tel:${phone}`)}
    />
  );

  // Key extractor
  const keyExtractor = (item, index) => {
    return String(item.key || item.loanId || `${item.customerId}-${index}`);
  };

  return (
    <View style={styles.fullscreenContainer}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Full-Width Top Frequency Tabs Attached to Header */}
      <View style={styles.headerAttachedTabBar}>
        {[
          { key: 'ALL', label: 'All', icon: 'layers-outline' },
          { key: 'WEEKLY', label: 'Weekly', icon: 'calendar-week' },
          { key: 'DAILY', label: 'Daily', icon: 'calendar-today' },
          { key: 'MONTHLY', label: 'Monthly', icon: 'calendar-month' },
        ].map((freq) => {
          const active = frequencyFilter === freq.key;
          return (
            <TouchableOpacity
              key={freq.key}
              style={styles.headerAttachedTab}
              onPress={() => handleFrequencySelect(freq.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContentRow}>
                <MaterialCommunityIcons
                  name={freq.icon}
                  size={15}
                  color={active ? '#6B46C1' : '#6B7280'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.headerAttachedTabText, active && styles.headerAttachedTabTextActive]}>
                  {freq.label}
                </Text>
              </View>
              {active && <View style={styles.tabActiveBottomLine} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Interactive Date Navigation Bar (Prev / Next & Current Period Reset) */}
      <View style={styles.dateNavContainer}>
        {frequencyFilter !== 'ALL' ? (
          <>
            <TouchableOpacity
              style={styles.dateNavArrowBtn}
              onPress={handlePrevDate}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B46C1" />
            </TouchableOpacity>

            <View style={styles.dateNavCenterBox}>
              <MaterialCommunityIcons name="calendar" size={15} color="#6B46C1" style={{ marginRight: 6 }} />
              <Text style={styles.dateNavCenterText} numberOfLines={1}>
                {getDateDisplayText()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.dateNavArrowBtn}
              onPress={handleNextDate}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B46C1" />
            </TouchableOpacity>

            {!isAnchorCurrent && (
              <TouchableOpacity
                style={styles.dateNavResetBtn}
                onPress={handleResetToCurrent}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="restore" size={13} color="#6B46C1" style={{ marginRight: 3 }} />
                <Text style={styles.dateNavResetText}>
                  {frequencyFilter === 'DAILY' ? 'Today' : frequencyFilter === 'WEEKLY' ? 'This Week' : 'This Month'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.dateNavAllBox}>
            <MaterialCommunityIcons name="calendar-check" size={16} color="#6B46C1" style={{ marginRight: 6 }} />
            <Text style={styles.dateNavCenterText}>All Active Payment Records</Text>
          </View>
        )}
      </View>

      {/* High-Performance Virtualized FlatList */}
      <FlatList
        data={filteredBorrowers}
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
            onRefresh={() => fetchReport(startDate, endDate, frequencyFilter, statusFilter, true)}
            colors={['#6B46C1']}
            tintColor="#6B46C1"
          />
        }
      />

      {/* Separate Borrower Log & Complete Installment History Modal */}
      <BorrowerLogModal
        visible={borrowerLedgerVisible}
        onClose={() => setBorrowerLedgerVisible(false)}
        borrower={selectedBorrower}
        onPaymentSuccess={() => fetchReport()}
      />

      {/* Collect Payment Modal (Legacy) */}
      <Modal
        visible={collectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCollectModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Record Collection</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedRecord?.customerName} • {selectedRecord?.loanNumber}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCollectModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Outstanding Summary Banner */}
            <View style={styles.dueBanner}>
              <View>
                <Text style={styles.dueBannerLabel}>Outstanding Dues</Text>
                <Text style={styles.dueBannerAmount}>
                  {formatINR(selectedRecord?.balance || selectedRecord?.expectedAmount || 0)}
                </Text>
              </View>
              <View style={styles.dueBannerBadge}>
                <Text style={styles.dueBannerBadgeText}>
                  Inst. #{selectedRecord?.installmentNumber}
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <Text style={styles.inputLabel}>Collection Amount (₹)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={collectAmount}
                onChangeText={setCollectAmount}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.methodRow}>
              {[
                { key: 'CASH', label: 'Cash', icon: 'cash' },
                { key: 'UPI', label: 'UPI / GPay', icon: 'qrcode-scan' },
                { key: 'BANK_TRANSFER', label: 'Bank', icon: 'bank' },
              ].map((m) => {
                const active = paymentMethod === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.methodBtn, active && styles.methodBtnActive]}
                    onPress={() => setPaymentMethod(m.key)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={m.icon}
                      size={16}
                      color={active ? '#6B46C1' : '#6B7280'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.methodBtnText, active && styles.methodBtnTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes Input */}
            <Text style={styles.inputLabel}>Remarks / Reference No.</Text>
            <TextInput
              style={styles.notesInput}
              value={collectNotes}
              onChangeText={setCollectNotes}
              placeholder="e.g., Paid via PhonePe, or collected at shop"
              placeholderTextColor="#9CA3AF"
            />

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCollectModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, collecting && { opacity: 0.7 }]}
                onPress={handleConfirmCollect}
                disabled={collecting}
                activeOpacity={0.85}
              >
                {collecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSubmitText}>Confirm Collection</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Details Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Installment Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {detailRecord && (
              <View style={styles.detailList}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Borrower</Text>
                  <Text style={styles.detailValue}>{detailRecord.customerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact Phone</Text>
                  <Text style={styles.detailValue}>{detailRecord.customerPhone}</Text>
                </View>
                {detailRecord.customerAddress ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{detailRecord.customerAddress}</Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loan Account</Text>
                  <Text style={styles.detailValue}>{detailRecord.loanNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Repayment Scheme</Text>
                  <Text style={styles.detailValue}>{detailRecord.frequency}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Installment Due Date</Text>
                  <Text style={styles.detailValue}>{formatDate(detailRecord.dueDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Scheduled Amount</Text>
                  <Text style={styles.detailValue}>{formatINR(detailRecord.expectedAmount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Collected Amount</Text>
                  <Text style={[styles.detailValue, { color: '#10B981' }]}>
                    {formatINR(detailRecord.paidAmount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Balance</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                    {formatINR(detailRecord.balance)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <Text style={[styles.detailValue, { fontWeight: '700' }]}>
                    {detailRecord.status}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={styles.detailCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  listContent: {
    paddingBottom: 90,
  },


  // Full-Width Top Frequency Tabs (Attached to Header)
  headerAttachedTabBar: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  headerAttachedTab: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAttachedTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  headerAttachedTabTextActive: {
    color: '#6B46C1',
    fontWeight: '800',
  },
  tabActiveBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#6B46C1',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // Interactive Date Navigator Bar
  dateNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateNavArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavCenterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  dateNavCenterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateNavResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginLeft: 4,
  },
  dateNavResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
  },
  dateNavAllBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },

  // Proper 3 Metric Cards matching Borrower card design
  metricsThreeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  metricCardProper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'space-between',
  },
  metricTopProper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabelProper: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  metricIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValueProper: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricSubtextProper: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },

  // Due info row
  dueInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dueInfoText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Status Filter Pills
  statusSection: {
    marginTop: 10,
  },
  statusContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },

  // Search
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  searchBar: {
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
    marginLeft: 8,
    paddingVertical: 0,
  },

  // Records Header
  recordsHeader: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  recordsHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },

  // Loading
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  // Empty State
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyLottie: {
    width: 130,
    height: 130,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Record Card
  recordCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
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
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardTitleBox: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  shopText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Meta strip
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },

  // Amounts row
  amountContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  amountCol: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  amountDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E5E7EB',
  },

  // Card Footer Actions
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
  },
  actionIconBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
    marginLeft: 4,
  },
  collectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  collectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settledBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  settledBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dueBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  dueBannerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B46C1',
  },
  dueBannerAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B46C1',
    marginTop: 2,
  },
  dueBannerBadge: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueBannerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B46C1',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 0,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  methodBtnActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3E8FF',
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodBtnTextActive: {
    color: '#6B46C1',
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Detail Modal
  detailCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  detailList: {
    marginTop: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  detailCloseBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
});

export default AdminReports;
