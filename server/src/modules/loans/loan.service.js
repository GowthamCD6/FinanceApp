const { query, withTransaction } = require('../../config/database');

/**
 * Generate a unique loan number: LN-YYYYMMDD-XXXX
 */
async function generateLoanNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await query(`SELECT COUNT(*) AS total FROM loans WHERE loan_number LIKE ?`, [`LN-${dateStr}-%`]);
  const seq = String((rows[0]?.total || 0) + 1).padStart(4, '0');
  return `LN-${dateStr}-${seq}`;
}

/**
 * Create a new loan application based on configurable loan products & policies
 */
async function createLoanApplication(data, userId) {
  const { customerId, productId, principalAmount, notes } = data;

  if (!customerId || !productId || !principalAmount) {
    throw new Error('Customer, loan product, and principal amount are required.');
  }

  const parsedPrincipal = parseFloat(principalAmount);

  // 1. Verify customer exists and is not blocked
  const [customer] = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
  if (customer.length === 0) throw new Error('Customer not found.');
  if (customer[0].status === 'BLOCKED') throw new Error('Customer is blocked from receiving loans.');

  // 2. Check if customer already has an active or overdue loan
  const [activeLoans] = await query(
    `SELECT id, loan_number, status FROM loans 
     WHERE customer_id = ? AND status IN ('PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'PARTIALLY_PAID', 'OVERDUE')
     LIMIT 1`,
    [customerId]
  );
  if (activeLoans.length > 0) {
    throw new Error(`Customer already has an ongoing loan (${activeLoans[0].loan_number}) in status ${activeLoans[0].status}.`);
  }

  // 3. Find the customer's most recent completed loan to link parent_loan_id
  const [lastLoan] = await query(
    `SELECT id FROM loans WHERE customer_id = ? AND status = 'COMPLETED' ORDER BY id DESC LIMIT 1`,
    [customerId]
  );
  const parentLoanId = lastLoan.length > 0 ? lastLoan[0].id : null;

  // 4. Fetch loan product and active policy
  const [product] = await query(`SELECT * FROM loan_products WHERE id = ? AND status = 'ACTIVE' LIMIT 1`, [productId]);
  if (product.length === 0) throw new Error('Loan product not found or inactive.');

  const [policy] = await query(
    `SELECT * FROM loan_policies WHERE product_id = ? AND status = 'ACTIVE' ORDER BY effective_from DESC LIMIT 1`,
    [productId]
  );
  if (policy.length === 0) throw new Error('No active policy found for this loan product.');

  const p = policy[0];
  if (parsedPrincipal < parseFloat(p.minimum_amount) || parsedPrincipal > parseFloat(p.maximum_amount)) {
    throw new Error(`Loan amount must be between ₹${p.minimum_amount} and ₹${p.maximum_amount} as per product policy.`);
  }

  // 5. Calculate contracted lending income / fees based on policy
  let contractedIncome = 0;
  if (p.income_type === 'PERCENTAGE') {
    contractedIncome = parsedPrincipal * parseFloat(p.income_value);
  } else if (p.income_type === 'FIXED_FEE') {
    contractedIncome = parseFloat(p.income_value);
  }

  const totalRepaymentAmount = parsedPrincipal + contractedIncome;
  const loanNumber = await generateLoanNumber();

  const [result] = await query(
    `INSERT INTO loans 
     (loan_number, customer_id, product_id, policy_id, parent_loan_id, principal_amount, contracted_income_amount, total_repayment_amount, total_installments, repayment_frequency, status, application_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_DATE, ?)`,
    [
      loanNumber,
      customerId,
      productId,
      p.id,
      parentLoanId,
      parsedPrincipal,
      contractedIncome,
      totalRepaymentAmount,
      p.number_of_installments,
      product[0].repayment_frequency,
      notes || null,
    ]
  );

  const loanId = result.insertId;

  // Record initial status history & event
  await query(
    `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
     VALUES (?, NULL, 'PENDING', 'Loan application submitted', ?)`,
    [loanId, userId]
  );

  await query(
    `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
     VALUES (?, 'LOAN_CREATED', ?, ?)`,
    [
      loanId,
      JSON.stringify({
        loanNumber,
        customerId,
        principal: parsedPrincipal,
        income: contractedIncome,
        installments: p.number_of_installments,
        frequency: product[0].repayment_frequency,
      }),
      userId,
    ]
  );

  return {
    id: loanId,
    loanNumber,
    customerId,
    principalAmount: parsedPrincipal,
    contractedIncomeAmount: contractedIncome,
    totalRepaymentAmount,
    totalInstallments: p.number_of_installments,
    frequency: product[0].repayment_frequency,
    status: 'PENDING',
  };
}

