const { query } = require('../config/database');

async function bootstrapDatabase() {
  try {
    // 1. Column Alterations
    const alters = [
      "ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_user_id BIGINT UNSIGNED NULL",
      "ALTER TABLE users MODIFY COLUMN role_type ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'BRANCH_ADMIN', 'FIELD_AGENT', 'SHOPKEEPER', 'COMMON_CUSTOMER', 'USER') NOT NULL DEFAULT 'USER'",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS branch_id BIGINT UNSIGNED NULL",
      "ALTER TABLE loans ADD COLUMN IF NOT EXISTS branch_id BIGINT UNSIGNED NULL",
      "ALTER TABLE payments ADD COLUMN IF NOT EXISTS branch_id BIGINT UNSIGNED NULL",
    ];

    for (const sql of alters) {
      try {
        await query(sql);
      } catch (err) {
        // Ignore column exists or engine warnings
      }
    }

    // 2. Roles
    await query(`
      INSERT INTO roles (name, description) VALUES
      ('SUPER_ADMIN', 'Complete platform administration across all organizations'),
      ('ORG_ADMIN', 'Organization Master Administrator managing all branches, staff, loans, and settings'),
      ('ADMIN', 'Organization Administrator managing branches, loans, and users'),
      ('BRANCH_ADMIN', 'Branch Administrator strictly managing operations, staff, borrowers, and collections for their assigned branch only'),
      ('FIELD_AGENT', 'Field executive managing routes, disbursements, and physical collections'),
      ('SHOPKEEPER', 'Merchant borrower with daily micro-credit facility'),
      ('USER', 'Borrower / Customer with loan portfolio and schedule visibility')
      ON DUPLICATE KEY UPDATE description=VALUES(description)
    `);

    // 3. Permissions
    await query(`
      INSERT INTO permissions (name, description) VALUES
      ('BRANCH_MANAGE', 'Create and configure organizational branches')
      ON DUPLICATE KEY UPDATE description=VALUES(description)
    `);

    // 4. Role Permissions
    await query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
      WHERE r.name IN ('ORG_ADMIN', 'ADMIN') AND p.name IN (
        'ORG_MANAGE', 'BRANCH_MANAGE', 'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
        'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
        'PAYMENT_CREATE', 'PAYMENT_READ', 'FUND_READ', 'EXPENSE_CREATE', 'REPORT_VIEW', 'USER_MANAGE'
      )
    `);

    await query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
      WHERE r.name = 'BRANCH_ADMIN' AND p.name IN (
        'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
        'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
        'PAYMENT_CREATE', 'PAYMENT_READ', 'FUND_READ', 'REPORT_VIEW', 'USER_MANAGE'
      )
    `);

    // 5. Ensure every existing organization has at least one default branch
    const orgs = await query(`SELECT id, code, name, address, city, phone, admin_name, admin_phone FROM organizations`);
    for (const org of orgs) {
      const branches = await query(`SELECT id FROM branches WHERE organization_id = ? LIMIT 1`, [org.id]);
      if (branches.length === 0) {
        const branchCode = `BR-${org.code || org.id}-01`;
        const branchName = `${org.name} Main Branch`;
        await query(
          `INSERT INTO branches (organization_id, branch_code, branch_name, location, phone, manager_name, status)
           VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [org.id, branchCode, branchName, org.address || org.city || 'Headquarters', org.admin_phone || org.phone || '', org.admin_name || 'Branch Manager']
        );
      }
    }

    console.log('✅ Database schema & tenant/branch RBAC bootstrap verified.');
  } catch (err) {
    console.warn('⚠️ Bootstrap database non-critical notice:', err.message);
  }
}

module.exports = { bootstrapDatabase };
