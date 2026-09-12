const { query, withTransaction } = require('../config/database');

/**
 * Generate unique payment receipt number: RCP-YYYYMMDD-XXXX
 */
async function generatePaymentNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await query(`SELECT COUNT(*) AS total FROM payments WHERE payment_number LIKE ?`, [`RCP-${dateStr}-%`]);
  const seq = String((rows[0]?.total || 0) + 1).padStart(4, '0');
  return `RCP-${dateStr}-${seq}`;
}

/**
 * Process a customer payment collection atomically:
 * 1. Validates loan and unpaid installments
 * 2. Distributes payment across pending installments (supports partial and multi-installment settlement)
 * 3. Allocates Principal Recovery vs Lending Income
 * 4. Records immutable payment and allocation records
 * 5. Injects cash into central fund ledger (PRINCIPAL_COLLECTION + LENDING_INCOME)
 * 6. Posts double-entry journal entry
 * 7. Records immutable loan_events (PAYMENT_RECEIVED)
 * 8. Checks for loan completion and triggers rule-based repeat-loan eligibility evaluation
 */
async function recordPayment({ loanId, amount, paymentMethod, fundAccountId, referenceNumber, notes, collectorId }) {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Payment amount must be a positive number.');
  }

  return await withTransaction(async (conn) => {
    // 1. Lock and fetch loan
    const [loans] = await conn.query(`SELECT * FROM loans WHERE id = ? FOR UPDATE`, [loanId]);
    if (loans.length === 0) throw new Error('Loan not found.');
    const loan = loans[0];

    if (!['ACTIVE', 'PARTIALLY_PAID', 'OVERDUE'].includes(loan.status)) {
      throw new Error(`Cannot record payment on a loan with status '${loan.status}'.`);
    }

    // 2. Fetch all unpaid installments ordered by installment_number
    const [installments] = await conn.query(
      `SELECT * FROM loan_installments 
       WHERE loan_id = ? AND status IN ('PENDING', 'PARTIAL', 'OVERDUE')
       ORDER BY installment_number ASC 
       FOR UPDATE`,
      [loanId]
    );

    if (installments.length === 0) {
      throw new Error('No outstanding installments found for this loan.');
    }

    // Calculate total outstanding on loan
    const totalRemainingDue = installments.reduce((acc, inst) => acc + parseFloat(inst.outstanding_amount), 0);
    if (parsedAmount > totalRemainingDue + 0.01) {
      throw new Error(
        `Payment amount (₹${parsedAmount.toFixed(2)}) exceeds total remaining balance (₹${totalRemainingDue.toFixed(2)}).`
      );
    }

    // 3. Create master payment record
    const paymentNumber = await generatePaymentNumber();
    const [paymentResult] = await conn.query(
      `INSERT INTO payments 
       (payment_number, customer_id, loan_id, payment_date, amount, payment_method, reference_number, collector_id, status, notes)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, 'COMPLETED', ?)`,
      [paymentNumber, loan.customer_id, loanId, parsedAmount, paymentMethod || 'CASH', referenceNumber || null, collectorId, notes || null]
    );
    const paymentId = paymentResult.insertId;

    // 4. Distribute amount across installments & calculate allocations
    let unallocatedAmount = parsedAmount;
    let totalPrincipalAllocated = 0;
    let totalIncomeAllocated = 0;
    const allocationDetails = [];

    for (const inst of installments) {
      if (unallocatedAmount <= 0) break;

      const instDue = parseFloat(inst.outstanding_amount);
      const applyAmount = Math.min(unallocatedAmount, instDue);

      const instScheduled = parseFloat(inst.scheduled_amount);
      const instPrincipalRatio = parseFloat(inst.principal_component) / instScheduled;

      const principalPortion = Math.round(applyAmount * instPrincipalRatio * 100) / 100;
      const incomePortion = Math.round((applyAmount - principalPortion) * 100) / 100;

      totalPrincipalAllocated += principalPortion;
      totalIncomeAllocated += incomePortion;

      // Update installment
      const newPaid = parseFloat(inst.paid_amount) + applyAmount;
      const newOutstanding = Math.max(0, instDue - applyAmount);
      const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIAL';

      await conn.query(
        `UPDATE loan_installments 
         SET paid_amount = ?, outstanding_amount = ?, status = ?, paid_at = CASE WHEN ? = 'PAID' THEN NOW() ELSE paid_at END
         WHERE id = ?`,
        [newPaid, newOutstanding, newStatus, newStatus, inst.id]
      );

      // Record payment allocation
      if (principalPortion > 0) {
        await conn.query(
          `INSERT INTO payment_allocations (payment_id, installment_id, allocation_type, amount)
           VALUES (?, ?, 'PRINCIPAL', ?)`,
          [paymentId, inst.id, principalPortion]
        );
      }
      if (incomePortion > 0) {
        await conn.query(
          `INSERT INTO payment_allocations (payment_id, installment_id, allocation_type, amount)
           VALUES (?, ?, 'LENDING_INCOME', ?)`,
          [paymentId, inst.id, incomePortion]
        );
      }

      allocationDetails.push({
        installmentNumber: inst.installment_number,
        applied: applyAmount,
        principalPortion,
        incomePortion,
        remainingOnInstallment: newOutstanding,
        status: newStatus,
      });

      unallocatedAmount -= applyAmount;
    }

    // Adjust any rounding difference into principal
    const diff = Math.round((parsedAmount - (totalPrincipalAllocated + totalIncomeAllocated)) * 100) / 100;
    if (diff !== 0) {
      totalPrincipalAllocated += diff;
    }

    // 5. Inflow into Central Fund Ledger (Pooled circulation)
    const targetAccountId = fundAccountId || 1;

    if (totalPrincipalAllocated > 0) {
      await conn.query(
        `INSERT INTO fund_transactions 
         (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
         VALUES (?, ?, NOW(), 'PRINCIPAL_COLLECTION', 'IN', ?, 'PAYMENT', ?, ?, ?)`,
        [
          `TX-PRIN-${paymentNumber}`,
          targetAccountId,
          totalPrincipalAllocated,
          paymentId,
          `Principal recovered on loan ${loan.loan_number} (${paymentNumber})`,
          collectorId,
        ]
      );
    }

    if (totalIncomeAllocated > 0) {
      await conn.query(
        `INSERT INTO fund_transactions 
         (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
         VALUES (?, ?, NOW(), 'LENDING_INCOME', 'IN', ?, 'PAYMENT', ?, ?, ?)`,
        [
          `TX-INC-${paymentNumber}`,
          targetAccountId,
          totalIncomeAllocated,
          paymentId,
          `Lending fee income recognized on loan ${loan.loan_number} (${paymentNumber})`,
          collectorId,
        ]
      );
    }

    // 6. Double-Entry Accounting
    const jeNumber = `JE-PAY-${paymentNumber}`;
    const [jeResult] = await conn.query(
      `INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, description, created_by)
       VALUES (?, NOW(), 'PAYMENT_COLLECTION', ?, ?, ?)`,
      [jeNumber, paymentId, `Collection for ${loan.loan_number}`, collectorId]
    );
    const jeId = jeResult.insertId;

    const [cashAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1000' LIMIT 1`);
    const [recAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1100' LIMIT 1`);
    const [incAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '4000' LIMIT 1`);

    if (cashAcc.length && recAcc.length && incAcc.length) {
      await conn.query(
        `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, 0.00, ?)`,
        [jeId, cashAcc[0].id, parsedAmount, 'Cash Inflow from Collection']
      );
      if (totalPrincipalAllocated > 0) {
        await conn.query(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, recAcc[0].id, totalPrincipalAllocated, 'Principal Recovery']
        );
      }
      if (totalIncomeAllocated > 0) {
        await conn.query(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, incAcc[0].id, totalIncomeAllocated, 'Realized Lending Income']
        );
      }
    }

    // 7. Check for Loan Completion & Evaluate Repeat Loan Eligibility
    const [remainingPending] = await conn.query(
      `SELECT COUNT(*) AS unpaidCount FROM loan_installments WHERE loan_id = ? AND status != 'PAID'`,
      [loanId]
    );

    let isCompleted = false;
    if ((remainingPending[0]?.unpaidCount || 0) === 0) {
      isCompleted = true;
      await conn.query(`UPDATE loans SET status = 'COMPLETED' WHERE id = ?`, [loanId]);

      // Record Loan Status History
      await conn.query(
        `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
         VALUES (?, ?, 'COMPLETED', 'All installments paid in full', ?)`,
        [loanId, loan.status, collectorId]
      );

      // Record Loan Event
      await conn.query(
        `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
         VALUES (?, 'LOAN_COMPLETED', ?, ?)`,
        [loanId, JSON.stringify({ finalPaymentId: paymentId, totalPaid: loan.total_repayment_amount }), collectorId]
      );

      // Rule-based repeat-loan eligibility evaluation
      const prevPrincipal = parseFloat(loan.principal_amount);
      const nextEligibleAmount = Math.min(prevPrincipal * 1.5, 150000);

      await conn.query(
        `INSERT INTO loan_eligibility (customer_id, previous_loan_id, next_product_id, eligible_amount, status, eligible_from, reason)
         VALUES (?, ?, ?, ?, 'ELIGIBLE', CURRENT_DATE, ?)
         ON DUPLICATE KEY UPDATE
           previous_loan_id = VALUES(previous_loan_id),
           eligible_amount = VALUES(eligible_amount),
           status = 'ELIGIBLE',
           eligible_from = CURRENT_DATE,
           reason = VALUES(reason)`,
        [
          loan.customer_id,
          loanId,
          loan.product_id,
          nextEligibleAmount,
          `Loan ${loan.loan_number} settled 100%. Qualified for next progression to ₹${nextEligibleAmount.toFixed(2)}.`,
        ]
      );
    } else {
      await conn.query(`UPDATE loans SET status = 'PARTIALLY_PAID' WHERE id = ?`, [loanId]);
    }

    // 8. Record Loan Event: PAYMENT_RECEIVED
    await conn.query(
      `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
       VALUES (?, 'PAYMENT_RECEIVED', ?, ?)`,
      [
        loanId,
        JSON.stringify({
          paymentNumber,
          amount: parsedAmount,
          principalRecovered: totalPrincipalAllocated,
          incomeRecognized: totalIncomeAllocated,
        }),
        collectorId,
      ]
    );

    return {
      paymentNumber,
      loanId,
      amountCollected: parsedAmount,
      principalRecovered: totalPrincipalAllocated,
      incomeEarned: totalIncomeAllocated,
      loanCompleted: isCompleted,
      allocations: allocationDetails,
    };
  });
}

/**
 * Reverses a payment with full auditable accounting & ledger contra-entries.
 * Never deletes the payment row.
 */
async function reversePayment({ paymentId, reason, userId }) {
  if (!reason) throw new Error('A valid reason is required to reverse a payment.');

  return await withTransaction(async (conn) => {
    // 1. Lock payment
    const [payments] = await conn.query(`SELECT * FROM payments WHERE id = ? FOR UPDATE`, [paymentId]);
    if (payments.length === 0) throw new Error('Payment not found.');
    const payment = payments[0];

    if (payment.status !== 'COMPLETED') {
      throw new Error(`Payment cannot be reversed from status '${payment.status}'.`);
    }

    const [loans] = await conn.query(`SELECT * FROM loans WHERE id = ? FOR UPDATE`, [payment.loan_id]);
    const loan = loans[0];

    // 2. Fetch all allocations for this payment
    const [allocations] = await conn.query(
      `SELECT * FROM payment_allocations WHERE payment_id = ?`,
      [paymentId]
    );

    let principalToReverse = 0;
    let incomeToReverse = 0;

    // 3. Roll back installment balances
    for (const alloc of allocations) {
      const amt = parseFloat(alloc.amount);
      if (alloc.allocation_type === 'PRINCIPAL') principalToReverse += amt;
      if (alloc.allocation_type === 'LENDING_INCOME') incomeToReverse += amt;

      if (alloc.installment_id) {
        await conn.query(
          `UPDATE loan_installments 
           SET paid_amount = GREATEST(0, paid_amount - ?),
               outstanding_amount = outstanding_amount + ?,
               status = 'PARTIAL'
           WHERE id = ?`,
          [amt, amt, alloc.installment_id]
        );
      }
    }

    // 4. Mark payment as REVERSED
    await conn.query(
      `UPDATE payments SET status = 'REVERSED', notes = CONCAT(COALESCE(notes, ''), ' | REVERSED: ', ?) WHERE id = ?`,
      [reason, paymentId]
    );

    // 5. Post counter-entries in Central Fund Ledger (OUT)
    const revTxNum = `TX-REV-${payment.payment_number}`;
    await conn.query(
      `INSERT INTO fund_transactions
       (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
       VALUES (?, 1, NOW(), 'REVERSAL', 'OUT', ?, 'PAYMENT_REVERSAL', ?, ?, ?)`,
      [revTxNum, payment.amount, paymentId, `Reversal of payment ${payment.payment_number}: ${reason}`, userId]
    );

    // 6. Reverse Journal Entry
    const revJeNum = `JE-REV-${payment.payment_number}`;
    const [jeResult] = await conn.query(
      `INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, description, created_by)
       VALUES (?, NOW(), 'PAYMENT_REVERSAL', ?, ?, ?)`,
      [revJeNum, paymentId, `Reversal of ${payment.payment_number}`, userId]
    );
    const jeId = jeResult.insertId;

    const [cashAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1000' LIMIT 1`);
    const [recAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1100' LIMIT 1`);
    const [incAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '4000' LIMIT 1`);

    if (cashAcc.length && recAcc.length && incAcc.length) {
      // Credit Cash (Cash goes down)
      await conn.query(
        `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, 0.00, ?, ?)`,
        [jeId, cashAcc[0].id, payment.amount, 'Cash Outflow from Payment Reversal']
      );
      // Debit Loan Receivables (Receivable restored)
      if (principalToReverse > 0) {
        await conn.query(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, recAcc[0].id, principalToReverse, 'Principal Restored on Reversal']
        );
      }
      // Debit Lending Income (Income undone)
      if (incomeToReverse > 0) {
        await conn.query(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, incAcc[0].id, incomeToReverse, 'Lending Income Undone on Reversal']
        );
      }
    }

    // 7. Update loan status if it was previously COMPLETED
    if (loan.status === 'COMPLETED') {
      await conn.query(`UPDATE loans SET status = 'ACTIVE' WHERE id = ?`, [loan.id]);

      // Revoke eligibility
      await conn.query(
        `UPDATE loan_eligibility SET status = 'UNDER_REVIEW', reason = 'Previous completed payment was reversed'
         WHERE customer_id = ?`,
        [loan.customer_id]
      );
    }

    // 8. Record Loan Event: PAYMENT_REVERSED
    await conn.query(
      `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
       VALUES (?, 'PAYMENT_REVERSED', ?, ?)`,
      [
        loan.id,
        JSON.stringify({
          reversedPaymentNumber: payment.payment_number,
          amount: payment.amount,
          reason,
        }),
        userId,
      ]
    );

    // 9. Audit Log
    await conn.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, reason)
       VALUES (?, 'PAYMENT_REVERSE', 'PAYMENT', ?, ?, 'REVERSED', ?)`,
      [userId, paymentId, JSON.stringify({ status: 'COMPLETED', amount: payment.amount }), reason]
    );

    return {
      paymentNumber: payment.payment_number,
      reversedAmount: payment.amount,
      status: 'REVERSED',
    };
  });
}

