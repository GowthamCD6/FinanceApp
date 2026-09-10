import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_ORGANIZATIONS } from '../services/mockData';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState(() =>
    MOCK_ORGANIZATIONS.map((o) => ({
      ...o,
      admin_name: o.admin_name || 'Branch Admin',
      admin_email: o.admin_email || '',
      admin_phone: o.admin_phone || '',
      initial_capital: o.initial_capital || o.active_portfolio || 500000,
      plan: o.plan || 'PRO',
      address: o.address || '',
    }))
  );
  const [activeOrgId, setActiveOrgId] = useState(null);

  const activeOrg = useMemo(
    () => organizations.find((o) => String(o.id) === String(activeOrgId)) || null,
    [organizations, activeOrgId]
  );

  const setActiveOrg = (orgId) => setActiveOrgId(orgId);
  const clearActiveOrg = () => setActiveOrgId(null);

  const addOrganization = (data) => {
    const id = Date.now();
    const code =
      data.code ||
      data.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) +
        '-' +
        String(id).slice(-2);

    const newOrg = {
      id,
      name: data.name,
      code,
      status: 'ACTIVE',
      plan: data.plan || 'PRO',
      branch_count: 1,
      total_customers: 0,
      active_portfolio: 0,
      initial_capital: parseFloat(data.initial_capital) || 500000,
      admin_name: data.admin_name || 'Branch Admin',
      admin_email: data.admin_email || '',
      admin_phone: data.admin_phone || '',
      address: data.address || '',
      created_at: new Date().toISOString().split('T')[0],
    };

    setOrganizations((prev) => [newOrg, ...prev]);
    return newOrg;
  };

  const updateOrgStatus = (orgId, status) => {
    setOrganizations((prev) =>
      prev.map((o) => (String(o.id) === String(orgId) ? { ...o, status } : o))
    );
  };

  const platformStats = useMemo(() => {
    const active = organizations.filter((o) => o.status === 'ACTIVE');
    return {
      totalOrgs: organizations.length,
      activeOrgs: active.length,
      suspendedOrgs: organizations.length - active.length,
      totalCustomers: organizations.reduce((s, o) => s + (o.total_customers || 0), 0),
      totalPortfolio: organizations.reduce((s, o) => s + (o.active_portfolio || 0), 0),
      totalCapital: organizations.reduce((s, o) => s + (o.initial_capital || 0), 0),
    };
  }, [organizations]);

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId,
        setActiveOrg,
        clearActiveOrg,
        addOrganization,
        updateOrgStatus,
        platformStats,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within an OrgProvider');
  return ctx;
};
