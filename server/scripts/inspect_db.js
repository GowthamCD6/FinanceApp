const { query, pool } = require('../src/config/database');

async function inspect() {
  try {
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name;
    `);
    
    console.log(`=== ${tables.length} TABLES IN DATABASE ===`);
    for (const t of tables) {
      const tableName = t.table_name || t.TABLE_NAME;
      try {
        const rows = await query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
        const count = rows[0]?.cnt;
        console.log(`- ${tableName}: ${count} rows`);
      } catch (err) {
        console.log(`- ${tableName}: Error counting rows (${err.message})`);
      }
    }
  } catch (e) {
    console.error('DB Inspection Error:', e.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

inspect();
