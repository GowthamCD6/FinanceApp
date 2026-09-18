import React from 'react';
import AdminTab from './ATab/AdminTab';
import UserTab from './UTab/UserTab';
import SuperAdminTab from './STab/SuperAdminTab';

export const TabRouter = ({ currentRole, activeTab, onTabPress, onOpenMore }) => {
  if (currentRole === 'SUPER_ADMIN') {
    return (
      <SuperAdminTab
        activeTab={activeTab}
        onTabPress={onTabPress}
        onOpenMore={onOpenMore}
      />
    );
  }

  if (currentRole === 'ADMIN') {
    return (
      <AdminTab
        activeTab={activeTab}
        onTabPress={onTabPress}
        onOpenMore={onOpenMore}
      />
    );
  }

  return (
    <UserTab
      activeTab={activeTab}
      onTabPress={onTabPress}
      onOpenMore={onOpenMore}
    />
  );
};

export default TabRouter;
