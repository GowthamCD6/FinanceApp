import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import MetricCard from '../../../../components/common/MetricCard';
import Icon from '../../../../components/common/Icon';

const INITIAL_WEEKLY_DUES = [
  { id: 'WD-101', customer_id: 101, customer_name: 'Kumar Swaminathan', phone: '98765 43210', loan_code: 'LN-WK-2024-001', week_number: 6, total_weeks: 10, due_amount: 600, due_date: '2026-09-12', status: 'PENDING', route: 'Triplicane High Rd' },
  { id: 'WD-102', customer_id: 102, customer_name: 'Priya Sundaram', phone: '98401 23456', loan_code: 'LN-WK-2024-004', week_number: 4, total_weeks: 10, due_amount: 1200, due_date: '2026-09-10', status: 'OVERDUE', route: 'Mylapore Tank' },
  { id: 'WD-103', customer_id: 103, customer_name: 'Mohamed Ibrahim', phone: '97908 11223', loan_code: 'LN-WK-2024-007', week_number: 8, total_weeks: 10, due_amount: 600, due_date: '2026-09-11', status: 'PENDING', route: 'Royapettah Bazaar' },
  { id: 'WD-104', customer_id: 104, customer_name: 'Rani Manikandan', phone: '94440 98765', loan_code: 'LN-WK-2024-012', week_number: 2, total_weeks: 10, due_amount: 900, due_date: '2026-09-10', status: 'PAID', route: 'T. Nagar Market' },
  { id: 'WD-105', customer_id: 105, customer_name: 'Karthik Raja', phone: '98841 55667', loan_code: 'LN-WK-2024-015', week_number: 9, total_weeks: 10, due_amount: 600, due_date: '2026-09-13', status: 'PENDING', route: 'Adyar Bus Stand' },
  { id: 'WD-106', customer_id: 106, customer_name: 'Anand Natarajan', phone: '98410 77889', loan_code: 'LN-WK-2024-018', week_number: 5, total_weeks: 10, due_amount: 1500, due_date: '2026-09-09', status: 'OVERDUE', route: 'Triplicane Big Mosque' },
];

const INITIAL_DAILY_COLLECTIONS = [
  { id: 'DC-201', customer_id: 201, customer_name: 'Murugan Provisions', shopkeeper_name: 'Murugan P.', phone: '98400 11223', loan_code: 'LN-DL-2024-022', day_number: 14, total_days: 25, due_amount: 400, collected_amount: 400, payment_mode: 'CASH', status: 'COLLECTED', receipt_no: 'RCP-DL-8821' },
  { id: 'DC-202', customer_id: 202, customer_name: 'Selvi Fancy Store', shopkeeper_name: 'Selvi K.', phone: '98402 33445', loan_code: 'LN-DL-2024-025', day_number: 7, total_days: 25, due_amount: 800, collected_amount: 0, payment_mode: null, status: 'PENDING', receipt_no: null },
  { id: 'DC-203', customer_id: 203, customer_name: 'Vasanth Tea Stall', shopkeeper_name: 'Vasanthan R.', phone: '98403 55667', loan_code: 'LN-DL-2024-028', day_number: 21, total_days: 25, due_amount: 300, collected_amount: 300, payment_mode: 'UPI', status: 'COLLECTED', receipt_no: 'RCP-DL-8824' },
  { id: 'DC-204', customer_id: 204, customer_name: 'Ayyappan Flower Stall', shopkeeper_name: 'Ayyappan M.', phone: '98404 77889', loan_code: 'LN-DL-2024-031', day_number: 18, total_days: 25, due_amount: 500, collected_amount: 0, payment_mode: null, status: 'MISSED', receipt_no: null },
  { id: 'DC-205', customer_id: 205, customer_name: 'Taj Mobile Accessories', shopkeeper_name: 'Tajudeen A.', phone: '98405 99001', loan_code: 'LN-DL-2024-034', day_number: 3, total_days: 25, due_amount: 600, collected_amount: 600, payment_mode: 'CASH', status: 'COLLECTED', receipt_no: 'RCP-DL-8829' },
  { id: 'DC-206', customer_id: 206, customer_name: 'Balaji Fruit Mart', shopkeeper_name: 'Balaji S.', phone: '98406 22334', loan_code: 'LN-DL-2024-037', day_number: 11, total_days: 25, due_amount: 400, collected_amount: 0, payment_mode: null, status: 'PENDING', receipt_no: null },
];

