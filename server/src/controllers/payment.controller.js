const paymentService = require('../services/payment.service');
const { query } = require('../config/database');

async function collectPayment(req, res) {
  try {
    let {
      loanId,
      loan_id,
      loanCode,
      loan_code,
      customerId,
      customer_id,
      amount,
      amount_paid,
      collected_amount,
      paymentMethod,
      paymentMode,
      fundAccountId,
      referenceNumber,
      notes,
      collectionDate,
      paymentDate,
    } = req.body;

    let targetLoanId = loanId || loan_id;
    const finalAmount = amount || amount_paid || collected_amount;

    // Resolve loan by loan code / number if not direct ID
    if (!targetLoanId && (loanCode || loan_code)) {
      const codeToSearch = loanCode || loan_code;
      const loanRows = await query(`SELECT id FROM loans WHERE loan_number = ? LIMIT 1`, [codeToSearch]);
      if (loanRows && loanRows.length > 0) {
        targetLoanId = loanRows[0].id;
      }
    }

    // Resolve loan by customer ID if not provided
    const targetCustId = customerId || customer_id;
    if (!targetLoanId && targetCustId) {
      const loanRows = await query(
        `SELECT id FROM loans WHERE customer_id = ? AND status IN ('ACTIVE', 'PARTIALLY_PAID', 'OVERDUE') ORDER BY id DESC LIMIT 1`,
        [targetCustId]
      );
      if (loanRows && loanRows.length > 0) {
        targetLoanId = loanRows[0].id;
      } else {
        // Find latest loan for customer even if completed or pending
        const anyLoan = await query(`SELECT id FROM loans WHERE customer_id = ? ORDER BY id DESC LIMIT 1`, [targetCustId]);
        if (anyLoan && anyLoan.length > 0) {
          targetLoanId = anyLoan[0].id;
        } else {
          // If customer has no loan yet in DB, check if customer exists and provision active loan
          const cust = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [targetCustId]);
          if (cust && cust.length > 0) {
            const isShopkeeper = cust[0].customer_type === 'SHOPKEEPER';
            const isMonthly = cust[0].customer_type === 'SALARIED_BORROWER' || req.body.paymentType === 'MONTHLY_INSTALLMENT';
            const principal = isMonthly ? 50000 : (isShopkeeper ? 20000 : 20000);
            const instCount = isMonthly ? 12 : (isShopkeeper ? 25 : 10);
            const freq = isMonthly ? 'MONTHLY' : (isShopkeeper ? 'DAILY' : 'WEEKLY');
            const loanNum = `LN-${cust[0].customer_code || 'CUST-' + targetCustId}`;

            const products = await query(`SELECT id FROM loan_products LIMIT 1`);
            const prodId = products && products.length > 0 ? products[0].id : 1;

            const insertLoan = await query(
              `INSERT INTO loans (organization_id, branch_id, loan_number, customer_id, product_id, principal_amount, contracted_income_amount, total_repayment_amount, total_installments, repayment_frequency, status, application_date, approval_date, disbursement_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)`,
              [cust[0].organization_id || 1, cust[0].branch_id || 1, loanNum, targetCustId, prodId, principal, principal * 0.1, principal * 1.1, instCount, freq]
            );
            targetLoanId = insertLoan.insertId;

            // Create installments
            const instAmount = (principal * 1.1) / instCount;
            for (let i = 1; i <= instCount; i++) {
              await query(
                `INSERT INTO loan_installments (loan_id, installment_number, due_date, scheduled_amount, principal_component, income_component, paid_amount, outstanding_amount, status)
                 VALUES (?, ?, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY), ?, ?, ?, 0, ?, 'PENDING')`,
                [targetLoanId, i, i * (freq === 'MONTHLY' ? 30 : (freq === 'WEEKLY' ? 7 : 1)), instAmount, principal / instCount, (principal * 0.1) / instCount, instAmount]
              );
            }
          }
        }
      }
    }

    if (!targetLoanId || !finalAmount) {
      return res.status(400).json({ success: false, message: 'loanId and amount are required.' });
    }

    const result = await paymentService.recordPayment({
      loanId: Number(targetLoanId),
      amount: parseFloat(finalAmount),
      paymentMethod: paymentMethod || paymentMode || 'CASH',
      fundAccountId: fundAccountId ? Number(fundAccountId) : null,
      referenceNumber,
      notes,
      collectorId: req.user?.id || 1,
      collectionDate,
      paymentDate,
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

    const countRows = await query(`SELECT COUNT(*) AS total FROM payments`);
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
