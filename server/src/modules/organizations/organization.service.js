/**
 * Organization Service — Multi-Tenant Engine
 * Manages organization tenants, branches, admin assignments, settings, and fund pool allocations.
 */

const { query, withTransaction } = require('../../config/database');

// In-memory fallback registry for offline / staging resiliency
let memoryOrganizations = [
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
  // Get all organizations with live customer & loan counts from DB
  getAllOrganizations: async () => {
    try {
      const rows = await query(`
        SELECT 
          o.id,
          o.code,
          o.name,
          o.plan,
          o.status,
          o.currency,
          o.initial_capital,
          o.available_cash,
          o.total_lent,
          o.admin_name,
          o.admin_email,
          o.phone,
          o.address,
          o.city,
          o.state,
          o.created_at,
          o.updated_at,
          (SELECT COUNT(*) FROM customers c WHERE c.organization_id = o.id) AS customer_count,
          (SELECT COUNT(*) FROM loans l WHERE l.organization_id = o.id AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE')) AS active_loans_count,
          (SELECT COUNT(*) FROM branches b WHERE b.organization_id = o.id) AS branch_count
        FROM organizations o
        ORDER BY o.id ASC
      `);

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          plan: r.plan,
          status: r.status,
          currency: r.currency || 'INR',
          initial_capital: parseFloat(r.initial_capital || 0),
          available_cash: parseFloat(r.available_cash || 0),
          total_lent: parseFloat(r.total_lent || 0),
          admin_name: r.admin_name || '',
          admin_email: r.admin_email || '',
          phone: r.phone || '',
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          customer_count: parseInt(r.customer_count || 0, 10),
          active_loans_count: parseInt(r.active_loans_count || 0, 10),
          branch_count: parseInt(r.branch_count || 0, 10),
          created_at: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('Database query fallback in getAllOrganizations:', err.message);
    }
    return memoryOrganizations;
  },

  // Get organization by ID
  getOrganizationById: async (id) => {
    try {
      const rows = await query(
        `SELECT 
           o.*,
           (SELECT COUNT(*) FROM customers c WHERE c.organization_id = o.id) AS customer_count,
           (SELECT COUNT(*) FROM loans l WHERE l.organization_id = o.id AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE')) AS active_loans_count
         FROM organizations o
         WHERE o.id = ?
         LIMIT 1`,
        [id]
      );

      if (rows && rows.length > 0) {
        const r = rows[0];
        const branches = await query(`SELECT * FROM branches WHERE organization_id = ?`, [id]);
        const settings = await query(`SELECT * FROM organization_settings WHERE organization_id = ? LIMIT 1`, [id]);

        return {
          id: r.id,
          code: r.code,
          name: r.name,
          plan: r.plan,
          status: r.status,
          currency: r.currency,
          initial_capital: parseFloat(r.initial_capital || 0),
          available_cash: parseFloat(r.available_cash || 0),
          total_lent: parseFloat(r.total_lent || 0),
          admin_name: r.admin_name,
          admin_email: r.admin_email,
          phone: r.phone,
          address: r.address,
          city: r.city,
          state: r.state,
          customer_count: parseInt(r.customer_count || 0, 10),
          active_loans_count: parseInt(r.active_loans_count || 0, 10),
          branches: branches || [],
          settings: settings && settings.length > 0 ? settings[0] : null,
          created_at: r.created_at,
        };
      }
    } catch (err) {
      console.warn('Database query fallback in getOrganizationById:', err.message);
    }

    const org = memoryOrganizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);
    return org;
  },

  // Create new tenant organization
  createOrganization: async (data) => {
    const { name, code, plan = 'PRO', currency = 'INR', initial_capital = 500000, admin_name, admin_email, phone, address, city, state } = data;

    if (!name || !code) {
      throw new Error('Organization name and unique organization code are required.');
    }

    const formattedCode = code.trim().toUpperCase();

    try {
      const [existing] = await query(`SELECT id FROM organizations WHERE code = ? LIMIT 1`, [formattedCode]);
      if (existing && existing.length > 0) {
        throw new Error(`Organization code "${formattedCode}" is already registered.`);
      }

      const res = await withTransaction(async (conn) => {
        const [orgRes] = await conn.query(
          `INSERT INTO organizations 
           (code, name, plan, status, currency, initial_capital, available_cash, total_lent, admin_name, admin_email, phone, address, city, state)
           VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, 0.00, ?, ?, ?, ?, ?, ?)`,
          [
            formattedCode,
            name.trim(),
            plan.toUpperCase(),
            currency,
            parseFloat(initial_capital) || 0,
            parseFloat(initial_capital) || 0,
            admin_name || 'Admin',
            admin_email || `${formattedCode.toLowerCase()}@fundflow.in`,
            phone || '',
            address || '',
            city || null,
            state || null,
          ]
        );
        const orgId = orgRes.insertId;

        // Default Main Branch
        await conn.query(
          `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, status)
           VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [orgId, `BR-${formattedCode}-01`, `${name.trim()} Main Branch`, address || city || 'Headquarters', phone || '', admin_name || 'Branch Manager']
        );

        // Default Settings
        await conn.query(
          `INSERT INTO organization_settings (organization_id, daily_loan_enabled, weekly_loan_enabled, max_active_loans_per_customer, auto_eligibility_check, default_interest_rate)
           VALUES (?, TRUE, TRUE, 1, TRUE, 10.00)`,
          [orgId]
        );

        // Default Fund Account (Cash Vault)
        await conn.query(
          `INSERT INTO fund_accounts (organization_id, account_code, account_name, account_type, current_balance)
           VALUES (?, ?, ?, 'CASH', ?)`,
          [orgId, `CASH_MAIN_${formattedCode}`, `${name.trim()} Central Cash Vault`, parseFloat(initial_capital) || 0]
        );

        return orgId;
      });

      return await organizationService.getOrganizationById(res);
    } catch (err) {
      if (err.message.includes('already registered')) throw err;
      console.warn('Database write fallback in createOrganization:', err.message);
    }

    // Memory fallback
    const newOrg = {
      id: memoryOrganizations.length + 1,
      code: formattedCode,
      name: name.trim(),
      plan: plan.toUpperCase(),
      status: 'ACTIVE',
      currency,
      initial_capital: parseFloat(initial_capital) || 0,
      available_cash: parseFloat(initial_capital) || 0,
      total_lent: 0,
      admin_name: admin_name || 'Admin',
      admin_email: admin_email || `${formattedCode.toLowerCase()}@fundflow.in`,
      phone: phone || '',
      address: address || '',
      customer_count: 0,
      active_loans_count: 0,
      created_at: new Date().toISOString(),
    };

    memoryOrganizations.unshift(newOrg);
    return newOrg;
  },

  // Update organization details
  updateOrganization: async (id, data) => {
    const { name, plan, status, admin_name, admin_email, phone, address, city, state } = data;
    try {
      await query(
        `UPDATE organizations SET 
           name = COALESCE(?, name),
           plan = COALESCE(?, plan),
           status = COALESCE(?, status),
           admin_name = COALESCE(?, admin_name),
           admin_email = COALESCE(?, admin_email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           updated_at = NOW()
         WHERE id = ?`,
        [
          name ? name.trim() : null,
          plan ? plan.toUpperCase() : null,
          status ? status.toUpperCase() : null,
          admin_name || null,
          admin_email || null,
          phone || null,
          address || null,
          city || null,
          state || null,
          id,
        ]
      );
      return await organizationService.getOrganizationById(id);
    } catch (err) {
      console.warn('Database update fallback in updateOrganization:', err.message);
    }

    const org = memoryOrganizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);
    if (name) org.name = name.trim();
    if (plan) org.plan = plan.toUpperCase();
    if (status) org.status = status.toUpperCase();
    if (admin_name) org.admin_name = admin_name;
    if (admin_email) org.admin_email = admin_email;
    if (phone) org.phone = phone;
    if (address) org.address = address;
    org.updated_at = new Date().toISOString();
    return org;
  },

  // Update organization status (Active / Suspended / Inactive)
  updateOrganizationStatus: async (id, status) => {
    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status.toUpperCase())) {
      throw new Error('Invalid organization status. Must be ACTIVE, SUSPENDED, or INACTIVE.');
    }

    try {
      await query(`UPDATE organizations SET status = ?, updated_at = NOW() WHERE id = ?`, [status.toUpperCase(), id]);
      return await organizationService.getOrganizationById(id);
    } catch (err) {
      console.warn('Database fallback in updateOrganizationStatus:', err.message);
    }

    const org = memoryOrganizations.find((o) => o.id === parseInt(id, 10));
    if (!org) throw new Error(`Organization with ID ${id} not found.`);
    org.status = status.toUpperCase();
    org.updated_at = new Date().toISOString();
    return org;
  },

  // Get branches for an organization
  getBranches: async (orgId) => {
    try {
      const branches = await query(`SELECT * FROM branches WHERE organization_id = ? ORDER BY id ASC`, [orgId]);
      return branches || [];
    } catch (err) {
      return [
        {
          id: 1,
          organization_id: parseInt(orgId, 10),
          branch_code: `BR-01`,
          branch_name: 'Main Hub',
          location: 'Chennai Central',
          status: 'ACTIVE',
        },
      ];
    }
  },

  // Create branch under an organization
  createBranch: async (orgId, branchData) => {
    const { branch_code, branch_name, location, phone, manager_name } = branchData;
    if (!branch_name) throw new Error('Branch name is required.');

    const bCode = branch_code || `BR-${orgId}-${Date.now().toString().slice(-4)}`;

    try {
      const [res] = await query(
        `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [orgId, bCode, branch_name.trim(), location || '', phone || '', manager_name || '']
      );
      return { id: res.insertId, organization_id: orgId, branch_code: bCode, branch_name, location, phone, manager_name, status: 'ACTIVE' };
    } catch (err) {
      console.warn('Database fallback in createBranch:', err.message);
      return { id: Date.now(), organization_id: orgId, branch_code: bCode, branch_name, location, phone, manager_name, status: 'ACTIVE' };
    }
  },
};

module.exports = organizationService;
