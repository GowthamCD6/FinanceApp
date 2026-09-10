import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { formatINR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { FadeInView } from '../../animations/FadeInView';
import Icon from '../../components/common/Icon';
import AddCustomerModal from '../../components/modals/AddCustomerModal';

export const SuperAdminCustomers = ({ onSelectCustomer }) => {
  const { customers, addNewCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = customers.filter((c) => {
    if (filterType === 'SHOPKEEPER' && c.customer_type !== 'SHOPKEEPER') return false;
    if (filterType === 'COMMON' && c.customer_type !== 'COMMON_CUSTOMER') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const cName = c?.full_name || c?.name || '';
      const cShop = c?.shop_name || '';
      const cPhone = c?.phone || '';
      return (
        cName.toLowerCase().includes(q) ||
        cPhone.includes(q) ||
        cShop.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Bar with Search & Filters */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Icon name="search" size={15} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search borrowers, phone, or shop name..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close" size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              { key: 'ALL', label: 'All Borrowers' },
              { key: 'COMMON', label: 'Regular Clients' },
              { key: 'SHOPKEEPER', label: 'Shopkeepers' },
            ].map((f) => {
              const active = filterType === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilterType(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Borrowers Feed */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{filtered.length} Registered Borrowers</Text>

        {filtered.map((c, idx) => {
          const custName = c.full_name || c.name || 'Customer';
          const totalBorrow = c.total_borrowed || 0;
          const totalRepay = c.total_repaid || 0;
          const outstanding = c.outstanding || 0;
          const isShopkeeper = c.customer_type === 'SHOPKEEPER';

          return (
            <FadeInView key={c.id || idx} delay={idx * 30}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectCustomer && onSelectCustomer(c.id || c)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.custLeft}>
                    <View style={[styles.avatar, { backgroundColor: isShopkeeper ? '#EFF6FF' : '#F1F5F9' }]}>
                      <Icon name={isShopkeeper ? 'shop' : 'user'} size={16} color={isShopkeeper ? '#2563EB' : '#64748B'} />
                    </View>
                    <View>
                      <Text style={styles.custName}>{custName}</Text>
                      <Text style={styles.custCode}>{c.customer_code || `#CUST-${c.id}`} • Registered {c.registration_date || '2025-11-20'}</Text>
                    </View>
                  </View>
                  <Badge
                    label={isShopkeeper ? 'Shopkeeper' : 'Regular'}
                    variant={isShopkeeper ? 'secondary' : 'neutral'}
                    size="sm"
                  />
                </View>

                {c.shop_name && <Text style={styles.shopName}>{c.shop_name}</Text>}
                <Text style={styles.custPhone}>Phone: {c.phone} • {c.address || c.city || 'Ahmedabad'}</Text>

                {/* Financial Snapshot */}
                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statLabel}>Total Borrowed</Text>
                    <Text style={styles.statVal}>{formatINR(totalBorrow)}</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Total Repaid</Text>
                    <Text style={[styles.statVal, { color: '#059669' }]}>{formatINR(totalRepay)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.statLabel}>Outstanding</Text>
                    <Text style={[styles.statVal, { color: outstanding > 0 ? '#D97706' : '#64748B' }]}>
                      {formatINR(outstanding)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.loanBadge}>
                    {c.total_loans || 1} Loans ({c.completed_loans || 0} Paid • {c.active_loans || 1} Active)
                  </Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewDetails}>View Profile</Text>
                    <Icon name="arrow-right" size={11} color="#2563EB" />
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
      </ScrollView>

      {/* Add Customer Modal */}
      <AddCustomerModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCustomer={(newCust) => addNewCustomer(newCust)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { backgroundColor: '#FFFFFF', padding: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10, height: 38, marginBottom: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', paddingVertical: 0 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chipsScroll: { flexDirection: 'row' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  listContent: { padding: 14, paddingBottom: 70 },
  countText: { fontSize: 11, color: '#64748B', fontWeight: '700', marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  custLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  custName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  custCode: { fontSize: 10, color: '#64748B', marginTop: 2 },
  shopName: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  custPhone: { fontSize: 11, color: '#64748B', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  statLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase' },
  statVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  loanBadge: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetails: { fontSize: 11, color: '#2563EB', fontWeight: '800' },
});

export default SuperAdminCustomers;
