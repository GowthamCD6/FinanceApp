const paymentService = require('./payment.service');
const { query } = require('../../config/database');

async function collectPayment(req, res) {
  try {
    const { loanId, amount, paymentMethod, fundAccountId, referenceNumber, notes } = req.body;

    if (!loanId || !amount) {
      return res.status(400).json({ success: false, message: 'loanId and amount are required.' });
    }

    const result = await paymentService.recordPayment({
      loanId: Number(loanId),
      amount: parseFloat(amount),
      paymentMethod,
      fundAccountId: fundAccountId ? Number(fundAccountId) : null,
      referenceNumber,
      notes,
      collectorId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: result.loanCompleted ? 'Payment recorded! Loan has been fully settled.' : 'Payment recorded successfully.',
      data: result,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function reversePayment(req, res) {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason for payment reversal is required.' });
    }

    const result = await paymentService.reversePayment({
      paymentId: Number(req.params.id),
      reason,
      userId: req.user.id,
    });

    return res.json({
      success: true,
      message: 'Payment reversed successfully. Central fund ledger and installment balances adjusted.',
      data: result,
    });
  } catch (error) {
    console.error('Reverse payment error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function recordVisit(req, res) {
  try {
    const result = await paymentService.recordCollectionVisit(req.body, req.user.id);
    return res.status(201).json({ success: true, message: 'Collection visit logged.', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getTodaysCollections(req, res) {
  try {
    const route = await paymentService.getTodaysCollectionsRoute(req.user.id);
    return res.json({ success: true, data: route });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getPaymentsList(req, res) {
  try {
    const safePage = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const safeLimit = Math.max(1, parseInt(req.query.limit || '20', 10) || 20);
    const offset = (safePage - 1) * safeLimit;

    const [countRows] = await query(`SELECT COUNT(*) AS total FROM payments`);
    const total = countRows[0]?.total || 0;

    const payments = await query(
      `SELECT 
         p.*,
         c.full_name AS customer_name,
         c.phone AS customer_phone,
         l.loan_number,
         u.name AS collector_name
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN loans l ON p.loan_id = l.id
       LEFT JOIN users u ON p.collector_id = u.id
       ORDER BY p.payment_date DESC
       LIMIT ${safeLimit} OFFSET ${offset}`
    );

    return res.json({ success: true, data: { payments, total, page: safePage, totalPages: Math.ceil(total / safeLimit) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  collectPayment,
  reversePayment,
  recordVisit,
  getTodaysCollections,
  getPaymentsList,
};
