const { query } = require('../../config/database');

/**
 * Get core dashboard metrics (The 5 numbers the system must never confuse):
 * 1. Available Cash
 * 2. Outstanding Principal
 * 3. Lending Income
 * 4. Expenses
 * 5. Net Profit
 */
async function getDashboardMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  // 1. Available Cash & Total Capital
  const [capRow] = await query(
    `SELECT COALESCE(SUM(amount), 0) AS totalCapital FROM fund_transactions WHERE transaction_type = 'CAPITAL_IN'`
  );
  const totalCapital = parseFloat(capRow[0]?.totalCapital || 0);

  const [cashRow] = await query(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS availableCash 
     FROM fund_transactions`
  );
  const availableCash = parseFloat(cashRow[0]?.availableCash || 0);

  // 2. Principal Disbursed vs Principal Recovered
  const [loanMetrics] = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN transaction_type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END), 0) AS totalDisbursed,
      COALESCE(SUM(CASE WHEN transaction_type = 'PRINCIPAL_COLLECTION' THEN amount ELSE 0 END), 0) AS totalPrincipalRecovered
    FROM fund_transactions
  `);
  const moneyCurrentlyLent = parseFloat(loanMetrics[0]?.totalDisbursed || 0);
  const principalRecovered = parseFloat(loanMetrics[0]?.totalPrincipalRecovered || 0);
  const outstandingPrincipal = Math.max(0, moneyCurrentlyLent - principalRecovered);

  // 3. Today's Collections & Income
  const [todayRows] = await query(
    `SELECT 
       COALESCE(SUM(amount), 0) AS todayTotalCollection,
       COALESCE(SUM(CASE WHEN transaction_type = 'LENDING_INCOME' THEN amount ELSE 0 END), 0) AS todayLendingIncome
     FROM fund_transactions
     WHERE DATE(transaction_date) = ? AND transaction_type IN ('PRINCIPAL_COLLECTION', 'LENDING_INCOME')`,
    [today]
  );
  const todayCollection = parseFloat(todayRows[0]?.todayTotalCollection || 0);
  const todayLendingIncome = parseFloat(todayRows[0]?.todayLendingIncome || 0);

  // 4. Monthly Collections, Income, Expenses, and Net Profit
  const [monthRows] = await query(
    `SELECT 
       COALESCE(SUM(CASE WHEN transaction_type IN ('PRINCIPAL_COLLECTION', 'LENDING_INCOME') THEN amount ELSE 0 END), 0) AS monthlyCollection,
       COALESCE(SUM(CASE WHEN transaction_type = 'LENDING_INCOME' THEN amount ELSE 0 END), 0) AS monthlyIncome,
       COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS monthlyExpenses
     FROM fund_transactions
     WHERE DATE(transaction_date) >= ?`,
    [startOfMonth]
  );
  const monthlyCollection = parseFloat(monthRows[0]?.monthlyCollection || 0);
  const monthlyIncome = parseFloat(monthRows[0]?.monthlyIncome || 0);
  const monthlyExpenses = parseFloat(monthRows[0]?.monthlyExpenses || 0);
  const netProfit = monthlyIncome - monthlyExpenses;

  // 5. Loan Counts
  const [loanStats] = await query(`
    SELECT 
      COUNT(CASE WHEN status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID') THEN 1 END) AS activeLoans,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completedLoans,
      COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdueLoans,
      (SELECT COUNT(*) FROM loan_eligibility WHERE status = 'ELIGIBLE') AS eligibleCustomers
    FROM loans
  `);

  return {
    totalCapital,
    availableCash,
    moneyCurrentlyLent,
    principalRecovered,
    outstandingPrincipal,
    todayCollection,
    todayLendingIncome,
    monthlyCollection,
    monthlyIncome,
    monthlyExpenses,
    netProfit,
    loanCounts: loanStats[0] || {},
  };
}

