const express = require('express');
const router = express.Router();
const loanController = require('./loan.controller');
const { authenticate, requirePermission } = require('../../middleware/auth');
const idempotency = require('../../middleware/idempotency');

router.use(authenticate);

router.get('/products', requirePermission('LOAN_READ'), loanController.getProducts);
router.get('/', requirePermission('LOAN_READ'), loanController.getLoans);
router.get('/:id', requirePermission('LOAN_READ'), loanController.getLoanById);
router.post('/', requirePermission('LOAN_CREATE'), idempotency({ required: false }), loanController.createLoan);
router.post('/:id/approve', requirePermission('LOAN_APPROVE'), loanController.approveLoan);
router.post('/:id/disburse', requirePermission('LOAN_DISBURSE'), idempotency({ required: false }), loanController.disburseLoan);

module.exports = router;
