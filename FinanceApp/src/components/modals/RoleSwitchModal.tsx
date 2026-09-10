import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../common/Button';

interface RoleSwitchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({ visible, onClose }) => {
  const { currentUser, switchRole, users } = useApp();

  const roleConfigs: Array<{
    role: UserRole;
    title: string;
    description: string;
    icon: string;
    badgeColor: string;
  }> = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Administrator',
      description: 'Complete system oversight, capital management, policies, and ledger adjustments.',
      icon: '👑',
      badgeColor: '#EDE9FE',
    },
    {
      role: 'LOAN_MANAGER',
      title: 'Loan Manager',
      description: 'Customer approval, policy underwriting, loan disbursement, and portfolio audits.',
      icon: '💼',
      badgeColor: '#DBEAFE',
    },
    {
      role: 'COLLECTOR',
      title: 'Field Collection Agent',
      description: 'Daily shopkeeper routes, weekly collections, 1-tap receipts, and cash drawer reconciliations.',
      icon: '🛵',
      badgeColor: '#D1FAE5',
    },
    {
      role: 'ACCOUNTANT',
      title: 'Financial Accountant',
      description: 'Double-entry journals, cash flow statements, expense tracking, and profit audits.',
      icon: '📊',
      badgeColor: '#FEF3C7',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Switch Active Role</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Test role-based workflows and mobile permissions dynamically:
          </Text>

          <ScrollView style={styles.list}>
            {roleConfigs.map((item) => {
              const isSelected = currentUser.role === item.role;
              return (
                <TouchableOpacity
                  key={item.role}
                  style={[styles.roleItem, isSelected && styles.selectedRoleItem]}
                  onPress={() => handleSelectRole(item.role)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.badgeColor }]}>
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.roleTitleRow}>
                      <Text style={[styles.roleTitle, isSelected && styles.selectedRoleTitle]}>
                        {item.title}
                      </Text>
                      {isSelected && <Text style={styles.activeTag}>CURRENT</Text>}
                    </View>
                    <Text style={styles.roleDesc}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Button title="Close" variant="outline" onPress={onClose} style={styles.closeAction} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: '#64748B',
    marginBottom: spacing.md,
  },
  list: {
    marginBottom: spacing.md,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  selectedRoleItem: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
  },
  selectedRoleTitle: {
    color: colors.primaryDark,
  },
  activeTag: {
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    color: colors.primaryDark,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleDesc: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    lineHeight: 16,
  },
  closeAction: {
    marginTop: spacing.xs,
  },
});
