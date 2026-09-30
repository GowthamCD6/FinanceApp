import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { apiService } from '../../../../../services/apiService';
import { formatINR } from '../../../../../utils/helpers';
import { BorrowerLogModal } from '../../../pages/Reports/BorrowerLogModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format currency in compact form for small calendar cells (e.g. ₹12.5k)
const formatCompactINR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  return `₹${Math.round(num)}`;
};

export const CollectionCalendarModal = ({
  visible,
  onClose,
  onOpenAddUser,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [selectedFrequency, setSelectedFrequency] = useState('ALL');
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({ summary: {}, records: [] });

  // Borrower Detailed Log Modal
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowerModalVisible, setBorrowerModalVisible] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Month Bounds
  const { monthStartStr, monthEndStr, daysInMonth, startWeekday } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${currentYear}-${pad(currentMonth + 1)}-01`;
    const endStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay.getDate())}`;

    return {
      monthStartStr: startStr,
      monthEndStr: endStr,
      daysInMonth: lastDay.getDate(),
      startWeekday: firstDay.getDay(),
    };
  }, [currentYear, currentMonth]);

  // Fetch Payment Report for Month
  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getPaymentReport({
        startDate: monthStartStr,
        endDate: monthEndStr,
        frequency: selectedFrequency === 'ALL' ? undefined : selectedFrequency,
      });

      if (res) {
        setReportData({
          summary: res.summary || {},
          records: Array.isArray(res.records) ? res.records : [],
        });
      }
    } catch (err) {
      console.warn('Error fetching calendar data in app:', err.message);
    } finally {
      setLoading(false);
    }
  }, [monthStartStr, monthEndStr, selectedFrequency]);

  useEffect(() => {
    if (visible) {
      fetchMonthData();
    }
  }, [visible, fetchMonthData]);

  // Day Aggregations
  const dayAggregates = useMemo(() => {
    const map = {};
    const pad = (n) => String(n).padStart(2, '0');

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      map[dStr] = {
        dateStr: dStr,
        dayNum: d,
        expected: 0,
        collected: 0,
        balance: 0,
        count: 0,
        paidCount: 0,
        records: [],
      };
    }

    (reportData.records || []).forEach((r) => {
      const rawDate = r.dueDate || r.due_date || r.date;
      const dateKey = rawDate ? String(rawDate).slice(0, 10) : '';
      if (!dateKey) return;

      if (!map[dateKey]) {
        map[dateKey] = {
          dateStr: dateKey,
          dayNum: parseInt(dateKey.slice(8), 10) || 1,
          expected: 0,
          collected: 0,
          balance: 0,
          count: 0,
          paidCount: 0,
          records: [],
        };
      }

      const exp = parseFloat(r.expectedAmount || r.dueAmount || r.amount || 0);
      const paid = parseFloat(r.paidAmount != null ? r.paidAmount : (r.status === 'PAID' ? exp : 0));
      const bal = parseFloat(r.balance != null ? r.balance : Math.max(0, exp - paid));

      map[dateKey].expected += exp;
      map[dateKey].collected += paid;
      map[dateKey].balance += bal;
      map[dateKey].count += 1;
      if (r.status === 'PAID' || bal <= 0 || paid >= exp) {
        map[dateKey].paidCount += 1;
      }
      map[dateKey].records.push(r);
    });

    return map;
  }, [currentYear, currentMonth, daysInMonth, reportData.records]);

  // Month Totals (4 Main KPIs matching Webpage)
  const monthTally = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let balance = 0;
    let totalDues = 0;
    let completedDues = 0;

    Object.values(dayAggregates).forEach((day) => {
      expected += day.expected;
      collected += day.collected;
      balance += day.balance;
      totalDues += day.count;
      completedDues += day.paidCount;
    });

    const efficiency = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

    return {
      expected,
      collected,
      balance: Math.max(0, balance),
      totalDues,
      completedDues,
      efficiency,
    };
  }, [dayAggregates]);

  // Selected Day Details
  const selectedDayData = useMemo(() => {
    return (
      dayAggregates[selectedDateStr] || {
        dateStr: selectedDateStr,
        dayNum: parseInt(selectedDateStr.slice(8), 10) || 1,
        expected: 0,
        collected: 0,
        balance: 0,
        count: 0,
        paidCount: 0,
        records: [],
      }
    );
  }, [dayAggregates, selectedDateStr]);

  // Filtered Selected Day Records
  const filteredDayRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return selectedDayData.records || [];
    return (selectedDayData.records || []).filter((r) => {
      const name = (r.customerName || r.borrowerName || r.name || '').toLowerCase();
      const phone = (r.customerPhone || r.phone || '').toLowerCase();
      const code = (r.loanNumber || r.loanCode || r.customerCode || '').toLowerCase();
      const shop = (r.shopName || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || code.includes(q) || shop.includes(q);
    });
  }, [selectedDayData.records, searchQuery]);

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const formattedSelectedDate = useMemo(() => {
    try {
      const dateObj = new Date(`${selectedDateStr}T00:00:00`);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Standard Page Header matching app style */}
        <Header
          title="Daily Collection Calendar"
          onBack={onClose}
          showBackButton={true}
          showDivider={true}
          rightComponent={
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={handleJumpToday}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="calendar-today" size={14} color="#4F46E5" />
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchMonthData}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="refresh" size={18} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Controls Bar: Stepper & Scheme Filters */}
          <View style={styles.controlsBar}>
            {/* Month Stepper */}
            <View style={styles.monthStepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Scheme Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freqTabsContainer}
            >
              {[
                { id: 'ALL', label: 'All Schemes' },
                { id: 'DAILY', label: 'Daily (Shop)' },
                { id: 'WEEKLY', label: 'Weekly Loans' },
                { id: 'MONTHLY', label: 'Monthly Loans' },
              ].map((scheme) => {
                const isActive = selectedFrequency === scheme.id;
                return (
                  <TouchableOpacity
                    key={scheme.id}
                    style={[styles.freqPill, isActive && styles.freqPillActive]}
                    onPress={() => setSelectedFrequency(scheme.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.freqText, isActive && styles.freqTextActive]}>
                      {scheme.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 4 Standard Monthly KPI Metric Cards (Matching Webpage) */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Month Total Target */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <Text style={styles.kpiLabel}>MONTH TARGET</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <MaterialCommunityIcons name="receipt" size={16} color="#4F46E5" />
                </View>
              </View>
              <Text style={styles.kpiValue}>{formatINR(monthTally.expected)}</Text>
              <Text style={styles.kpiDesc}>{monthTally.totalDues} scheduled dues</Text>
            </View>

            {/* Card 2: Total Received */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <Text style={[styles.kpiLabel, { color: '#059669' }]}>TOTAL RECEIVED</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialCommunityIcons name="cash-check" size={16} color="#059669" />
                </View>
              </View>
              <Text style={[styles.kpiValue, { color: '#059669' }]}>
                {formatINR(monthTally.collected)}
              </Text>
              <Text style={styles.kpiDesc}>{monthTally.completedDues} dues cleared</Text>
            </View>

            {/* Card 3: Pending to Tally */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <Text style={[styles.kpiLabel, { color: '#D97706' }]}>PENDING TALLY</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#D97706" />
                </View>
              </View>
              <Text style={[styles.kpiValue, { color: '#D97706' }]}>
                {formatINR(monthTally.balance)}
              </Text>
              <Text style={styles.kpiDesc}>Remaining recovery</Text>
            </View>

            {/* Card 4: Month Recovery Rate */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <Text style={[styles.kpiLabel, { color: '#7C3AED' }]}>RECOVERY RATE</Text>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <MaterialCommunityIcons name="trending-up" size={16} color="#7C3AED" />
                </View>
              </View>
              <Text style={[styles.kpiValue, { color: '#7C3AED' }]}>
                {monthTally.efficiency}%
              </Text>
              <Text style={styles.kpiDesc}>
                {monthTally.completedDues} of {monthTally.totalDues} collected
              </Text>
            </View>
          </View>

          {/* Calendar Grid Container */}
          <View style={styles.calendarCard}>
            {/* Card Header & Legend */}
            <View style={styles.calCardHeader}>
              <View style={styles.calHeaderTitleRow}>
                <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#4F46E5" />
                <Text style={styles.calHeaderTitle}>
                  {MONTH_NAMES[currentMonth]} {currentYear} Breakdown
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Cleared</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>Partial</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendText}>Due</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Overdue</Text>
                </View>
              </View>
            </View>

            {/* Weekday Row */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text
                  key={w}
                  style={[
                    styles.weekdayHeaderCell,
                    idx === 0 && { color: '#EF4444' }, // Sunday red accent
                  ]}
                >
                  {w}
                </Text>
              ))}
            </View>

            {/* Calendar Grid Days */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading collection schedule...</Text>
              </View>
            ) : (
              <View style={styles.daysGrid}>
                {/* Empty Lead Days */}
                {Array.from({ length: startWeekday }).map((_, i) => (
                  <View key={`lead-${i}`} style={styles.emptyDayCell} />
                ))}

                {/* Days in Month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const pad = (n) => String(n).padStart(2, '0');
                  const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
                  const dayData = dayAggregates[dateStr] || {
                    expected: 0,
                    collected: 0,
                    balance: 0,
                    count: 0,
                    paidCount: 0,
                  };

                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDateStr;
                  const isPast = dateStr < todayStr;
                  const hasDues = dayData.count > 0;
                  const isFullyCollected = hasDues && dayData.collected >= dayData.expected;
                  const isPartial = hasDues && dayData.collected > 0 && dayData.collected < dayData.expected;
                  const isOverdue = hasDues && isPast && dayData.balance > 0;

                  let cellStatusStyle = styles.cellNoDues;
                  let barColor = '#CBD5E1';
                  if (hasDues) {
                    if (isFullyCollected) {
                      cellStatusStyle = styles.cellCleared;
                      barColor = '#10B981';
                    } else if (isOverdue) {
                      cellStatusStyle = styles.cellOverdue;
                      barColor = '#EF4444';
                    } else if (isPartial) {
                      cellStatusStyle = styles.cellPartial;
                      barColor = '#3B82F6';
                    } else {
                      cellStatusStyle = styles.cellDue;
                      barColor = '#8B5CF6';
                    }
                  }

                  const dayPct =
                    dayData.expected > 0
                      ? Math.min(100, Math.round((dayData.collected / dayData.expected) * 100))
                      : 0;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={[
                        styles.dayCell,
                        cellStatusStyle,
                        isToday && styles.cellToday,
                        isSelected && styles.cellSelected,
                      ]}
                      onPress={() => setSelectedDateStr(dateStr)}
                      activeOpacity={0.7}
                    >
                      {/* Top row: Day Number + Count badge */}
                      <View style={styles.cellTopRow}>
                        <Text
                          style={[
                            styles.cellDayNum,
                            isToday && styles.cellDayNumToday,
                            isSelected && styles.cellDayNumSelected,
                          ]}
                        >
                          {dayNum}
                        </Text>
                        {hasDues && (
                          <View
                            style={[
                              styles.cellCountBadge,
                              isSelected && { backgroundColor: '#4F46E5' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cellCountText,
                                isSelected && { color: '#FFFFFF' },
                              ]}
                            >
                              {dayData.count}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Content row: Target, Received, Progress Bar */}
                      {hasDues ? (
                        <View style={styles.cellBody}>
                          <Text
                            style={[
                              styles.cellTgtText,
                              isSelected && { color: '#1E293B', fontWeight: '700' },
                            ]}
                            numberOfLines={1}
                          >
                            {formatCompactINR(dayData.expected)}
                          </Text>
                          <Text
                            style={[
                              styles.cellRecvText,
                              isSelected && { color: '#059669', fontWeight: '800' },
                            ]}
                            numberOfLines={1}
                          >
                            {formatCompactINR(dayData.collected)}
                          </Text>
                          {/* Mini progress bar */}
                          <View style={styles.cellBarTrack}>
                            <View
                              style={[
                                styles.cellBarFill,
                                {
                                  width: `${dayPct}%`,
                                  backgroundColor: barColor,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.cellEmptyBody}>
                          <Text style={styles.cellEmptyDash}>—</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Selected Date Details Panel (Matching Webpage Drawer) */}
          <View style={styles.selectedDayCard}>
            {/* Day Header */}
            <View style={styles.selectedDayHeader}>
              <View>
                <View style={styles.selectedDayTagRow}>
                  <Text style={styles.selectedDayTag}>SELECTED DATE</Text>
                  {selectedDateStr === todayStr && (
                    <View style={styles.todayChip}>
                      <Text style={styles.todayChipText}>Today</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.selectedDayTitle}>{formattedSelectedDate}</Text>
              </View>

              <View style={styles.selectedDayBadge}>
                <MaterialCommunityIcons name="calendar-check" size={16} color="#4F46E5" />
                <Text style={styles.selectedDayBadgeText}>
                  {selectedDayData.count} Due{selectedDayData.count !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Quick 3 Stats Box */}
            <View style={styles.selectedDayStatsRow}>
              <View style={styles.dayStatBox}>
                <Text style={styles.dayStatLabel}>TARGET DUE</Text>
                <Text style={styles.dayStatVal}>{formatINR(selectedDayData.expected)}</Text>
              </View>
              <View style={styles.dayStatBox}>
                <Text style={[styles.dayStatLabel, { color: '#059669' }]}>COLLECTED</Text>
                <Text style={[styles.dayStatVal, { color: '#059669' }]}>
                  {formatINR(selectedDayData.collected)}
                </Text>
              </View>
              <View style={styles.dayStatBox}>
                <Text style={[styles.dayStatLabel, { color: '#D97706' }]}>REMAINING</Text>
                <Text
                  style={[
                    styles.dayStatVal,
                    { color: selectedDayData.balance > 0 ? '#DC2626' : '#059669' },
                  ]}
                >
                  {formatINR(selectedDayData.balance)}
                </Text>
              </View>
            </View>

            {/* Search Input for Day Records */}
            {selectedDayData.records.length > 0 && (
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search borrower, phone, or loan #..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Borrower Records Queue */}
            {filteredDayRecords.length === 0 ? (
              <View style={styles.emptyRecordsWrap}>
                <MaterialCommunityIcons name="calendar-check-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyRecordsTitle}>
                  {selectedDayData.records.length === 0
                    ? 'No installments scheduled for this date'
                    : 'No matching borrower found'}
                </Text>
                <Text style={styles.emptyRecordsSubtitle}>
                  {selectedDayData.records.length === 0
                    ? 'Select another date in the calendar above or switch the scheme filter.'
                    : 'Try searching with a different name or loan number.'}
                </Text>
              </View>
            ) : (
              <View style={styles.recordsList}>
                {filteredDayRecords.map((item, index) => {
                  const exp = parseFloat(item.expectedAmount || item.dueAmount || item.amount || 0);
                  const paid = parseFloat(
                    item.paidAmount != null ? item.paidAmount : item.status === 'PAID' ? exp : 0
                  );
                  const bal = parseFloat(item.balance != null ? item.balance : Math.max(0, exp - paid));

                  const isPaid = item.status === 'PAID' || bal <= 0 || paid >= exp;
                  const isOverdue = item.status === 'OVERDUE' || (selectedDateStr < todayStr && bal > 0);
                  const isPartial = paid > 0 && bal > 0;
                  const isTarget = item.status === 'DUE_AT_END';

                  const customerName =
                    item.customerName || item.borrowerName || item.name || 'Borrower';
                  const customerPhone = item.customerPhone || item.phone || '';
                  const loanCode = item.loanNumber || item.loanCode || item.customerCode || 'LN';
                  const freq = item.frequency || item.repaymentFrequency || 'Weekly';

                  return (
                    <View
                      key={item.id || item.loanId || index}
                      style={[
                        styles.borrowerCard,
                        isPaid && styles.borrowerCardPaid,
                      ]}
                    >
                      {/* Top details row */}
                      <View style={styles.borrowerCardHeader}>
                        <View style={styles.borrowerInfo}>
                          <View
                            style={[
                              styles.borrowerAvatar,
                              isPaid && { backgroundColor: '#ECFDF5' },
                              isOverdue && { backgroundColor: '#FEF2F2' },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={
                                isPaid
                                  ? 'check-circle'
                                  : isTarget
                                  ? 'target'
                                  : isOverdue
                                  ? 'alert-circle'
                                  : 'account'
                              }
                              size={18}
                              color={
                                isPaid
                                  ? '#059669'
                                  : isTarget
                                  ? '#7C3AED'
                                  : isOverdue
                                  ? '#DC2626'
                                  : '#4F46E5'
                              }
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.borrowerName} numberOfLines={1}>
                              {customerName}
                            </Text>
                            <Text style={styles.borrowerMeta} numberOfLines={1}>
                              {loanCode} • {freq}
                              {item.shopName ? ` • ${item.shopName}` : ''}
                            </Text>
                          </View>
                        </View>

                        {/* Status badge */}
                        <View
                          style={[
                            styles.statusPill,
                            isPaid && styles.statusPillPaid,
                            isOverdue && styles.statusPillOverdue,
                            isPartial && styles.statusPillPartial,
                            isTarget && styles.statusPillTarget,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              isPaid && { color: '#059669' },
                              isOverdue && { color: '#DC2626' },
                              isPartial && { color: '#2563EB' },
                              isTarget && { color: '#7C3AED' },
                            ]}
                          >
                            {isPaid
                              ? 'CLEARED'
                              : isTarget
                              ? 'TARGET'
                              : isOverdue
                              ? 'OVERDUE'
                              : isPartial
                              ? 'PARTIAL'
                              : 'PENDING'}
                          </Text>
                        </View>
                      </View>

                      {/* Amounts Breakdown Grid */}
                      <View style={styles.amountsRow}>
                        <View style={styles.amountCol}>
                          <Text style={styles.amountLabel}>Scheduled</Text>
                          <Text style={styles.amountVal}>{formatINR(exp)}</Text>
                        </View>
                        <View style={styles.amountDivider} />
                        <View style={styles.amountCol}>
                          <Text style={[styles.amountLabel, { color: '#059669' }]}>Received</Text>
                          <Text style={[styles.amountVal, { color: '#059669' }]}>
                            {formatINR(paid)}
                          </Text>
                        </View>
                        <View style={styles.amountDivider} />
                        <View style={styles.amountCol}>
                          <Text
                            style={[
                              styles.amountLabel,
                              { color: bal > 0 ? '#DC2626' : '#059669' },
                            ]}
                          >
                            Balance Left
                          </Text>
                          <Text
                            style={[
                              styles.amountVal,
                              { color: bal > 0 ? '#DC2626' : '#059669' },
                            ]}
                          >
                            {formatINR(bal)}
                          </Text>
                        </View>
                      </View>

                      {/* Actions Footer */}
                      <View style={styles.cardActionsRow}>
                        {customerPhone ? (
                          <TouchableOpacity
                            style={styles.phoneActionBtn}
                            onPress={() => handleCall(customerPhone)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="phone" size={14} color="#4F46E5" />
                            <Text style={styles.phoneActionText}>Call</Text>
                          </TouchableOpacity>
                        ) : null}

                        {isPaid ? (
                          <TouchableOpacity
                            style={styles.settledBtn}
                            onPress={() => {
                              setSelectedBorrower({
                                loanId: item.loanId || item.id,
                                customerId: item.customerId || item.customer_id,
                                loanNumber: loanCode,
                                customerName,
                                customerPhone,
                                shopName: item.shopName,
                                expectedAmount: exp,
                              });
                              setBorrowerModalVisible(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={14}
                              color="#059669"
                              style={{ marginRight: 5 }}
                            />
                            <Text style={styles.settledBtnText}>Settled (View Log)</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.collectActionBtn}
                            onPress={() => {
                              setSelectedBorrower({
                                loanId: item.loanId || item.id,
                                customerId: item.customerId || item.customer_id,
                                loanNumber: loanCode,
                                customerName,
                                customerPhone,
                                shopName: item.shopName,
                                expectedAmount: exp,
                              });
                              setBorrowerModalVisible(true);
                            }}
                            activeOpacity={0.85}
                          >
                            <MaterialCommunityIcons
                              name="cash"
                              size={15}
                              color="#FFFFFF"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.collectActionText}>
                              Collect {formatINR(bal)}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Borrower Detailed Ledger Log Modal */}
        {selectedBorrower && (
          <BorrowerLogModal
            visible={borrowerModalVisible}
            onClose={() => {
              setBorrowerModalVisible(false);
              setSelectedBorrower(null);
            }}
            borrower={selectedBorrower}
            onPaymentSuccess={() => {
              fetchMonthData();
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    gap: 4,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  // Controls Bar
  controlsBar: {
    marginBottom: 12,
    gap: 10,
  },
  monthStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  freqTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  freqPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  freqPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  freqText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  freqTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // 4 Top KPI Cards
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flexBasis: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  kpiDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  // Calendar Card
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  calCardHeader: {
    marginBottom: 10,
    gap: 8,
  },
  calHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    marginBottom: 6,
  },
  weekdayHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.285%',
    height: 64,
    borderWidth: 0.5,
    borderColor: '#F8FAFC',
    backgroundColor: '#FAFAFA',
  },
  dayCell: {
    width: '14.285%',
    height: 64,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
    padding: 3,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  cellNoDues: {
    backgroundColor: '#FFFFFF',
  },
  cellCleared: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cellPartial: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  cellDue: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  cellOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: '#4338CA',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  cellTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellDayNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  cellDayNumToday: {
    color: '#4F46E5',
    fontWeight: '900',
  },
  cellDayNumSelected: {
    color: '#4338CA',
    fontWeight: '900',
  },
  cellCountBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 3,
    minWidth: 13,
    alignItems: 'center',
  },
  cellCountText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#475569',
  },
  cellBody: {
    marginTop: 1,
    gap: 1,
  },
  cellTgtText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
  },
  cellRecvText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#059669',
  },
  cellBarTrack: {
    height: 2.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  cellBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  cellEmptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellEmptyDash: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  // Selected Day Details Card
  selectedDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  selectedDayTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  selectedDayTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  todayChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
  },
  selectedDayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  selectedDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  selectedDayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  selectedDayStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginBottom: 12,
  },
  dayStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  dayStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  dayStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },
  emptyRecordsWrap: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyRecordsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyRecordsSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  recordsList: {
    gap: 10,
  },
  borrowerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  borrowerCardPaid: {
    borderColor: '#BBF7D0',
    backgroundColor: '#FBFDFB',
  },
  borrowerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  borrowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  borrowerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borrowerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  borrowerMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  statusPillPaid: {
    backgroundColor: '#ECFDF5',
  },
  statusPillOverdue: {
    backgroundColor: '#FEF2F2',
  },
  statusPillPartial: {
    backgroundColor: '#EFF6FF',
  },
  statusPillTarget: {
    backgroundColor: '#FAF5FF',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  amountVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  amountDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  phoneActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    gap: 4,
  },
  phoneActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  settledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  settledBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  collectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  collectActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
