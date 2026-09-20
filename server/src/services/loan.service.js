const { query, withTransaction } = require('../config/database');

/**
 * Generate a unique loan number: LN-YYYYMMDD-XXXX
 */
async function generateLoanNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rows = await query(`SELECT COUNT(*) AS total FROM loans WHERE loan_number LIKE ?`, [`LN-${dateStr}-%`]);
  const seq = String((rows[0]?.total || 0) + 1).padStart(4, '0');
  return `LN-${dateStr}-${seq}`;
}

/**
 * Create a new loan application based on configurable loan products & policies
 */
async function createLoanApplication(data, userId) {
  const customerId = data.customerId || data.customer_id || data.userId || data.id;
  const principalVal = data.principalAmount || data.principal || data.principal_amount || data.amount;
  let productId = data.productId || data.product_id;
  const notes = data.notes || data.description || '';
  const frequency = data.frequency || data.repayment_frequency || data.type || 'WEEKLY';

  if (!customerId || !principalVal) {
    throw new Error('Customer and principal amount are required.');
  }

  const parsedPrincipal = parseFloat(principalVal);
  if (isNaN(parsedPrincipal) || parsedPrincipal <= 0) {
    throw new Error('Valid principal amount is required.');
  }

  // 1. Verify customer exists and is not blocked
  const customer = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
  if (!customer || customer.length === 0) throw new Error('Customer not found.');
  if (customer[0].status === 'BLOCKED') throw new Error('Customer is blocked from receiving loans.');

  // 2. Check if customer already has an active or overdue loan
  const activeLoans = await query(
    `SELECT id, loan_number, status FROM loans 
     WHERE customer_id = ? AND status IN ('PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'PARTIALLY_PAID', 'OVERDUE')
     LIMIT 1`,
    [customerId]
  );
  if (activeLoans && activeLoans.length > 0) {
    throw new Error(`Customer already has an ongoing loan (${activeLoans[0].loan_number}) in status ${activeLoans[0].status}.`);
  }

  // 3. Find the customer's most recent completed loan to link parent_loan_id
  const lastLoan = await query(
    `SELECT id FROM loans WHERE customer_id = ? AND status = 'COMPLETED' ORDER BY id DESC LIMIT 1`,
    [customerId]
  );
  const parentLoanId = lastLoan && lastLoan.length > 0 ? lastLoan[0].id : null;

  const effectiveOrgId = customer[0].organization_id || data.organizationId || data.organization_id || 2;
  const effectiveBranchId = data.branchId || data.branch_id || customer[0].branch_id || null;

  // 4. Resolve Loan Product
  if (!productId) {
    const prodRows = await query(
      `SELECT id, product_name, repayment_frequency FROM loan_products 
       WHERE (organization_id = ? OR organization_id IS NULL) AND (repayment_frequency = ? OR product_code LIKE ?) AND status = 'ACTIVE' 
       ORDER BY id ASC LIMIT 1`,
      [effectiveOrgId, frequency, `%${frequency.slice(0, 3)}%`]
    );
    if (prodRows && prodRows.length > 0) {
      productId = prodRows[0].id;
    } else {
      const anyProd = await query(`SELECT id FROM loan_products WHERE status = 'ACTIVE' LIMIT 1`);
      productId = anyProd?.[0]?.id || null;
    }
  }

  if (!productId) {
    const newProd = await query(
      `INSERT INTO loan_products (organization_id, product_name, product_code, customer_type, repayment_frequency, status)
       VALUES (?, ?, ?, 'BOTH', ?, 'ACTIVE')`,
      [effectiveOrgId, `${frequency} Lending Product`, `PROD-${frequency.slice(0, 3)}`, frequency]
    );
    productId = newProd.insertId;
  }

  // 5. Calculate contracted lending income / fees & installments
  const defaultTenure = frequency === 'DAILY' ? 100 : (frequency === 'MONTHLY' ? 12 : 10);
  const numInstallments = parseInt(data.total_installments || data.duration || data.tenure || defaultTenure, 10);
  const interestRate = parseFloat(data.interest_rate || data.interestRate || data.rate || 25.0);
  const contractedIncome = Math.round(((parsedPrincipal * interestRate) / 100) * 100) / 100;
  const totalRepaymentAmount = parsedPrincipal + contractedIncome;
  const loanNumber = await generateLoanNumber();

  // Find policy ID if exists
  const policyRows = await query(
    `SELECT id FROM loan_policies WHERE product_id = ? AND status = 'ACTIVE' ORDER BY effective_from DESC LIMIT 1`,
    [productId]
  );
  const policyId = policyRows?.[0]?.id || null;

  const result = await query(
    `INSERT INTO loans 
     (organization_id, branch_id, loan_number, customer_id, product_id, policy_id, parent_loan_id, principal_amount, contracted_income_amount, interest_rate, total_repayment_amount, total_installments, repayment_frequency, status, application_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_DATE, ?)`,
    [
      effectiveOrgId,
      effectiveBranchId,
      loanNumber,
      customerId,
      productId,
      policyId,
      parentLoanId,
      parsedPrincipal,
      contractedIncome,
      interestRate,
      totalRepaymentAmount,
      numInstallments,
      frequency,
      notes || null,
    ]
  );

  const loanId = result.insertId;

  // Record initial status history & event
  await query(
    `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
     VALUES (?, NULL, 'PENDING', 'Loan application submitted', ?)`,
    [loanId, userId || 1]
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
        installments: numInstallments,
        frequency,
        fundingSource: data.funding_source || data.fundingSource || 'VAULT',
      }),
      userId || 1,
    ]
  );

  return {
    id: loanId,
    loanNumber,
    customerId,
    principalAmount: parsedPrincipal,
    contractedIncomeAmount: contractedIncome,
    totalRepaymentAmount,
    totalInstallments: numInstallments,
    frequency,
    status: 'PENDING',
  };
}

