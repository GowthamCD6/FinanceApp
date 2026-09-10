const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const { authenticate, requirePermission } = require('../../middleware/auth');

router.use(authenticate);

router.post('/', requirePermission('CUSTOMER_CREATE'), customerController.createCustomer);
router.get('/', requirePermission('CUSTOMER_READ'), customerController.getCustomers);
router.get('/:id', requirePermission('CUSTOMER_READ'), customerController.getCustomerById);

module.exports = router;
