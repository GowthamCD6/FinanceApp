const { query, pool } = require('../src/config/database');

async function updateDatabase() {
  console.log('--- STARTING DATABASE SCHEMA UPDATE & CLEANUP ---');

  try {
    // 1. Drop unused / obsolete tables
    const tablesToDrop = [
      'accounting_accounts',
      'journal_entry_lines',
      'journal_entries',
      'collection_visits',
      'customer_documents',
      'customer_notes',
      'idempotency_keys',
      'reconciliation_adjustments',
      'reconciliations',
      'cluster_nodes',
    ];

    console.log('[1/4] Dropping unused and empty tables...');
    await query('SET FOREIGN_KEY_CHECKS = 0;');
    for (const tbl of tablesToDrop) {
      await query(`DROP TABLE IF EXISTS \`${tbl}\`;`);
      console.log(`  - Dropped table: ${tbl}`);
    }

    // 2. Create user_security_settings table (for fingerprint & biometric lock)
    console.log('[2/4] Creating user_security_settings table...');
    await query(`
      CREATE TABLE IF NOT EXISTS \`user_security_settings\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
        \`is_fingerprint_enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`biometric_type\` VARCHAR(50) NOT NULL DEFAULT 'FINGERPRINT',
        \`device_model\` VARCHAR(100) NULL,
        \`device_id\` VARCHAR(150) NULL,
        \`biometric_token\` VARCHAR(255) NULL,
        \`last_authenticated_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_user_security_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        INDEX \`idx_user_sec_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✅ user_security_settings created successfully.');

    // 3. Create user_locations table (for storing GPS location & address)
    console.log('[3/4] Creating user_locations table...');
    await query(`
      CREATE TABLE IF NOT EXISTS \`user_locations\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`organization_id\` BIGINT UNSIGNED NULL,
        \`latitude\` DECIMAL(10, 8) NOT NULL,
        \`longitude\` DECIMAL(11, 8) NOT NULL,
        \`accuracy\` DECIMAL(8, 2) NULL,
        \`full_address\` TEXT NULL,
        \`city\` VARCHAR(100) NULL,
        \`state\` VARCHAR(100) NULL,
        \`postal_code\` VARCHAR(20) NULL,
        \`is_location_sharing_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`saved_to_database\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`captured_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_user_locations_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_user_locations_org\` FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON DELETE SET NULL,
        INDEX \`idx_user_loc_user\` (\`user_id\`),
        INDEX \`idx_user_loc_org\` (\`organization_id\`),
        INDEX \`idx_user_loc_captured\` (\`captured_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✅ user_locations created successfully.');

    // 4. Add new permissions
    console.log('[4/4] Ensuring security and location permissions exist...');
    const permissions = [
      {
        name: 'SECURITY_BIOMETRIC_MANAGE',
        description: 'Enable, configure, and authenticate with biometric and fingerprint lock',
      },
      {
        name: 'LOCATION_SHARE_MANAGE',
        description: 'Capture, store, view, and share GPS coordinates and addresses',
      },
    ];

    for (const p of permissions) {
      await query(`
        INSERT INTO \`permissions\` (\`name\`, \`description\`)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE \`description\` = VALUES(\`description\`);
      `, [p.name, p.description]);
      console.log(`  - Permission ensured: ${p.name}`);
    }

    // Grant these permissions to SUPER_ADMIN, ADMIN, and USER roles
    const roles = await query(`SELECT id, name FROM \`roles\` WHERE name IN ('SUPER_ADMIN', 'ADMIN', 'ORG_ADMIN', 'FIELD_AGENT', 'USER');`);
    const newPermRows = await query(`SELECT id, name FROM \`permissions\` WHERE name IN ('SECURITY_BIOMETRIC_MANAGE', 'LOCATION_SHARE_MANAGE');`);

    for (const r of roles) {
      for (const perm of newPermRows) {
        await query(`
          INSERT IGNORE INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
          VALUES (?, ?);
        `, [r.id, perm.id]);
      }
    }
    console.log('  ✅ Role permissions updated for all active roles.');

    await query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('\n✨ DATABASE UPDATE COMPLETE SUCCESSFUL! ✨');
  } catch (error) {
    console.error('Migration error:', error);
    await query('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateDatabase();
