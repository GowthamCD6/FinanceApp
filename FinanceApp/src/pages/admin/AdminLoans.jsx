import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import DisburseLoanModal from '../../components/modals/DisburseLoanModal';

const AdminLoans = ({ onSelectLoan, initialOpenNewLoan = false }) => {
  const { loans, customers } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(initialOpenNewLoan);

  useEffect(() => {
    if (initialOpenNewLoan) {
      setModalVisible(true);
    }
  }, [initialOpenNewLoan]);

  const filteredLoans = loans.filter((l) => {
    const cust = customers.find((c) => c.id === (l.customerId || l.customer_id));
    const lNum = l.loanNumber || l.loan_number || '';
    const cName = cust?.name || cust?.full_name || l.customer_name || '';
    const matchesSearch = 
      lNum.toLowerCase().includes(search.toLowerCase()) ||
      cName.toLowerCase().includes(search.toLowerCase());

    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && l.status === filter;
  });

  const renderItem = ({ item }) => {
    const cust = customers.find((c) => c.id === (item.customerId || item.customer_id)) || { 
      name: item.customer_name || 'Customer' 
    };
    const isCompleted = item.status === 'COMPLETED';
    const isOverdue = item.status === 'OVERDUE';
    const isActive = item.status === 'ACTIVE';

    const principal = item.principal_amount !== undefined ? item.principal_amount : (item.principal || 0);
    const totalRepay = item.total_repayment_amount !== undefined ? item.total_repayment_amount : (item.totalRepayment || 0);
    const paid = item.total_paid !== undefined ? item.total_paid : (item.paidAmount || 0);
    const remaining = item.outstanding_amount !== undefined ? item.outstanding_amount : (item.remainingAmount || Math.max(0, totalRepay - paid));
    const duration = item.total_installments || item.duration || 10;
    const loanType = item.repayment_frequency || item.loan_type || item.type || 'WEEKLY';

    return (
      <TouchableOpacity 
        style={[styles.loanCard, isOverdue && styles.loanCardOverdue]}
        onPress={() => onSelectLoan && onSelectLoan(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View>
            <View style={styles.numRow}>
              <Text style={styles.loanNum}>{item.loan_number || item.loanNumber || `#${item.id}`}</Text>
              {(item.parent_loan_id || item.parentLoanId) && (
                <View style={styles.repeatBadge}>
                  <Icon name="repeat" size={10} color="#7C3AED" />
                  <Text style={styles.repeatText}>Repeat #{item.parent_loan_id || item.parentLoanId}</Text>
                </View>
              )}
            </View>
            <Text style={styles.customerName}>{cust.name || cust.full_name}</Text>
          </View>
          <Badge 
            label={item.status} 
            variant={isCompleted ? 'success' : isOverdue ? 'danger' : isActive ? 'primary' : 'neutral'} 
            size="sm"
          />
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailVal}>{loanType}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Principal</Text>
            <Text style={styles.detailVal}>{formatINR(principal)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Repayment</Text>
            <Text style={styles.detailVal}>{formatINR(totalRepay)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Remaining</Text>
            <Text style={[styles.detailVal, { color: remaining > 0 ? '#D97706' : '#059669' }]}>
              {formatINR(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.subtext}>
            {duration} {loanType === 'WEEKLY' ? 'Weeks' : 'Days'} • Paid: {formatINR(paid)}
          </Text>
          <View style={styles.viewRow}>
            <Text style={styles.viewLink}>Manage & Collect</Text>
            <Icon name="arrow-right" size={12} color="#2563EB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top action bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Loan Operations</Text>
          <Text style={styles.subtitle}>Weekly & Daily Lending Portfolio</Text>
        </View>
        <TouchableOpacity 
          style={styles.newLoanBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.newLoanBtnText}>New Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Search box */}
      <View style={styles.searchBox}>
        <View style={styles.searchInner}>
          <Icon name="search" size={15} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by loan # or borrower..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.activeTab]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, filter === f && styles.activeTabText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loan List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No loans found matching your criteria.</Text>
          </View>
        }
      />

      {/* Disburse Loan Modal */}
      <DisburseLoanModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newLoanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  newLoanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    color: '#64748B',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 70,
    gap: 12,
  },
  loanCard: {
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
  loanCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderColor: '#FCA5A5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loanNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repeatText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '700',
  },
  customerName: {
    fontSize: 14,
    color: '#0F172A',
    marginTop: 2,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailCol: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewLink: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '800',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
});

export default AdminLoans;
