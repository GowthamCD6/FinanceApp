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

async function runSeed() {
  console.log(`\n==============================================`);
  console.log(`🌱 Seeding Database: ${dbName}`);
  console.log(`Host: ${dbHost}:${dbPort} | User: ${dbUser}`);
  console.log(`==============================================\n`);

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

    console.log(`[1/5] Seeding Organizations & Branches...`);
    await conn.query(`
      INSERT INTO organizations (id, code, name, plan, status, currency, initial_capital, available_cash, total_lent, admin_name, admin_email, phone, address, city, state)
      VALUES 
      (1, 'ORG-APEX', 'Apex Finance Ltd', 'ENTERPRISE', 'ACTIVE', 'INR', 1000000.00, 240000.00, 760000.00, 'Rajesh Kumar', 'rajesh@apexfinance.com', '9876543210', '14, Financial District', 'Chennai', 'Tamil Nadu'),
      (2, 'ORG-HORIZON', 'Horizon Microcredit', 'PRO', 'ACTIVE', 'INR', 500000.00, 185000.00, 315000.00, 'Priya Sharma', 'priya@horizoncredit.in', '9840123456', '88, Gandhi Road', 'Coimbatore', 'Tamil Nadu'),
      (3, 'ORG-DLT', 'Delta Rural Lending', 'STARTER', 'ACTIVE', 'INR', 300000.00, 120000.00, 180000.00, 'Suresh Babu', 'suresh@deltarural.in', '9443277890', '22, Bazaar Street', 'Madurai', 'Tamil Nadu'),
      (4, 'ORG-SBP', 'Sri Bhuvaneshwari Lending', 'ENTERPRISE', 'ACTIVE', 'INR', 850000.00, 230000.00, 620000.00, 'Senthil Nathan', 'senthil@sbpfinance.com', '9876501234', '55, Industrial Estate', 'Salem', 'Tamil Nadu'),
      (5, 'ORG-RCM', 'Royal Capital Microfinance', 'PRO', 'ACTIVE', 'INR', 450000.00, 160000.00, 290000.00, 'Anitha Rajan', 'anitha@royalcapital.in', '9790123456', '12, West Car Street', 'Tirunelveli', 'Tamil Nadu'),
      (6, 'ORG-PMC', 'Pioneer Merchants Credit', 'STARTER', 'ACTIVE', 'INR', 250000.00, 110000.00, 140000.00, 'Karthik S', 'karthik@pioneercredit.in', '9176543210', '9, Station Road', 'Trichy', 'Tamil Nadu')
      ON DUPLICATE KEY UPDATE 
      name=VALUES(name), plan=VALUES(plan), status=VALUES(status), 
      initial_capital=VALUES(initial_capital), available_cash=VALUES(available_cash), total_lent=VALUES(total_lent),
      admin_name=VALUES(admin_name), admin_email=VALUES(admin_email), phone=VALUES(phone);
    `);

    await conn.query(`
      INSERT INTO branches (id, organization_id, branch_code, branch_name, location, phone, manager_name, status)
      VALUES
      (1, 1, 'BR-APX-01', 'Chennai Central Hub', 'Financial District, Chennai', '9876543210', 'Rajesh Kumar', 'ACTIVE'),
      (2, 1, 'BR-APX-02', 'Tambaram Field Office', 'Tambaram Market, Chennai', '9876543211', 'Venkatesh S', 'ACTIVE'),
      (3, 2, 'BR-HRZ-01', 'Coimbatore Main Branch', 'Gandhi Road, Coimbatore', '9840123456', 'Priya Sharma', 'ACTIVE'),
      (4, 3, 'BR-DLT-01', 'Madurai Rural Desk', 'Bazaar Street, Madurai', '9443277890', 'Suresh Babu', 'ACTIVE'),
      (5, 4, 'BR-SBP-01', 'Salem Industrial Unit', 'Industrial Estate, Salem', '9876501234', 'Senthil Nathan', 'ACTIVE'),
      (6, 5, 'BR-RCM-01', 'Tirunelveli Central', 'West Car Street, Tirunelveli', '9790123456', 'Anitha Rajan', 'ACTIVE'),
      (7, 6, 'BR-PMC-01', 'Trichy Main Route', 'Station Road, Trichy', '9176543210', 'Karthik S', 'ACTIVE')
      ON DUPLICATE KEY UPDATE branch_name=VALUES(branch_name), location=VALUES(location), manager_name=VALUES(manager_name);
    `);

    console.log(`[2/5] Seeding System Governance & Settings...`);
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await conn.query(seedsSql);

    console.log(`[3/5] Seeding Multi-Tenant System Users & Credentials...`);
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

    await ensureUser('Super Admin', '9999999999', 'admin@fundlending.com', 'Admin@123', superRoleId, 'SUPER_ADMIN', null, null);
    await ensureUser('Rajesh Kumar', '9876543210', 'rajesh@apexfinance.com', 'Admin@123', adminRoleId, 'ADMIN', 1, 1);
    await ensureUser('Venkatesh S', '9876543212', 'agent@apexfinance.com', 'Agent@123', agentRoleId, 'FIELD_AGENT', 1, 1);
    await ensureUser('Priya Sharma', '9840123456', 'priya@horizoncredit.in', 'Admin@123', adminRoleId, 'ADMIN', 2, 3);
    await ensureUser('Senthil Nathan', '9876501234', 'senthil@sbpfinance.com', 'Admin@123', adminRoleId, 'ADMIN', 4, 5);

    console.log(`[4/5] Seeding Customers & Borrowers...`);
    await conn.query(`
      INSERT INTO customers (id, organization_id, branch_id, customer_code, full_name, phone, customer_type, occupation, shop_name, aadhaar_number, address, city, registration_date, status)
      VALUES
      (1, 1, 1, 'CUST-001', 'Murugan Supermarket', '9876540001', 'SHOPKEEPER', 'Retailer', 'Murugan Supermarket', '334455667788', '12, Bazaar St, Tambaram', 'Chennai', '2026-01-10', 'ACTIVE'),
      (2, 1, 1, 'CUST-002', 'Annachi Tea Stall', '9876540002', 'SHOPKEEPER', 'Tea Merchant', 'Annachi Tea Stall', '334455667789', '44, Station Rd, Tambaram', 'Chennai', '2026-01-12', 'ACTIVE'),
      (3, 1, 1, 'CUST-003', 'Lakshmi Silks & Textiles', '9876540003', 'SHOPKEEPER', 'Textile Merchant', 'Lakshmi Silks', '334455667790', '78, Market Complex, Tambaram', 'Chennai', '2026-01-15', 'ACTIVE'),
      (4, 1, 1, 'CUST-004', 'Kavitha Ramesh', '9876540004', 'COMMON_CUSTOMER', 'Tailor', NULL, '445566778899', '21, Anna Nagar, Chennai', 'Chennai', '2026-01-20', 'ACTIVE'),
      (5, 1, 1, 'CUST-005', 'Selvam Mani', '9876540005', 'COMMON_CUSTOMER', 'Driver', NULL, '445566778800', '15, 2nd Cross, Chennai', 'Chennai', '2026-02-01', 'ACTIVE'),
      (6, 1, 1, 'CUST-006', 'Deepa Ravichandran', '9876540006', 'COMMON_CUSTOMER', 'Teacher', NULL, '445566778801', '89, Gandhi St, Chennai', 'Chennai', '2026-02-05', 'ACTIVE'),
      (7, 4, 5, 'CUST-007', 'Salem Plastics & Packing', '9876540007', 'SHOPKEEPER', 'Plastic Manufacturer', 'Salem Plastics', '556677889900', '10, Industrial Rd, Salem', 'Salem', '2026-02-10', 'ACTIVE'),
      (8, 4, 5, 'CUST-008', 'Amman Agro Supplies', '9876540008', 'SHOPKEEPER', 'Agro Trader', 'Amman Agro', '556677889901', '32, Market Yard, Salem', 'Salem', '2026-02-15', 'ACTIVE')
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), shop_name=VALUES(shop_name);
    `);

    console.log(`[5/5] Seeding Active Loans & Micro-credit Accounts...`);
    await conn.query(`
      INSERT INTO loans (id, organization_id, branch_id, loan_number, customer_id, product_id, loan_title, principal_amount, contracted_income_amount, interest_rate, total_repayment_amount, total_installments, paid_installments, repayment_frequency, application_date, status)
      VALUES
      (1, 1, 1, 'LN-2026-001', 1, 2, '25-Day Merchant Microcredit', 25000.00, 2500.00, 10.00, 27500.00, 25, 12, 'DAILY', '2026-02-01', 'ACTIVE'),
      (2, 1, 1, 'LN-2026-002', 2, 2, '25-Day Tea Stall Working Capital', 15000.00, 1500.00, 10.00, 16500.00, 25, 8, 'DAILY', '2026-02-05', 'ACTIVE'),
      (3, 1, 1, 'LN-2026-003', 3, 2, '25-Day Retail Inventory Line', 40000.00, 4000.00, 10.00, 44000.00, 25, 15, 'DAILY', '2026-01-20', 'ACTIVE'),
      (4, 1, 1, 'LN-2026-004', 4, 1, '10-Week Borrower Household Micro-Loan', 20000.00, 2000.00, 10.00, 22000.00, 10, 4, 'WEEKLY', '2026-01-15', 'ACTIVE'),
      (5, 1, 1, 'LN-2026-005', 5, 1, '10-Week Common Borrower Micro-Loan', 30000.00, 3000.00, 10.00, 33000.00, 10, 6, 'WEEKLY', '2026-01-18', 'ACTIVE'),
      (6, 4, 5, 'LN-2026-006', 7, 2, '25-Day SBP Merchant Credit', 50000.00, 5000.00, 10.00, 55000.00, 25, 10, 'DAILY', '2026-02-10', 'ACTIVE')
      ON DUPLICATE KEY UPDATE loan_title=VALUES(loan_title), principal_amount=VALUES(principal_amount), status=VALUES(status);
    `);

    console.log(`\n🎉 Database seeded successfully with multi-tenant organizations, branches, customers, loans, and governance!`);
    await conn.end();
  } catch (err) {
    console.error(`\n❌ Seeding execution error:`, err.message);
    if (conn) await conn.end().catch(() => {});
  }
}

runSeed();
