import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from '../../../../components/common/Icon';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';

export const ManageUsersModal = ({ visible, onClose, onOpenAddUser }) => {
  if (!visible) return null;

  const { customers, currentOrganization, updateCustomerStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  const handleStatusChange = (customerId, status, name) => {
    updateCustomerStatus(customerId, status, 'Status updated via Manage Users modal');
    setFeedback(`${name} marked as ${status}`);
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
                style={styles.addUserBtn}
                onPress={() => {
                  onClose();
                  onOpenAddUser();
                }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addUserBtnText}>Add User</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Tabs */}
          <View style={styles.filterRow}>
            {['ALL', 'ACTIVE', 'SUSPENDED', 'DEFAULTER'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.filterText, statusFilter === st && styles.filterTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.map((item) => {
              const st = item.status || 'ACTIVE';
              const isSuspended = st === 'SUSPENDED';
              const isDefaulter = st === 'DEFAULTER';

              return (
                <View key={item.id} style={styles.userCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(item.name || 'U').charAt(0)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userSub}>
                        {item.customer_code} • {item.phone}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        st === 'ACTIVE'
                          ? styles.badgeActive
                          : isDefaulter
                          ? styles.badgeDefaulter
                          : styles.badgeSuspended,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          st === 'ACTIVE'
                            ? styles.textActive
                            : isDefaulter
                            ? styles.textDefaulter
                            : styles.textSuspended,
                        ]}
                      >
                        {st}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Credit Limit</Text>
                      <Text style={styles.metaVal}>{formatINR(item.creditLimit || 25000)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Outstanding</Text>
                      <Text
                        style={[
                          styles.metaVal,
                          { color: (item.outstanding || 0) > 0 ? '#D97706' : '#059669' },
                        ]}
                      >
                        {formatINR(item.outstanding || 0)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Completed</Text>
                      <Text style={styles.metaVal}>{item.completed_loans || 0} Loans</Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.cardActions}>
                    {st === 'ACTIVE' ? (
                      <TouchableOpacity
                        style={styles.suspendBtn}
                        onPress={() => handleStatusChange(item.id, 'SUSPENDED', item.name)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.suspendBtnText}>Suspend User</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.activateBtn}
                        onPress={() => handleStatusChange(item.id, 'ACTIVE', item.name)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.activateBtnText}>Reactivate User</Text>
                      </TouchableOpacity>
                    )}

                    {!isDefaulter && (
                      <TouchableOpacity
                        style={styles.defaulterBtn}
                        onPress={() => handleStatusChange(item.id, 'DEFAULTER', item.name)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.defaulterBtnText}>Mark NPA</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orgTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  orgTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
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
    backgroundColor: '#F8FAFC',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  addUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 4,
  },
  addUserBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    maxHeight: 480,
  },
  userCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: { backgroundColor: '#ECFDF5' },
  badgeSuspended: { backgroundColor: '#FEF2F2' },
  badgeDefaulter: { backgroundColor: '#FFFBEB' },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: '#059669' },
  textSuspended: { color: '#DC2626' },
  textDefaulter: { color: '#D97706' },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  suspendBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  suspendBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  activateBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
  },
  activateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  defaulterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
  },
  defaulterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
});

export default ManageUsersModal;
