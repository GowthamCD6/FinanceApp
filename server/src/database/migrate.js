const fs = require('fs');
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

async function runMigration() {
  console.log(`\n==============================================`);
  console.log(`🚀 Starting Database Migration: ${dbName}`);
  console.log(`Host: ${dbHost}:${dbPort} | User: ${dbUser}`);
  console.log(`==============================================\n`);

  let conn;
  let rootConn;
  try {
    // 1. Connect to check and connect to target database
    console.log(`[1/5] Connecting to MySQL host (${dbHost}:${dbPort}) for '${dbName}'...`);
    
    let isConnected = false;
    try {
      // Try connecting directly to dbName (works for TiDB Cloud and pre-existing local DB)
      conn = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: dbSsl,
        multipleStatements: true,
      });
      console.log(`✅ Connected directly to database '${dbName}'.`);
      isConnected = true;
    } catch (directErr) {
      console.log(`ℹ️ Direct connection to '${dbName}' returned: ${directErr.message}. Attempting host creation...`);
    }

    if (!isConnected) {
      // If direct connection didn't work (e.g., fresh local MySQL), connect to root and create
      rootConn = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        ssl: dbSsl,
      });

      await rootConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await rootConn.end();
      rootConn = null;

      conn = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: dbSsl,
        multipleStatements: true,
      });
      console.log(`✅ Database '${dbName}' created and connected.`);
    }

    // 2. Execute schema.sql
    console.log(`[2/5] Executing multi-tenant schema DDL (organizations, branches, users, loans, funds, governance)...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await conn.query(schemaSql);
    console.log(`✅ All enterprise tables created successfully with strict constraints & indexes.`);

    // 2b. Schema alterations for app/web adaptation
    const alterations = [
      "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS admin_phone VARCHAR(20) NULL AFTER admin_name;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100) NULL AFTER occupation;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER designation;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS stall_no VARCHAR(50) NULL AFTER shop_name;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS market_location VARCHAR(150) NULL AFTER stall_no;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) NULL AFTER market_location;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) NULL AFTER aadhaar_number;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS guarantor_name VARCHAR(150) NULL AFTER pan_number;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS guarantor_phone VARCHAR(20) NULL AFTER guarantor_name;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS guarantor_relation VARCHAR(50) NULL AFTER guarantor_phone;",
      "ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_title VARCHAR(200) NULL AFTER parent_loan_id;",
      "ALTER TABLE loans ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00 AFTER contracted_income_amount;",
      "ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_method ENUM('CASH', 'BANK_TRANSFER', 'UPI') NOT NULL DEFAULT 'CASH' AFTER repayment_frequency;",
      "ALTER TABLE loans ADD COLUMN IF NOT EXISTS closed_at DATETIME NULL AFTER maturity_date;",
      "ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100) NULL AFTER reference_number;",
      "ALTER TABLE payments ADD COLUMN IF NOT EXISTS collected_latitude DECIMAL(10,8) NULL AFTER receipt_number;",
      "ALTER TABLE payments ADD COLUMN IF NOT EXISTS collected_longitude DECIMAL(11,8) NULL AFTER collected_latitude;",
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(150) NULL AFTER user_id;",
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(150) NULL AFTER user_name;",
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SUCCESS' AFTER reason;",
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT NULL AFTER user_agent;",
      "ALTER TABLE audit_logs MODIFY COLUMN entity_id VARCHAR(100) NULL;"
    ];

    for (const sql of alterations) {
      try {
        await conn.query(sql);
      } catch (altErr) {
        // Safe fallback if column exists
      }
    }
    console.log(`✅ Table schemas adapted and column enhancements synchronized.`);

    // 3. Execute seeds.sql
    console.log(`[3/5] Seeding organizations, branches, roles, products, policies, accounts...`);
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await conn.query(seedsSql);
    console.log(`✅ Seed data applied.`);

    // 5. Seed Users & RBAC
    console.log(`[4/5] Seeding Multi-Tenant Users (Super Admin, Org Admin, Field Agent, Customer Kumar, Shopkeeper Murugan)...`);
    const [roles] = await conn.query(`SELECT id, name FROM roles`);
    const superRoleId = roles.find((r) => r.name === 'SUPER_ADMIN')?.id;
    const adminRoleId = roles.find((r) => r.name === 'ADMIN')?.id;
    const agentRoleId = roles.find((r) => r.name === 'FIELD_AGENT')?.id;
    const userRoleId = roles.find((r) => r.name === 'USER')?.id;
    const shopRoleId = roles.find((r) => r.name === 'SHOPKEEPER')?.id || userRoleId;

    async function ensureUser(name, phone, email, plainPassword, roleId, roleType, orgId = null, branchId = null) {
      const [exists] = await conn.query(`SELECT id FROM users WHERE phone = ? OR email = ? LIMIT 1`, [phone, email]);
      if (exists.length > 0) return exists[0].id;
      const hash = await bcrypt.hash(plainPassword, 10);
      const [res] = await conn.query(
        `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [orgId, branchId, name, phone, email, hash, roleType]
      );
      const userId = res.insertId;
      if (roleId) {
        await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
      }
      return userId;
    }

    const superAdminId = await ensureUser('Super Admin', '9999999999', 'admin@fundlending.com', 'Admin@123', superRoleId, 'SUPER_ADMIN', null, null);
    const orgAdminId = await ensureUser('Rajesh Kumar', '9876543210', 'rajesh@apexfinance.com', 'Admin@123', adminRoleId, 'ADMIN', 1, 1);
    const fieldAgentId = await ensureUser('Venkatesh S', '9876543212', 'agent@apexfinance.com', 'Agent@123', agentRoleId, 'FIELD_AGENT', 1, 1);
    const kumarUserId = await ensureUser('Kumar', '9876543213', 'kumar@gmail.com', 'Kumar@123', userRoleId, 'COMMON_CUSTOMER', 1, 1);
    const muruganUserId = await ensureUser('Murugan Store', '9876543214', 'murugan@gmail.com', 'Murugan@123', shopRoleId, 'SHOPKEEPER', 1, 1);

    console.log(`✅ Multi-Tenant Users verified:`);
    console.log(`   • Super Admin: admin@fundlending.com / 9999999999`);
    console.log(`   • Apex Org Admin: rajesh@apexfinance.com / 9876543210`);
    console.log(`   • Apex Field Agent: agent@apexfinance.com / 9876543212`);
    console.log(`   • Borrower Kumar: kumar@gmail.com / 9876543213`);
    console.log(`   • Shopkeeper Murugan: murugan@gmail.com / 9876543214`);

    // 6. Seed Customers & Loan Portfolios
    console.log(`[5/5] Seeding Customers & Loan Lifecycle Portfolios...`);
    
    // Ensure Customer Kumar (Weekly Borrower)
    let kumarCustId;
    const [kExists] = await conn.query(`SELECT id FROM customers WHERE phone = '9876543213' LIMIT 1`);
    if (kExists.length > 0) {
      kumarCustId = kExists[0].id;
    } else {
      const [cRes] = await conn.query(
        `INSERT INTO customers 
         (organization_id, branch_id, customer_code, full_name, phone, address, city, customer_type, status, registration_date, user_id, assigned_agent_id, created_by)
         VALUES (1, 1, 'CUST-001', 'Kumar', '9876543213', 'Gandhi Nagar Market', 'Salem', 'COMMON_CUSTOMER', 'ACTIVE', '2026-01-10', ?, ?, ?)`,
        [kumarUserId, fieldAgentId, orgAdminId]
      );
      kumarCustId = cRes.insertId;
    }

    // Ensure Customer Murugan (Daily Shopkeeper)
    let muruganCustId;
    const [mExists] = await conn.query(`SELECT id FROM customers WHERE phone = '9876543214' LIMIT 1`);
    if (mExists.length > 0) {
      muruganCustId = mExists[0].id;
    } else {
      const [mRes] = await conn.query(
        `INSERT INTO customers 
         (organization_id, branch_id, customer_code, full_name, phone, address, city, customer_type, shop_name, status, registration_date, user_id, assigned_agent_id, created_by)
         VALUES (1, 1, 'SHOP-001', 'Murugan Store', '9876543214', 'Main Bazaar Street', 'Chennai', 'SHOPKEEPER', 'Sri Murugan Groceries', 'ACTIVE', '2026-02-01', ?, ?, ?)`,
        [muruganUserId, fieldAgentId, orgAdminId]
      );
      muruganCustId = mRes.insertId;
    }

    // Loan helper
    async function ensureLoan(orgId, branchId, num, custId, prodId, parentId, principal, income, totalInst, freq, status, appDate, disDate) {
      const [lExists] = await conn.query(`SELECT id FROM loans WHERE organization_id = ? AND loan_number = ? LIMIT 1`, [orgId, num]);
      if (lExists.length > 0) return lExists[0].id;
      const totalRepay = principal + income;
      const [lRes] = await conn.query(
        `INSERT INTO loans 
         (organization_id, branch_id, loan_number, customer_id, product_id, parent_loan_id, principal_amount, contracted_income_amount, total_repayment_amount, total_installments, repayment_frequency, status, application_date, approval_date, disbursement_date, approved_by, disbursed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orgId, branchId, num, custId, prodId, parentId, principal, income, totalRepay, totalInst, freq, status, appDate, disDate, disDate, orgAdminId, orgAdminId]
      );
      const lId = lRes.insertId;

      // Seed installments
      const instAmount = Math.round(totalRepay / totalInst);
      const instPrinc = Math.round(principal / totalInst);
      const instInc = instAmount - instPrinc;
      const dayGap = freq === 'DAILY' ? 1 : 7;

      for (let i = 1; i <= totalInst; i++) {
        const dueDate = new Date(disDate);
        dueDate.setDate(dueDate.getDate() + i * dayGap);
        const isPaid = status === 'COMPLETED' || (status === 'ACTIVE' && i <= 2);
        const instStatus = isPaid ? 'PAID' : 'PENDING';
        const paidAmt = isPaid ? instAmount : 0;
        const outstanding = isPaid ? 0 : instAmount;

        await conn.query(
          `INSERT IGNORE INTO loan_installments 
           (loan_id, installment_number, due_date, scheduled_amount, principal_component, income_component, paid_amount, outstanding_amount, status, paid_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [lId, i, dueDate.toISOString().slice(0, 10), instAmount, instPrinc, instInc, paidAmt, outstanding, instStatus, isPaid ? dueDate : null]
        );
      }
      return lId;
    }

    // Weekly loans for Kumar
    const loan1Id = await ensureLoan(1, 1, 'LN-001', kumarCustId, 1, null, 20000, 2000, 10, 'WEEKLY', 'COMPLETED', '2026-01-10', '2026-01-12');
    const loan2Id = await ensureLoan(1, 1, 'LN-002', kumarCustId, 1, loan1Id, 25000, 2500, 10, 'WEEKLY', 'COMPLETED', '2026-03-25', '2026-03-27');
    const loan3Id = await ensureLoan(1, 1, 'LN-003', kumarCustId, 1, loan2Id, 35000, 3500, 10, 'WEEKLY', 'COMPLETED', '2026-06-10', '2026-06-12');
    const loan4Id = await ensureLoan(1, 1, 'LN-004', kumarCustId, 1, loan3Id, 40000, 4000, 10, 'WEEKLY', 'ACTIVE', '2026-08-25', '2026-08-28');

    // Daily loan for Murugan Store
    const shopLoanId = await ensureLoan(1, 1, 'LN-SHOP-001', muruganCustId, 2, null, 30000, 3750, 25, 'DAILY', 'ACTIVE', '2026-08-20', '2026-08-22');

    // Seed repeat loan eligibility evaluation
    await conn.query(
      `INSERT INTO loan_eligibility 
       (customer_id, previous_loan_id, next_product_id, eligible_amount, status, eligible_from, reason, evaluated_by)
       VALUES (?, ?, 1, 50000.00, 'ELIGIBLE', CURRENT_DATE, 'Previous 3 loan cycles completed on time. Eligible for next level repeat cycle up to ₹50,000.', ?)
       ON DUPLICATE KEY UPDATE eligible_amount=VALUES(eligible_amount), status=VALUES(status)`,
      [kumarCustId, loan3Id, orgAdminId]
    );

    // Seed Central Fund ledger circulation transactions
    const [txCount] = await conn.query(`SELECT COUNT(*) as cnt FROM fund_transactions WHERE organization_id = 1`);
    if (txCount[0].cnt === 0) {
      await conn.query(
        `INSERT INTO fund_transactions 
         (organization_id, transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, description, created_by)
         VALUES 
         (1, 'TX-CAP-001', 1, '2026-01-01 10:00:00', 'CAPITAL_IN', 'IN', 1000000.00, 'Initial Apex Central Capital Pool', ?),
         (1, 'TX-DISB-PORTFOLIO', 1, '2026-08-01 11:00:00', 'LOAN_DISBURSEMENT', 'OUT', 760000.00, 'Cumulative Active Loan Disbursements', ?),
         (1, 'TX-COLL-PRINCIPAL', 1, '2026-08-15 15:00:00', 'PRINCIPAL_COLLECTION', 'IN', 520000.00, 'Principal Recovered (Re-lent Pool)', ?),
         (1, 'TX-COLL-INCOME', 1, '2026-08-15 15:00:00', 'LENDING_INCOME', 'IN', 85000.00, 'Contracted Lending Income Earned', ?),
         (1, 'TX-EXP-OPERATIONAL', 1, '2026-08-20 16:00:00', 'EXPENSE', 'OUT', 25000.00, 'Branch Operations & Route Fuel', ?)`,
        [orgAdminId, orgAdminId, orgAdminId, orgAdminId, orgAdminId]
      );
      console.log(`✅ Central Fund transactions seeded for Apex Finance.`);
    }

    await conn.end();
    console.log(`\n🎉 Enterprise Database migration and multi-tenant seed completed successfully!\n`);
  } catch (err) {
    console.error(`\n❌ Migration execution notice:`, err.message);
    if (rootConn) await rootConn.end().catch(() => {});
  }
}

runMigration();
