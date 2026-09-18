import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';
import { BouncyPressable } from '../../../animation/BouncyPressable';

export const UserTab = ({ activeTab, onTabPress, onOpenMore }) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'loans',
      label: 'My Loans',
      icon: 'wallet-outline',
      activeIcon: 'wallet',
    },
    // Center Action Button is rendered separately
    {
      id: 'payments',
      label: 'Receipts',
      icon: 'receipt-text-outline',
      activeIcon: 'receipt-text',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'account-circle-outline',
      activeIcon: 'account-circle',
    },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTabItem = (tab) => {
    const isActive = activeTab === tab.id;
    const iconName = isActive ? tab.activeIcon : tab.icon;
    const color = isActive ? Colors.secondaryBlue : Colors.gray250;

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

        {/* Center Quick Action FAB (+) */}
        <View style={styles.centerFabContainer}>
          <BouncyPressable
            style={styles.centerFab}
            onPress={onOpenMore}
            scaleTo={0.92}
            accessibilityLabel="Apply or Repay Loan"
            accessibilityRole="button"
          >
            <View style={styles.fabInner}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.white} />
            </View>
          </BouncyPressable>
          <Text style={styles.fabLabel}>Pay / Apply</Text>
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
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 10,
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
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.secondaryBlue,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: Colors.secondaryBlue,
  },
  centerFabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  fabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondaryBlue,
    marginTop: 3,
  },
});

export default UserTab;