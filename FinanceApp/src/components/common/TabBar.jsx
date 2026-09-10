import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';

export const TabBar = ({
  activeTab,
  onSelectTab,
  overdueCount = 0,
  dueTodayCount = 0,
}) => {
  const tabs = [
    { key: 'dashboard', label: 'Fund Pool', icon: 'fund' },
    { key: 'route', label: 'Route', icon: 'collections', badge: dueTodayCount },
    { key: 'loans', label: 'Loans', icon: 'loans', badge: overdueCount > 0 ? overdueCount : undefined },
    { key: 'customers', label: 'Clients', icon: 'customers' },
    { key: 'reports', label: 'Reports', icon: 'reports' },
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
              <Icon name={tab.icon} size={18} color={isActive ? '#2563EB' : '#64748B'} />
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
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: 'space-around',
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flex: 1,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#DC2626',
    borderRadius: 9999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default TabBar;
