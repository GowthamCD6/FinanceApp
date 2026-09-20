import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Share,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { apiService } from '../../../../services/apiService';
import { formatINR, formatDate } from '../../../../utils/helpers';
import { useApp } from '../../../../context/AppContext';

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
  const d = new Date(refDate);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
  };
};

const getMonthRange = (refDate = new Date()) => {
  const first = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  const last = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  return {
    start: formatDateStr(first),
    end: formatDateStr(last),
  };
};

// Status Badge Helper
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

// Memoized Single Payment Record Card for 60fps Smooth Scrolling
const RecordCard = React.memo(({ item, onOpenCollect, onOpenDetail }) => {
  const statusStyle = getStatusStyle(item.status);
  const initial = item.customerName ? item.customerName.charAt(0).toUpperCase() : 'C';

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

      {/* Loan Meta Tags Strip */}
      <View style={styles.metaStrip}>
        <View style={styles.metaChip}>
          <MaterialCommunityIcons name="file-document-outline" size={12} color="#6B46C1" />
          <Text style={styles.metaChipText}>{item.loanNumber}</Text>
        </View>

        <View style={styles.metaChip}>
          <MaterialCommunityIcons name="repeat" size={12} color="#6B7280" />
          <Text style={styles.metaChipText}>{item.frequency}</Text>
        </View>

        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>Inst. #{item.installmentNumber}</Text>
        </View>

        <View style={[styles.metaChip, { marginLeft: 'auto' }]}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={12}
            color={item.status === 'OVERDUE' ? '#DC2626' : '#6B7280'}
          />
          <Text
            style={[
              styles.metaChipText,
              item.status === 'OVERDUE' && { color: '#DC2626', fontWeight: '700' },
            ]}
          >
            Due: {item.dueDate ? formatDate(item.dueDate) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Amount Breakdown Row */}
      <View style={styles.amountContainer}>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Scheduled Due</Text>
          <Text style={styles.amountVal}>{formatINR(item.expectedAmount)}</Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amountVal, { color: '#10B981' }]}>
            {formatINR(item.paidAmount)}
          </Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Balance Left</Text>
          <Text
            style={[
              styles.amountVal,
              { color: item.balance > 0 ? '#EF4444' : '#10B981' },
            ]}
          >
            {formatINR(item.balance)}
          </Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.cardFooter}>
        {item.customerPhone ? (
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="phone" size={16} color="#6B46C1" />
            <Text style={styles.actionIconBtnText}>Call</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onOpenDetail(item)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information-outline" size={16} color="#6B7280" />
          <Text style={[styles.actionIconBtnText, { color: '#6B7280' }]}>Details</Text>
        </TouchableOpacity>

        {item.balance > 0 ? (
          <TouchableOpacity
            style={styles.collectBtn}
            onPress={() => onOpenCollect(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cash-fast" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.collectBtnText}>Collect {formatINR(item.balance)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.settledBadge}>
            <MaterialCommunityIcons name="check-all" size={14} color="#059669" />
            <Text style={styles.settledBadgeText}>Fully Settled</Text>
          </View>
        )}
      </View>
    </View>
  );
});

export const AdminReports = () => {
  const { currentUser } = useApp();

  // Filter States
  const [datePreset, setDatePreset] = useState('ALL'); // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL'); // 'ALL' | 'WEEKLY' | 'DAILY' | 'MONTHLY'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'UNPAID' | 'PARTIAL' | 'PAID'
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
  const fetchReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiService.getPaymentReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        frequency: frequencyFilter,
        status: statusFilter,
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
  }, [startDate, endDate, frequencyFilter, statusFilter]);

  // Initial & Filter-Triggered Fetch
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Preset Date Selection Handler
  const handlePresetSelect = useCallback((preset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      const t = formatDateStr(today);
      setStartDate(t);
      setEndDate(t);
    } else if (preset === 'THIS_WEEK') {
      const w = getWeekRange(today);
      setStartDate(w.start);
      setEndDate(w.end);
    } else if (preset === 'THIS_MONTH') {
      const m = getMonthRange(today);
      setStartDate(m.start);
      setEndDate(m.end);
    }
  }, []);

  // Client-Side Search Filtering
  const filteredRecords = useMemo(() => {
    if (!report.records) return [];
    if (!searchQuery.trim()) return report.records;

    const query = searchQuery.toLowerCase().trim();
    return report.records.filter((rec) => {
      const name = (rec.customerName || '').toLowerCase();
      const phone = (rec.customerPhone || '').toLowerCase();
      const loanNo = (rec.loanNumber || '').toLowerCase();
      const shop = (rec.shopName || '').toLowerCase();
      return (
        name.includes(query) ||
        phone.includes(query) ||
        loanNo.includes(query) ||
        shop.includes(query)
      );
    });
  }, [report.records, searchQuery]);

  // Open Collect Modal
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
      fetchReport(true);
    } catch (err) {
      console.error('Error recording payment:', err);
      Alert.alert('Collection Failed', err.message || 'Failed to record payment on server.');
    } finally {
      setCollecting(false);
    }
  };

  // Share Summary Report
  const handleShareSummary = useCallback(async () => {
    try {
      const summary = report.summary;
      const text = `📊 *Apex Finance — Collection Report*\n` +
        `📅 Period: ${datePreset}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💰 Expected: ${formatINR(summary.expected)}\n` +
        `✅ Collected: ${formatINR(summary.collected)}\n` +
        `⚠️ Outstanding: ${formatINR(summary.outstanding)}\n` +
        `📈 Recovery Rate: ${summary.recovery_rate}%\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Overdue: ${summary.overdue_count} | Unpaid: ${summary.unpaid_count} | Paid: ${summary.paid_count}\n` +
        `Total Records: ${summary.total_records}`;

      await Share.share({
        title: 'Collection Report',
        message: text,
      });
    } catch (err) {
      console.log('Error sharing summary:', err);
    }
  }, [report.summary, datePreset]);

  // Render FlatList Header with all filters, search, and metrics
  const renderListHeader = () => {
    return (
      <View>
        {/* Top Control Bar: Date Presets & Quick Actions */}
        <View style={styles.topControlRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetContainer}
          >
            {[
              { key: 'ALL', label: 'All Time', icon: 'calendar-range' },
              { key: 'TODAY', label: 'Today', icon: 'calendar-today' },
              { key: 'THIS_WEEK', label: 'This Week', icon: 'calendar-week' },
              { key: 'THIS_MONTH', label: 'This Month', icon: 'calendar-month' },
            ].map((p) => {
              const active = datePreset === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                  onPress={() => handlePresetSelect(p.key)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={p.icon}
                    size={13}
                    color={active ? '#FFFFFF' : '#6B7280'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quick Refresh & Share */}
          <View style={styles.headerIconsRow}>
            <TouchableOpacity
              style={styles.miniIconBtn}
              onPress={() => fetchReport(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#6B46C1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.miniIconBtn, { marginLeft: 6 }]}
              onPress={handleShareSummary}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6B46C1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequency Filter Tabs */}
        <View style={styles.frequencyContainer}>
          {['ALL', 'WEEKLY', 'DAILY', 'MONTHLY'].map((freq) => {
            const active = frequencyFilter === freq;
            return (
              <TouchableOpacity
                key={freq}
                style={[styles.freqTab, active && styles.freqTabActive]}
                onPress={() => setFrequencyFilter(freq)}
                activeOpacity={0.7}
              >
                <Text style={[styles.freqTabText, active && styles.freqTabTextActive]}>
                  {freq === 'ALL' ? 'All Freq' : freq.charAt(0) + freq.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary Metric Dashboard (4 Cards in 2x2 Grid) */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Expected */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>TOTAL EXPECTED</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="calendar-clock" size={15} color="#6B46C1" />
              </View>
            </View>
            <Text style={styles.metricValue}>{formatINR(report.summary.expected)}</Text>
            <Text style={styles.metricSubtext}>
              {report.summary.total_records} Total Installments
            </Text>
          </View>

          {/* Card 2: Collected */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>COLLECTED</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="check-decagram" size={15} color="#10B981" />
              </View>
            </View>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>
              {formatINR(report.summary.collected)}
            </Text>
            <Text style={styles.metricSubtext}>
              {report.summary.paid_count} Settled Loans
            </Text>
          </View>

          {/* Card 3: Outstanding */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>OUTSTANDING</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF2F2' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#EF4444" />
              </View>
            </View>
            <Text style={[styles.metricValue, { color: '#EF4444' }]}>
              {formatINR(report.summary.outstanding)}
            </Text>
            <Text style={styles.metricSubtext}>
              {report.summary.overdue_count + report.summary.unpaid_count} Pending Payments
            </Text>
          </View>

          {/* Card 4: Recovery Rate */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>RECOVERY RATE</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="percent" size={15} color="#3B82F6" />
              </View>
            </View>
            <Text style={[styles.metricValue, { color: '#6B46C1' }]}>
              {report.summary.recovery_rate}%
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, report.summary.recovery_rate || 0)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Status Filter Pills Row */}
        <View style={styles.statusSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusContainer}
          >
            {[
              { key: 'ALL', label: 'All', count: report.summary.total_records, color: '#6B46C1' },
              { key: 'OVERDUE', label: 'Overdue', count: report.summary.overdue_count, color: '#EF4444' },
              { key: 'UNPAID', label: 'Unpaid', count: report.summary.unpaid_count, color: '#F59E0B' },
              { key: 'PARTIAL', label: 'Partial', count: report.summary.partial_count, color: '#3B82F6' },
              { key: 'PAID', label: 'Paid', count: report.summary.paid_count, color: '#10B981' },
            ].map((s) => {
              const active = statusFilter === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusPill,
                    active && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => setStatusFilter(s.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      active && { color: '#FFFFFF' },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <View
                    style={[
                      styles.statusBadgeCount,
                      active && { backgroundColor: 'rgba(255,255,255,0.25)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeCountText,
                        active && { color: '#FFFFFF' },
                      ]}
                    >
                      {s.count || 0}
                    </Text>
                  </View>
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
              placeholder="Search customer, phone, loan code..."
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

        {/* Records Count Bar */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>
            PAYMENT OBLIGATIONS ({filteredRecords.length})
          </Text>
          <Text style={styles.recordsHeaderSub}>
            Sorted by urgency & due date
          </Text>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6B46C1" />
            <Text style={styles.loadingText}>Fetching live reports...</Text>
          </View>
        )}
      </View>
    );
  };

  // Render Empty State
  const renderEmpty = () => {
    if (loading) return null;

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
        {(datePreset !== 'ALL' || frequencyFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
          <TouchableOpacity
            style={styles.resetFilterBtn}
            onPress={() => {
              setDatePreset('ALL');
              setStartDate('');
              setEndDate('');
              setFrequencyFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="filter-remove-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.resetFilterText}>Reset All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render Single Record Item
  const renderItem = ({ item }) => (
    <RecordCard
      item={item}
      onOpenCollect={openCollectModal}
      onOpenDetail={openDetailModal}
    />
  );

  // Key extractor
  const keyExtractor = (item, index) => {
    return String(item.scheduleId || `${item.loanId}-${item.installmentNumber}-${index}`);
  };

  return (
    <View style={styles.fullscreenContainer}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* High-Performance Virtualized FlatList */}
      <FlatList
        data={filteredRecords}
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
            onRefresh={() => fetchReport(true)}
            colors={['#6B46C1']}
            tintColor="#6B46C1"
          />
        }
      />

      {/* Collect Payment Modal */}
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

  // Top Control Bar
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    paddingRight: 16,
  },
  presetContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  miniIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Frequency Tabs
  frequencyContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
  },
  freqTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  freqTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  freqTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  freqTabTextActive: {
    color: '#6B46C1',
    fontWeight: '700',
  },

  // Metric Dashboard Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  metricCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  metricIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  metricSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#6B46C1',
    borderRadius: 2,
  },

  // Status Filter Pills
  statusSection: {
    marginTop: 8,
  },
  statusContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 6,
  },
  statusBadgeCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  statusBadgeCountText: {
    fontSize: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  recordsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  recordsHeaderSub: {
    fontSize: 11,
    color: '#9CA3AF',
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
