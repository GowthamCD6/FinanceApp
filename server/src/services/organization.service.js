/**
 * Organization Service — Multi-Tenant Engine
 * Manages organization tenants, branches, admin assignments, settings, and fund pool allocations.
 */

const { query, withTransaction } = require('../config/database');
const bcrypt = require('bcryptjs');

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

      if (!rows || rows.length === 0) {
        return [];
      }

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
    } catch (err) {
      console.error('Database query error in getAllOrganizations:', err.message);
      return [];
    }
  },

  // Get organization by ID
  getOrganizationById: async (id) => {
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

    if (!rows || rows.length === 0) {
      throw new Error(`Organization with ID ${id} not found.`);
    }

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
  },

  // Create new tenant organization
  createOrganization: async (data) => {
    let {
      name,
      code,
      plan = 'PRO',
      currency = 'INR',
      initial_capital = 500000,
      admin_name,
      admin_email,
      phone,
      admin_phone,
      admin_password,
      password,
      address,
      city,
      state,
    } = data;

    if (!name || !name.trim()) {
      throw new Error('Organization name is required.');
    }

    const effectivePhone = (admin_phone || phone || '').trim();
    const effectiveAdminName = (admin_name || 'Admin').trim();
    const effectiveAdminEmail = (admin_email || (effectivePhone ? `${effectivePhone}@fundflow.in` : '')).trim();
    const rawPassword = (admin_password || password || 'Admin@123').trim();

    if (!code || !code.trim()) {
      const cleanName = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'ORG';
      code = `ORG-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const formattedCode = code.trim().toUpperCase();

    const existing = await query(`SELECT id FROM organizations WHERE code = ? LIMIT 1`, [formattedCode]);
    if (existing && existing.length > 0) {
      throw new Error(`Organization code "${formattedCode}" is already registered.`);
    }

    const orgId = await withTransaction(async (conn) => {
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
          effectiveAdminEmail || `${formattedCode.toLowerCase()}@fundflow.in`,
          effectivePhone,
          address || 'Tamil Nadu, India',
          city || 'Chennai',
          state || 'Tamil Nadu',
        ]
      );
      const newOrgId = orgRes.insertId;

      // 1. Default Main Branch
      const [branchRes] = await conn.query(
        `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [newOrgId, `BR-${formattedCode}-01`, `${name.trim()} Main Branch`, address || city || 'Headquarters', effectivePhone, effectiveAdminName]
      );
      const branchId = branchRes.insertId;

      // 2. Default Settings
      await conn.query(
        `INSERT INTO organization_settings (organization_id, daily_loan_enabled, weekly_loan_enabled, max_active_loans_per_customer, auto_eligibility_check, default_interest_rate)
         VALUES (?, TRUE, TRUE, 2, TRUE, 10.00)`,
        [newOrgId]
      );

      // 3. Default Fund Account (Cash Vault)
      await conn.query(
        `INSERT INTO fund_accounts (organization_id, account_code, account_name, account_type, current_balance)
         VALUES (?, ?, ?, 'CASH', ?)`,
        [newOrgId, `CASH_MAIN_${formattedCode}`, `${name.trim()} Central Cash Vault`, parseFloat(initial_capital) || 500000]
      );

      // 4. Create Initial Org Admin User
      if (effectivePhone || effectiveAdminEmail) {
        const [roles] = await conn.query(`SELECT id FROM roles WHERE name IN ('ORG_ADMIN', 'ADMIN') ORDER BY id ASC LIMIT 1`);
        const adminRoleId = roles?.[0]?.id || 2;
        const passHash = await bcrypt.hash(rawPassword, 10);
        
        let userExists = [];
        if (effectivePhone) {
          const [byPhone] = await conn.query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [effectivePhone]);
          userExists = byPhone || [];
        }
        if (userExists.length === 0 && effectiveAdminEmail) {
          const [byEmail] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [effectiveAdminEmail]);
          userExists = byEmail || [];
        }

        let adminUserId = null;
        if (userExists.length === 0) {
          const [uRes] = await conn.query(
            `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status)
             VALUES (?, ?, ?, ?, ?, ?, 'ORG_ADMIN', 'ACTIVE')`,
            [newOrgId, branchId, effectiveAdminName, effectivePhone || null, effectiveAdminEmail, passHash]
          );
          adminUserId = uRes.insertId;
          await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [adminUserId, adminRoleId]);
        } else {
          adminUserId = userExists[0].id;
          await conn.query(
            `UPDATE users SET organization_id = ?, branch_id = ?, role_type = 'ORG_ADMIN', email = COALESCE(?, email), phone = COALESCE(?, phone), password_hash = ? WHERE id = ?`,
            [newOrgId, branchId, effectiveAdminEmail || null, effectivePhone || null, passHash, adminUserId]
          );
        }

        if (adminUserId) {
          await conn.query(`UPDATE branches SET manager_user_id = ? WHERE id = ?`, [adminUserId, branchId]);
        }
      }

      return newOrgId;
    });

    return await organizationService.getOrganizationById(orgId);
  },

  // Update organization details
  updateOrganization: async (id, data) => {
    const {
      name,
      plan,
      status,
      admin_name,
      admin_email,
      phone,
      admin_phone,
      admin_password,
      password,
      address,
      city,
      state,
    } = data;
    const effectivePhone = (admin_phone || phone || '').trim();
    const effectiveAdminName = (admin_name || '').trim();
    const effectiveAdminEmail = (admin_email || '').trim();

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
        effectiveAdminEmail || null,
        effectivePhone || null,
        address || null,
        city || null,
        state || null,
        id,
      ]
    );

    // Synchronize admin user details (phone, email, name, password) in users table
    if (admin_password || password || effectiveAdminEmail || effectiveAdminName || effectivePhone) {
      const rawPassword = (admin_password || password || '').trim();
      if (rawPassword) {
        const passHash = await bcrypt.hash(rawPassword, 10);
        await query(
          `UPDATE users SET 
             password_hash = ?,
             phone = COALESCE(?, phone),
             email = COALESCE(?, email),
             name = COALESCE(?, name),
             updated_at = NOW()
           WHERE organization_id = ? AND role_type IN ('ORG_ADMIN', 'ADMIN')`,
          [passHash, effectivePhone || null, effectiveAdminEmail || null, effectiveAdminName || null, id]
        );
      } else {
        await query(
          `UPDATE users SET 
             phone = COALESCE(?, phone),
             email = COALESCE(?, email),
             name = COALESCE(?, name),
             updated_at = NOW()
           WHERE organization_id = ? AND role_type IN ('ORG_ADMIN', 'ADMIN')`,
          [effectivePhone || null, effectiveAdminEmail || null, effectiveAdminName || null, id]
        );
      }
    }

    return await organizationService.getOrganizationById(id);
  },

  // Update organization status (Active / Suspended / Inactive)
  updateOrganizationStatus: async (id, status) => {
    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status.toUpperCase())) {
      throw new Error('Invalid organization status. Must be ACTIVE, SUSPENDED, or INACTIVE.');
    }

    await query(`UPDATE organizations SET status = ?, updated_at = NOW() WHERE id = ?`, [status.toUpperCase(), id]);
    return await organizationService.getOrganizationById(id);
  },

  // Get branches for an organization with live metrics and assigned branch admin info
  getBranches: async (orgId) => {
    try {
      // Ensure manager_user_id column exists
      try {
        await query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_user_id BIGINT UNSIGNED NULL");
      } catch (e) {}

      const branches = await query(
        `SELECT 
           b.*,
           u.id AS admin_user_id,
           u.name AS admin_user_name,
           u.phone AS admin_user_phone,
           u.email AS admin_user_email,
           u.role_type AS admin_role_type,
           (SELECT COUNT(*) FROM customers c WHERE c.branch_id = b.id) AS borrower_count,
           (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.role_type IN ('ADMIN', 'BRANCH_ADMIN', 'FIELD_AGENT', 'COLLECTOR')) AS staff_count,
           (SELECT COUNT(*) FROM loans l JOIN customers c ON l.customer_id = c.id WHERE c.branch_id = b.id AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE')) AS active_loans_count
         FROM branches b
         LEFT JOIN users u ON b.manager_user_id = u.id
         WHERE b.organization_id = ? 
         ORDER BY b.id ASC`,
        [orgId]
      );
      return branches || [];
    } catch (err) {
      console.warn('Database fallback in getBranches:', err.message);
      return [];
    }
  },

  // Create branch under an organization and optionally provision a Branch Admin user
  createBranch: async (orgId, branchData) => {
    const {
      branch_code,
      branch_name,
      location,
      phone,
      manager_name,
      manager_phone,
      manager_email,
      manager_password,
      create_branch_admin
    } = branchData;

    if (!branch_name) throw new Error('Branch name is required.');

    const bCode = branch_code || `BR-${orgId}-${Date.now().toString().slice(-4)}`;
    const effectiveMgrName = (manager_name || '').trim();
    const effectiveMgrPhone = (manager_phone || phone || '').trim();

    try {
      return await withTransaction(async (conn) => {
        const [res] = await conn.query(
          `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, manager_phone, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [orgId, bCode, branch_name.trim(), location || '', phone || '', effectiveMgrName, effectiveMgrPhone]
        );
        const branchId = res.insertId;
        let adminUserId = null;

        // Optionally create Branch Admin user immediately
        if ((create_branch_admin || manager_password) && effectiveMgrPhone) {
          const [roleRows] = await conn.query(`SELECT id FROM roles WHERE name = 'BRANCH_ADMIN' LIMIT 1`);
          const branchAdminRoleId = roleRows?.[0]?.id || 2;
          const passwordHash = await bcrypt.hash(manager_password || 'Admin@123', 10);
          const emailVal = manager_email || `${effectiveMgrPhone}@fundflow.in`;

          const [existingUsers] = await conn.query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [effectiveMgrPhone]);
          if (existingUsers.length === 0) {
            const [uRes] = await conn.query(
              `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status)
               VALUES (?, ?, ?, ?, ?, ?, 'BRANCH_ADMIN', 'ACTIVE')`,
              [orgId, branchId, effectiveMgrName || `${branch_name} Admin`, effectiveMgrPhone, emailVal, passwordHash]
            );
            adminUserId = uRes.insertId;
            await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [adminUserId, branchAdminRoleId]);
          } else {
            adminUserId = existingUsers[0].id;
            await conn.query(`UPDATE users SET branch_id = ?, organization_id = ?, role_type = 'BRANCH_ADMIN' WHERE id = ?`, [branchId, orgId, adminUserId]);
            await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [adminUserId, branchAdminRoleId]);
          }

          if (adminUserId) {
            await conn.query(`UPDATE branches SET manager_user_id = ? WHERE id = ?`, [adminUserId, branchId]);
          }
        }

        const [createdBranch] = await conn.query(`SELECT * FROM branches WHERE id = ?`, [branchId]);
        return createdBranch[0];
      });
    } catch (err) {
      console.warn('Database error in createBranch:', err.message);
      throw err;
    }
  },

  // Assign or Provision a Branch Admin for a branch
  assignBranchAdmin: async (orgId, branchId, adminData) => {
    const { userId, name, phone, email, password } = adminData;

    try {
      return await withTransaction(async (conn) => {
        // Verify branch belongs to organization
        const [branches] = await conn.query(`SELECT * FROM branches WHERE id = ? AND organization_id = ? LIMIT 1`, [branchId, orgId]);
        if (branches.length === 0) {
          throw new Error(`Branch with ID ${branchId} does not belong to organization ${orgId}.`);
        }

        const [roleRows] = await conn.query(`SELECT id FROM roles WHERE name = 'BRANCH_ADMIN' LIMIT 1`);
        const branchAdminRoleId = roleRows?.[0]?.id || 2;
        let assignedUserId = userId;
        let adminName = name;
        let adminPhone = phone;

        if (userId) {
          // Link existing user
          const [userRows] = await conn.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [userId]);
          if (userRows.length === 0) throw new Error(`User with ID ${userId} not found.`);
          const targetUser = userRows[0];
          adminName = targetUser.name;
          adminPhone = targetUser.phone;

          await conn.query(
            `UPDATE users SET organization_id = ?, branch_id = ?, role_type = 'BRANCH_ADMIN' WHERE id = ?`,
            [orgId, branchId, userId]
          );
          await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, branchAdminRoleId]);
        } else {
          // Create new Branch Admin user
          if (!name || !phone) {
            throw new Error('Name and phone number are required to create a new Branch Admin.');
          }
          const rawPhone = phone.trim();
          const [userExists] = await conn.query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [rawPhone]);
          
          if (userExists.length > 0) {
            assignedUserId = userExists[0].id;
            await conn.query(
              `UPDATE users SET organization_id = ?, branch_id = ?, role_type = 'BRANCH_ADMIN' WHERE id = ?`,
              [orgId, branchId, assignedUserId]
            );
            await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [assignedUserId, branchAdminRoleId]);
          } else {
            const passwordHash = await bcrypt.hash(password || 'Admin@123', 10);
            const userEmail = email || `${rawPhone}@fundflow.in`;
            const [uRes] = await conn.query(
              `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status)
               VALUES (?, ?, ?, ?, ?, ?, 'BRANCH_ADMIN', 'ACTIVE')`,
              [orgId, branchId, name.trim(), rawPhone, userEmail, passwordHash]
            );
            assignedUserId = uRes.insertId;
            await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [assignedUserId, branchAdminRoleId]);
          }
        }

        // Update branch with assigned manager
        await conn.query(
          `UPDATE branches SET manager_user_id = ?, manager_name = ?, manager_phone = ?, updated_at = NOW() WHERE id = ?`,
          [assignedUserId, adminName, adminPhone, branchId]
        );

        const [updatedBranch] = await conn.query(
          `SELECT 
             b.*,
             u.id AS admin_user_id,
             u.name AS admin_user_name,
             u.phone AS admin_user_phone,
             u.email AS admin_user_email
           FROM branches b
           LEFT JOIN users u ON b.manager_user_id = u.id
           WHERE b.id = ?`,
          [branchId]
        );

        return updatedBranch[0];
      });
    } catch (err) {
      console.error('Error assigning branch admin:', err.message);
      throw err;
    }
  },

  // Update branch details
  updateBranch: async (orgId, branchId, data) => {
    const { branch_name, location, phone, manager_name, manager_phone, status } = data;
    try {
      await query(
        `UPDATE branches SET 
           branch_name = COALESCE(?, branch_name),
           location = COALESCE(?, location),
           phone = COALESCE(?, phone),
           manager_name = COALESCE(?, manager_name),
           manager_phone = COALESCE(?, manager_phone),
           status = COALESCE(?, status),
           updated_at = NOW()
         WHERE id = ? AND organization_id = ?`,
        [
          branch_name ? branch_name.trim() : null,
          location || null,
          phone || null,
          manager_name || null,
          manager_phone || null,
          status ? status.toUpperCase() : null,
          branchId,
          orgId,
        ]
      );
      const rows = await query(`SELECT * FROM branches WHERE id = ? AND organization_id = ?`, [branchId, orgId]);
      return rows[0];
    } catch (err) {
      console.warn('Database error in updateBranch:', err.message);
      throw err;
    }
  },

  // Update branch status (ACTIVE / INACTIVE)
  updateBranchStatus: async (orgId, branchId, status) => {
    try {
      await query(
        `UPDATE branches SET status = ?, updated_at = NOW() WHERE id = ? AND organization_id = ?`,
        [status.toUpperCase(), branchId, orgId]
      );
      const rows = await query(`SELECT * FROM branches WHERE id = ? AND organization_id = ?`, [branchId, orgId]);
      return rows[0];
    } catch (err) {
      console.warn('Database error in updateBranchStatus:', err.message);
      throw err;
    }
  },
  // Get organization lending & interest rate schemes
  getLendingConfig: async (orgId) => {
    try {
      const alters = [
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS daily_interest_rate DECIMAL(5,2) DEFAULT 10.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS daily_tenure_days INT DEFAULT 100",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_interest_rate DECIMAL(5,2) DEFAULT 10.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_tenure_weeks INT DEFAULT 10",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_interest_rate DECIMAL(5,2) DEFAULT 18.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_tenure_months INT DEFAULT 12",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_loan_enabled BOOLEAN DEFAULT TRUE",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS daily_min_amount DECIMAL(15,2) DEFAULT 2000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS daily_max_amount DECIMAL(15,2) DEFAULT 100000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_min_amount DECIMAL(15,2) DEFAULT 5000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_max_amount DECIMAL(15,2) DEFAULT 150000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_min_amount DECIMAL(15,2) DEFAULT 100000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_max_amount DECIMAL(15,2) DEFAULT 500000.00",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_collection_days VARCHAR(100) DEFAULT 'MON,WED,FRI'",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS weekly_collection_grace_days INT DEFAULT 2",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_collection_start_day INT DEFAULT 1",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_collection_end_day INT DEFAULT 5",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS monthly_collection_grace_days INT DEFAULT 3",
        "ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS daily_operating_days VARCHAR(100) DEFAULT 'MON,TUE,WED,THU,FRI,SAT'"
      ];
      for (const alt of alters) {
        try { await query(alt); } catch (e) {}
      }

      const rows = await query(`SELECT * FROM organization_settings WHERE organization_id = ? LIMIT 1`, [orgId]);
      if (rows && rows.length > 0) return rows[0];

      await query(
        `INSERT INTO organization_settings 
         (organization_id, daily_loan_enabled, weekly_loan_enabled, monthly_loan_enabled, daily_interest_rate, daily_tenure_days, weekly_interest_rate, weekly_tenure_weeks, monthly_interest_rate, monthly_tenure_months, max_active_loans_per_customer, auto_eligibility_check, grace_period_days, default_interest_rate, currency_symbol, weekly_collection_days, weekly_collection_grace_days, monthly_collection_start_day, monthly_collection_end_day, monthly_collection_grace_days, daily_operating_days)
         VALUES (?, 1, 1, 1, 10.00, 100, 10.00, 10, 18.00, 12, 1, 1, 0, 10.00, '₹', 'MON,WED,FRI', 2, 1, 5, 3, 'MON,TUE,WED,THU,FRI,SAT')`,
        [orgId]
      );
      const created = await query(`SELECT * FROM organization_settings WHERE organization_id = ? LIMIT 1`, [orgId]);
      return created && created.length > 0 ? created[0] : null;
    } catch (err) {
      console.warn('Fallback in getLendingConfig:', err.message);
      return {
        organization_id: parseInt(orgId, 10),
        daily_loan_enabled: true,
        weekly_loan_enabled: true,
        monthly_loan_enabled: true,
        daily_interest_rate: 10.00,
        daily_tenure_days: 100,
        weekly_interest_rate: 10.00,
        weekly_tenure_weeks: 10,
        monthly_interest_rate: 18.00,
        monthly_tenure_months: 12,
        daily_min_amount: 2000,
        daily_max_amount: 100000,
        weekly_min_amount: 5000,
        weekly_max_amount: 150000,
        monthly_min_amount: 10000,
        monthly_max_amount: 500000,
        max_active_loans_per_customer: 1,
        auto_eligibility_check: true,
        grace_period_days: 0,
        currency_symbol: '₹',
        weekly_collection_days: 'MON,WED,FRI',
        weekly_collection_grace_days: 2,
        monthly_collection_start_day: 1,
        monthly_collection_end_day: 5,
        monthly_collection_grace_days: 3,
        daily_operating_days: 'MON,TUE,WED,THU,FRI,SAT'
      };
    }
  },

  // Update organization lending & interest rate schemes
  updateLendingConfig: async (orgId, configData) => {
    const {
      daily_loan_enabled,
      weekly_loan_enabled,
      monthly_loan_enabled,
      daily_interest_rate,
      daily_tenure_days,
      weekly_interest_rate,
      weekly_tenure_weeks,
      monthly_interest_rate,
      monthly_tenure_months,
      daily_min_amount,
      daily_max_amount,
      weekly_min_amount,
      weekly_max_amount,
      monthly_min_amount,
      monthly_max_amount,
      max_active_loans_per_customer,
      auto_eligibility_check,
      grace_period_days,
      currency_symbol,
      weekly_collection_days,
      weekly_collection_grace_days,
      monthly_collection_start_day,
      monthly_collection_end_day,
      monthly_collection_grace_days,
      daily_operating_days
    } = configData;

    try {
      await organizationService.getLendingConfig(orgId);
      await query(
        `UPDATE organization_settings SET
           daily_loan_enabled = COALESCE(?, daily_loan_enabled),
           weekly_loan_enabled = COALESCE(?, weekly_loan_enabled),
           monthly_loan_enabled = COALESCE(?, monthly_loan_enabled),
           daily_interest_rate = COALESCE(?, daily_interest_rate),
           daily_tenure_days = COALESCE(?, daily_tenure_days),
           weekly_interest_rate = COALESCE(?, weekly_interest_rate),
           weekly_tenure_weeks = COALESCE(?, weekly_tenure_weeks),
           monthly_interest_rate = COALESCE(?, monthly_interest_rate),
           monthly_tenure_months = COALESCE(?, monthly_tenure_months),
           daily_min_amount = COALESCE(?, daily_min_amount),
           daily_max_amount = COALESCE(?, daily_max_amount),
           weekly_min_amount = COALESCE(?, weekly_min_amount),
           weekly_max_amount = COALESCE(?, weekly_max_amount),
           monthly_min_amount = COALESCE(?, monthly_min_amount),
           monthly_max_amount = COALESCE(?, monthly_max_amount),
           max_active_loans_per_customer = COALESCE(?, max_active_loans_per_customer),
           auto_eligibility_check = COALESCE(?, auto_eligibility_check),
           grace_period_days = COALESCE(?, grace_period_days),
           currency_symbol = COALESCE(?, currency_symbol),
           weekly_collection_days = COALESCE(?, weekly_collection_days),
           weekly_collection_grace_days = COALESCE(?, weekly_collection_grace_days),
           monthly_collection_start_day = COALESCE(?, monthly_collection_start_day),
           monthly_collection_end_day = COALESCE(?, monthly_collection_end_day),
           monthly_collection_grace_days = COALESCE(?, monthly_collection_grace_days),
           daily_operating_days = COALESCE(?, daily_operating_days)
         WHERE organization_id = ?`,
        [
          daily_loan_enabled != null ? (daily_loan_enabled ? 1 : 0) : null,
          weekly_loan_enabled != null ? (weekly_loan_enabled ? 1 : 0) : null,
          monthly_loan_enabled != null ? (monthly_loan_enabled ? 1 : 0) : null,
          daily_interest_rate,
          daily_tenure_days,
          weekly_interest_rate,
          weekly_tenure_weeks,
          monthly_interest_rate,
          monthly_tenure_months,
          daily_min_amount,
          daily_max_amount,
          weekly_min_amount,
          weekly_max_amount,
          monthly_min_amount,
          monthly_max_amount,
          max_active_loans_per_customer,
          auto_eligibility_check != null ? (auto_eligibility_check ? 1 : 0) : null,
          grace_period_days,
          currency_symbol,
          weekly_collection_days,
          weekly_collection_grace_days,
          monthly_collection_start_day,
          monthly_collection_end_day,
          monthly_collection_grace_days,
          daily_operating_days,
          orgId
        ]
      );
      // Synchronize default_category_configs table with newly saved interest rates & tenures
      if (weekly_interest_rate != null || weekly_tenure_weeks != null || weekly_min_amount != null || weekly_max_amount != null) {
        await query(
          `UPDATE default_category_configs SET
             default_interest_rate = COALESCE(?, default_interest_rate),
             tenure_installments = COALESCE(?, tenure_installments),
             default_min_loan = COALESCE(?, default_min_loan),
             default_max_loan = COALESCE(?, default_max_loan),
             description = CONCAT('Standard individual and worker micro-loans with ', COALESCE(?, tenure_installments), '-week recurring repayments.')
           WHERE category_code = 'CAT-BORROWER-WK'`,
          [weekly_interest_rate, weekly_tenure_weeks, weekly_min_amount, weekly_max_amount, weekly_tenure_weeks]
        );
      }

      if (daily_interest_rate != null || daily_tenure_days != null || daily_min_amount != null || daily_max_amount != null) {
        await query(
          `UPDATE default_category_configs SET
             default_interest_rate = COALESCE(?, default_interest_rate),
             tenure_installments = COALESCE(?, tenure_installments),
             default_min_loan = COALESCE(?, default_min_loan),
             default_max_loan = COALESCE(?, default_max_loan),
             description = CONCAT('Retail shopkeepers and stall merchants with ', COALESCE(?, tenure_installments), '-day rapid daily collections.')
           WHERE category_code = 'CAT-MERCHANT-DLY'`,
          [daily_interest_rate, daily_tenure_days, daily_min_amount, daily_max_amount, daily_tenure_days]
        );
      }

      if (monthly_interest_rate != null || monthly_tenure_months != null || monthly_min_amount != null || monthly_max_amount != null) {
        await query(
          `UPDATE default_category_configs SET
             default_interest_rate = COALESCE(?, default_interest_rate),
             tenure_installments = COALESCE(?, tenure_installments),
             default_min_loan = COALESCE(?, default_min_loan),
             default_max_loan = COALESCE(?, default_max_loan),
             description = CONCAT(COALESCE(?, tenure_installments), '-Month structured EMI micro-loans for salaried individuals (', COALESCE(?, default_interest_rate), '% flat interest).')
           WHERE category_code = 'CAT-BORROWER-MO'`,
          [monthly_interest_rate, monthly_tenure_months, monthly_min_amount, monthly_max_amount, monthly_tenure_months, monthly_interest_rate]
        );
      }

      return await organizationService.getLendingConfig(orgId);
    } catch (err) {
      console.warn('Update fallback in updateLendingConfig:', err.message);
      return { organization_id: orgId, ...configData };
    }
  },
};

module.exports = organizationService;
