import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { PulseView } from '../../animations/PulseView';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenRoleSwitch: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenRoleSwitch,
  rightAction,
}) => {
  const { currentUser } = useApp();

  const getRoleBadgeColor = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'LOAN_MANAGER':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'COLLECTOR':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'ACCOUNTANT':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const roleStyle = getRoleBadgeColor();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <Text style={styles.appLogo}>🏦 FundFlow</Text>
          <View style={styles.statusPill}>
            <PulseView duration={1200} style={styles.pulseDot}>
              <View style={styles.onlineDot} />
            </PulseView>
            <Text style={styles.onlineText}>Ledger Active</Text>
          </View>
        </View>

        {/* Role Switcher Trigger Button */}
        <TouchableOpacity
          style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}
          onPress={onOpenRoleSwitch}
          activeOpacity={0.8}
        >
          <Text style={[styles.roleText, { color: roleStyle.text }]}>
            👤 {currentUser.name.split(' ')[0]} ({currentUser.role.replace('_', ' ')}) ▾
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appLogo: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  onlineText: {
    fontSize: 10,
    color: colors.successText,
    fontWeight: typography.weights.medium,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
});
