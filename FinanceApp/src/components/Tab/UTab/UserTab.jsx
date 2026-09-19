import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';

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
      label: 'Portfolio',
      icon: 'briefcase-outline',
      activeIcon: 'briefcase',
    },
    // Center Action Button is rendered separately
    {
      id: 'payments',
      label: 'Payments',
      icon: 'receipt-text-outline',
      activeIcon: 'receipt-text',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'account-outline',
      activeIcon: 'account',
    },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const activeColor = '#2842C4';
  const inactiveColor = '#6B7280';

  const renderTabItem = (tab) => {
    const isActive = activeTab === tab.id;
    const iconName = isActive ? tab.activeIcon : tab.icon;
    const color = isActive ? activeColor : inactiveColor;

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabIconContainer}
        onPress={() => onTabPress && onTabPress(tab.id)}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={24}
          color={color}
          style={styles.iconStyle}
        />
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
    <View style={styles.tabBar}>
      {/* Left Tabs */}
      <View style={styles.tabGroup}>
        {leftTabs.map(renderTabItem)}
      </View>

      {/* Center Floating Action Tab */}
      <TouchableOpacity
        style={styles.customTabButton}
        onPress={onOpenMore}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Actions"
      >
        <View style={styles.customTabButtonInner}>
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Right Tabs */}
      <View style={styles.tabGroup}>
        {rightTabs.map(renderTabItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 84 : 70,
    borderTopWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabGroup: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 62,
    height: 50,
  },
  iconStyle: {
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 14,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  customTabButton: {
    top: -18,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  customTabButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2842C4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2842C4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default UserTab;