import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { PulseView } from '../../animations/PulseView';
import Icon from './Icon';

export const Header = ({
  title,
  subtitle,
  onOpenRoleSwitch,
  rightAction,
}) => {
  const { currentUser } = useApp();

  const getRoleBadgeColor = () => {
    switch (currentUser?.role) {
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
          <View style={styles.logoRow}>
            <Icon name="fund" size={16} color="#2563EB" />
            <Text style={styles.appLogo}>FundFlow</Text>
          </View>
          <View style={styles.statusPill}>
            <PulseView duration={1200} style={styles.pulseDot}>
              <View style={styles.onlineDot} />
            </PulseView>
            <Text style={styles.onlineText}>Ledger Active</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}
          onPress={onOpenRoleSwitch}
          activeOpacity={0.8}
        >
          <Text style={[styles.roleText, { color: roleStyle.text }]}>
            {currentUser?.name?.split(' ')[0] || 'User'} ({currentUser?.role?.replace('_', ' ') || 'Role'}) ▾
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appLogo: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
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
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
