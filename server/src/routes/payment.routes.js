const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, requirePermission } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');

router.use(authenticate);

router.get('/today', requirePermission('PAYMENT_READ'), paymentController.getTodaysCollections);
router.get('/', requirePermission('PAYMENT_READ'), paymentController.getPaymentsList);
router.post('/', requirePermission('PAYMENT_CREATE'), idempotency({ required: false }), paymentController.collectPayment);
router.post('/:id/reverse', requirePermission('PAYMENT_REVERSE'), idempotency({ required: false }), paymentController.reversePayment);
router.post('/visits', requirePermission('PAYMENT_CREATE'), paymentController.recordVisit);

module.exports = router;
