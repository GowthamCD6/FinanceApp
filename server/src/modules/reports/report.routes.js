const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate } = require('../../middleware/auth');

// Support authenticated requests (with optional fallback for demo/portal access)
router.use((req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
});

router.get('/dashboard', reportController.getDashboard);
router.get('/cashflow', reportController.getCashFlow);
router.get('/overdue', reportController.getOverdue);
router.get('/payments', reportController.getPaymentReport);

module.exports = router;
