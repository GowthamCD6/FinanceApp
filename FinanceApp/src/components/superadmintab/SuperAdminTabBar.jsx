import React from 'react';
import BottomTabBar from '../common/BottomTabBar';

// Super Admin role tab definitions
export const SUPER_ADMIN_TABS = [
  { id: 'dashboard',      label: 'Dashboard',  iconName: 'dashboard' },
  { id: 'organizations',  label: 'Orgs',       iconName: 'building'  },
  { id: 'analytics',      label: 'Analytics',  iconName: 'reports'   },
  { id: 'profile',        label: 'Profile',    iconName: 'user'      },
];

export const SUPER_ADMIN_PRIMARY_COLOR = '#7C3AED';

/**
 * SuperAdminTabBar
 *
 * Pre-wired BottomTabBar for the Super Admin role.
 *
 * Props:
 *   activeTab   {string}   – currently active tab id
 *   onTabPress  {function} – called with pressed tab id
 *   onOpenMore  {function} – called when centre "+" is pressed
 */
const SuperAdminTabBar = ({ activeTab, onTabPress, onOpenMore }) => (
  <BottomTabBar
    tabs={SUPER_ADMIN_TABS}
    activeTab={activeTab}
    onTabPress={onTabPress}
    onOpenMore={onOpenMore}
    primaryColor={SUPER_ADMIN_PRIMARY_COLOR}
  />
);

export default SuperAdminTabBar;
