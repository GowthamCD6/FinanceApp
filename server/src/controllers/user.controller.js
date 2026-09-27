const userService = require('../services/user.service');

async function createUser(req, res) {
  try {
    const orgId = req.body.organizationId || req.body.organization_id || req.headers['x-organization-id'] || req.user?.organization_id || 1;
    const branchId = req.body.branchId || req.body.branch_id || req.branchId || req.headers['x-branch-id'] || req.user?.branch_id || null;
    const user = await userService.createUser({ ...req.body, organizationId: orgId, branchId }, req.user?.id || null);
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const { search, role, status, scope, page, limit, organizationId, branchId } = req.query;
    const orgId = organizationId || req.headers['x-organization-id'] || req.organizationId || req.user?.organization_id || null;
    const effectiveBranchId = branchId || req.branchId || req.headers['x-branch-id'] || req.user?.branch_id || null;
    const result = await userService.getUsers({
      search,
      role,
      status,
      scope,
      organizationId: orgId,
      branchId: effectiveBranchId,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by id error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user?.id || null);
    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    return res.json({
      success: true,
      message: 'User status updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function saveBiometrics(req, res) {
  try {
    const userId = req.body.userId || req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.saveBiometricSettings(userId, req.body);
    return res.json({
      success: true,
      message: 'Biometric security settings saved successfully.',
      data: result,
    });
  } catch (error) {
    console.error('Save biometrics error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getBiometrics(req, res) {
  try {
    const userId = req.query.userId || req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.getBiometricSettings(userId);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get biometrics error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function saveLocation(req, res) {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required to save location.' });
    }
    const result = await userService.saveUserLocation(userId, req.body);
    return res.json({
      success: true,
      message: 'User location saved successfully.',
      data: { location: result },
    });
  } catch (error) {
    console.error('Save location error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getLocation(req, res) {
  try {
    const userId = req.query.userId || req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.getUserLocation(userId);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get location error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getAdminUserLocations(req, res) {
  try {
    const orgId = req.query.organizationId || req.headers['x-organization-id'] || req.user?.organization_id || null;
    const search = req.query.search || '';
    const result = await userService.getAllUserLocations(orgId, search);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get admin user locations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function forceLogout(req, res) {
  try {
    const targetUserId = req.body.userId || req.params.id;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required.' });
    }
    const reason = req.body.reason || 'Forced logout by administrator';
    const result = await userService.forceLogoutUser(targetUserId, reason);
    return res.json({
      success: true,
      message: 'User has been force-logged out. They will be signed out on their next session check.',
      data: result,
    });
  } catch (error) {
    console.error('Force logout error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function blockUserHandler(req, res) {
  try {
    const targetUserId = req.body.userId || req.params.id;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required.' });
    }
    const reason = req.body.reason || 'Blocked by administrator';
    const result = await userService.blockUser(targetUserId, reason);
    return res.json({
      success: true,
      message: 'User account has been blocked and deactivated.',
      data: result,
    });
  } catch (error) {
    console.error('Block user error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function unblockUserHandler(req, res) {
  try {
    const targetUserId = req.body.userId || req.params.id;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required.' });
    }
    const result = await userService.unblockUser(targetUserId);
    return res.json({
      success: true,
      message: 'User account has been unblocked and reactivated.',
      data: result,
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getAllUsersForAdmin(req, res) {
  try {
    const orgId = req.query.organizationId || req.headers['x-organization-id'] || req.organizationId || req.user?.organization_id || null;
    const branchId = req.query.branchId || req.branchId || req.headers['x-branch-id'] || req.user?.branch_id || null;
    const result = await userService.getUsers({
      search: req.query.search || '',
      role: req.query.role || null,
      status: req.query.status || null,
      organizationId: orgId,
      branchId: branchId,
      page: parseInt(req.query.page || '1', 10),
      limit: parseInt(req.query.limit || '100', 10),
    });
    return res.json({ success: true, data: result?.users || result?.data || result || [] });
  } catch (error) {
    console.error('Get all users for admin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function verifySession(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, valid: false, reason: 'NO_USER_ID' });
    }
    const result = await userService.verifyUserSession(userId);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Verify session error:', error);
    return res.status(500).json({ success: false, valid: false, message: error.message });
  }
}

async function clearForceLogout(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required.' });
    }
    const { query: dbQuery } = require('../config/database');
    await dbQuery(`UPDATE users SET force_logout_at = NULL WHERE id = ?`, [userId]);
    return res.json({ success: true, message: 'Force logout flag cleared.' });
  } catch (error) {
    console.error('Clear force logout error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function saveNotificationPreferences(req, res) {
  try {
    const userId = req.body.userId || req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.saveNotificationPreferences(userId, req.body);
    return res.json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: result,
    });
  } catch (error) {
    console.error('Save notification preferences error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getNotificationPreferences(req, res) {
  try {
    const userId = req.query.userId || req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.getNotificationPreferences(userId);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getUserPasswordDetails(req, res) {
  try {
    const userId = req.params.id || req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.getPasswordDetails(userId);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get user password details error:', error);
    return res.status(error.message === 'User not found.' ? 404 : 500).json({ success: false, message: error.message });
  }
}

async function updateUserPassword(req, res) {
  try {
    const userId = req.body.userId || req.params.id || req.params.userId;
    const newPassword = req.body.newPassword || req.body.password;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }
    const result = await userService.updateUserPassword(userId, newPassword);
    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Update user password error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function resetUserPassword(req, res) {
  try {
    const userId = req.body.userId || req.params.id || req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }
    const result = await userService.resetUserPassword(userId);
    return res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  saveBiometrics,
  getBiometrics,
  saveLocation,
  getLocation,
  getAdminUserLocations,
  forceLogout,
  blockUserHandler,
  unblockUserHandler,
  getAllUsersForAdmin,
  verifySession,
  clearForceLogout,
  saveNotificationPreferences,
  getNotificationPreferences,
  getUserPasswordDetails,
  updateUserPassword,
  resetUserPassword,
};
