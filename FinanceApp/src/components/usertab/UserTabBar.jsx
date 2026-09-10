import React from 'react';
import BottomTabBar from '../common/BottomTabBar';

// User (Borrower) role tab definitions
export const USER_TABS = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
  { id: 'loans',     label: 'My Loans',  iconName: 'reports'   },
  { id: 'payments',  label: 'Payments',  iconName: 'wallet'    },
  { id: 'profile',   label: 'Profile',   iconName: 'user'      },
];

export const USER_PRIMARY_COLOR = '#2563EB';

/**
 * UserTabBar
 *
 * Pre-wired BottomTabBar for the User (Borrower) role.
 *
 * Props:
 *   activeTab   {string}   – currently active tab id
 *   onTabPress  {function} – called with pressed tab id
 *   onOpenMore  {function} – called when centre "+" is pressed
 */
const UserTabBar = ({ activeTab, onTabPress, onOpenMore }) => (
  <BottomTabBar
    tabs={USER_TABS}
    activeTab={activeTab}
    onTabPress={onTabPress}
    onOpenMore={onOpenMore}
    primaryColor={USER_PRIMARY_COLOR}
  />
);

export default UserTabBar;
