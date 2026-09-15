const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const governanceService = require('../services/governance.service');

async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const rawId = (identifier || '').trim();
    const rawPassword = (password || '').trim();

    if (!rawId || !rawPassword) {
      return res.status(400).json({ success: false, message: 'Identifier (phone/email) and password are required.' });
    }

    const cleanPhone = rawId.replace(/\D/g, '').slice(-10);

    // 1. Dynamic User Lookup: Check users table by phone, clean 10-digit phone, or email
    let users = await query(
      `SELECT * FROM users 
       WHERE phone = ? 
          OR (LENGTH(?) = 10 AND (phone = ? OR phone LIKE ?))
          OR email = ? 
          OR LOWER(email) = LOWER(?) 
       LIMIT 1`,
      [rawId, cleanPhone, cleanPhone, `%${cleanPhone}`, rawId, rawId]
    );

    // 2. If not found in users table, dynamically check if an organization exists with this phone or email
    if (users.length === 0) {
      const orgs = await query(
        `SELECT * FROM organizations 
         WHERE phone = ? 
            OR (LENGTH(?) = 10 AND (phone = ? OR phone LIKE ?))
            OR admin_phone = ? 
            OR (LENGTH(?) = 10 AND (admin_phone = ? OR admin_phone LIKE ?))
            OR admin_email = ? 
            OR LOWER(admin_email) = LOWER(?)
         LIMIT 1`,
        [rawId, cleanPhone, cleanPhone, `%${cleanPhone}`, rawId, cleanPhone, cleanPhone, `%${cleanPhone}`, rawId, rawId]
      );

      if (orgs.length > 0) {
        const org = orgs[0];
        const orgUsers = await query(
          `SELECT * FROM users WHERE organization_id = ? AND role_type IN ('ORG_ADMIN', 'ADMIN') LIMIT 1`,
          [org.id]
        );
        if (orgUsers.length > 0) {
          users = orgUsers;
        }
      }
    }

    if (users.length === 0) {
      const isEmail = rawId.includes('@');
      return res.status(404).json({
        success: false,
        message: isEmail ? 'This email is not registered in the system.' : 'This phone number is not registered in the system.',
      });
    }

    const user = users[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated or suspended. Please contact administrator.' });
    }

    // 3. Dynamic Password Verification (supports bcrypt hash or plain text from direct DB edits)
    let isMatch = false;
    if (user.password_hash) {
      if (user.password_hash === rawPassword || user.password_hash === password) {
        isMatch = true;
        // Upgrade plain text to bcrypt hash in DB
        try {
          const newHash = await bcrypt.hash(rawPassword, 10);
          await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, user.id]);
        } catch (upgradeErr) {
          console.warn('Could not upgrade password hash:', upgradeErr);
        }
      } else if (user.password_hash.startsWith('$2')) {
        isMatch = await bcrypt.compare(rawPassword, user.password_hash);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Either the password or email/phone is wrong.',
      });
    }

    // Update last login timestamp
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    // Fetch user roles
    const roles = await query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [user.id]
    );
    let roleNames = roles.map(r => r.name);
    if (user.role_type && !roleNames.includes(user.role_type)) {
      roleNames.push(user.role_type);
    }
    if (roleNames.length === 0) {
      roleNames = [user.role_type || 'ADMIN'];
    }

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

    // Asynchronously log audit event
    governanceService.logAudit({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'USER_LOGIN',
      entity_type: 'AUTHENTICATION',
      entity_id: `AUTH-${user.id}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1',
      reason: `${user.role_type || roleNames[0] || 'User'} authenticated successfully`,
      status: 'SUCCESS'
    });

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

    // Asynchronously log audit event
    governanceService.logAudit({
      organization_id: user.organization_id,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'USER_LOGIN',
      entity_type: 'AUTHENTICATION',
      entity_id: `AUTH-GOOGLE-${user.id}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1',
      reason: `User authenticated via Google OAuth SSO`,
      status: 'SUCCESS'
    });

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
