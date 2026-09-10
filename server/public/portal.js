/**
 * Fund Flow — Multi-Tenant Web Portal Client Logic
 * Handles role switching, tenant scoping, organization creation,
 * and live customer status mutations.
 */

(function () {
  'use strict';

  // In-memory application state
  const state = {
    currentRole: 'SUPER_ADMIN', // 'SUPER_ADMIN' | 'ADMIN'
    currentOrgId: 1,
    adminSubTab: 'reports', // 'reports' | 'userStatus' | 'loans'
    userStatusFilter: 'ALL',
    userSearchQuery: '',
    
    // Initial Organizations
    organizations: [
      {
        id: 1,
        code: 'ORG-APEX',
        name: 'Apex Finance Ltd',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        currency: 'INR',
        initial_capital: 1000000,
        available_cash: 222000,
        total_lent: 760000,
        admin_name: 'Rajesh Kumar',
        admin_email: 'rajesh@apexfinance.com',
        phone: '+91 98765 43210',
        customer_count: 5,
        active_loans_count: 4,
      },
      {
        id: 2,
        code: 'ORG-HORIZON',
        name: 'Horizon Microcredit',
        plan: 'PRO',
        status: 'ACTIVE',
        currency: 'INR',
        initial_capital: 500000,
        available_cash: 185000,
        total_lent: 315000,
        admin_name: 'Priya Sharma',
        admin_email: 'priya@horizoncredit.in',
        phone: '+91 98401 23456',
        customer_count: 3,
        active_loans_count: 2,
      },
      {
        id: 3,
        code: 'ORG-DELTA',
        name: 'Delta Rural Lending',
        plan: 'STARTER',
        status: 'ACTIVE',
        currency: 'INR',
        initial_capital: 300000,
        available_cash: 120000,
        total_lent: 180000,
        admin_name: 'Suresh Babu',
        admin_email: 'suresh@deltarural.in',
        phone: '+91 94432 77890',
        customer_count: 2,
        active_loans_count: 1,
      },
    ],

    // Customers with multi-tenant status governance
    users: [
      {
        id: 101,
        orgId: 1,
        code: 'CUST-001',
        name: 'Murugan Tea Stall',
        phone: '+91 98401 12345',
        type: 'SHOPKEEPER',
        occupation: 'Tea Shop Owner',
        activeLoans: 1,
        outstanding: 6000,
        status: 'ACTIVE',
      },
      {
        id: 102,
        orgId: 1,
        code: 'CUST-002',
        name: 'Kavitha General Store',
        phone: '+91 98402 23456',
        type: 'SHOPKEEPER',
        occupation: 'Kirana Merchant',
        activeLoans: 1,
        outstanding: 10000,
        status: 'ACTIVE',
      },
      {
        id: 103,
        orgId: 1,
        code: 'CUST-003',
        name: 'Selvam Florist',
        phone: '+91 98403 34567',
        type: 'SHOPKEEPER',
        occupation: 'Flower Vendor',
        activeLoans: 1,
        outstanding: 0,
        status: 'ACTIVE',
      },
      {
        id: 104,
        orgId: 1,
        code: 'CUST-004',
        name: 'Anand Electronics',
        phone: '+91 98404 45678',
        type: 'SHOPKEEPER',
        occupation: 'Repair Shop',
        activeLoans: 1,
        outstanding: 15000,
        status: 'UNDER_REVIEW',
      },
      {
        id: 105,
        orgId: 1,
        code: 'CUST-005',
        name: 'Ravi Footwear',
        phone: '+91 98405 56789',
        type: 'SHOPKEEPER',
        occupation: 'Shoe Retailer',
        activeLoans: 0,
        outstanding: 0,
        status: 'BLOCKED',
      },
      {
        id: 201,
        orgId: 2,
        code: 'CUST-021',
        name: 'Palanisamy Textiles',
        phone: '+91 98411 99887',
        type: 'SHOPKEEPER',
        occupation: 'Saree Merchant',
        activeLoans: 1,
        outstanding: 18000,
        status: 'ACTIVE',
      },
      {
        id: 202,
        orgId: 2,
        code: 'CUST-022',
        name: 'Latha Beauty Parlour',
        phone: '+91 98412 88776',
        type: 'COMMON_CUSTOMER',
        occupation: 'Beautician',
        activeLoans: 1,
        outstanding: 8500,
        status: 'ACTIVE',
      },
      {
        id: 203,
        orgId: 2,
        code: 'CUST-023',
        name: 'Mani Workshop',
        phone: '+91 98413 77665',
        type: 'SHOPKEEPER',
        occupation: 'Two-Wheeler Service',
        activeLoans: 0,
        outstanding: 0,
        status: 'INACTIVE',
      },
      {
        id: 301,
        orgId: 3,
        code: 'CUST-031',
        name: 'Thangavelu Dairy',
        phone: '+91 98421 11223',
        type: 'COMMON_CUSTOMER',
        occupation: 'Dairy Farmer',
        activeLoans: 1,
        outstanding: 12000,
        status: 'ACTIVE',
      },
      {
        id: 302,
        orgId: 3,
        code: 'CUST-032',
        name: 'Marimuthu Agri Supplies',
        phone: '+91 98422 22334',
        type: 'SHOPKEEPER',
        occupation: 'Seeds & Fertilizer',
        activeLoans: 0,
        outstanding: 0,
        status: 'ACTIVE',
      },
    ],

    loans: [
      { id: 1, orgId: 1, loanNumber: 'LN-2026-0001', customerName: 'Murugan Tea Stall', product: 'Weekly (10 Wk)', principal: 20000, totalRepayment: 22000, paid: 16000, outstanding: 6000, status: 'ACTIVE' },
      { id: 2, orgId: 1, loanNumber: 'LN-2026-0002', customerName: 'Kavitha General Store', product: 'Daily (25 D)', principal: 25000, totalRepayment: 27500, paid: 17500, outstanding: 10000, status: 'ACTIVE' },
      { id: 3, orgId: 1, loanNumber: 'LN-2026-0003', customerName: 'Anand Electronics', product: 'Weekly (10 Wk)', principal: 30000, totalRepayment: 33000, paid: 18000, outstanding: 15000, status: 'ACTIVE' },
      { id: 4, orgId: 2, loanNumber: 'LN-2026-0021', customerName: 'Palanisamy Textiles', product: 'Weekly (10 Wk)', principal: 40000, totalRepayment: 44000, paid: 26000, outstanding: 18000, status: 'ACTIVE' },
      { id: 5, orgId: 2, loanNumber: 'LN-2026-0022', customerName: 'Latha Beauty Parlour', product: 'Daily (25 D)', principal: 15000, totalRepayment: 16500, paid: 8000, outstanding: 8500, status: 'ACTIVE' },
      { id: 6, orgId: 3, loanNumber: 'LN-2026-0031', customerName: 'Thangavelu Dairy', product: 'Weekly (10 Wk)', principal: 25000, totalRepayment: 27500, paid: 15500, outstanding: 12000, status: 'ACTIVE' },
    ],
  };

  // Helpers
  function formatINR(val) {
    if (typeof val !== 'number') return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Render Tenant Switcher Dropdown
  function renderOrgSelector() {
    const select = document.getElementById('orgSelect');
    if (!select) return;

    let options = '';
    if (state.currentRole === 'SUPER_ADMIN') {
      options += `<option value="ALL">All Organizations (Global Overview)</option>`;
    }

    state.organizations.forEach((org) => {
      const isSelected = org.id === state.currentOrgId && state.currentRole !== 'SUPER_ADMIN';
      options += `<option value="${org.id}" ${isSelected ? 'selected' : ''}>${org.name} (${org.code})</option>`;
    });

    select.innerHTML = options;
  }

  // Render Super Admin View
  function renderSuperAdminView() {
    // Aggregates
    const totalTenants = state.organizations.length;
    const totalCapital = state.organizations.reduce((sum, o) => sum + (o.initial_capital || 0), 0);
    const totalLent = state.organizations.reduce((sum, o) => sum + (o.total_lent || 0), 0);
    const totalClients = state.users.length;

    document.getElementById('totalTenantsCount').textContent = totalTenants;
    document.getElementById('globalCapitalPool').textContent = formatINR(totalCapital);
    document.getElementById('globalLentAmount').textContent = formatINR(totalLent);
    document.getElementById('globalClientsCount').textContent = totalClients;
    document.getElementById('orgsTableBadge').textContent = `${totalTenants} Organizations`;

    const tbody = document.getElementById('orgsTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.organizations
      .map((org) => {
        const isSuspended = org.status === 'SUSPENDED';
        const statusBadge = isSuspended
          ? `<span class="badge badge-danger">SUSPENDED</span>`
          : `<span class="badge badge-success">ACTIVE</span>`;

        return `
          <tr>
            <td><strong>${org.code}</strong></td>
            <td>
              <strong>${org.name}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${org.address || 'Central'}</div>
            </td>
            <td><span class="badge badge-purple">${org.plan}</span></td>
            <td>${formatINR(org.initial_capital)}</td>
            <td><span style="color: var(--success); font-weight: 700;">${formatINR(org.available_cash)}</span></td>
            <td><strong>${formatINR(org.total_lent)}</strong></td>
            <td>
              <div>${org.admin_name}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${org.phone}</div>
            </td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">
              <button class="btn btn-sm ${isSuspended ? 'btn-success-outline' : 'btn-danger-outline'}" 
                onclick="window.portalApp.toggleOrgStatus(${org.id})">
                ${isSuspended ? 'Activate' : 'Suspend'}
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Render Admin View
  function renderAdminView() {
    const activeOrg = state.organizations.find((o) => o.id === state.currentOrgId) || state.organizations[0];
    
    // Banner
    const banner = document.getElementById('activeTenantBanner');
    if (banner) {
      banner.textContent = `ORGANIZATION: ${activeOrg.name.toUpperCase()} (${activeOrg.code})`;
    }

    // Metrics
    document.getElementById('adminAvailableCash').textContent = formatINR(activeOrg.available_cash);
    document.getElementById('adminTotalLent').textContent = formatINR(activeOrg.total_lent);

    // Filter Users for this Org
    renderUserStatusTable();
    renderLoansTable();
  }

  // Render User Status Table (Core requirement for Admin)
  function renderUserStatusTable() {
    const tbody = document.getElementById('userStatusTableBody');
    if (!tbody) return;

    let filtered = state.users.filter((u) => u.orgId === state.currentOrgId);

    if (state.userStatusFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.status === state.userStatusFilter);
    }

    if (state.userSearchQuery) {
      const q = state.userSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No accounts found matching filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((u) => {
        let badgeClass = 'badge-neutral';
        if (u.status === 'ACTIVE') badgeClass = 'badge-success';
        if (u.status === 'UNDER_REVIEW') badgeClass = 'badge-warning';
        if (u.status === 'BLOCKED') badgeClass = 'badge-danger';

        return `
          <tr>
            <td><strong>${u.code}</strong></td>
            <td>
              <strong>${u.name}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${u.occupation || 'Self-Employed'}</div>
            </td>
            <td>${u.phone}</td>
            <td><span class="badge badge-primary">${u.type === 'SHOPKEEPER' ? 'Merchant' : 'Borrower'}</span></td>
            <td>${u.activeLoans} Active</td>
            <td><strong>${formatINR(u.outstanding)}</strong></td>
            <td><span class="badge ${badgeClass}">${u.status.replace('_', ' ')}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-sm btn-secondary" onclick="window.portalApp.openStatusChangeModal(${u.id}, '${u.name.replace(/'/g, "\\'")}', '${u.status}')">
                Update Status ▾
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Render Loans Table
  function renderLoansTable() {
    const tbody = document.getElementById('loansTableBody');
    if (!tbody) return;

    const filtered = state.loans.filter((l) => l.orgId === state.currentOrgId);
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No circulating loans in this organization.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((l) => `
        <tr>
          <td><strong>${l.loanNumber}</strong></td>
          <td><strong>${l.customerName}</strong></td>
          <td><span class="badge badge-purple">${l.product}</span></td>
          <td>${formatINR(l.principal)}</td>
          <td>${formatINR(l.totalRepayment)}</td>
          <td><span style="color: var(--success); font-weight: 600;">${formatINR(l.paid)}</span></td>
          <td><strong style="color: var(--primary);">${formatINR(l.outstanding)}</strong></td>
          <td><span class="badge badge-success">${l.status}</span></td>
        </tr>
      `)
      .join('');
  }

  // Initialize and fetch from REST server
  async function init() {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          state.organizations = json.data;
          document.getElementById('connectionText').textContent = 'REST Backend Live';
        }
      }
    } catch (err) {
      console.log('Using in-memory organization registry.');
    }

    renderOrgSelector();
    renderSuperAdminView();
    renderAdminView();
  }

  // Export Public API for DOM handlers
  window.portalApp = {
    switchRole: (role) => {
      state.currentRole = role;
      document.getElementById('roleSuperAdminBtn').classList.toggle('active', role === 'SUPER_ADMIN');
      document.getElementById('roleAdminBtn').classList.toggle('active', role === 'ADMIN');
      document.getElementById('superAdminView').classList.toggle('active', role === 'SUPER_ADMIN');
      document.getElementById('adminView').classList.toggle('active', role === 'ADMIN');

      renderOrgSelector();
      if (role === 'SUPER_ADMIN') {
        renderSuperAdminView();
      } else {
        renderAdminView();
      }
    },

    handleOrgChange: (orgVal) => {
      if (orgVal === 'ALL') {
        window.portalApp.switchRole('SUPER_ADMIN');
        return;
      }
      state.currentOrgId = parseInt(orgVal, 10);
      renderAdminView();
      showToast(`Switched active branch to ${state.organizations.find((o) => o.id === state.currentOrgId)?.name}`);
    },

    switchAdminTab: (tabName) => {
      state.adminSubTab = tabName;
      document.getElementById('subtabReports').classList.toggle('active', tabName === 'reports');
      document.getElementById('subtabUserStatus').classList.toggle('active', tabName === 'userStatus');
      document.getElementById('subtabLoans').classList.toggle('active', tabName === 'loans');

      document.getElementById('adminReportsView').classList.toggle('active', tabName === 'reports');
      document.getElementById('adminUserStatusView').classList.toggle('active', tabName === 'userStatus');
      document.getElementById('adminLoansView').classList.toggle('active', tabName === 'loans');
    },

    filterReports: (type) => {
      document.querySelectorAll('.filter-pill').forEach((btn) => {
        btn.classList.toggle('active', btn.textContent.includes(type) || (type === 'ALL' && btn.textContent.includes('All')));
      });
      showToast(`Reports filtered: ${type}`);
    },

    filterUserStatus: (status) => {
      state.userStatusFilter = status;
      document.querySelectorAll('.status-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.textContent.toUpperCase().includes(status));
      });
      renderUserStatusTable();
    },

    handleUserSearch: (query) => {
      state.userSearchQuery = query;
      renderUserStatusTable();
    },

    openModal: (modalId) => {
      const el = document.getElementById(modalId);
      if (el) el.classList.add('open');
    },

    closeModal: (modalId) => {
      const el = document.getElementById(modalId);
      if (el) el.classList.remove('open');
    },

    // Organization Creation (Super Admin)
    handleCreateOrgSubmit: async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        code: formData.get('code'),
        plan: formData.get('plan'),
        initial_capital: parseFloat(formData.get('initial_capital')),
        admin_name: formData.get('admin_name'),
        admin_email: formData.get('admin_email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
      };

      try {
        const res = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          state.organizations.unshift(json.data);
        } else {
          // In-memory fallback
          const newOrg = {
            id: state.organizations.length + 1,
            code: payload.code.toUpperCase(),
            name: payload.name,
            plan: payload.plan,
            status: 'ACTIVE',
            initial_capital: payload.initial_capital,
            available_cash: payload.initial_capital,
            total_lent: 0,
            admin_name: payload.admin_name || 'Admin',
            phone: payload.phone || '+91 99999 88888',
            address: payload.address || 'Central Office',
          };
          state.organizations.unshift(newOrg);
        }

        form.reset();
        window.portalApp.closeModal('createOrgModal');
        renderOrgSelector();
        renderSuperAdminView();
        showToast(`Organisation ${payload.name} (${payload.code}) provisioned successfully!`);
      } catch (err) {
        showToast(`Error provisioning organization: ${err.message}`, 'error');
      }
    },

    // Toggle Organization Status (Super Admin)
    toggleOrgStatus: async (orgId) => {
      const org = state.organizations.find((o) => o.id === orgId);
      if (!org) return;

      const newStatus = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      org.status = newStatus;

      try {
        await fetch(`/api/organizations/${orgId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.log('Updated in local state');
      }

      renderSuperAdminView();
      showToast(`Organisation ${org.name} is now ${newStatus}!`);
    },

    // Open User Status Modal
    openStatusChangeModal: (userId, userName, currentStatus) => {
      document.getElementById('statusTargetUserId').value = userId;
      document.getElementById('statusTargetUserName').textContent = userName;
      document.getElementById('statusTargetNewStatus').value = currentStatus;
      document.getElementById('statusTargetReason').value = '';
      window.portalApp.openModal('statusChangeModal');
    },

    // Confirm User Status Mutation (Admin)
    handleStatusConfirmSubmit: async (e) => {
      e.preventDefault();
      const userId = parseInt(document.getElementById('statusTargetUserId').value, 10);
      const newStatus = document.getElementById('statusTargetNewStatus').value;
      const reason = document.getElementById('statusTargetReason').value;

      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.status = newStatus;
        try {
          await fetch(`/api/customers/${userId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, reason }),
          });
        } catch (err) {
          console.log('Saved in local state');
        }

        renderUserStatusTable();
        window.portalApp.closeModal('statusChangeModal');
        showToast(`Account ${user.name} status updated to ${newStatus}`);
      }
    },

    // Onboard User / Customer (Admin & Super Admin)
    handleAddUserSubmit: (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);

      const newUser = {
        id: Date.now(),
        orgId: state.currentOrgId,
        code: `CUST-0${state.users.length + 1}`,
        name: formData.get('name'),
        phone: formData.get('phone'),
        type: formData.get('type'),
        occupation: formData.get('occupation') || 'Merchant',
        activeLoans: 0,
        outstanding: 0,
        status: 'ACTIVE',
      };

      state.users.unshift(newUser);
      form.reset();
      window.portalApp.closeModal('addUserModal');
      renderUserStatusTable();
      showToast(`User ${newUser.name} successfully onboarded into ${state.organizations.find((o) => o.id === state.currentOrgId)?.name}`);
    },
  };

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
