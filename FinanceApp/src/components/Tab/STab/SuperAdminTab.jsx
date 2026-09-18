import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';
import { BouncyPressable } from '../../../animation/BouncyPressable';

export const SuperAdminTab = ({ activeTab, onTabPress, onOpenMore }) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Executive',
      icon: 'view-dashboard-outline',
      activeIcon: 'view-dashboard',
      matchIds: ['dashboard'],
    },
    {
      id: 'loans',
      label: 'Loans',
      icon: 'file-document-outline',
      activeIcon: 'file-document',
      matchIds: ['loans', 'loan_detail'],
    },
    // Center Action Button is rendered separately
    {
      id: 'customers',
      label: 'Borrowers',
      icon: 'account-group-outline',
      activeIcon: 'account-group',
      matchIds: ['customers', 'customer_detail'],
    },
    {
      id: 'fund',
      label: 'Vault',
      icon: 'safe',
      activeIcon: 'safe-square-outline',
      matchIds: ['fund', 'reports', 'expenses', 'audit'],
    },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTabItem = (tab) => {
    const isActive = tab.matchIds ? tab.matchIds.includes(activeTab) : activeTab === tab.id;
    const iconName = isActive ? tab.activeIcon : tab.icon;
    const color = isActive ? Colors.primaryVivid : Colors.gray250;

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabItem}
        onPress={() => onTabPress && onTabPress(tab.id)}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.iconContainer}>
          {isActive && <View style={styles.activeDot} />}
          <MaterialCommunityIcons name={iconName} size={22} color={color} />
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color },
            isActive && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.container}>
        {/* Left 2 Tabs */}
        <View style={styles.tabGroup}>
          {leftTabs.map(renderTabItem)}
        </View>

        {/* Center Super Admin Crown Action FAB */}
        <View style={styles.centerFabContainer}>
          <BouncyPressable
            style={styles.centerFab}
            onPress={onOpenMore}
            scaleTo={0.92}
            accessibilityLabel="Super Admin Governance Actions"
            accessibilityRole="button"
          >
            <View style={styles.fabInner}>
              <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
            </View>
          </BouncyPressable>
          <Text style={styles.fabLabel}>Control</Text>
        </View>

        {/* Right 2 Tabs */}
        <View style={styles.tabGroup}>
          {rightTabs.map(renderTabItem)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 84 : 66,
  },
  tabGroup: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activeDot: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primaryVivid,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: Colors.primaryVivid,
  },
  centerFabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: '#FDE047',
  },
  fabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    marginTop: 3,
  },
});

export default SuperAdminTab;
