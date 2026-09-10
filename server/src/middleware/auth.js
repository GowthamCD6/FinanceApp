const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Authenticate JWT token and attach user + roles + permissions to req
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Fetch user details
    const users = await query(
      `SELECT id, name, email, phone, status FROM users WHERE id = ? AND status = 'ACTIVE' LIMIT 1`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user.' });
    }

    const user = users[0];

    // Fetch user roles
    const roles = await query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [user.id]
    );
    user.roles = roles.map(r => r.name);

    // Fetch user permissions
    const permissions = await query(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    user.permissions = permissions.map(p => p.name);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

/**
 * Middleware to enforce required permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    if (req.user.roles.includes('SUPER_ADMIN') || req.user.permissions.includes(permission)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Permission denied. Required: ${permission}`,
    });
  };
}

/**
 * Middleware to enforce required roles
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    if (req.user.roles.includes('SUPER_ADMIN') || req.user.roles.some(r => allowedRoles.includes(r))) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access forbidden for your role. Allowed: ${allowedRoles.join(', ')}`,
    });
  };
}

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
};
