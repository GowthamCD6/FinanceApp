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

module.exports = {
  getDashboardMetrics,
  getCashFlowReport,
  getOverdueReport,
};
