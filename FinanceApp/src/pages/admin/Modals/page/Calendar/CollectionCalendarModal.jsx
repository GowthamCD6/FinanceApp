import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService } from '../../../../../services/apiService';
import { formatINR } from '../../../../../utils/helpers';
import { BorrowerLogModal } from '../../../pages/Reports/BorrowerLogModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Borrower Ledger Log Modal
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
      const dateKey = r.dueDate ? String(r.dueDate).slice(0, 10) : '';
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

      const dueAmt = Number(r.dueAmount || r.amount || 0);
      const paidAmt = Number(r.paidAmount || (r.status === 'PAID' ? dueAmt : 0));

      map[dateKey].expected += dueAmt;
      map[dateKey].collected += paidAmt;
      map[dateKey].balance += Math.max(0, dueAmt - paidAmt);
      map[dateKey].count += 1;
      if (r.status === 'PAID' || paidAmt >= dueAmt) {
        map[dateKey].paidCount += 1;
      }
      map[dateKey].records.push(r);
    });

    return map;
  }, [currentYear, currentMonth, daysInMonth, reportData.records]);

  // Selected Day Records
  const selectedDayData = dayAggregates[selectedDateStr] || {
    expected: 0,
    collected: 0,
    balance: 0,
    records: [],
  };

  const filteredDayRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return selectedDayData.records || [];
    return (selectedDayData.records || []).filter((r) => {
      const name = (r.customerName || r.borrowerName || r.name || '').toLowerCase();
      const code = (r.customerCode || r.loanCode || '').toLowerCase();
      const shop = (r.shopName || '').toLowerCase();
      return name.includes(q) || code.includes(q) || shop.includes(q);
    });
  }, [selectedDayData.records, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let totalPaidCount = 0;
    let totalCount = 0;

    Object.values(dayAggregates).forEach((d) => {
      totalExpected += d.expected;
      totalCollected += d.collected;
      totalPaidCount += d.paidCount;
      totalCount += d.count;
    });

    const efficiency = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
    const balance = Math.max(0, totalExpected - totalCollected);

    return {
      totalExpected,
      totalCollected,
      balance,
      efficiency,
      totalCount,
      totalPaidCount,
    };
  }, [dayAggregates]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top App Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.headerTitle}>Collection Calendar</Text>
            <Text style={styles.headerSubtitle}>Day-wise Dues & Repayment Schedule</Text>
          </View>
          <TouchableOpacity style={styles.refreshIconBtn} onPress={fetchMonthData} activeOpacity={0.7}>
            <MaterialCommunityIcons name="refresh" size={20} color="#6B46C1" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Month Stepper & Frequency Switcher */}
          <View style={styles.monthNavRow}>
            <View style={styles.monthStepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={handlePrevMonth} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-left" size={22} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity style={styles.stepBtn} onPress={handleNextMonth} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Frequency Tabs */}
            <View style={styles.freqTabs}>
              {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.freqPill, selectedFrequency === freq && styles.freqPillActive]}
                  onPress={() => setSelectedFrequency(freq)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freqText, selectedFrequency === freq && styles.freqTextActive]}>
                    {freq === 'ALL' ? 'All' : freq === 'DAILY' ? 'Daily' : freq === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Monthly KPI Summary Cards */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { borderColor: '#E2E8F0' }]}>
              <Text style={styles.kpiLabel}>MONTH EXPECTED</Text>
              <Text style={styles.kpiValue}>{formatINR(summary.totalExpected)}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.kpiLabel, { color: '#047857' }]}>COLLECTED</Text>
              <Text style={[styles.kpiValue, { color: '#047857' }]}>{formatINR(summary.totalCollected)}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]}>
              <Text style={[styles.kpiLabel, { color: '#BE123C' }]}>PENDING</Text>
              <Text style={[styles.kpiValue, { color: '#BE123C' }]}>{formatINR(summary.balance)}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: '#DDD6FE', backgroundColor: '#FAF5FF' }]}>
              <Text style={[styles.kpiLabel, { color: '#6D28D9' }]}>RECOVERY</Text>
              <Text style={[styles.kpiValue, { color: '#6D28D9' }]}>{summary.efficiency}%</Text>
            </View>
          </View>

          {/* Calendar Grid Container */}
          <View style={styles.calendarCard}>
            {/* Weekday Headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text
                  key={w}
                  style={[
                    styles.weekdayText,
                    idx === 0 && { color: '#EF4444' }, // Sunday in soft red
                  ]}
                >
                  {w}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6B46C1" />
                <Text style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>Loading schedule...</Text>
              </View>
            ) : (
              <View style={styles.daysGrid}>
                {/* Empty placeholder cells for startWeekday */}
                {Array.from({ length: startWeekday }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptyDayCell} />
                ))}

                {/* Day cells 1..daysInMonth */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const pad = (n) => String(n).padStart(2, '0');
                  const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
                  const dayData = dayAggregates[dateStr] || { expected: 0, collected: 0, count: 0 };

                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDateStr;
                  const hasDues = dayData.expected > 0;
                  const isFullyPaid = hasDues && dayData.collected >= dayData.expected;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedDayCell,
                      ]}
                      onPress={() => setSelectedDateStr(dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          isToday && styles.todayNumText,
                          isSelected && styles.selectedNumText,
                        ]}
                      >
                        {dayNum}
                      </Text>

                      {hasDues ? (
                        <View style={styles.dayBadgeBox}>
                          <Text
                            style={[
                              styles.dayDueText,
                              isSelected && { color: '#FFFFFF' },
                              !isSelected && isFullyPaid && { color: '#059669' },
                            ]}
                            numberOfLines={1}
                          >
                            ₹{dayData.expected >= 1000 ? `${Math.round(dayData.expected / 1000)}k` : dayData.expected}
                          </Text>
                          <View
                            style={[
                              styles.dueDot,
                              isFullyPaid ? styles.dueDotPaid : styles.dueDotPending,
                              isSelected && { backgroundColor: '#FFFFFF' },
                            ]}
                          />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Selected Date Summary & Drawer List */}
          <View style={styles.selectedDaySection}>
            <View style={styles.selectedDayHeader}>
              <View>
                <Text style={styles.selectedDayTitle}>
                  {selectedDateStr === todayStr ? "Today's Collection" : `Schedule: ${selectedDateStr}`}
                </Text>
                <Text style={styles.selectedDaySubtitle}>
                  {selectedDayData.records.length} Scheduled Installment{selectedDayData.records.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.selectedDayDueAmt}>{formatINR(selectedDayData.expected)}</Text>
                <Text style={styles.selectedDayPaidAmt}>
                  Collected: <Text style={{ color: '#059669', fontWeight: '800' }}>{formatINR(selectedDayData.collected)}</Text>
                </Text>
              </View>
            </View>

            {/* Search filter in Day List */}
            {selectedDayData.records.length > 3 ? (
              <View style={styles.daySearchBox}>
                <MaterialCommunityIcons name="magnify" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.daySearchInput}
                  placeholder="Search borrower by name or code..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Borrower Records List */}
            {filteredDayRecords.length === 0 ? (
              <View style={styles.emptyDayBox}>
                <MaterialCommunityIcons name="calendar-check-outline" size={36} color="#CBD5E1" />
                <Text style={styles.emptyDayTitle}>No scheduled dues on this day</Text>
                <Text style={styles.emptyDaySubtitle}>
                  Select another date in the calendar or change the frequency filter.
                </Text>
              </View>
            ) : (
              filteredDayRecords.map((item, index) => {
                const isPaid = item.status === 'PAID' || (item.paidAmount && item.paidAmount >= item.dueAmount);
                const isOverdue = item.status === 'OVERDUE';
                const isDueAtEnd = item.status === 'DUE_AT_END';

                return (
                  <TouchableOpacity
                    key={item.id || item.loanId || index}
                    style={styles.borrowerRecordCard}
                    onPress={() => {
                      setSelectedBorrower({
                        loanId: item.loanId || item.id,
                        loanNumber: item.loanCode || item.loan_number,
                        customerName: item.customerName || item.borrowerName || item.name,
                        customerPhone: item.customerPhone || item.phone,
                        shopName: item.shopName,
                        expectedAmount: item.dueAmount || item.amount,
                      });
                      setBorrowerModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recordLeft}>
                      <View style={[styles.avatarCircle, isPaid && { backgroundColor: '#ECFDF5' }]}>
                        <MaterialCommunityIcons
                          name={isPaid ? 'check-circle' : isDueAtEnd ? 'target' : 'account'}
                          size={18}
                          color={isPaid ? '#059669' : isDueAtEnd ? '#7C3AED' : '#6B46C1'}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.recordName} numberOfLines={1}>
                          {item.customerName || item.borrowerName || item.name || 'Borrower'}
                        </Text>
                        <Text style={styles.recordSub} numberOfLines={1}>
                          {item.loanCode || item.customerCode || 'LN'} • {item.frequency || 'Weekly'}
                          {item.shopName ? ` • ${item.shopName}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.recordRight}>
                      <Text style={styles.recordDueAmt}>{formatINR(item.dueAmount || item.amount || 0)}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          isPaid && styles.statusPillPaid,
                          isOverdue && styles.statusPillOverdue,
                          isDueAtEnd && styles.statusPillEnd,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            isPaid && { color: '#059669' },
                            isOverdue && { color: '#BE123C' },
                            isDueAtEnd && { color: '#7C3AED' },
                          ]}
                        >
                          {isPaid ? 'PAID' : isDueAtEnd ? 'TARGET' : isOverdue ? 'OVERDUE' : 'PENDING'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Borrower Detailed Log Modal */}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    padding: 14,
  },
  monthNavRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
  },
  monthStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  freqTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  freqPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: 'center',
  },
  freqPillActive: {
    backgroundColor: '#6B46C1',
  },
  freqText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  freqTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 48,
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: '#6B46C1',
    backgroundColor: '#F5F3FF',
  },
  selectedDayCell: {
    backgroundColor: '#6B46C1',
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  todayNumText: {
    color: '#6B46C1',
    fontWeight: '900',
  },
  selectedNumText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  dayDueText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B46C1',
  },
  dueDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dueDotPending: {
    backgroundColor: '#F59E0B',
  },
  dueDotPaid: {
    backgroundColor: '#10B981',
  },
  selectedDaySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 30,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedDaySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  selectedDayDueAmt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  selectedDayPaidAmt: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  daySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  daySearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    marginLeft: 6,
    padding: 0,
  },
  emptyDayBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyDayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  emptyDaySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
  },
  borrowerRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  recordSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  recordDueAmt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  statusPillPaid: {
    backgroundColor: '#ECFDF5',
  },
  statusPillOverdue: {
    backgroundColor: '#FFF1F2',
  },
  statusPillEnd: {
    backgroundColor: '#FAF5FF',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
});
