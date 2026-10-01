const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

// Secure all financial report endpoints with JWT authentication
router.use(authenticate);

router.get('/dashboard', reportController.getDashboard);
router.get('/cashflow', reportController.getCashFlow);
router.get('/overdue', reportController.getOverdue);
router.get('/payments', reportController.getPaymentReport);

module.exports = router;
