const customerService = require('../services/customer.service');

async function createCustomer(req, res) {
  try {
    const result = await customerService.createCustomer(req.body, req.user.id);
    return res.status(201).json({ success: true, message: 'Customer created successfully.', data: result });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getCustomers(req, res) {
  try {
    const { search, customerType, status, page, limit } = req.query;
    const result = await customerService.getCustomers({
      search,
      customerType,
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getCustomerById(req, res) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    return res.json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getCustomerLifecycle(req, res) {
  try {
    const lifecycle = await customerService.getCustomerLifecycle(req.params.id);
    return res.json({ success: true, data: lifecycle });
  } catch (error) {
    console.error('Get customer lifecycle error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getCustomerMeDashboard(req, res) {
  try {
    const dashboard = await customerService.getCustomerMeDashboard(req.user.id);
    return res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Customer portal error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function updateCustomerStatus(req, res) {
  try {
    const { status, reason } = req.body;
    const result = await customerService.updateCustomerStatus(
      req.params.id,
      status,
      reason,
      req.user?.id
    );
    return res.json({
      success: true,
      message: `Customer status updated to ${status}`,
      data: result,
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getWeeklyCustomers(req, res) {
  try {
    const { search, status, area } = req.query;
    const result = await customerService.getWeeklyCustomers({ search, status, area });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get weekly customers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getShopkeepers(req, res) {
  try {
    const { search, status, route } = req.query;
    const result = await customerService.getShopkeepers({ search, status, route });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get shopkeepers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerLifecycle,
  getCustomerMeDashboard,
  updateCustomerStatus,
  getWeeklyCustomers,
  getShopkeepers,
};

