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
  console.log(`🚀 Starting Database Migration on TiDB Cloud: ${dbName}`);
  console.log(`Host: ${dbHost}:${dbPort} | User: ${dbUser}`);
  console.log(`==============================================\n`);

  let rootConn;
  try {
    // 1. Connect to check and create database
    console.log(`[1/5] Connecting to TiDB Cloud and ensuring '${dbName}' exists...`);
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

    // 2. Connect to the database with multipleStatements enabled
    const conn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: dbSsl,
      multipleStatements: true,
    });

    // 3. Execute schema.sql
    console.log(`[2/5] Executing schema DDL...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await conn.query(schemaSql);
    console.log(`✅ All tables created successfully with strict constraints & indexes.`);

    // 4. Execute seeds.sql
    console.log(`[3/5] Seeding strict 3 roles, products, policies, accounts...`);
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await conn.query(seedsSql);
    console.log(`✅ Seed data applied.`);

    // 5. Seed Strict 3 Users: Super Admin, Admin, Customer (Kumar)
    console.log(`[4/5] Seeding Strict 3 Users (Super Admin, Admin, Customer Kumar)...`);
    const [roles] = await conn.query(`SELECT id, name FROM roles`);
    const superRoleId = roles.find((r) => r.name === 'SUPER_ADMIN')?.id;
    const adminRoleId = roles.find((r) => r.name === 'ADMIN')?.id;
    const userRoleId = roles.find((r) => r.name === 'USER')?.id;

    // Helper to ensure user
    async function ensureUser(name, phone, email, plainPassword, roleId) {
      const [exists] = await conn.query(`SELECT id FROM users WHERE phone = ? OR email = ? LIMIT 1`, [phone, email]);
      if (exists.length > 0) return exists[0].id;
      const hash = await bcrypt.hash(plainPassword, 10);
      const [res] = await conn.query(
        `INSERT INTO users (name, phone, email, password_hash, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
        [name, phone, email, hash]
      );
      const userId = res.insertId;
      if (roleId) {
        await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
      }
      return userId;
    }

    const superAdminId = await ensureUser('Super Admin', '9999999999', 'admin@fundlending.com', 'Admin@123', superRoleId);
    const adminId = await ensureUser('Admin Field Manager', '8888888888', 'ops@fundlending.com', 'Admin@123', adminRoleId);
    const kumarUserId = await ensureUser('Kumar', '9876543210', 'kumar@gmail.com', 'Kumar@123', userRoleId);

    console.log(`✅ Strict 3 Users created/verified:`);
    console.log(`   • Super Admin: admin@fundlending.com / 9999999999`);
    console.log(`   • Admin: ops@fundlending.com / 8888888888`);
    console.log(`   • User (Kumar): kumar@gmail.com / 9876543210`);

    // 6. Seed Customer Kumar and 4-Loan Lifecycle (#001 -> #002 -> #003 -> #004)
    console.log(`[5/5] Seeding Customer Kumar and Lifecycle Progression (#001 -> #002 -> #003 -> #004)...`);
    
    // Customer profile
    let kumarCustId;
    const [custExists] = await conn.query(`SELECT id FROM customers WHERE phone = '9876543210' LIMIT 1`);
    if (custExists.length > 0) {
      kumarCustId = custExists[0].id;
    } else {
      const [cRes] = await conn.query(
        `INSERT INTO customers 
         (customer_code, full_name, phone, address, city, customer_type, status, registration_date, user_id, created_by)
         VALUES ('CUST-001', 'Kumar', '9876543210', 'Gandhi Nagar Market', 'Salem', 'COMMON_CUSTOMER', 'ACTIVE', '2026-01-10', ?, ?)`,
        [kumarUserId, adminId]
      );
      kumarCustId = cRes.insertId;
    }

    // Weekly product & policy
    const [weeklyProd] = await conn.query(`SELECT id FROM loan_products WHERE product_code = 'WEEKLY_STANDARD' LIMIT 1`);
    const prodId = weeklyProd[0]?.id || 1;
    const [cashAcc] = await conn.query(`SELECT id FROM fund_accounts WHERE account_code = 'CASH_MAIN' LIMIT 1`);
    const fundAccId = cashAcc[0]?.id || 1;

    // Seed Loan #001: ₹20,000 Completed
    async function ensureLoan(num, principal, income, status, parentId, appDate, disDate) {
      const [lExists] = await conn.query(`SELECT id FROM loans WHERE loan_number = ? LIMIT 1`, [num]);
      if (lExists.length > 0) return lExists[0].id;
      const totalRepay = principal + income;
      const [lRes] = await conn.query(
        `INSERT INTO loans 
         (loan_number, customer_id, product_id, parent_loan_id, principal_amount, contracted_income_amount, total_repayment_amount, total_installments, repayment_frequency, status, application_date, approval_date, disbursement_date, approved_by, disbursed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 10, 'WEEKLY', ?, ?, ?, ?, ?, ?)`,
        [num, kumarCustId, prodId, parentId, principal, income, totalRepay, status, appDate, disDate, disDate, adminId, adminId]
      );
      const lId = lRes.insertId;

      // Seed 10 installments
      const instAmount = Math.round(totalRepay / 10);
      const instPrinc = Math.round(principal / 10);
      const instInc = instAmount - instPrinc;

      for (let i = 1; i <= 10; i++) {
        const dueDate = new Date(disDate);
        dueDate.setDate(dueDate.getDate() + i * 7);
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

    const loan1Id = await ensureLoan('LN-001', 20000, 2000, 'COMPLETED', null, '2026-01-10', '2026-01-12');
    const loan2Id = await ensureLoan('LN-002', 25000, 2500, 'COMPLETED', loan1Id, '2026-03-25', '2026-03-27');
    const loan3Id = await ensureLoan('LN-003', 35000, 3500, 'COMPLETED', loan2Id, '2026-06-10', '2026-06-12');
    const loan4Id = await ensureLoan('LN-004', 40000, 4000, 'ACTIVE', loan3Id, '2026-08-25', '2026-08-28');

    // Seed repeat loan eligibility evaluation
    await conn.query(
      `INSERT INTO loan_eligibility 
       (customer_id, previous_loan_id, next_product_id, eligible_amount, status, eligible_from, reason, evaluated_by)
       VALUES (?, ?, ?, 15000.00, 'ELIGIBLE', CURRENT_DATE, 'Previous loan completed without default. Eligible for repeat cycle up to ₹15,000.', ?)
       ON DUPLICATE KEY UPDATE eligible_amount=VALUES(eligible_amount), status=VALUES(status)`,
      [kumarCustId, loan3Id, prodId, adminId]
    );

    // Seed Central Fund ledger circulation transactions
    const [txCount] = await conn.query(`SELECT COUNT(*) as cnt FROM fund_transactions`);
    if (txCount[0].cnt === 0) {
      await conn.query(
        `INSERT INTO fund_transactions 
         (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, description, created_by)
         VALUES 
         ('TX-CAP-001', ?, '2026-01-01 10:00:00', 'CAPITAL_IN', 'IN', 1000000.00, 'Initial Central Fund Capital', ?),
         ('TX-CAP-002', ?, '2026-06-01 10:00:00', 'CAPITAL_IN', 'IN', 200000.00, 'Additional Capital Injected', ?),
         ('TX-DISB-PORTFOLIO', ?, '2026-08-01 11:00:00', 'LOAN_DISBURSEMENT', 'OUT', 850000.00, 'Cumulative Active Loan Disbursements', ?),
         ('TX-COLL-PRINCIPAL', ?, '2026-08-15 15:00:00', 'PRINCIPAL_COLLECTION', 'IN', 520000.00, 'Principal Recovered (Re-lent Pool)', ?),
         ('TX-COLL-INCOME', ?, '2026-08-15 15:00:00', 'LENDING_INCOME', 'IN', 85000.00, 'Contracted Lending Income Earned', ?),
         ('TX-EXP-OPERATIONAL', ?, '2026-08-20 16:00:00', 'EXPENSE', 'OUT', 25000.00, 'Operational & Transport Expenses', ?)`,
        [fundAccId, superAdminId, fundAccId, superAdminId, fundAccId, adminId, fundAccId, adminId, fundAccId, adminId, fundAccId, adminId]
      );
      console.log(`✅ Central Fund transactions seeded (Capital ₹12L, Lent ₹8.5L, Recovered ₹5.2L, Income ₹85k, Expenses ₹25k, Available Cash ₹3.1L).`);
    }

    await conn.end();
    console.log(`\n🎉 TiDB Cloud Database migration and seed completed successfully!\n`);
  } catch (err) {
    console.error(`\n❌ Migration failed:`, err.message);
    if (rootConn) await rootConn.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
