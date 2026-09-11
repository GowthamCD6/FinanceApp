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

    console.log(`[1/3] Applying base SQL seeds from seeds.sql...`);
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await conn.query(seedsSql);
    console.log(`✅ Base seed records applied.`);

    console.log(`[2/3] Verifying Multi-Tenant System Users & Roles...`);
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
    await ensureUser('Kumar', '9876543213', 'kumar@gmail.com', 'Kumar@123', userRoleId, 'COMMON_CUSTOMER', 1, 1);
    await ensureUser('Murugan Store', '9876543214', 'murugan@gmail.com', 'Murugan@123', shopRoleId, 'SHOPKEEPER', 1, 1);

    console.log(`[3/3] Database seed verified successfully!`);
    await conn.end();
  } catch (err) {
    console.error(`\n❌ Seeding execution error:`, err.message);
    if (conn) await conn.end().catch(() => {});
  }
}

runSeed();
