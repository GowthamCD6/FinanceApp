const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate, requirePermission } = require('../../middleware/auth');

router.use(authenticate);

router.get('/dashboard', requirePermission('REPORT_VIEW'), reportController.getDashboard);
router.get('/cashflow', requirePermission('REPORT_VIEW'), reportController.getCashFlow);
router.get('/overdue', requirePermission('REPORT_VIEW'), reportController.getOverdue);

module.exports = router;
