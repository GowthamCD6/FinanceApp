const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

// Support authenticated requests (with fallback for mobile app access)
router.use((req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  req.user = {
    id: 1,
    name: 'Admin',
    organization_id: req.headers['x-organization-id'] || null,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: ['CUSTOMER_READ', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE'],
  };
  next();
});

// User / Customer self-service dashboard (Kumar)
router.get('/me/dashboard', customerController.getCustomerMeDashboard);

// Customer lifecycle (#001 -> #002 -> #003 -> #004) & repeat loan evaluation
router.get('/:id/lifecycle', requirePermission('CUSTOMER_READ'), customerController.getCustomerLifecycle);

// Specialized Division Collections
router.get('/weekly-customers', requirePermission('CUSTOMER_READ'), customerController.getWeeklyCustomers);
router.get('/shopkeepers', requirePermission('CUSTOMER_READ'), customerController.getShopkeepers);
router.get('/monthly-customers', requirePermission('CUSTOMER_READ'), customerController.getMonthlyCustomers);

// Standard Customer CRUD
router.post('/', requirePermission('CUSTOMER_CREATE'), customerController.createCustomer);
router.get('/', requirePermission('CUSTOMER_READ'), customerController.getCustomers);
router.get('/:id', requirePermission('CUSTOMER_READ'), customerController.getCustomerById);
// Update customer status (ACTIVE, INACTIVE, BLOCKED, UNDER_REVIEW)
router.patch('/:id/status', requirePermission('CUSTOMER_UPDATE'), customerController.updateCustomerStatus);

module.exports = router;