/**
 * Record a field collector visit
 */
async function recordCollectionVisit(data, collectorId) {
  const {
    customerId,
    loanId,
    installmentId,
    paymentId,
    expectedAmount,
    collectedAmount,
    pendingAmount,
    latitude,
    longitude,
    notes,
  } = data;

  const [result] = await query(
    `INSERT INTO collection_visits 
     (collector_id, customer_id, loan_id, installment_id, payment_id, expected_amount, collected_amount, pending_amount, latitude, longitude, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      collectorId,
      customerId,
      loanId,
      installmentId || null,
      paymentId || null,
      expectedAmount || 0,
      collectedAmount || 0,
      pendingAmount || 0,
      latitude || null,
      longitude || null,
      notes || null,
    ]
  );

  return { id: result.insertId, status: 'VISIT_RECORDED' };
}

/**
 * Get collector's daily route and pending collections
 */
async function getTodaysCollectionsRoute(collectorId = null) {
  const today = new Date().toISOString().slice(0, 10);

  const collections = await query(
    `SELECT 
       li.id AS installment_id,
       li.installment_number,
       li.due_date,
       li.scheduled_amount,
       li.outstanding_amount,
       li.status AS installment_status,
       l.id AS loan_id,
       l.loan_number,
       l.repayment_frequency,
       c.id AS customer_id,
       c.customer_code,
       c.full_name AS customer_name,
       c.phone,
       c.shop_name,
       c.address,
       c.city
     FROM loan_installments li
     JOIN loans l ON li.loan_id = l.id
     JOIN customers c ON l.customer_id = c.id
     WHERE l.status IN ('ACTIVE', 'PARTIALLY_PAID', 'OVERDUE')
       AND (li.due_date <= ? AND li.status IN ('PENDING', 'PARTIAL', 'OVERDUE'))
     ORDER BY li.due_date ASC, c.full_name ASC`,
    [today]
  );

  const totalExpected = collections.reduce((acc, c) => acc + parseFloat(c.outstanding_amount), 0);

  return {
    today,
    totalExpected,
    count: collections.length,
    route: collections,
  };
}

module.exports = {
  recordPayment,
  reversePayment,
  recordCollectionVisit,
  getTodaysCollectionsRoute,
};
