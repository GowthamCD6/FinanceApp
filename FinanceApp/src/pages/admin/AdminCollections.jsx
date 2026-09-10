import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import CollectPaymentModal from '../../components/modals/CollectPaymentModal';
import DigitalReceiptModal from '../../components/modals/DigitalReceiptModal';

const AdminCollections = () => {
  const { loans, customers, collectPayment, fundMetrics } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [activeCollectItem, setActiveCollectItem] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Gather pending installments across active and overdue loans
  const allPendingCollections = [];
  loans.forEach((loan) => {
    const cust = customers.find((c) => c.id === loan.customerId || c.id === loan.customer_id) || {
      name: loan.customer_name || loan.customerName || 'Customer',
    };
    const items = loan.schedule || loan.installments || [];
    items.forEach((inst) => {
      const status = inst.status;
      if (status === 'PENDING' || status === 'OVERDUE') {
        const instNum = inst.installmentNumber || inst.installment_number || 1;
        const dueDt = inst.dueDate || inst.due_date || '2026-09-15';
        const expAmt = inst.expectedAmount || inst.expected_amount || loan.installment_amount || loan.installmentAmount || 2000;
        const princ = loan.principal || loan.principal_amount || 20000;
        const repay = loan.totalRepayment || loan.total_repayment_amount || 22000;
        const princSplit = inst.principalComponent || inst.principal_comp || Math.round(expAmt * (princ / repay));
        const incSplit = inst.incomeComponent || inst.income_comp || (expAmt - princSplit);

        allPendingCollections.push({
          ...inst,
          id: inst.id || `${loan.id}_${instNum}`,
          installmentNumber: instNum,
          dueDate: dueDt,
          expectedAmount: expAmt,
          loanId: loan.id,
          loanNumber: loan.loanNumber || loan.loan_number || '#004',
          loanType: loan.type || loan.loan_type || 'WEEKLY',
          customerName: cust.name || cust.full_name || 'Customer',
          customerId: cust.id,
          principalSplit: princSplit,
          incomeSplit: incSplit,
          status: status,
          rawLoan: loan,
          rawInstallment: inst,
        });
      }
    });
  });

  const pendingCollections = allPendingCollections.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      !search ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.loanNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenCollect = (item) => {
    setActiveCollectItem(item);
  };

  const handleCollectSuccess = (receiptData) => {
    setActiveCollectItem(null);
    setActiveReceipt(receiptData);
  };

  const renderItem = ({ item }) => {
    const isOverdue = item.status === 'OVERDUE';

    return (
      <View style={[styles.collectionCard, isOverdue && styles.overdueCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.loanMeta}>Loan {item.loanNumber} • Inst #{item.installmentNumber} ({item.loanType})</Text>
          </View>
          <Badge 
            label={item.status} 
            variant={isOverdue ? 'danger' : 'warning'} 
            size="sm"
          />
        </View>

        <View style={styles.dueRow}>
          <View>
            <Text style={styles.dueLabel}>Amount Due</Text>
            <Text style={styles.dueAmount}>{formatINR(item.expectedAmount)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={styles.dateVal}>{formatDate(item.dueDate)}</Text>
          </View>
        </View>

        {/* Breakdown of principal vs income split */}
        <View style={styles.splitBox}>
          <Text style={styles.splitText}>
            Principal Return: <Text style={styles.splitHighlight}>{formatINR(item.principalSplit)}</Text>  •  
            Lending Income: <Text style={[styles.splitHighlight, { color: '#059669' }]}>{formatINR(item.incomeSplit)}</Text>
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.collectBtn}
          onPress={() => handleOpenCollect(item)}
          activeOpacity={0.8}
        >
          <Icon name="collections" size={16} color="#FFFFFF" />
          <Text style={styles.collectBtnText}>Collect {formatINR(item.expectedAmount)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Daily Collections</Text>
          <Text style={styles.subtitle}>Field Collection & Instant Capital Circulation</Text>
        </View>
      </View>

      {/* Summary strip */}
      <View style={styles.statsStrip}>
        <View style={styles.stripCol}>
          <Text style={styles.stripLabel}>Today Collected</Text>
          <Text style={[styles.stripVal, { color: '#059669' }]}>{formatINR(fundMetrics.todayCollection)}</Text>
        </View>
        <View style={styles.stripCol}>
          <Text style={styles.stripLabel}>Pending Today</Text>
          <Text style={[styles.stripVal, { color: '#D97706' }]}>{formatINR(fundMetrics.pendingCollection)}</Text>
        </View>
        <View style={styles.stripCol}>
          <Text style={styles.stripLabel}>Central Cash</Text>
          <Text style={[styles.stripVal, { color: '#2563EB' }]}>{formatINR(fundMetrics.availableCash)}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <View style={styles.searchInner}>
          <Icon name="search" size={15} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search borrower or loan #..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'ALL', label: 'All Due' },
          { key: 'PENDING', label: 'Regular Pending' },
          { key: 'OVERDUE', label: 'Overdue Dues' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, filter === t.key && styles.activeTab]}
            onPress={() => setFilter(t.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, filter === t.key && styles.activeTabText]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={pendingCollections}
        keyExtractor={(item) => `${item.loanId}_${item.installmentNumber}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>All collections for today are settled!</Text>
          </View>
        }
      />

      {/* Interactive Collection Modal */}
      {activeCollectItem && (
        <CollectPaymentModal
          visible={!!activeCollectItem}
          loan={activeCollectItem.rawLoan}
          installment={activeCollectItem.rawInstallment}
          onClose={() => setActiveCollectItem(null)}
          onCollectPayment={({ loanId, installmentId, amount, paymentMethod }) => {
            collectPayment(loanId, activeCollectItem.installmentNumber, amount, paymentMethod);
          }}
          onSuccess={handleCollectSuccess}
        />
      )}

      {/* Shareable Digital Receipt Modal */}
      <DigitalReceiptModal
        visible={!!activeReceipt}
        receiptData={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stripCol: {
    alignItems: 'center',
  },
  stripLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  stripVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 60,
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  overdueCard: {
    borderColor: '#FCA5A5',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  loanMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  dueAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  dateVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  splitBox: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 6,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  splitText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
  },
  splitHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  collectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
});

export default AdminCollections;
