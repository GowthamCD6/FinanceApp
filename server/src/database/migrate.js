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
    console.log(`[1/4] Connecting to TiDB Cloud and ensuring '${dbName}' exists...`);
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
    console.log(`[2/4] Executing schema DDL...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await conn.query(schemaSql);
    console.log(`✅ All 18+ tables created successfully with strict constraints & indexes.`);

    // 4. Execute seeds.sql
    console.log(`[3/4] Seeding initial roles, products, policies, and accounts...`);
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await conn.query(seedsSql);
    console.log(`✅ Seed data applied.`);

    // 5. Create default Super Admin user if not exists
    console.log(`[4/4] Verifying default Super Admin account...`);
    const [existingAdmin] = await conn.query(
      `SELECT id FROM users WHERE phone = '9999999999' OR email = 'admin@fundlending.com' LIMIT 1`
    );
    
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('Admin@123', 10);
      const [userResult] = await conn.query(
        `INSERT INTO users (name, phone, email, password_hash, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
        ['Super Admin', '9999999999', 'admin@fundlending.com', passwordHash]
      );
      const newUserId = userResult.insertId;

      // Assign SUPER_ADMIN role
      const [superRole] = await conn.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1`);
      if (superRole.length > 0) {
        await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [newUserId, superRole[0].id]);
      }
      console.log(`✅ Super Admin created: Email: admin@fundlending.com | Phone: 9999999999 | Password: Admin@123`);
    } else {
      console.log(`ℹ️ Super Admin account already exists.`);
    }

    await conn.end();
    console.log(`\n🎉 TiDB Cloud Database migration and initialization completed successfully!\n`);
  } catch (err) {
    console.error(`\n❌ Migration failed:`, err.message);
    if (rootConn) await rootConn.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
