import React from 'react';
import BottomTabBar from '../common/BottomTabBar';

// Admin role tab definitions
export const ADMIN_TABS = [
  { id: 'dashboard',    label: 'Dashboard', iconName: 'dashboard' },
  { id: 'reports',      label: 'Reports',   iconName: 'reports'   },
  { id: 'manage_users', label: 'Users',     iconName: 'users'     },
  { id: 'profile',      label: 'Profile',   iconName: 'user'      },
];

export const ADMIN_PRIMARY_COLOR = '#059669';

/**
 * AdminTabBar
 *
 * Pre-wired BottomTabBar for the Admin role.
 *
 * Props:
 *   activeTab   {string}   – currently active tab id
 *   onTabPress  {function} – called with pressed tab id
 *   onOpenMore  {function} – called when centre "+" is pressed
 */
const AdminTabBar = ({ activeTab, onTabPress, onOpenMore }) => (
  <BottomTabBar
    tabs={ADMIN_TABS}
    activeTab={activeTab}
    onTabPress={onTabPress}
    onOpenMore={onOpenMore}
    primaryColor={ADMIN_PRIMARY_COLOR}
  />
);

export default AdminTabBar;