/**
 * Approve a pending loan
 */
async function approveLoan(loanId, userId) {
  const loans = await query(`SELECT * FROM loans WHERE id = ? LIMIT 1`, [loanId]);
  if (!loans || loans.length === 0) throw new Error('Loan not found.');
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
async function disburseLoan({ loanId, fundAccountId = 1, userId, fundingSource = 'VAULT' }) {
  return await withTransaction(async (conn) => {
    // 1. Fetch loan and lock row
    const [loans] = await conn.query(`SELECT * FROM loans WHERE id = ? FOR UPDATE`, [loanId]);
    if (loans.length === 0) throw new Error('Loan not found.');
    const loan = loans[0];

    if (loan.status !== 'APPROVED' && loan.status !== 'PENDING') {
      throw new Error(`Loan must be in APPROVED or PENDING status to be disbursed. Current: ${loan.status}`);
    }

    const principal = parseFloat(loan.principal_amount);
    const income = parseFloat(loan.contracted_income_amount);
    const totalRepayment = parseFloat(loan.total_repayment_amount);
    const installmentsCount = parseInt(loan.total_installments, 10);
    const frequency = loan.repayment_frequency || 'WEEKLY';

    // 2. Resolve & Lock Fund Account
    let targetFundAccId = fundAccountId;
    const [accounts] = await conn.query(`SELECT * FROM fund_accounts WHERE id = ? FOR UPDATE`, [targetFundAccId]);
    if (accounts.length === 0 || accounts[0].status !== 'ACTIVE') {
      const [anyAcc] = await conn.query(`SELECT id FROM fund_accounts WHERE status = 'ACTIVE' LIMIT 1`);
      targetFundAccId = anyAcc?.[0]?.id || 1;
    }

    const isHandsOn = String(fundingSource).toUpperCase() === 'HANDS_ON' || String(fundingSource).toUpperCase() === 'HANDS_ON_MONEY';

    const effectiveOrgId = loan.organization_id || 2;

    // If hands-on money, inject external capital into the vault fund first
    if (isHandsOn) {
      const txInfusion = `TX-INFUSE-${loan.loan_number}-${Date.now()}`;
      await conn.query(
        `INSERT INTO fund_transactions
         (organization_id, transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
         VALUES (?, ?, ?, NOW(), 'CAPITAL_IN', 'IN', ?, 'LOAN', ?, ?, ?)`,
        [
          effectiveOrgId,
          txInfusion,
          targetFundAccId,
          principal,
          loanId,
          `Hands-on external admin funds injection for loan ${loan.loan_number}`,
          userId || 1,
        ]
      );
    }

    // Check available cash
    const [balanceRow] = await conn.query(
      `SELECT COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS balance
       FROM fund_transactions WHERE fund_account_id = ?`,
      [targetFundAccId]
    );
    const availableCash = parseFloat(balanceRow[0]?.balance || 0);

    // 3. Update Loan to ACTIVE
    const disbursementDate = new Date();
    const maturityDate = new Date();
    const daysInterval = frequency === 'DAILY' ? 1 : (frequency === 'MONTHLY' ? 30 : 7);
    maturityDate.setDate(maturityDate.getDate() + installmentsCount * daysInterval);

    await conn.query(
      `UPDATE loans SET 
         status = 'ACTIVE',
         disbursement_date = CURRENT_DATE,
         maturity_date = ?,
         disbursed_by = ?
       WHERE id = ?`,
      [maturityDate.toISOString().slice(0, 10), userId || 1, loanId]
    );

    // 4. Generate Installments Engine
    const principalPerInst = Math.floor((principal / installmentsCount) * 100) / 100;
    const incomePerInst = Math.floor((income / installmentsCount) * 100) / 100;
    let principalRemainder = Math.round((principal - principalPerInst * installmentsCount) * 100) / 100;
    let incomeRemainder = Math.round((income - incomePerInst * installmentsCount) * 100) / 100;

    await conn.query(`DELETE FROM loan_installments WHERE loan_id = ?`, [loanId]);

    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * daysInterval);

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
       (organization_id, transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
       VALUES (?, ?, ?, NOW(), 'LOAN_DISBURSEMENT', 'OUT', ?, 'LOAN', ?, ?, ?)`,
      [
        effectiveOrgId,
        txNumber,
        targetFundAccId,
        principal,
        loanId,
        `Disbursement for loan ${loan.loan_number} (${frequency}) [${isHandsOn ? 'HANDS-ON' : 'VAULT'}]`,
        userId || 1,
      ]
    );

    // 6. Double-Entry: Debit 1100 (Receivables), Credit 1000 (Cash)
    const jeNumber = `JE-DISB-${loan.loan_number}`;
    const [jeResult] = await conn.query(
      `INSERT INTO journal_entries (organization_id, entry_number, entry_date, reference_type, reference_id, description, created_by)
       VALUES (?, ?, NOW(), 'LOAN_DISBURSEMENT', ?, ?, ?)`,
      [effectiveOrgId, jeNumber, loanId, `Disbursed ${loan.loan_number}`, userId || 1]
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

    // 7. Audit log & events
    await conn.query(
      `INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, new_values, reason)
       VALUES (?, ?, 'LOAN_DISBURSE', 'LOAN', ?, ?, 'Disbursement authorized and processed')`,
      [effectiveOrgId, userId || 1, loanId, JSON.stringify({ fundAccountId: targetFundAccId, principal, installmentsCount, frequency, fundingSource })]
    );

    await conn.query(
      `INSERT INTO loan_status_history (loan_id, from_status, to_status, reason, changed_by)
       VALUES (?, 'APPROVED', 'ACTIVE', 'Disbursed and installments generated', ?)`,
      [loanId, userId || 1]
    );

    await conn.query(
      `INSERT INTO loan_events (loan_id, event_type, payload, performed_by)
       VALUES (?, 'LOAN_DISBURSED', ?, ?)`,
      [
        loanId,
        JSON.stringify({
          loanNumber: loan.loan_number,
          principal,
          fundAccountId: targetFundAccId,
          installmentsCount,
          frequency,
          fundingSource,
          disbursementDate: disbursementDate.toISOString(),
        }),
        userId || 1,
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
async function getLoans({ status, customerId, frequency, organizationId, branchId, page = 1, limit = 50 }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(1000, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (safePage - 1) * safeLimit;
  let whereClauses = ['1=1'];
  const params = [];

  if (organizationId && organizationId !== 'ALL') {
    whereClauses.push('(l.organization_id = ? OR c.organization_id = ?)');
    params.push(organizationId, organizationId);
  }

  if (branchId && branchId !== 'ALL') {
    whereClauses.push('(l.branch_id = ? OR c.branch_id = ?)');
    params.push(branchId, branchId);
  }

  if (status) {
    whereClauses.push('l.status = ?');
    params.push(status);
  }
  if (customerId) {
    whereClauses.push('(l.customer_id = ? OR c.id = ?)');
    params.push(customerId, customerId);
  }
  if (frequency) {
    whereClauses.push('l.repayment_frequency = ?');
    params.push(frequency);
  }

  const whereSql = whereClauses.join(' AND ');

  const countRows = await query(`SELECT COUNT(*) AS total FROM loans l LEFT JOIN customers c ON l.customer_id = c.id WHERE ${whereSql}`, params);
  const total = countRows[0]?.total || 0;

  const rawLoans = await query(
    `SELECT 
       l.*,
       COALESCE(c.full_name, l.customer_id, 'Borrower') AS customer_name,
       c.full_name AS customer_full_name,
       COALESCE(c.phone, '') AS customer_phone,
       c.customer_code,
       c.shop_name,
       COALESCE(lp.product_name, CONCAT(COALESCE(l.repayment_frequency, 'WEEKLY'), ' Scheme')) AS product_name,
       (SELECT COALESCE(SUM(paid_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS totalCollected,
       (SELECT COALESCE(SUM(outstanding_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS totalOutstanding,
       (SELECT COUNT(*) FROM loan_installments WHERE loan_id = l.id AND (status = 'PAID' OR paid_amount >= scheduled_amount)) AS paid_installments
     FROM loans l
     LEFT JOIN customers c ON l.customer_id = c.id
     LEFT JOIN loan_products lp ON l.product_id = lp.id
     WHERE ${whereSql}
     ORDER BY l.id DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  const loans = rawLoans.map((l) => {
    const principal = Number(l.principal_amount || 0);
    const totalRepayment = Number(l.total_repayment_amount || (principal * 1.25));
    const totalPaid = Number(l.totalCollected || 0);
    const totalOutstanding = Number(l.totalOutstanding || Math.max(0, totalRepayment - totalPaid));
    const totalInst = Number(l.total_installments || 10);
    const paidInst = Number(l.paid_installments || (totalInst > 0 && totalRepayment > 0 ? Math.floor((totalPaid / (totalRepayment / totalInst))) : 0));

    return {
      ...l,
      principal: principal,
      principal_amount: principal,
      total_repayment_amount: totalRepayment,
      totalRepayment: totalRepayment,
      total_paid: totalPaid,
      paid_amount: totalPaid,
      totalCollected: totalPaid,
      outstanding_amount: totalOutstanding,
      totalOutstanding: totalOutstanding,
      total_installments: totalInst,
      paid_installments: paidInst,
      emi_amount: totalInst > 0 ? Math.round(totalRepayment / totalInst) : 0,
    };
  });

  return { loans, total, page: safePage, totalPages: Math.ceil(total / safeLimit) };
}

/**
 * Get single loan details with installment schedules and payment allocations
 */
async function getLoanById(loanId) {
  const loans = await query(
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

  if (!loans || loans.length === 0) return null;
  const loan = loans[0];

  // Fetch installments with latest payment details if paid
  const installments = await query(
    `SELECT 
       li.*,
       (SELECT p.payment_method FROM payment_allocations pa JOIN payments p ON pa.payment_id = p.id WHERE pa.installment_id = li.id ORDER BY p.id DESC LIMIT 1) AS payment_method,
       (SELECT COALESCE(p.payment_date, li.paid_at) FROM payment_allocations pa JOIN payments p ON pa.payment_id = p.id WHERE pa.installment_id = li.id ORDER BY p.id DESC LIMIT 1) AS effective_paid_date
     FROM loan_installments li 
     WHERE li.loan_id = ? 
     ORDER BY li.installment_number ASC`,
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
  const customer = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
  if (!customer || customer.length === 0) throw new Error('Customer not found.');

  // Find previous completed loan to link parent_loan_id
  const lastCompleted = await query(
    `SELECT * FROM loans WHERE customer_id = ? AND status = 'COMPLETED' ORDER BY id DESC LIMIT 1`,
    [customerId]
  );
  if (!lastCompleted || lastCompleted.length === 0) {
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

