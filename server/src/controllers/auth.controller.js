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
      const isEmail = identifier.includes('@');
      return res.status(404).json({
        success: false,
        message: isEmail ? 'This email is not registered.' : 'This phone number is not registered.',
      });
    }

    const user = users[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated or suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Either the password or email is wrong.',
      });
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

    // Fetch organization and branch metadata if assigned
    let orgName = null;
    let branchName = null;
    if (user.organization_id) {
      const orgRows = await query(`SELECT name FROM organizations WHERE id = ? LIMIT 1`, [user.organization_id]);
      if (orgRows.length > 0) orgName = orgRows[0].name;
    }
    if (user.branch_id) {
      const branchRows = await query(`SELECT branch_name FROM branches WHERE id = ? LIMIT 1`, [user.branch_id]);
      if (branchRows.length > 0) branchName = branchRows[0].branch_name;
    }

    let customerInfo = null;
    if (roleNames.includes('USER') || user.role_type === 'USER' || user.role_type === 'SHOPKEEPER' || user.role_type === 'COMMON_CUSTOMER') {
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
          role_type: user.role_type || (roleNames[0] || 'USER'),
          organization_id: user.organization_id,
          organization_name: orgName,
          branch_id: user.branch_id,
          branch_name: branchName,
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

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This email is not registered. Please contact your administrator or sign in with registered credentials.',
      });
    }

    let user = users[0];

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
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    let orgName = null;
    let branchName = null;
    if (user.organization_id) {
      const orgRows = await query(`SELECT name FROM organizations WHERE id = ? LIMIT 1`, [user.organization_id]);
      if (orgRows.length > 0) orgName = orgRows[0].name;
    }
    if (user.branch_id) {
      const branchRows = await query(`SELECT branch_name FROM branches WHERE id = ? LIMIT 1`, [user.branch_id]);
      if (branchRows.length > 0) branchName = branchRows[0].branch_name;
    }

    return res.json({
      success: true,
      data: {
        user: {
          ...user,
          organization_name: orgName,
          branch_name: branchName,
          role_type: user.role_type || (user.roles?.[0] || 'USER'),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  login,
  googleLogin,
  getProfile,
};
