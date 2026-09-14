import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(() => {
    return localStorage.getItem('finance_active_org_id') || null;
  });
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(() => {
    return localStorage.getItem('finance_active_branch_id') || 'ALL';
  });
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

  // Fetch branches whenever active organization changes
  const fetchBranches = useCallback(async (orgId = null) => {
    const targetOrgId = orgId || activeOrgId;
    if (!targetOrgId) {
      setBranches([]);
      return;
    }
    try {
      const data = await api.organizations.getBranches(targetOrgId);
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load branches in OrgContext:', err);
      setBranches([]);
    }
  }, [activeOrgId]);

  useEffect(() => {
    if (activeOrgId) {
      fetchBranches(activeOrgId);
    }
  }, [activeOrgId, fetchBranches]);

  const activeBranch = useMemo(
    () => branches.find((b) => String(b.id) === String(activeBranchId)) || null,
    [branches, activeBranchId]
  );

  // Auto-sync active organization and branch based on logged-in user role
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('finance_user');
      if (!savedUserStr) return;
      const user = JSON.parse(savedUserStr);
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role_type || 'USER'];
      const isSuper = userRoles.includes('SUPER_ADMIN');
      const isBranchAdmin = userRoles.includes('BRANCH_ADMIN');
      const isOrgAdmin = userRoles.includes('ORG_ADMIN') || (userRoles.includes('ADMIN') && !isBranchAdmin);

      if (isBranchAdmin && user.branch_id) {
        // Strictly lock Branch Admin to their assigned branch and organization
        setActiveBranchId(String(user.branch_id));
        localStorage.setItem('finance_active_branch_id', String(user.branch_id));
        if (user.organization_id) {
          setActiveOrgId(String(user.organization_id));
          localStorage.setItem('finance_active_org_id', String(user.organization_id));
        }
      } else if (isOrgAdmin && user.organization_id && !isSuper) {
        // Lock Org Admin to their assigned organization (can toggle branches)
        setActiveOrgId(String(user.organization_id));
        localStorage.setItem('finance_active_org_id', String(user.organization_id));
      }
    } catch (e) {
      console.warn('OrgContext user auto-sync notice:', e);
    }
  }, []);

  const setActiveOrg = (orgId) => {
    try {
      const savedUserStr = localStorage.getItem('finance_user');
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.role_type || 'USER'];
        // Prevent non-super admins from switching orgs
        if (!userRoles.includes('SUPER_ADMIN') && user.organization_id && String(orgId) !== String(user.organization_id)) {
          return;
        }
      }
    } catch (_) {}

    setActiveOrgId(orgId);
    if (orgId) {
      localStorage.setItem('finance_active_org_id', String(orgId));
      fetchBranches(orgId);
    } else {
      localStorage.removeItem('finance_active_org_id');
      setBranches([]);
    }
  };

  const setActiveBranch = (branchId) => {
    try {
      const savedUserStr = localStorage.getItem('finance_user');
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.role_type || 'USER'];
        // Prevent Branch Admins from switching branches
        if (userRoles.includes('BRANCH_ADMIN') && user.branch_id && String(branchId) !== String(user.branch_id)) {
          return;
        }
      }
    } catch (_) {}

    setActiveBranchId(branchId);
    if (branchId && branchId !== 'ALL') {
      localStorage.setItem('finance_active_branch_id', String(branchId));
    } else {
      localStorage.removeItem('finance_active_branch_id');
    }
  };

  const clearActiveOrg = () => {
    setActiveOrgId(null);
    setActiveBranchId('ALL');
    localStorage.removeItem('finance_active_org_id');
    localStorage.removeItem('finance_active_branch_id');
    setBranches([]);
  };

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
        branches,
        activeBranch,
        activeBranchId,
        loading,
        setActiveOrg,
        setActiveBranch,
        setActiveBranchId: setActiveBranch,
        clearActiveOrg,
        fetchBranches,
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
