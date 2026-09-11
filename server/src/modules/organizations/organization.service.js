/**
 * Organization Service — Multi-Tenant Engine
 * Manages organization tenants, branches, admin assignments, settings, and fund pool allocations.
 */

const { query, withTransaction } = require('../../config/database');
const bcrypt = require('bcryptjs');

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
    available_cash: 240000,
    total_lent: 760000,
    admin_name: 'Rajesh Kumar',
    admin_email: 'rajesh@apexfinance.com',
    phone: '9876543210',
    address: '14, Financial District, Chennai, Tamil Nadu',
    total_customers: 6,
    customer_count: 6,
    active_loans_count: 5,
    branch_count: 2,
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
    phone: '9840123456',
    address: '88, Gandhi Road, Coimbatore, Tamil Nadu',
    total_customers: 3,
    customer_count: 3,
    active_loans_count: 2,
    branch_count: 1,
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
    phone: '9443277890',
    address: '22, Bazaar Street, Madurai, Tamil Nadu',
    total_customers: 2,
    customer_count: 2,
    active_loans_count: 1,
    branch_count: 1,
    created_at: new Date('2026-03-01').toISOString(),
  },
  {
    id: 4,
    code: 'ORG-SBP',
    name: 'Sri Bhuvaneshwari Lending',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    currency: 'INR',
    initial_capital: 850000,
    available_cash: 230000,
    total_lent: 620000,
    admin_name: 'Senthil Nathan',
    admin_email: 'senthil@sbpfinance.com',
    phone: '9876501234',
    address: '55, Industrial Estate, Salem, Tamil Nadu',
    total_customers: 2,
    customer_count: 2,
    active_loans_count: 1,
    branch_count: 1,
    created_at: new Date('2026-02-10').toISOString(),
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
          (SELECT COUNT(*) FROM customers c WHERE c.organization_id = o.id) AS total_customers,
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
          total_customers: parseInt(r.total_customers || 0, 10),
          customer_count: parseInt(r.total_customers || 0, 10),
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
           (SELECT COUNT(*) FROM customers c WHERE c.organization_id = o.id) AS total_customers,
           (SELECT COUNT(*) FROM loans l WHERE l.organization_id = o.id AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE')) AS active_loans_count,
           (SELECT COUNT(*) FROM branches b WHERE b.organization_id = o.id) AS branch_count
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
          total_customers: parseInt(r.total_customers || 0, 10),
          customer_count: parseInt(r.total_customers || 0, 10),
          active_loans_count: parseInt(r.active_loans_count || 0, 10),
          branch_count: parseInt(r.branch_count || (branches?.length || 1), 10),
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
    let { name, code, plan = 'PRO', currency = 'INR', initial_capital = 500000, admin_name, admin_email, phone, admin_phone, address, city, state } = data;

    if (!name || !name.trim()) {
      throw new Error('Organization name is required.');
    }

    const effectivePhone = (admin_phone || phone || '').trim();
    const effectiveAdminName = (admin_name || 'Admin').trim();

    if (!code || !code.trim()) {
      const cleanName = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'ORG';
      code = `ORG-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const formattedCode = code.trim().toUpperCase();

    try {
      const existing = await query(`SELECT id FROM organizations WHERE code = ? LIMIT 1`, [formattedCode]);
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
            parseFloat(initial_capital) || 500000,
            parseFloat(initial_capital) || 500000,
            effectiveAdminName,
            admin_email || `${formattedCode.toLowerCase()}@fundflow.in`,
            effectivePhone,
            address || 'Tamil Nadu, India',
            city || 'Chennai',
            state || 'Tamil Nadu',
          ]
        );
        const orgId = orgRes.insertId;

        // 1. Default Main Branch
        const [branchRes] = await conn.query(
          `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, status)
           VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [orgId, `BR-${formattedCode}-01`, `${name.trim()} Main Branch`, address || city || 'Headquarters', effectivePhone, effectiveAdminName]
        );
        const branchId = branchRes.insertId;

        // 2. Default Settings
        await conn.query(
          `INSERT INTO organization_settings (organization_id, daily_loan_enabled, weekly_loan_enabled, max_active_loans_per_customer, auto_eligibility_check, default_interest_rate)
           VALUES (?, TRUE, TRUE, 2, TRUE, 10.00)`,
          [orgId]
        );

        // 3. Default Fund Account (Cash Vault)
        await conn.query(
          `INSERT INTO fund_accounts (organization_id, account_code, account_name, account_type, current_balance)
           VALUES (?, ?, ?, 'CASH', ?)`,
          [orgId, `CASH_MAIN_${formattedCode}`, `${name.trim()} Central Cash Vault`, parseFloat(initial_capital) || 500000]
        );

        // 4. Create Initial Admin User
        if (effectivePhone) {
          const [roles] = await conn.query(`SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`);
          const adminRoleId = roles?.[0]?.id || 2;
          const defaultPassHash = await bcrypt.hash('Admin@123', 10);
          
          const [userExists] = await conn.query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [effectivePhone]);
          if (userExists.length === 0) {
            const [uRes] = await conn.query(
              `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status)
               VALUES (?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
              [orgId, branchId, effectiveAdminName, effectivePhone, admin_email || `${effectivePhone}@fundflow.in`, defaultPassHash]
            );
            await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uRes.insertId, adminRoleId]);
          }
        }

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
      initial_capital: parseFloat(initial_capital) || 500000,
      available_cash: parseFloat(initial_capital) || 500000,
      total_lent: 0,
      admin_name: effectiveAdminName,
      admin_email: admin_email || `${formattedCode.toLowerCase()}@fundflow.in`,
      phone: effectivePhone,
      admin_phone: effectivePhone,
      address: address || '',
      city: city || 'Chennai',
      state: state || 'Tamil Nadu',
      total_customers: 0,
      customer_count: 0,
      active_loans_count: 0,
      branch_count: 1,
      created_at: new Date().toISOString(),
    };

    memoryOrganizations.unshift(newOrg);
    return newOrg;
  },

  // Update organization details
  updateOrganization: async (id, data) => {
    const { name, plan, status, admin_name, admin_email, phone, admin_phone, address, city, state } = data;
    const effectivePhone = (admin_phone || phone || '').trim();
    const effectiveAdminName = (admin_name || '').trim();

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
          effectiveAdminName || null,
          admin_email || null,
          effectivePhone || null,
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
    if (effectiveAdminName) org.admin_name = effectiveAdminName;
    if (admin_email) org.admin_email = admin_email;
    if (effectivePhone) {
      org.phone = effectivePhone;
      org.admin_phone = effectivePhone;
    }
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
