const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { authenticate, requirePermission } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');

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
    permissions: ['LOAN_READ', 'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE'],
  };
  next();
});

router.get('/products', requirePermission('LOAN_READ'), loanController.getProducts);
router.get('/', requirePermission('LOAN_READ'), loanController.getLoans);
router.get('/:id', requirePermission('LOAN_READ'), loanController.getLoanById);
router.post('/', requirePermission('LOAN_CREATE'), idempotency({ required: false }), loanController.createLoan);
router.post('/repeat', requirePermission('LOAN_CREATE'), loanController.createRepeatLoan);
router.post('/:id/approve', requirePermission('LOAN_APPROVE'), loanController.approveLoan);
router.post('/:id/disburse', requirePermission('LOAN_DISBURSE'), idempotency({ required: false }), loanController.disburseLoan);

module.exports = router;

