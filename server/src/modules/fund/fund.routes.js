const express = require('express');
const router = express.Router();
const fundController = require('./fund.controller');
const { authenticate, requirePermission } = require('../../middleware/auth');

router.use(authenticate);

router.get('/summary', requirePermission('FUND_READ'), fundController.getSummary);
router.get('/accounts', requirePermission('FUND_READ'), fundController.getAccounts);
router.get('/circulation', requirePermission('FUND_READ'), fundController.getCirculationTrail);
router.post('/capital', requirePermission('FUND_MANAGE'), fundController.addCapital);

module.exports = router;
