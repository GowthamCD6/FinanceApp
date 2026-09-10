const express = require('express');
const router = express.Router();
const reconciliationController = require('./reconciliation.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);

// Restricted to ADMIN, SUPER_ADMIN, and ACCOUNTANT
router.get('/', requireRole(['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']), reconciliationController.getReconciliations);
router.post('/', requireRole(['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']), reconciliationController.performReconciliation);
router.post('/:id/adjust', requireRole(['ADMIN', 'SUPER_ADMIN']), reconciliationController.recordAdjustment);

module.exports = router;