const AdminReports = () => {
  const { collectPayment } = useApp();
  const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'DAILY'
  const [weeklyList, setWeeklyList] = useState(INITIAL_WEEKLY_DUES);
  const [dailyList, setDailyList] = useState(INITIAL_DAILY_COLLECTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Collect Modal State
  const [collectModalVisible, setCollectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentMode, setPaymentMode] = useState('CASH');

  // Calculations
  const weeklyTotal = weeklyList.reduce((s, i) => s + i.due_amount, 0);
  const weeklyCollected = weeklyList.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.due_amount, 0);
  const weeklyPending = weeklyTotal - weeklyCollected;
  const weeklyOverdue = weeklyList.filter((i) => i.status === 'OVERDUE').length;

  const dailyTotal = dailyList.reduce((s, i) => s + i.due_amount, 0);
  const dailyCollected = dailyList.filter((i) => i.status === 'COLLECTED').reduce((s, i) => s + i.collected_amount, 0);
  const dailyPending = dailyTotal - dailyCollected;
  const dailyMissed = dailyList.filter((i) => i.status === 'MISSED').length;

  const handleOpenCollect = (item) => {
    setSelectedItem(item);
    setPaymentMode('CASH');
    setCollectModalVisible(true);
  };

  const handleConfirmCollect = () => {
    if (!selectedItem) return;

    if (activeTab === 'WEEKLY') {
      setWeeklyList((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: 'PAID' } : i))
      );
      if (collectPayment) {
        collectPayment({
          loanId: 1,
          amount: selectedItem.due_amount,
          paymentMethod: paymentMode,
        });
      }
      Alert.alert('Payment Recorded', `₹${selectedItem.due_amount} collected from ${selectedItem.customer_name} via ${paymentMode}.`);
    } else {
      const generatedReceipt = `RCP-DL-${Math.floor(1000 + Math.random() * 9000)}`;
      setDailyList((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? { ...i, status: 'COLLECTED', collected_amount: i.due_amount, payment_mode: paymentMode, receipt_no: generatedReceipt }
            : i
        )
      );
      if (collectPayment) {
        collectPayment({
          loanId: 2,
          amount: selectedItem.due_amount,
          paymentMethod: paymentMode,
        });
      }
      Alert.alert('Collection Success', `₹${selectedItem.due_amount} logged for ${selectedItem.customer_name}. Receipt: ${generatedReceipt}`);
    }

    setCollectModalVisible(false);
    setSelectedItem(null);
  };

  const filteredWeekly = weeklyList.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.customer_name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.loan_code.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredDaily = dailyList.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.customer_name.toLowerCase().includes(q) ||
        item.shopkeeper_name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.loan_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.tag}>RECOVERY LEDGERS</Text>
          <Text style={styles.title}>Field Operations Reports</Text>
          <Text style={styles.sub}>Track weekly borrower schedules & merchant daily collections</Text>
        </View>
      </View>

      {/* SEGMENTED TAB SWITCHER */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'WEEKLY' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('WEEKLY');
            setStatusFilter('ALL');
          }}
          activeOpacity={0.8}
        >
          <Icon name="calendar" size={16} color={activeTab === 'WEEKLY' ? '#2563EB' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'WEEKLY' && styles.tabButtonTextActive]}>
            Weekly Dues ({weeklyList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'DAILY' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('DAILY');
            setStatusFilter('ALL');
          }}
          activeOpacity={0.8}
        >
          <Icon name="collections" size={16} color={activeTab === 'DAILY' ? '#059669' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'DAILY' && styles.tabButtonTextActive]}>
            Daily Collections ({dailyList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUMMARY METRIC CARDS */}
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title={activeTab === 'WEEKLY' ? "This Week's Target" : "Today's Target"}
            value={formatINR(activeTab === 'WEEKLY' ? weeklyTotal : dailyTotal)}
            change={activeTab === 'WEEKLY' ? `${weeklyOverdue} Overdue` : `${dailyMissed} Missed`}
            isPositive={false}
            color={activeTab === 'WEEKLY' ? '#2563EB' : '#059669'}
            iconName="receipt"
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Collected So Far"
            value={formatINR(activeTab === 'WEEKLY' ? weeklyCollected : dailyCollected)}
            change={`Pending: ${formatINR(activeTab === 'WEEKLY' ? weeklyPending : dailyPending)}`}
            isPositive={true}
            color="#059669"
            iconName="check"
          />
        </View>
      </View>

      {/* SEARCH AND FILTERS */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Icon name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'WEEKLY' ? "Search borrower, phone, loan code..." : "Search shop, merchant, phone..."}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusChips}>
          {['ALL', activeTab === 'WEEKLY' ? 'PENDING' : 'PENDING', activeTab === 'WEEKLY' ? 'OVERDUE' : 'MISSED', activeTab === 'WEEKLY' ? 'PAID' : 'COLLECTED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.chip, statusFilter === st && styles.chipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TAB CONTENT */}
      <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* TAB 1: WEEKLY DUES */}
        {activeTab === 'WEEKLY' && (
          <>
            <Text style={styles.listHeaderTitle}>
              WHO NEED TO PAY THIS WEEK ({filteredWeekly.length})
            </Text>
            {filteredWeekly.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No weekly dues matching criteria.</Text>
              </View>
            ) : (
              filteredWeekly.map((item) => {
                const isOverdue = item.status === 'OVERDUE';
                const isPaid = item.status === 'PAID';
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.customer_name.charAt(0)}</Text>
                      </View>
                      <View style={styles.cardTitleBox}>
                        <Text style={styles.cardName}>{item.customer_name}</Text>
                        <Text style={styles.cardPhone}>{item.phone} • {item.route}</Text>
                      </View>
                      <View style={[
                        styles.badge,
                        isPaid && styles.badgePaid,
                        isOverdue && styles.badgeOverdue,
                        !isPaid && !isOverdue && styles.badgePending,
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          isPaid && styles.badgeTextPaid,
                          isOverdue && styles.badgeTextOverdue,
                          !isPaid && !isOverdue && styles.badgeTextPending,
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>LOAN CODE</Text>
                        <Text style={styles.infoValue}>{item.loan_code}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>CYCLE</Text>
                        <Text style={styles.infoValue}>Wk {item.week_number} of {item.total_weeks}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>DUE DATE</Text>
                        <Text style={[styles.infoValue, isOverdue && { color: '#DC2626', fontWeight: '700' }]}>
                          {item.due_date}
                        </Text>
                      </View>
                      <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                        <Text style={styles.infoLabel}>DUE AMOUNT</Text>
                        <Text style={styles.amountValue}>{formatINR(item.due_amount)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <View style={styles.cycleProgress}>
                        <View style={[styles.progressBar, { width: `${(item.week_number / item.total_weeks) * 100}%` }]} />
                      </View>
                      {!isPaid && (
                        <TouchableOpacity
                          style={styles.collectBtn}
                          onPress={() => handleOpenCollect(item)}
                          activeOpacity={0.8}
                        >
                          <Icon name="check" size={14} color="#FFFFFF" />
                          <Text style={styles.collectBtnText}>Collect ₹{item.due_amount}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: DAILY COLLECTIONS */}
        {activeTab === 'DAILY' && (
          <>
            <Text style={styles.listHeaderTitle}>
              DAILY COLLECTION SHEET ({filteredDaily.length})
            </Text>
            {filteredDaily.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No daily merchant records found.</Text>
              </View>
            ) : (
              filteredDaily.map((item) => {
                const isCollected = item.status === 'COLLECTED';
                const isMissed = item.status === 'MISSED';
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.avatar, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={[styles.avatarText, { color: '#059669' }]}>
                          {item.shopkeeper_name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.cardTitleBox}>
                        <Text style={styles.cardName}>{item.customer_name}</Text>
                        <Text style={styles.cardPhone}>Prop: {item.shopkeeper_name} • {item.phone}</Text>
                      </View>
                      <View style={[
                        styles.badge,
                        isCollected && styles.badgePaid,
                        isMissed && styles.badgeOverdue,
                        !isCollected && !isMissed && styles.badgePending,
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          isCollected && styles.badgeTextPaid,
                          isMissed && styles.badgeTextOverdue,
                          !isCollected && !isMissed && styles.badgeTextPending,
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>LOAN NUMBER</Text>
                        <Text style={styles.infoValue}>{item.loan_code}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>DAY CYCLE</Text>
                        <Text style={styles.infoValue}>Day {item.day_number} of {item.total_days}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>MODE / RECEIPT</Text>
                        <Text style={styles.infoValue}>
                          {item.receipt_no ? `${item.payment_mode} • ${item.receipt_no}` : 'Uncollected'}
                        </Text>
                      </View>
                      <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                        <Text style={styles.infoLabel}>DAILY DUE</Text>
                        <Text style={[styles.amountValue, { color: '#059669' }]}>{formatINR(item.due_amount)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <View style={styles.cycleProgress}>
                        <View style={[styles.progressBar, { width: `${(item.day_number / item.total_days) * 100}%`, backgroundColor: '#059669' }]} />
                      </View>
                      {!isCollected && (
                        <TouchableOpacity
                          style={[styles.collectBtn, { backgroundColor: '#059669' }]}
                          onPress={() => handleOpenCollect(item)}
                          activeOpacity={0.8}
                        >
                          <Icon name="check" size={14} color="#FFFFFF" />
                          <Text style={styles.collectBtnText}>Collect ₹{item.due_amount}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* QUICK REPAYMENT COLLECT MODAL */}
      <Modal visible={collectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Log Field Collection</Text>
                <Text style={styles.modalSub}>{selectedItem?.customer_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setCollectModalVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.amountDisplay}>
                <Text style={styles.amountDisplayLabel}>DUE AMOUNT TO COLLECT</Text>
                <Text style={styles.amountDisplayValue}>{formatINR(selectedItem?.due_amount || 0)}</Text>
                <Text style={styles.amountDisplaySub}>
                  {activeTab === 'WEEKLY' ? `Week ${selectedItem?.week_number} Installment` : `Day ${selectedItem?.day_number} Daily Collection`}
                </Text>
              </View>

              <Text style={styles.inputLabel}>SELECT PAYMENT METHOD</Text>
              <View style={styles.modeRow}>
                {['CASH', 'UPI', 'BANK_TRANSFER'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.modeBtn, paymentMode === mode && styles.modeBtnActive]}
                    onPress={() => setPaymentMode(mode)}
                  >
                    <Text style={[styles.modeBtnText, paymentMode === mode && styles.modeBtnTextActive]}>
                      {mode.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.confirmCollectBtn} onPress={handleConfirmCollect}>
                <Icon name="check" size={16} color="#FFFFFF" />
                <Text style={styles.confirmCollectBtnText}>Confirm & Print Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  sub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#1E40AF',
  },
  metricRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  metricHalf: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  statusChips: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePaid: {
    backgroundColor: '#ECFDF5',
  },
  badgeOverdue: {
    backgroundColor: '#FEE2E2',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextPaid: {
    color: '#059669',
  },
  badgeTextOverdue: {
    color: '#DC2626',
  },
  badgeTextPending: {
    color: '#D97706',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  infoCol: {},
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cycleProgress: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  collectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {},
  amountDisplay: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountDisplayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  amountDisplayValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#059669',
  },
  amountDisplaySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  confirmCollectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmCollectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminReports;
