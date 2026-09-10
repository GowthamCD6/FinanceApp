import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from './Icon';

/**
 * BottomTabBar
 *
 * A curved bottom tab bar with a centre raised "+" action button.
 * Splits tabs into 2 left + 2 right around the centre button.
 *
 * Props:
 *   tabs          {Array}    – [{ id, label, iconName, badge? }]
 *   activeTab     {string}   – id of the active tab
 *   onTabPress    {function} – called with tab id on press
 *   onOpenMore    {function} – called when the centre "+" is pressed
 *   primaryColor  {string}   – accent color for active state & centre button
 */
export const BottomTabBar = ({
  tabs = [],
  activeTab,
  onTabPress,
  onOpenMore,
  primaryColor = '#2563EB',
}) => {
  const leftTabs  = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2, 4);

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>

        {/* Left Tabs */}
        {leftTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress && onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconContainer}>
                <Icon
                  name={tab.iconName || tab.id}
                  size={20}
                  color={isActive ? primaryColor : '#94A3B8'}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? primaryColor : '#94A3B8' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Centre Raised "+" Button */}
        <TouchableOpacity
          style={styles.customTabButton}
          onPress={onOpenMore}
          activeOpacity={0.85}
        >
          <View style={[styles.customTabButtonInner, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <Icon name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Right Tabs */}
        {rightTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress && onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconContainer}>
                <Icon
                  name={tab.iconName || tab.id}
                  size={20}
                  color={isActive ? primaryColor : '#94A3B8'}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? primaryColor : '#94A3B8' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 76 : 64,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 26,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  customTabButton: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  customTabButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 4,
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
});

export default BottomTabBar;