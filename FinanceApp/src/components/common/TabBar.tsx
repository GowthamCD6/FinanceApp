import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';

export type TabKey = 'dashboard' | 'route' | 'loans' | 'customers' | 'ledger' | 'reports';

interface TabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  overdueCount?: number;
  dueTodayCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  overdueCount = 0,
  dueTodayCount = 0,
}) => {
  const tabs: Array<{ key: TabKey; label: string; icon: string; badge?: number }> = [
    { key: 'dashboard', label: 'Fund Pool', icon: '📊' },
    { key: 'route', label: 'Route', icon: '🛵', badge: dueTodayCount },
    { key: 'loans', label: 'Loans', icon: '📑', badge: overdueCount > 0 ? overdueCount : undefined },
    { key: 'customers', label: 'Clients', icon: '👥' },
    { key: 'ledger', label: 'Ledger', icon: '🏛️' },
    { key: 'reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{tab.icon}</Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    flex: 1,
  },
  activeTab: {
    backgroundColor: '#F0FDFA',
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  activeLabel: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
});