/**
 * Approve a pending loan
 */
async function approveLoan(loanId, userId) {
  const [loans] = await query(`SELECT * FROM loans WHERE id = ? LIMIT 1`, [loanId]);
  if (loans.length === 0) throw new Error('Loan not found.');
  if (loans[0].status !== 'PENDING') throw new Error(`Loan cannot be approved from status ${loans[0].status}.`);

  await query(
    `UPDATE loans SET status = 'APPROVED', approval_date = CURRENT_DATE, approved_by = ? WHERE id = ?`,
    [userId, loanId]
  );

  // Status history & event
  await query(
    `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
     VALUES (?, 'PENDING', 'APPROVED', 'Loan approved by manager', ?)`,
    [loanId, userId]
  );

  await query(
    `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
     VALUES (?, 'LOAN_APPROVED', ?, ?)`,
    [loanId, JSON.stringify({ approvedBy: userId, approvalDate: new Date().toISOString() }), userId]
  );

  return { id: loanId, status: 'APPROVED' };
}

/**
 * Atomically disburse loan:
 * 1. Locks fund account row with SELECT ... FOR UPDATE
 * 2. Checks available cash in ledger
 * 3. Changes loan status to ACTIVE
 * 4. Generates daily/weekly installments with principal + income breakdown
 * 5. Creates immutable fund_transaction (LOAN_DISBURSEMENT, direction: OUT)
 * 6. Posts double-entry journal entry
 * 7. Records audit log
 */
