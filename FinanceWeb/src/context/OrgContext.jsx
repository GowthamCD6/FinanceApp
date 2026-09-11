import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load live organizations from Backend on mount
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await api.organizations.getAll();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load organizations from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const activeOrg = useMemo(
    () => organizations.find((o) => String(o.id) === String(activeOrgId)) || null,
    [organizations, activeOrgId]
  );

  const setActiveOrg = (orgId) => setActiveOrgId(orgId);
  const clearActiveOrg = () => setActiveOrgId(null);

  const addOrganization = async (data) => {
    try {
      const created = await api.organizations.create(data);
      await fetchOrganizations();
      return created;
    } catch (err) {
      console.error('Failed to create organization via API:', err);
      throw err;
    }
  };

  const updateOrgStatus = async (orgId, status) => {
    try {
      await api.organizations.updateStatus(orgId, status);
      await fetchOrganizations();
    } catch (err) {
      console.error('Failed to update organization status via API:', err);
      throw err;
    }
  };

  const updateOrganization = async (orgId, data) => {
    try {
      await api.organizations.update(orgId, data);
      await fetchOrganizations();
    } catch (err) {
      console.error('Failed to update organization via API:', err);
      throw err;
    }
  };

  const platformStats = useMemo(() => {
    const active = organizations.filter((o) => o.status === 'ACTIVE');
    return {
      totalOrgs: organizations.length,
      activeOrgs: active.length,
      suspendedOrgs: organizations.length - active.length,
      totalCustomers: organizations.reduce((s, o) => s + (Number(o.total_customers) || 0), 0),
      totalPortfolio: organizations.reduce((s, o) => s + (Number(o.total_lent || o.active_portfolio) || 0), 0),
      totalCapital: organizations.reduce((s, o) => s + (Number(o.initial_capital) || 0), 0),
    };
  }, [organizations]);

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId,
        loading,
        setActiveOrg,
        clearActiveOrg,
        addOrganization,
        updateOrganization,
        updateOrgStatus,
        refreshOrganizations: fetchOrganizations,
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
