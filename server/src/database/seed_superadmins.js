const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function seedSuperAdmins() {
  const hash = await bcrypt.hash('Admin@123', 10);
  const roles = await query("SELECT id FROM roles WHERE name = 'SUPER_ADMIN'");
  const superRoleId = roles[0]?.id;

  const admins = [
    { name: 'Kavitha Ramanathan', email: 'kavitha.security@fundlending.com', phone: '9840112233', role: 'SUPER_ADMIN' },
    { name: 'Dr. Anandhakumar V', email: 'anand.audit@fundlending.com', phone: '9876599887', role: 'SUPER_ADMIN' },
    { name: 'Muthukumar S', email: 'muthu.devops@fundlending.com', phone: '9790123987', role: 'SUPER_ADMIN' },
  ];

  for (const a of admins) {
    const exists = await query('SELECT id FROM users WHERE phone = ? OR email = ?', [a.phone, a.email]);
    if (exists.length === 0) {
      const res = await query(
        "INSERT INTO users (name, email, phone, password_hash, role_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())",
        [a.name, a.email, a.phone, hash, a.role]
      );
      if (superRoleId) {
        await query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [res.insertId, superRoleId]);
      }
      console.log('✅ Created SuperAdmin:', a.name);
    }
  }
}

seedSuperAdmins()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
