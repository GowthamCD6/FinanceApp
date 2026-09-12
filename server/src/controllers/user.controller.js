const userService = require('../services/user.service');

async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body, req.user?.id || null);
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
    const { search, role, status, page, limit } = req.query;
    const result = await userService.getUsers({
      search,
      role,
      status,
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};
