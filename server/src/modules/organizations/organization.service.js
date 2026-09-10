/**
 * Organization Service — Multi-Tenant Engine
 * Manages organization tenants, admin assignments, and fund pool allocations.
 */

// In-memory tenant registry with DB synchronization capability
let organizations = [
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
    address: '14, Financial District, Chennai, Tamil Nadu',
    customer_count: 5,
    active_loans_count: 4,
    created_at: new Date('2026-01-01').toISOString(),
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
    address: '88, Gandhi Road, Coimbatore, Tamil Nadu',
    customer_count: 3,
    active_loans_count: 2,
    created_at: new Date('2026-02-15').toISOString(),
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
    address: '22, Bazaar Street, Madurai, Tamil Nadu',
    customer_count: 2,
    active_loans_count: 1,
    created_at: new Date('2026-03-01').toISOString(),
  },
];

const organizationService = {
  // Get all organizations (Super Admin)
  getAllOrganizations: async () => {
    return organizations;
  },

  // Get organization by ID
  getOrganizationById: async (id) => {
    const org = organizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);
    return org;
  },

  // Create new tenant organization
  createOrganization: async (data) => {
    const { name, code, plan = 'PRO', currency = 'INR', initial_capital = 500000, admin_name, admin_email, phone, address } = data;

    if (!name || !code) {
      throw new Error('Organization name and unique organization code are required.');
    }

    const existing = organizations.find((o) => o.code.toUpperCase() === code.trim().toUpperCase());
    if (existing) {
      throw new Error(`Organization code "${code}" is already registered.`);
    }

    const newOrg = {
      id: organizations.length + 1,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      plan: plan.toUpperCase(),
      status: 'ACTIVE',
      currency,
      initial_capital: parseFloat(initial_capital) || 0,
      available_cash: parseFloat(initial_capital) || 0,
      total_lent: 0,
      admin_name: admin_name || 'Admin',
      admin_email: admin_email || `${code.toLowerCase()}@fundflow.in`,
      phone: phone || '',
      address: address || '',
      customer_count: 0,
      active_loans_count: 0,
      created_at: new Date().toISOString(),
    };

    organizations.unshift(newOrg);
    return newOrg;
  },

  // Update organization status (Active / Suspended)
  updateOrganizationStatus: async (id, status) => {
    const org = organizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      throw new Error('Invalid organization status. Must be ACTIVE, SUSPENDED, or INACTIVE.');
    }

    org.status = status;
    org.updated_at = new Date().toISOString();
    return org;
  },

  // Update organization capital/fund metrics
  adjustOrganizationCapital: async (id, amount, isAddition = true) => {
    const org = organizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);

    if (isAddition) {
      org.available_cash += parseFloat(amount);
      org.initial_capital += parseFloat(amount);
    } else {
      org.available_cash = Math.max(0, org.available_cash - parseFloat(amount));
    }
    return org;
  },
};

module.exports = organizationService;