async function disburseLoan({ loanId, fundAccountId, userId }) {
  return await withTransaction(async (conn) => {
    // 1. Fetch loan and lock row
    const [loans] = await conn.query(`SELECT * FROM loans WHERE id = ? FOR UPDATE`, [loanId]);
    if (loans.length === 0) throw new Error('Loan not found.');
    const loan = loans[0];

    if (loan.status !== 'APPROVED') {
      throw new Error(`Loan must be in APPROVED status to be disbursed. Current: ${loan.status}`);
    }

    const principal = parseFloat(loan.principal_amount);
    const income = parseFloat(loan.contracted_income_amount);
    const totalRepayment = parseFloat(loan.total_repayment_amount);
    const installmentsCount = parseInt(loan.total_installments, 10);
    const frequency = loan.repayment_frequency; // 'DAILY' or 'WEEKLY'

    // 2. Lock and verify Fund Account
    const [accounts] = await conn.query(`SELECT * FROM fund_accounts WHERE id = ? FOR UPDATE`, [fundAccountId]);
    if (accounts.length === 0 || accounts[0].status !== 'ACTIVE') {
      throw new Error('Selected fund account not found or inactive.');
    }

    // Check available cash in this specific fund account
    const [balanceRow] = await conn.query(
      `SELECT COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS balance
       FROM fund_transactions WHERE fund_account_id = ?`,
      [fundAccountId]
    );
    const availableCash = parseFloat(balanceRow[0]?.balance || 0);

    if (availableCash < principal) {
      throw new Error(
        `Insufficient available cash in ${accounts[0].account_name}. Available: ₹${availableCash.toFixed(2)}, Required: ₹${principal.toFixed(2)}.`
      );
    }

    // 3. Update Loan to DISBURSED / ACTIVE
    const disbursementDate = new Date();
    const maturityDate = new Date();
    const daysInterval = frequency === 'DAILY' ? 1 : 7;
    maturityDate.setDate(maturityDate.getDate() + installmentsCount * daysInterval);

    await conn.query(
      `UPDATE loans SET 
         status = 'ACTIVE',
         disbursement_date = CURRENT_DATE,
         maturity_date = ?,
         disbursed_by = ?
       WHERE id = ?`,
      [maturityDate.toISOString().slice(0, 10), userId, loanId]
    );

    // 4. Generate Installments Engine
    const principalPerInst = Math.floor((principal / installmentsCount) * 100) / 100;
    const incomePerInst = Math.floor((income / installmentsCount) * 100) / 100;
    let principalRemainder = Math.round((principal - principalPerInst * installmentsCount) * 100) / 100;
    let incomeRemainder = Math.round((income - incomePerInst * installmentsCount) * 100) / 100;

    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * daysInterval);

      // Add remainders to the final installment for cent-accurate precision
      const curPrincipal = i === installmentsCount ? principalPerInst + principalRemainder : principalPerInst;
      const curIncome = i === installmentsCount ? incomePerInst + incomeRemainder : incomePerInst;
      const scheduledAmount = curPrincipal + curIncome;

      await conn.query(
        `INSERT INTO loan_installments 
         (loan_id, installment_number, due_date, scheduled_amount, principal_component, income_component, paid_amount, outstanding_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'PENDING')`,
        [loanId, i, dueDate.toISOString().slice(0, 10), scheduledAmount, curPrincipal, curIncome, scheduledAmount]
      );
    }

    // 5. Create Fund Transaction: LOAN_DISBURSEMENT (OUT)
    const txNumber = `TX-DISB-${loan.loan_number}-${Date.now()}`;
    await conn.query(
      `INSERT INTO fund_transactions
       (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
       VALUES (?, ?, NOW(), 'LOAN_DISBURSEMENT', 'OUT', ?, 'LOAN', ?, ?, ?)`,
      [
        txNumber,
        fundAccountId,
        principal,
        loanId,
        `Disbursement for loan ${loan.loan_number} (${frequency})`,
        userId,
      ]
    );

    // 6. Double-Entry: Debit 1100 (Receivables), Credit 1000 (Cash)
    const jeNumber = `JE-DISB-${loan.loan_number}`;
    const [jeResult] = await conn.query(
      `INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, description, created_by)
       VALUES (?, NOW(), 'LOAN_DISBURSEMENT', ?, ?, ?)`,
      [jeNumber, loanId, `Disbursed ${loan.loan_number}`, userId]
    );
    const jeId = jeResult.insertId;

    const [recAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1100' LIMIT 1`);
    const [cashAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1000' LIMIT 1`);

    if (recAcc.length && cashAcc.length) {
      await conn.query(
        `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES
         (?, ?, ?, 0.00, 'Debit Loan Receivables on Disbursement'),
         (?, ?, 0.00, ?, 'Credit Cash on Disbursement')`,
        [jeId, recAcc[0].id, principal, cashAcc[0].id, principal]
      );
    }

    // 7. Audit log, status history, and immutable event
    await conn.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, reason)
       VALUES (?, 'LOAN_DISBURSE', 'LOAN', ?, ?, 'Disbursement authorized and processed')`,
      [userId, loanId, JSON.stringify({ fundAccountId, principal, installmentsCount, frequency })]
    );

    await conn.query(
      `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
       VALUES (?, 'APPROVED', 'ACTIVE', 'Disbursed and installments generated', ?)`,
      [loanId, userId]
    );

    await conn.query(
      `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
       VALUES (?, 'LOAN_DISBURSED', ?, ?)`,
      [
        loanId,
        JSON.stringify({
          loanNumber: loan.loan_number,
          principal,
          fundAccountId,
          installmentsCount,
          frequency,
          disbursementDate: disbursementDate.toISOString(),
        }),
        userId,
      ]
    );

    return {
      loanId,
      loanNumber: loan.loan_number,
      disbursedAmount: principal,
      installmentsCreated: installmentsCount,
      status: 'ACTIVE',
      newAvailableCash: availableCash - principal,
    };
  });
}

/**
 * List loans with optional filters
 */
async function getLoans({ status, customerId, frequency, page = 1, limit = 20 }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
  const offset = (safePage - 1) * safeLimit;
  let whereClauses = ['1=1'];
  const params = [];

  if (status) {
    whereClauses.push('l.status = ?');
    params.push(status);
  }
  if (customerId) {
    whereClauses.push('l.customer_id = ?');
    params.push(customerId);
  }
  if (frequency) {
    whereClauses.push('l.repayment_frequency = ?');
    params.push(frequency);
  }

  const whereSql = whereClauses.join(' AND ');

  const [countRows] = await query(`SELECT COUNT(*) AS total FROM loans l WHERE ${whereSql}`, params);
  const total = countRows[0]?.total || 0;

  const loans = await query(
    `SELECT 
       l.*,
       c.full_name AS customer_name,
       c.phone AS customer_phone,
       c.shop_name,
       lp.product_name,
       (SELECT COALESCE(SUM(paid_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS totalCollected,
       (SELECT COALESCE(SUM(outstanding_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS totalOutstanding
     FROM loans l
     JOIN customers c ON l.customer_id = c.id
     JOIN loan_products lp ON l.product_id = lp.id
     WHERE ${whereSql}
     ORDER BY l.id DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  return { loans, total, page: safePage, totalPages: Math.ceil(total / safeLimit) };
}

/**
 * Get single loan details with installment schedules and payment allocations
 */
async function getLoanById(loanId) {
  const [loans] = await query(
    `SELECT 
       l.*,
       c.full_name AS customer_name,
       c.phone AS customer_phone,
       c.customer_code,
       c.shop_name,
       lp.product_name,
       lp.product_code
     FROM loans l
     JOIN customers c ON l.customer_id = c.id
     JOIN loan_products lp ON l.product_id = lp.id
     WHERE l.id = ? LIMIT 1`,
    [loanId]
  );

  if (loans.length === 0) return null;
  const loan = loans[0];

  // Fetch installments
  const installments = await query(
    `SELECT * FROM loan_installments WHERE loan_id = ? ORDER BY installment_number ASC`,
    [loanId]
  );

  // Fetch payments
  const payments = await query(
    `SELECT p.*, u.name AS collector_name 
     FROM payments p 
     LEFT JOIN users u ON p.collector_id = u.id 
     WHERE p.loan_id = ? 
     ORDER BY p.payment_date DESC`,
    [loanId]
  );

  return {
    ...loan,
    installments,
    payments,
  };
}

/**
 * SECTION 12: CREATE REPEAT LOAN
 * Preserves lending lifecycle tree: #001 -> #002 -> #003 -> #004
 */
async function createRepeatLoan({ customerId, requestedAmount = 15000, notes, userId }) {
  const [customer] = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
  if (customer.length === 0) throw new Error('Customer not found.');

  // Find previous completed loan to link parent_loan_id
  const [lastCompleted] = await query(
    `SELECT * FROM loans WHERE customer_id = ? AND status = 'COMPLETED' ORDER BY id DESC LIMIT 1`,
    [customerId]
  );
  if (lastCompleted.length === 0) {
    throw new Error('Customer has no previous completed loans to initiate a repeat loan.');
  }

  const parentLoanId = lastCompleted[0].id;
  const productId = lastCompleted[0].product_id;

  // Use createLoanApplication with parentLoanId
  return await createLoanApplication(
    {
      customerId,
      productId,
      principalAmount: requestedAmount,
      notes: notes || `Repeat loan following completed loan ${lastCompleted[0].loan_number}`,
    },
    userId
  );
}

module.exports = {
  createLoanApplication,
  createRepeatLoan,
  approveLoan,
  disburseLoan,
  getLoans,
  getLoanById,
};

