import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import AddCustomerModal from '../../components/modals/AddCustomerModal';

const AdminCustomers = ({ onSelectCustomer }) => {
  const { customers, addCustomer, loans } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const custName = c?.name || c?.full_name || '';
    const custPhone = c?.phone || '';
    const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || 
                          custPhone.includes(search);
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'ACTIVE') {
      const hasActive = loans.some((l) => (l.customerId || l.customer_id) === c.id && l.status === 'ACTIVE');
      return matchesSearch && hasActive;
    }
    if (filterType === 'OVERDUE') {
      const hasOverdue = loans.some((l) => (l.customerId || l.customer_id) === c.id && l.status === 'OVERDUE');
      return matchesSearch && hasOverdue;
    }
    return matchesSearch;
  });

  const renderItem = ({ item }) => {
    const custName = item.name || item.full_name || 'Customer';
    const custLoans = loans.filter((l) => (l.customerId || l.customer_id) === item.id);
    const activeLoan = custLoans.find((l) => l.status === 'ACTIVE');
    const totalBorrowed = custLoans.reduce((sum, l) => sum + (l.principal_amount !== undefined ? l.principal_amount : (l.principal || 0)), 0);
    const remaining = custLoans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + (l.outstanding_amount !== undefined ? l.outstanding_amount : (l.remainingAmount || 0)), 0);

    return (
      <TouchableOpacity 
        style={styles.customerCard}
        onPress={() => onSelectCustomer && onSelectCustomer(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{custName.charAt(0)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{custName}</Text>
            <Text style={styles.phone}>{item.phone} • {item.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : (item.type || 'Common Customer')}</Text>
          </View>
          <Badge 
            label={activeLoan ? 'ACTIVE' : 'IDLE'} 
            variant={activeLoan ? 'success' : 'neutral'} 
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Loans</Text>
            <Text style={styles.statVal}>{custLoans.length}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Borrowed</Text>
            <Text style={styles.statVal}>{formatINR(totalBorrowed)}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Pending Dues</Text>
            <Text style={[styles.statVal, { color: remaining > 0 ? '#D97706' : '#059669' }]}>
              {formatINR(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewLink}>View Lending Lifecycle & History</Text>
          <Icon name="arrow-right" size={12} color="#2563EB" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header & Controls */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>Customers</Text>
          <Text style={styles.subtitle}>Borrower Profiles & Loan Histories</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <View style={styles.searchInner}>
          <Icon name="search" size={15} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['ALL', 'ACTIVE', 'OVERDUE'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterType === f && styles.filterChipActive]}
            onPress={() => setFilterType(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filterType === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No customers match your filter.</Text>
          </View>
        }
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCustomer={(customerData) => {
          addCustomer(customerData);
        }}
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 70,
    gap: 12,
  },
  customerCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  viewLink: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
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

export default AdminCustomers;