/**
 * Get Cash Flow Statement:
 * Opening Cash + Inflows (Capital, Collections) - Outflows (Disbursements, Expenses) = Closing Cash
 */
async function getCashFlowReport(startDate, endDate) {
  const from = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = endDate || new Date().toISOString().slice(0, 10);

  // Opening balance prior to startDate
  const [openRow] = await query(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS openingCash
     FROM fund_transactions
     WHERE DATE(transaction_date) < ?`,
    [from]
  );
  const openingCash = parseFloat(openRow[0]?.openingCash || 0);

  // Period transactions
  const transactions = await query(
    `SELECT 
       transaction_type,
       direction,
       COALESCE(SUM(amount), 0) AS totalAmount
     FROM fund_transactions
     WHERE DATE(transaction_date) BETWEEN ? AND ?
     GROUP BY transaction_type, direction`,
    [from, to]
  );

  let capitalIn = 0;
  let principalCollections = 0;
  let lendingIncome = 0;
  let loanDisbursements = 0;
  let expenses = 0;

  for (const t of transactions) {
    const amt = parseFloat(t.totalAmount);
    if (t.transaction_type === 'CAPITAL_IN') capitalIn += amt;
    else if (t.transaction_type === 'PRINCIPAL_COLLECTION') principalCollections += amt;
    else if (t.transaction_type === 'LENDING_INCOME') lendingIncome += amt;
    else if (t.transaction_type === 'LOAN_DISBURSEMENT') loanDisbursements += amt;
    else if (t.transaction_type === 'EXPENSE') expenses += amt;
  }

  const totalInflows = capitalIn + principalCollections + lendingIncome;
  const totalOutflows = loanDisbursements + expenses;
  const closingCash = openingCash + totalInflows - totalOutflows;

  return {
    period: { from, to },
    openingCash,
    inflows: {
      capitalIn,
      principalCollections,
      lendingIncome,
      totalInflows,
    },
    outflows: {
      loanDisbursements,
      expenses,
      totalOutflows,
    },
    closingCash,
  };
}

/**
 * Get categorized overdue portfolio (1-7 days, 8-30 days, 30+ days)
 */
async function getOverdueReport() {
  const today = new Date().toISOString().slice(0, 10);

  const overdueList = await query(
    `SELECT 
       li.id AS installment_id,
       li.installment_number,
       li.due_date,
       li.outstanding_amount,
       DATEDIFF(?, li.due_date) AS days_overdue,
       l.id AS loan_id,
       l.loan_number,
       c.id AS customer_id,
       c.full_name AS customer_name,
       c.phone,
       c.shop_name
     FROM loan_installments li
     JOIN loans l ON li.loan_id = l.id
     JOIN customers c ON l.customer_id = c.id
     WHERE li.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
       AND li.due_date < ?
     ORDER BY days_overdue DESC`,
    [today, today]
  );

  const summary = {
    range1To7: { count: 0, amount: 0 },
    range8To30: { count: 0, amount: 0 },
    range30Plus: { count: 0, amount: 0 },
    totalOverdueAmount: 0,
  };

  for (const item of overdueList) {
    const amt = parseFloat(item.outstanding_amount);
    const days = parseInt(item.days_overdue, 10);
    summary.totalOverdueAmount += amt;

    if (days <= 7) {
      summary.range1To7.count++;
      summary.range1To7.amount += amt;
    } else if (days <= 30) {
      summary.range8To30.count++;
      summary.range8To30.amount += amt;
    } else {
      summary.range30Plus.count++;
      summary.range30Plus.amount += amt;
    }
  }

  return {
    summary,
    overdueList,
  };
}

/**
 * Dynamic Payment Obligations & Collection Report with date range filtering and unpaid-first sorting
 */
async function getPaymentReport({ startDate, endDate, frequency, status }) {
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = startDate || today;
  const toDate = endDate || today;

  let whereClauses = [
    `li.due_date BETWEEN ? AND ?`,
    `l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE')`,
  ];
  const params = [fromDate, toDate];

  if (frequency && frequency !== 'ALL') {
    whereClauses.push(`l.repayment_frequency = ?`);
    params.push(frequency);
  }

  const whereSql = whereClauses.join(' AND ');

  const rawRecords = await query(
    `SELECT 
       li.id AS schedule_id,
       li.loan_id,
       li.installment_number,
       li.due_date,
       li.scheduled_amount AS expected_amount,
       li.paid_amount,
       li.outstanding_amount AS balance,
       li.status AS raw_status,
       li.paid_at,
       l.loan_number,
       l.repayment_frequency,
       l.principal_amount,
       l.total_repayment_amount,
       l.status AS loan_status,
       c.id AS customer_id,
       c.customer_code,
       c.full_name AS customer_name,
       c.phone AS customer_phone,
       c.address AS customer_address,
       c.shop_name,
       c.customer_type,
       u.id AS user_id,
       u.name AS user_name
     FROM loan_installments li
     JOIN loans l ON li.loan_id = l.id
     JOIN customers c ON l.customer_id = c.id
     LEFT JOIN users u ON c.user_id = u.id
     WHERE ${whereSql}
     ORDER BY li.due_date ASC, li.installment_number ASC`,
    params
  );

  let expectedTotal = 0;
  let collectedTotal = 0;
  let outstandingTotal = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let partialCount = 0;
  let overdueCount = 0;

  const records = rawRecords.map((r) => {
    const expected = parseFloat(r.expected_amount || 0);
    const paid = parseFloat(r.paid_amount || 0);
    const balance = Math.max(0, expected - paid);
    const dueDateStr = r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : '';

    let calculatedStatus = 'UNPAID';
    let sortPriority = 2; // Default for UNPAID

    if (balance === 0 || paid >= expected) {
      calculatedStatus = 'PAID';
      sortPriority = 4; // Bottom
      paidCount++;
    } else if (paid > 0) {
      calculatedStatus = 'PARTIAL';
      sortPriority = 3; // Middle
      partialCount++;
    } else if (dueDateStr < today) {
      calculatedStatus = 'OVERDUE';
      sortPriority = 1; // Top
      overdueCount++;
    } else {
      calculatedStatus = 'UNPAID';
      sortPriority = 2; // Top/Unpaid
      unpaidCount++;
    }

    expectedTotal += expected;
    collectedTotal += paid;
    outstandingTotal += balance;

    return {
      scheduleId: r.schedule_id,
      loanId: r.loan_id,
      userId: r.user_id || r.customer_id,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerAddress: r.customer_address,
      shopName: r.shop_name,
      customerType: r.customer_type,
      loanNumber: r.loan_number,
      frequency: r.repayment_frequency,
      installmentNumber: r.installment_number,
      dueDate: dueDateStr,
      expectedAmount: expected,
      paidAmount: paid,
      balance,
      status: calculatedStatus,
      paidAt: r.paid_at,
      sortPriority,
    };
  });

  // Strict sorting: OVERDUE (1) -> UNPAID (2) -> PARTIAL (3) -> PAID (4)
  records.sort((a, b) => {
    if (a.sortPriority !== b.sortPriority) {
      return a.sortPriority - b.sortPriority;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // Filter if status filter requested
  const filteredRecords = status && status !== 'ALL'
    ? records.filter((rec) => rec.status === status)
    : records;

  return {
    period: {
      start: fromDate,
      end: toDate,
    },
    summary: {
      expected: expectedTotal,
      collected: collectedTotal,
      outstanding: outstandingTotal,
      paid_count: paidCount,
      unpaid_count: unpaidCount,
      partial_count: partialCount,
      overdue_count: overdueCount,
      total_records: records.length,
    },
    records: filteredRecords,
  };
}

module.exports = {
  getDashboardMetrics,
  getCashFlowReport,
  getOverdueReport,
  getPaymentReport,
};
