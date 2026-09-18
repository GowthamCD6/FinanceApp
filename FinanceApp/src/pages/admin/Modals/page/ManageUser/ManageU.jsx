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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import { formatINR } from '../../../../../utils/helpers';
import Colors from '../../../../../theme/colors';

export const ManageU = ({ visible, onClose, onOpenAddUser }) => {
  if (!visible) return null;

  const { customers, updateCustomerStatus } = useApp();
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
          <Header
            title="User Status Governance"
            onBack={onClose}
            showBackButton={true}
            showDivider={true}
          />

          {feedback && (
            <View style={styles.feedbackBanner}>
              <MaterialCommunityIcons name="check" size={14} color="#065F46" />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={18} color={Colors.gray200} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone or code..."
                placeholderTextColor={Colors.gray100}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={Colors.gray200} />
                </TouchableOpacity>
              ) : null}
            </View>
            {onOpenAddUser && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  onClose();
                  onOpenAddUser();
                }}
              >
                <MaterialCommunityIcons name="account-plus" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            {['ALL', 'ACTIVE', 'SUSPENDED', 'DEFAULTER'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-search-outline" size={36} color={Colors.gray100} />
                <Text style={styles.emptyText}>No users match your criteria</Text>
              </View>
            ) : (
              filtered.map((c) => {
                const status = c.status || 'ACTIVE';
                return (
                  <View key={c.id} style={styles.userCard}>
                    <View style={styles.cardTop}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(c.name || 'U').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{c.name}</Text>
                        <Text style={styles.userSub}>{c.phone} • {c.customer_code || 'N/A'}</Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        status === 'ACTIVE' ? styles.badgeActive :
                        status === 'SUSPENDED' ? styles.badgeSuspended : styles.badgeDefaulter
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          status === 'ACTIVE' ? styles.textActive :
                          status === 'SUSPENDED' ? styles.textSuspended : styles.textDefaulter
                        ]}>
                          {status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardMeta}>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Credit Score</Text>
                        <Text style={styles.metaVal}>{c.credit_score || 'N/A'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Credit Limit</Text>
                        <Text style={styles.metaVal}>{formatINR(c.credit_limit || 0)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      {status !== 'ACTIVE' && (
                        <TouchableOpacity
                          style={styles.activateBtn}
                          onPress={() => handleStatusChange(c.id, 'ACTIVE', c.name)}
                        >
                          <Text style={styles.activateBtnText}>Activate</Text>
                        </TouchableOpacity>
                      )}
                      {status !== 'SUSPENDED' && (
                        <TouchableOpacity
                          style={styles.suspendBtn}
                          onPress={() => handleStatusChange(c.id, 'SUSPENDED', c.name)}
                        >
                          <Text style={styles.suspendBtnText}>Suspend</Text>
                        </TouchableOpacity>
                      )}
                      {status !== 'DEFAULTER' && (
                        <TouchableOpacity
                          style={styles.defaulterBtn}
                          onPress={() => handleStatusChange(c.id, 'DEFAULTER', c.name)}
                        >
                          <Text style={styles.defaulterBtnText}>Mark Defaulter</Text>
                        </TouchableOpacity>
                      )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successBg,
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray100,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray750,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.lightGray100,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray350,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: 16,
    maxHeight: 480,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray100,
    marginTop: 8,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray800,
  },
  userSub: {
    fontSize: 11,
    color: Colors.gray200,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: { backgroundColor: Colors.successBg },
  badgeSuspended: { backgroundColor: Colors.errorBg },
  badgeDefaulter: { backgroundColor: Colors.amberBg },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: Colors.success },
  textSuspended: { color: Colors.errorDanger },
  textDefaulter: { color: Colors.amberDark },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.gray100,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray800,
    marginTop: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray400,
  },
  suspendBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
  },
  suspendBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.errorDanger,
  },
  activateBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.successBg,
    alignItems: 'center',
  },
  activateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  defaulterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.amberBg,
    alignItems: 'center',
  },
  defaulterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.amberDark,
  },
});

export default ManageU;
