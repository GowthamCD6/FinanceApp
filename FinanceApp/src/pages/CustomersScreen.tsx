import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Customer, CustomerType } from '../types';
import { formatINR, formatDate } from '../utils/helpers';
import { evaluateEligibility } from '../utils/loanCalculators';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { FadeInView } from '../animations/FadeInView';

export const CustomersScreen: React.FC = () => {
  const { customers, eligibilities, addNewCustomer } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'SHOPKEEPER' | 'COMMON'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Customer Form State
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Ahmedabad');
  const [newType, setNewType] = useState<CustomerType>('SHOPKEEPER');
  const [newShopName, setNewShopName] = useState<string>('');

  const filteredCustomers = customers.filter((c) => {
    if (filterType === 'SHOPKEEPER' && c.customer_type !== 'SHOPKEEPER') return false;
    if (filterType === 'COMMON' && c.customer_type !== 'COMMON_CUSTOMER') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.full_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.shop_name && c.shop_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Missing Fields', 'Please provide at least a full name and phone number.');
      return;
    }

    const created = addNewCustomer({
      full_name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || 'Local Market Area',
      city: newCity.trim() || 'City Center',
      customer_type: newType,
      shop_name: newType === 'SHOPKEEPER' ? newShopName.trim() || 'Retail Merchant' : undefined,
    });

    Alert.alert('Client Enrolled', `Customer ${created.full_name} (${created.customer_code}) registered.`);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewShopName('');
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients, phone or shop..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.chipRow}>
            {[
              { key: 'ALL', label: 'All Clients' },
              { key: 'SHOPKEEPER', label: '🏪 Shopkeepers' },
              { key: 'COMMON', label: '👤 Common' },
            ].map((f) => {
              const isSelected = filterType === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                  onPress={() => setFilterType(f.key as any)}
                >
                  <Text style={[styles.filterText, isSelected && styles.selectedFilterText]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Add Client"
            variant="primary"
            size="sm"
            icon="➕"
            onPress={() => setShowAddModal(true)}
          />
        </View>
      </View>

      {/* Customer List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredCustomers.map((cust, idx) => {
          // Check repeat eligibility
          const savedElig = eligibilities.find((e) => e.customer_id === cust.id);
          const evalResult = savedElig || evaluateEligibility(
            cust.customer_type,
            cust.total_loans_count || 1,
            cust.overdue_count && cust.overdue_count > 0 ? 65 : 98,
            cust.overdue_count || 0
          );

          const isEligible = evalResult.status === 'ELIGIBLE';

          return (
            <FadeInView key={cust.id} delay={idx * 50}>
              <TouchableOpacity
                style={styles.customerCard}
                onPress={() => setSelectedCustomer(cust)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.custName}>{cust.full_name}</Text>
                    <Text style={styles.custCode}>{cust.customer_code} • {cust.city}</Text>
                  </View>
                  <Badge
                    label={cust.customer_type === 'SHOPKEEPER' ? 'Shopkeeper' : 'Common Client'}
                    variant={cust.customer_type === 'SHOPKEEPER' ? 'secondary' : 'neutral'}
                    size="sm"
                  />
                </View>

                {cust.shop_name && (
                  <Text style={styles.shopName}>🏪 {cust.shop_name}</Text>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoItem}>📞 {cust.phone}</Text>
                  <Text style={styles.infoItem}>🏠 {cust.address.slice(0, 24)}...</Text>
                </View>

                {/* Repeat Loan Eligibility Box */}
                <View style={[styles.eligibilityBox, isEligible ? styles.eligGood : styles.eligWarn]}>
                  <View style={styles.eligHeader}>
                    <Text style={styles.eligTitle}>
                      {isEligible ? '✨ Repeat Loan Eligible' : '⚠️ Eligibility Under Review'}
                    </Text>
                    {isEligible && (
                      <Text style={styles.eligLimit}>
                        Up to {formatINR('eligible_amount' in evalResult ? evalResult.eligible_amount : evalResult.maxEligibleAmount)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.eligReason} numberOfLines={2}>
                    {evalResult.reason}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.activeLoansBadge}>
                    {cust.active_loans_count || 0} Active Loans • {cust.overdue_count ? `⚠️ ${cust.overdue_count} Overdue` : '✓ Healthy Record'}
                  </Text>
                  <Text style={styles.viewDetailsText}>Profile ➔</Text>
                </View>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
      </ScrollView>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Modal visible={!!selectedCustomer} transparent animationType="slide" onRequestClose={() => setSelectedCustomer(undefined)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedCustomer.full_name}</Text>
                  <Text style={styles.modalSub}>{selectedCustomer.customer_code} • Enrolled {selectedCustomer.registration_date}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCustomer(undefined)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Contact & Business Details</Text>
                  <Text style={styles.detailLine}>📱 Primary Phone: {selectedCustomer.phone}</Text>
                  {selectedCustomer.alternate_phone && (
                    <Text style={styles.detailLine}>📞 Alternate: {selectedCustomer.alternate_phone}</Text>
                  )}
                  {selectedCustomer.shop_name && (
                    <Text style={styles.detailLine}>🏪 Store: {selectedCustomer.shop_name}</Text>
                  )}
                  <Text style={styles.detailLine}>📍 Address: {selectedCustomer.address}, {selectedCustomer.city}</Text>
                  <Text style={styles.detailLine}>🏷️ Category: {selectedCustomer.customer_type}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Repayment Performance & Repeat Limit</Text>
                  <Text style={styles.detailLine}>
                    Total Historical Loans: {selectedCustomer.total_loans_count || 1}
                  </Text>
                  <Text style={styles.detailLine}>
                    Currently Active Loans: {selectedCustomer.active_loans_count || 0}
                  </Text>
                  <Text style={styles.detailLine}>
                    Delinquency Incidents: {selectedCustomer.overdue_count || 0}
                  </Text>
                </View>

                <Button
                  title="Close Profile"
                  variant="outline"
                  onPress={() => setSelectedCustomer(undefined)}
                  style={{ marginTop: spacing.md }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add New Customer Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Enroll New Client</Text>
                <Text style={styles.modalSub}>Register Shopkeeper or Household Borrower</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <Text style={styles.inputLabel}>Borrower Category</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, newType === 'SHOPKEEPER' && styles.selectedTypeBtn]}
                  onPress={() => setNewType('SHOPKEEPER')}
                >
                  <Text style={[styles.typeText, newType === 'SHOPKEEPER' && styles.selectedTypeText]}>
                    🏪 Retail Shopkeeper (Daily)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, newType === 'COMMON_CUSTOMER' && styles.selectedTypeBtn]}
                  onPress={() => setNewType('COMMON_CUSTOMER')}
                >
                  <Text style={[styles.typeText, newType === 'COMMON_CUSTOMER' && styles.selectedTypeText]}>
                    👤 Common Client (Weekly)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Anand Kumar"
                placeholderTextColor="#94A3B8"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 9820011223"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />

              {newType === 'SHOPKEEPER' && (
                <>
                  <Text style={styles.inputLabel}>Shop / Business Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Anand Supermarket"
                    placeholderTextColor="#94A3B8"
                    value={newShopName}
                    onChangeText={setNewShopName}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Shop 12, Station Road Market"
                placeholderTextColor="#94A3B8"
                value={newAddress}
                onChangeText={setNewAddress}
              />

              <View style={styles.actionRow}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => setShowAddModal(false)}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Register Client"
                  variant="primary"
                  onPress={handleCreateCustomer}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
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
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 38,
    marginBottom: spacing.xs,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  selectedFilterChip: {
    backgroundColor: colors.primaryDark,
  },
  filterText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#475569',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  custName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  custCode: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  shopName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primaryDark,
    marginTop: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  infoItem: {
    fontSize: 11,
    color: '#64748B',
  },
  eligibilityBox: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
  },
  eligGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  eligWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  eligHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  eligTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  eligLimit: {
    fontSize: 11,
    fontWeight: typography.weights.heavy,
    color: colors.successText,
  },
  eligReason: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  activeLoansBadge: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: '#475569',
  },
  viewDetailsText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  detailSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginBottom: 6,
  },
  detailLine: {
    fontSize: typography.sizes.xs,
    color: '#475569',
    marginVertical: 2,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedTypeBtn: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
  },
  typeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: typography.weights.medium,
  },
  selectedTypeText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
