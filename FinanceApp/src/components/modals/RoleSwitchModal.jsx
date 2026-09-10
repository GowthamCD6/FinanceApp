import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

export const RoleSwitchModal = ({ visible, onClose }) => {
  const { currentRole, switchRole } = useApp();

  const roleConfigs = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Administrator',
      description: 'Complete system control, central fund circulation, equity injections, policy underwriting, and ledger audits.',
      icon: 'crown',
      badgeColor: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      role: 'ADMIN',
      title: 'Admin Operations',
      description: 'Day-to-day loan disbursement, field payment collections, borrower onboarding, and daily cash drawer reconciliation.',
      icon: 'shield',
      badgeColor: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      role: 'USER',
      title: 'Customer (Borrower)',
      description: 'Customer view for individual loans, upcoming installment schedule, and digital repayment receipts.',
      icon: 'customers',
      badgeColor: '#FFFBEB',
      iconColor: '#D97706',
    },
  ];

  const handleSelectRole = (role) => {
    if (switchRole) switchRole(role);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Switch Active Role</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Select role to inspect dedicated view and operations:
          </Text>

          <ScrollView style={styles.list}>
            {roleConfigs.map((item) => {
              const isSelected = currentRole === item.role;
              return (
                <TouchableOpacity
                  key={item.role}
                  style={[styles.roleItem, isSelected && styles.selectedRoleItem]}
                  onPress={() => handleSelectRole(item.role)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.badgeColor }]}>
                    <Icon name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.roleTitleRow}>
                      <Text style={[styles.roleTitle, isSelected && styles.selectedRoleTitle]}>
                        {item.title}
                      </Text>
                      {isSelected && <Text style={styles.activeTag}>ACTIVE</Text>}
                    </View>
                    <Text style={styles.roleDesc}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  list: {
    marginBottom: 12,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  selectedRoleItem: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedRoleTitle: {
    color: '#2563EB',
  },
  activeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RoleSwitchModal;
