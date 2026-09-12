const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

// User / Customer self-service dashboard (Kumar)
router.get('/me/dashboard', customerController.getCustomerMeDashboard);

// Customer lifecycle (#001 -> #002 -> #003 -> #004) & repeat loan evaluation
router.get('/:id/lifecycle', requirePermission('CUSTOMER_READ'), customerController.getCustomerLifecycle);

// Specialized Division Collections
router.get('/weekly-customers', requirePermission('CUSTOMER_READ'), customerController.getWeeklyCustomers);
router.get('/shopkeepers', requirePermission('CUSTOMER_READ'), customerController.getShopkeepers);

// Standard Customer CRUD
router.post('/', requirePermission('CUSTOMER_CREATE'), customerController.createCustomer);
router.get('/', requirePermission('CUSTOMER_READ'), customerController.getCustomers);
router.get('/:id', requirePermission('CUSTOMER_READ'), customerController.getCustomerById);
// Update customer status (ACTIVE, INACTIVE, BLOCKED, UNDER_REVIEW)
router.patch('/:id/status', requirePermission('CUSTOMER_UPDATE'), customerController.updateCustomerStatus);

module.exports = router;

