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

async function googleLogin(req, res) {
  try {
    const { email, name, google_id, role, avatar_url } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required.' });
    }

    // 1. Look up existing user by email or google_id
    let users = await query(
      `SELECT * FROM users WHERE email = ? OR (google_id IS NOT NULL AND google_id = ?) LIMIT 1`,
      [email, google_id || '']
    );

    let user = null;
    if (users.length > 0) {
      user = users[0];
    } else {
      // If user doesn't exist yet, check requested role criteria:
      // Allowed: SUPER_ADMIN, ADMIN (Lender), FIELD_AGENT (Route Staff).
      // NOT allowed for USER (borrower) or SHOPKEEPER through Google OAuth.
      const targetRole = (role || 'ADMIN').toUpperCase();
      if (!['SUPER_ADMIN', 'ADMIN', 'FIELD_AGENT'].includes(targetRole)) {
        return res.status(403).json({
          success: false,
          message: 'Google Sign-In is restricted to SuperAdmin Authority, Lenders (Admins), and Route Staff.',
        });
      }

      // Create new staff/admin user with Google credentials
      const defaultOrgId = targetRole === 'SUPER_ADMIN' ? null : 1;
      const defaultBranchId = targetRole === 'SUPER_ADMIN' ? null : 1;
      const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

      const insertRes = await query(
        `INSERT INTO users (organization_id, branch_id, name, email, phone, password_hash, role_type, status, google_id, avatar_url)
         VALUES (?, ?, ?, ?, ?, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', ?, 'ACTIVE', ?, ?)`,
        [defaultOrgId, defaultBranchId, name || 'Google User', email, randomPhone, targetRole, google_id || email, avatar_url || null]
      );

      const newId = insertRes.insertId;
      // Assign role in user_roles
      const roleRow = await query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [targetRole]);
      if (roleRow.length > 0) {
        await query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [newId, roleRow[0].id]);
      }

      const created = await query(`SELECT * FROM users WHERE id = ?`, [newId]);
      user = created[0];
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated or suspended.' });
    }

    // Fetch user roles
    const roles = await query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [user.id]
    );
    const roleNames = roles.map(r => r.name);

    // CRITERIA ENFORCEMENT:
    // Google Login is strictly for Authority (SUPER_ADMIN), Lenders (ADMIN), and Route Staff (FIELD_AGENT).
    // Not for regular borrowers (USER).
    const isAuthorizedRole = roleNames.some(r => ['SUPER_ADMIN', 'ADMIN', 'FIELD_AGENT'].includes(r));
    if (!isAuthorizedRole) {
      return res.status(403).json({
        success: false,
        message: 'Google Sign-In is restricted to SuperAdmin Authority, Lenders, and Route Staff. Borrowers must use Mobile OTP.',
      });
    }

    // Update last login and google_id / avatar if missing
    await query(
      `UPDATE users SET last_login_at = NOW(), google_id = COALESCE(google_id, ?), avatar_url = COALESCE(avatar_url, ?) WHERE id = ?`,
      [google_id || email, avatar_url || null, user.id]
    );

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
          organization_id: user.organization_id,
          branch_id: user.branch_id,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during Google authentication.' });
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
  googleLogin,
  getProfile,
};
