const { query, pool } = require('../src/config/database');

async function run() {
  console.log('Migrating collection_mode column...');
  try {
    await query("ALTER TABLE loans ADD COLUMN IF NOT EXISTS collection_mode VARCHAR(30) NOT NULL DEFAULT 'NORMAL'");
    console.log('✅ Added collection_mode to loans');
  } catch (e) {
    // If syntax doesn't support IF NOT EXISTS, try direct ALTER
    try {
      await query("ALTER TABLE loans ADD COLUMN collection_mode VARCHAR(30) NOT NULL DEFAULT 'NORMAL'");
      console.log('✅ Added collection_mode to loans (direct)');
    } catch (err) {
      console.log('ℹ️ loans table notice:', err.message);
    }
  }

  try {
    await query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS collection_mode VARCHAR(30) NOT NULL DEFAULT 'NORMAL'");
    console.log('✅ Added collection_mode to customers');
  } catch (e) {
    try {
      await query("ALTER TABLE customers ADD COLUMN collection_mode VARCHAR(30) NOT NULL DEFAULT 'NORMAL'");
      console.log('✅ Added collection_mode to customers (direct)');
    } catch (err) {
      console.log('ℹ️ customers table notice:', err.message);
    }
  }

  // Verify
  const loanCols = await query("SHOW COLUMNS FROM loans LIKE 'collection_mode'");
  console.log('loans.collection_mode verified:', loanCols.length > 0 ? 'YES' : 'NO');

  const custCols = await query("SHOW COLUMNS FROM customers LIKE 'collection_mode'");
  console.log('customers.collection_mode verified:', custCols.length > 0 ? 'YES' : 'NO');

  await pool.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
