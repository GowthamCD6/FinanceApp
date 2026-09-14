const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'fund_lending_app';
const dbSsl = process.env.DB_SSL === 'true' ? {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true,
} : undefined;

async function cleanDatabase() {
  console.log(`\n======================================================`);
  console.log(`🧹 Database Reset: Retaining ONLY Roles & Super Admin`);
  console.log(`Host: ${dbHost}:${dbPort} | DB: ${dbName}`);
  console.log(`======================================================\n`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: dbSsl,
      multipleStatements: true,
    });

    console.log(`✅ Connected to database '${dbName}'.`);

    // 1. Disable Foreign Key Checks
    await conn.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    console.log(`🔒 Disabled Foreign Key Checks.`);

    // 2. Truncate / Empty operational & tenant tables
    const tablesToClean = [
      'loan_repayments',
      'loan_schedules',
      'loans',
      'loan_applications',
      'borrower_financial_profiles',
      'customer_notes',
      'customers',
      'accounting_journal_lines',
      'accounting_journal_entries',
      'accounting_accounts',
      'fund_transactions',
      'fund_accounts',
      'expenses',
      'branches',
      'organization_settings',
      'organizations',
    ];

    for (const table of tablesToClean) {
      try {
        await conn.query(`TRUNCATE TABLE \`${table}\`;`);
        console.log(`   ✓ Cleaned table: ${table}`);
      } catch (err) {
        // Fallback to DELETE if TRUNCATE has foreign key restriction on some engines
        try {
          await conn.query(`DELETE FROM \`${table}\`;`);
          console.log(`   ✓ Deleted rows from: ${table}`);
        } catch (delErr) {
          console.warn(`   ⚠️ Table ${table} notice: ${delErr.message}`);
        }
      }
    }

    // 3. Clean Users table - Keep ONLY Super Admin
    console.log(`\n[3/5] Cleaning Users (Retaining Super Admin only)...`);
    await conn.query(`DELETE FROM users WHERE role_type != 'SUPER_ADMIN';`);

    // Clean user_roles for non-existent users
    await conn.query(`DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM users WHERE role_type = 'SUPER_ADMIN');`);

    // Hash for 'Admin@123'
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Ensure primary Super Admin user exists (id: 1)
    await conn.query(`
      INSERT INTO users (id, organization_id, branch_id, name, phone, email, password_hash, role_type, status)
      VALUES (1, NULL, NULL, 'GOWTHAM', '9999999999', 'gowthamnaveen124@gmail.com', ?, 'SUPER_ADMIN', 'ACTIVE')
      ON DUPLICATE KEY UPDATE 
        name = 'GOWTHAM',
        phone = '9999999999',
        email = 'gowthamnaveen124@gmail.com',
        role_type = 'SUPER_ADMIN',
        organization_id = NULL,
        branch_id = NULL,
        status = 'ACTIVE';
    `, [passwordHash]);

    // 4. Ensure Roles & Permissions exist
    console.log(`\n[4/5] Ensuring all system Roles & Permissions are populated...`);
    const roles = [
      ['SUPER_ADMIN', 'Complete platform administration across all organizations'],
      ['ORG_ADMIN', 'Organization Master Administrator managing all branches, staff, loans, and settings'],
      ['ADMIN', 'Organization Administrator managing branches, loans, and users'],
      ['BRANCH_ADMIN', 'Branch Administrator strictly managing operations, staff, borrowers, and collections for their assigned branch only'],
      ['FIELD_AGENT', 'Field executive managing routes, disbursements, and physical collections'],
      ['SHOPKEEPER', 'Merchant borrower with daily micro-credit facility'],
      ['USER', 'Borrower / Customer with loan portfolio and schedule visibility'],
    ];

    for (const [rName, rDesc] of roles) {
      await conn.query(`
        INSERT INTO roles (name, description) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE description = VALUES(description);
      `, [rName, rDesc]);
    }

    // Map Super Admin role to user 1
    await conn.query(`
      INSERT IGNORE INTO user_roles (user_id, role_id)
      SELECT 1, id FROM roles WHERE name = 'SUPER_ADMIN';
    `);

    // Ensure permissions
    const permissions = [
      ['SYSTEM_ALL', 'Full system administration and configuration'],
      ['ORG_MANAGE', 'Create, edit, suspend, and view tenant organizations'],
      ['BRANCH_MANAGE', 'Create and configure organizational branches'],
      ['CUSTOMER_CREATE', 'Create and register new borrowers and shopkeepers'],
      ['CUSTOMER_READ', 'View customer details and lending lifecycles'],
      ['CUSTOMER_UPDATE', 'Modify borrower information'],
      ['LOAN_CREATE', 'Initiate weekly and daily loan applications'],
      ['LOAN_APPROVE', 'Approve pending loan applications'],
      ['LOAN_DISBURSE', 'Disburse loans from central fund'],
      ['LOAN_READ', 'View loan portfolio and schedules'],
      ['PAYMENT_CREATE', 'Collect repayments and split principal vs income'],
      ['PAYMENT_READ', 'View repayment receipts and history'],
      ['FUND_MANAGE', 'Inject capital and manage vault balances'],
      ['FUND_READ', 'View central fund circulation and cash position'],
      ['EXPENSE_CREATE', 'Log operational expenses with immediate cash/profit impact'],
      ['REPORT_VIEW', 'Access collections, outstanding, loan, profit, and cash flow reports'],
      ['USER_MANAGE', 'Manage employee credentials and access levels'],
    ];

    for (const [pName, pDesc] of permissions) {
      await conn.query(`
        INSERT INTO permissions (name, description) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE description = VALUES(description);
      `, [pName, pDesc]);
    }

    // Map all permissions to SUPER_ADMIN
    await conn.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';
    `);

    // Map permissions to ORG_ADMIN & ADMIN
    await conn.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
      WHERE r.name IN ('ORG_ADMIN', 'ADMIN') AND p.name IN (
        'ORG_MANAGE', 'BRANCH_MANAGE',
        'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
        'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
        'PAYMENT_CREATE', 'PAYMENT_READ',
        'FUND_READ', 'EXPENSE_CREATE', 'REPORT_VIEW', 'USER_MANAGE'
      );
    `);

    // Map permissions to BRANCH_ADMIN
    await conn.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
      WHERE r.name = 'BRANCH_ADMIN' AND p.name IN (
        'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
        'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
        'PAYMENT_CREATE', 'PAYMENT_READ',
        'FUND_READ', 'REPORT_VIEW', 'USER_MANAGE'
      );
    `);

    // Map permissions to FIELD_AGENT
    await conn.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
      WHERE r.name = 'FIELD_AGENT' AND p.name IN (
        'CUSTOMER_CREATE', 'CUSTOMER_READ',
        'LOAN_READ', 'PAYMENT_CREATE', 'PAYMENT_READ'
      );
    `);

    // 5. Re-enable Foreign Key Checks
    await conn.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    console.log(`🔓 Re-enabled Foreign Key Checks.`);

    // Summary Verification
    const [userCount] = await conn.query(`SELECT id, name, phone, email, role_type FROM users;`);
    const [roleCount] = await conn.query(`SELECT COUNT(*) as count FROM roles;`);
    const [orgCount] = await conn.query(`SELECT COUNT(*) as count FROM organizations;`);
    const [branchCount] = await conn.query(`SELECT COUNT(*) as count FROM branches;`);
    const [customerCount] = await conn.query(`SELECT COUNT(*) as count FROM customers;`);
    const [loanCount] = await conn.query(`SELECT COUNT(*) as count FROM loans;`);

    console.log(`\n======================================================`);
    console.log(`✨ DATABASE RESET COMPLETE ✨`);
    console.log(`======================================================`);
    console.log(`Organizations: ${orgCount[0].count} (All dummy tenants removed)`);
    console.log(`Branches:      ${branchCount[0].count} (All dummy branches removed)`);
    console.log(`Customers:     ${customerCount[0].count} (All dummy customers removed)`);
    console.log(`Loans:         ${loanCount[0].count} (All dummy loans removed)`);
    console.log(`Roles:         ${roleCount[0].count} system roles intact`);
    console.log(`Users:         ${userCount.length} user(s) present:`);
    console.table(userCount);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`❌ Reset error:`, err);
  } finally {
    if (conn) await conn.end();
  }
}

cleanDatabase();
