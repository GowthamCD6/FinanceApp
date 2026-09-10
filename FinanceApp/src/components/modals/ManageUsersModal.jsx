import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from '../common/Icon';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/helpers';

export const ManageUsersModal = ({ visible, onClose, onOpenAddUser }) => {
  if (!visible) return null;

  const { customers, currentOrganization, updateCustomerStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  const handleStatusChange = (customerId, status, name) => {
    updateCustomerStatus(customerId, status, 'Status updated via Manage Users modal');
    setFeedback(`${name} is now ${status}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const filtered = customers.filter((c) => {
    if (statusFilter !== 'ALL' && (c.status || 'ACTIVE') !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchCode = (c.customer_code || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchCode;
    }
    return true;
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.orgTag}>
                <Text style={styles.orgTagText}>{currentOrganization?.code || 'ORG-APEX'}</Text>
              </View>
              <Text style={styles.title}>User Status Governance</Text>
              <Text style={styles.sub}>Audit borrowers, credit limits & account statuses</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Feedback banner */}
          {feedback && (
            <View style={styles.feedbackBanner}>
              <Icon name="check" size={14} color="#065F46" />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}

          {/* Top Actions: Search + Add User Button */}
          <View style={styles.topActionsRow}>
            <View style={styles.searchBox}>
              <Icon name="search" size={14} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search user, phone or code..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {onOpenAddUser && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  onClose();
                  onOpenAddUser();
                }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status filters */}
          <View style={styles.filterRow}>
            {['ALL', 'ACTIVE', 'UNDER_REVIEW', 'BLOCKED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                onPress={() => setStatusFilter(st)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, statusFilter === st && styles.filterTextActive]}>
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* List of Users */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollList}>
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found matching filter.</Text>
              </View>
            ) : (
              filtered.map((c) => {
                const currentStatus = c.status || 'ACTIVE';
                const isBlocked = currentStatus === 'BLOCKED';
                const isUnderReview = currentStatus === 'UNDER_REVIEW';
                const isActive = currentStatus === 'ACTIVE';

                return (
                  <View key={c.id} style={styles.userItem}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userCode}>{c.customer_code || `CUST-00${c.id}`}</Text>
                        <Text style={styles.userName}>{c.name || c.full_name}</Text>
                        <Text style={styles.userPhone}>{c.phone} • {c.occupation || 'Borrower'}</Text>
                      </View>
                      <View style={[
                        styles.statusPill,
                        isActive && styles.statusPillActive,
                        isUnderReview && styles.statusPillReview,
                        isBlocked && styles.statusPillBlocked,
                      ]}>
                        <Text style={[
                          styles.statusPillText,
                          isActive && styles.statusTextActive,
                          isUnderReview && styles.statusTextReview,
                          isBlocked && styles.statusTextBlocked,
                        ]}>
                          {currentStatus.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metricsStrip}>
                      <Text style={styles.stripLabel}>
                        Outstanding: <Text style={styles.stripVal}>{formatINR(c.outstanding || 0)}</Text>
                      </Text>
                      <Text style={styles.stripLabel}>
                        Limit: <Text style={styles.stripVal}>{formatINR(c.creditLimit || 30000)}</Text>
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, isActive ? styles.actionBtnCurrent : styles.actionBtnActive]}
                        onPress={() => handleStatusChange(c.id, 'ACTIVE', c.name || c.full_name)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnText, isActive && styles.actionBtnCurrentText]}>
                          {isActive ? '✓ Active' : 'Set Active'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, isUnderReview ? styles.actionBtnCurrent : styles.actionBtnReview]}
                        onPress={() => handleStatusChange(c.id, 'UNDER_REVIEW', c.name || c.full_name)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnText, isUnderReview && styles.actionBtnCurrentText]}>
                          {isUnderReview ? '✓ Review' : 'Under Review'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, isBlocked ? styles.actionBtnCurrent : styles.actionBtnBlocked]}
                        onPress={() => handleStatusChange(c.id, 'BLOCKED', c.name || c.full_name)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnText, isBlocked && styles.actionBtnCurrentText]}>
                          {isBlocked ? '✓ Blocked' : 'Block Defaulter'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  orgTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  orgTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollList: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  userItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userCode: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  userPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillReview: {
    backgroundColor: '#FFFBEB',
  },
  statusPillBlocked: {
    backgroundColor: '#FEF2F2',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextReview: {
    color: '#D97706',
  },
  statusTextBlocked: {
    color: '#DC2626',
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  stripLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  stripVal: {
    fontWeight: '700',
    color: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  actionBtnReview: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  actionBtnBlocked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionBtnCurrent: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionBtnCurrentText: {
    color: '#FFFFFF',
  },
});

export default ManageUsersModal;
