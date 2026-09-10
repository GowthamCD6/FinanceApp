const customerService = require('./customer.service');

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

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};
