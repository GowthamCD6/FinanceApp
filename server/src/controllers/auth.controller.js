const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

async function login(req, res) {
  try {
    const { identifier, password } = req.body; // Can be phone or email

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (phone/email) and password are required.' });
    }

    const users = await query(
      `SELECT * FROM users WHERE phone = ? OR email = ? LIMIT 1`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated or suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    // Fetch roles
    const roles = await query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [user.id]
    );
    const roleNames = roles.map(r => r.name);

    // Fetch permissions
    const permissions = await query(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const permissionNames = permissions.map(p => p.name);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, name: user.name, roles: roleNames },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    let customerInfo = null;
    if (roleNames.includes('USER')) {
      const custRows = await query(`SELECT id, customer_code, full_name, customer_type FROM customers WHERE user_id = ? LIMIT 1`, [user.id]);
      if (custRows.length > 0) customerInfo = custRows[0];
    }

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: roleNames,
          permissions: permissionNames,
          customer: customerInfo,
        },
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
}

async function getProfile(req, res) {
  return res.json({
    success: true,
    data: req.user,
  });
}

module.exports = {
  login,
  getProfile,
};
