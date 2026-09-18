import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Borrowers' },
  { id: 'WEEKLY', label: 'Weekly (10 Wks)' },
  { id: 'DAILY', label: 'Daily (Merchant)' },
  { id: 'MONTHLY', label: 'Monthly' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Status' },
  { id: 'ACTIVE', label: 'Active Loans' },
  { id: 'DUE_TODAY', label: 'Due Today' },
  { id: 'OVERDUE', label: 'Overdue' },
];

export const CustomersScreen = ({
  onOpenAddUser,
  onOpenDisburse,
  onOpenCollect,
  onOpenLedger,
  onOpenAddBorrower,
}) => {
  const { customers, loans } = useApp();

  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Match customers with active loans
  const enrichedCustomers = useMemo(() => {
    return customers.map((c) => {
      const custLoans = loans.filter((l) => String(l.customer_id) === String(c.id) || l.customer_phone === c.phone);
      const activeLoan = custLoans.find(
        (l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID' || l.status === 'OVERDUE'
      ) || custLoans[0] || null;

      const totalInstallments = activeLoan?.tenure_installments || (c.category === 'DAILY_MERCHANT' ? 25 : 10);
      const paidInstallments = activeLoan?.paid_installments || Math.min(totalInstallments, Math.floor((activeLoan?.total_paid || 0) / (activeLoan?.emi_amount || 1000)));
      const remainingBalance = activeLoan
        ? Number(activeLoan.outstanding_amount || (Number(activeLoan.total_repayment_amount || 0) - Number(activeLoan.total_paid || 0)) || 0)
        : 0;

      return {
        ...c,
        activeLoan,
        totalInstallments,
        paidInstallments,
        remainingBalance,
      };
    });
  }, [customers, loans]);

  const filtered = useMemo(() => {
    return enrichedCustomers.filter((c) => {
      // Category Tab Filter
      if (selectedTab === 'WEEKLY') {
        if (c.category && !c.category.includes('WEEKLY') && !c.activeLoan?.repayment_frequency?.includes('WEEK')) return false;
      } else if (selectedTab === 'DAILY') {
        if (c.category && !c.category.includes('DAILY') && !c.activeLoan?.repayment_frequency?.includes('DAILY')) return false;
      } else if (selectedTab === 'MONTHLY') {
        if (c.category && !c.category.includes('MONTHLY') && !c.activeLoan?.repayment_frequency?.includes('MONTH')) return false;
      }

      // Status Filter
      if (selectedStatus === 'ACTIVE' && (!c.activeLoan || c.activeLoan.status === 'COMPLETED')) return false;
      if (selectedStatus === 'OVERDUE' && c.activeLoan?.status !== 'OVERDUE') return false;

      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        const matchCode = (c.customer_code || '').toLowerCase().includes(q);
        const matchLoan = (c.activeLoan?.loan_code || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchCode || matchLoan;
      }
      return true;
    });
  }, [enrichedCustomers, selectedTab, selectedStatus, search]);

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Add Row */}
      <View style={styles.topActionBar}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={15} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, code..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={13} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.btnAddBorrower} onPress={onOpenAddUser} activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.btnAddBorrowerText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setSelectedTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Borrower Directory List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="account-group" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Borrowers Found</Text>
            <Text style={styles.emptySub}>No borrower accounts match your query.</Text>
          </View>
        ) : (
          filtered.map((c) => {
            const hasActiveLoan = Boolean(c.activeLoan && c.activeLoan.status !== 'COMPLETED');
            const isOverdue = c.activeLoan?.status === 'OVERDUE';
            const progressRatio = c.totalInstallments > 0 ? Math.min(1, c.paidInstallments / c.totalInstallments) : 0;

            return (
              <TouchableOpacity
                key={c.id}
                style={styles.borrowerCard}
                onPress={() => setSelectedBorrower(c)}
                activeOpacity={0.9}
              >
                {/* Top Info */}
                <View style={styles.cardTop}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarLetter}>{(c.name || 'B').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.nameBlock}>
                    <Text style={styles.borrowerName}>{c.name}</Text>
                    <Text style={styles.borrowerMeta}>
                      {c.phone || 'No phone'} • {c.address || c.occupation || 'Chennai'}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text
                      style={[
                        styles.statusPillText,
                        isOverdue
                          ? { color: '#DC2626' }
                          : hasActiveLoan
                          ? { color: '#059669' }
                          : { color: '#64748B' },
                      ]}
                    >
                      {isOverdue ? 'OVERDUE' : hasActiveLoan ? 'ACTIVE' : 'NO LOAN'}
                    </Text>
                  </View>
                </View>

                {/* Loan & Progress Info */}
                {hasActiveLoan ? (
                  <View style={styles.loanInfoStrip}>
                    <View style={styles.progressRow}>
                      <Text style={styles.schemeTagText}>
                        {c.activeLoan?.repayment_frequency || 'WEEKLY'} SCHEME ({c.activeLoan?.loan_code})
                      </Text>
                      <Text style={styles.installmentCountText}>
                        {c.paidInstallments} / {c.totalInstallments} Paid
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progressRatio * 100}%` },
                          isOverdue && { backgroundColor: '#DC2626' },
                        ]}
                      />
                    </View>

                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>Remaining Outstanding:</Text>
                      <Text style={styles.balanceAmount}>{formatINR(c.remainingBalance)}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noLoanStrip}>
                    <Text style={styles.noLoanText}>Eligible for new loan assignment</Text>
                  </View>
                )}

                {/* Bottom Actions */}
                <View style={styles.cardActions}>
                  {c.phone && (
                    <TouchableOpacity
                      style={styles.btnCall}
                      onPress={() => handleCall(c.phone)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="phone" size={13} color="#2563EB" />
                      <Text style={styles.btnCallText}>Call</Text>
                    </TouchableOpacity>
                  )}

                  {hasActiveLoan ? (
                    <TouchableOpacity
                      style={styles.btnCollectAction}
                      onPress={() => onOpenCollect && onOpenCollect(c.activeLoan)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="wallet" size={13} color="#FFFFFF" />
                      <Text style={styles.btnCollectText}>
                        Collect {formatINR(c.activeLoan?.emi_amount || 1000)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnDisburseAction}
                      onPress={() => onOpenDisburse && onOpenDisburse(c)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="plus" size={13} color="#FFFFFF" />
                      <Text style={styles.btnDisburseText}>Assign Loan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 5. Borrower Details Modal Dialog */}
      {selectedBorrower && (
        <Modal visible={Boolean(selectedBorrower)} transparent animationType="slide" onRequestClose={() => setSelectedBorrower(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedBorrower.name}</Text>
                  <Text style={styles.modalSub}>{selectedBorrower.customer_code} • {selectedBorrower.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedBorrower(null)} style={styles.modalCloseBtn}>
                  <MaterialCommunityIcons name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.profileMetaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Occupation</Text>
                    <Text style={styles.metaVal}>{selectedBorrower.occupation || 'Retail Merchant'}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Address / Area</Text>
                    <Text style={styles.metaVal}>{selectedBorrower.address || 'Anna Nagar, Chennai'}</Text>
                  </View>
                </View>

                {selectedBorrower.activeLoan && (
                  <View style={styles.ledgerBox}>
                    <Text style={styles.ledgerTitle}>ACTIVE LOAN CONTRACT</Text>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Principal Given:</Text>
                      <Text style={styles.ledgerVal}>{formatINR(selectedBorrower.activeLoan.principal_amount || 20000)}</Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Contracted Interest:</Text>
                      <Text style={[styles.ledgerVal, { color: '#059669' }]}>
                        +{formatINR(selectedBorrower.activeLoan.interest_amount || 2000)}
                      </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Total Repayable:</Text>
                      <Text style={[styles.ledgerVal, { fontWeight: '900' }]}>
                        {formatINR(selectedBorrower.activeLoan.total_repayment_amount || 22000)}
                      </Text>
                    </View>
                    <View style={[styles.ledgerRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 6 }]}>
                      <Text style={styles.ledgerLabel}>Outstanding Due:</Text>
                      <Text style={[styles.ledgerVal, { color: '#2563EB', fontWeight: '900', fontSize: 14 }]}>
                        {formatINR(selectedBorrower.remainingBalance)}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                {selectedBorrower.phone && (
                  <TouchableOpacity
                    style={styles.modalCallBtn}
                    onPress={() => handleCall(selectedBorrower.phone)}
                  >
                    <MaterialCommunityIcons name="phone" size={15} color="#2563EB" />
                    <Text style={styles.modalCallBtnText}>Call Borrower</Text>
                  </TouchableOpacity>
                )}
                {selectedBorrower.activeLoan ? (
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      const l = selectedBorrower.activeLoan;
                      setSelectedBorrower(null);
                      if (onOpenCollect) onOpenCollect(l);
                    }}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Record Payment</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      const b = selectedBorrower;
                      setSelectedBorrower(null);
                      if (onOpenDisburse) onOpenDisburse(b);
                    }}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Assign Loan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  btnAddBorrower: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  btnAddBorrowerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    paddingVertical: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    maxHeight: 34,
  },
  tabChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabChipTextActive: {
    color: '#2563EB',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  borrowerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  nameBlock: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  borrowerMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  loanInfoStrip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  schemeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  installmentCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  balanceAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  noLoanStrip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  noLoanText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  btnCallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  btnCollectAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  btnCollectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisburseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  btnDisburseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  profileMetaGrid: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  ledgerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  ledgerLabel: {
    fontSize: 11,
    color: '#475569',
  },
  ledgerVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  modalCallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  modalPrimaryBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CustomersScreen;
