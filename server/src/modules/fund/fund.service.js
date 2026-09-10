const { query, withTransaction } = require('../../config/database');

/**
 * Calculate available balance for a fund account or all accounts combined
 * Derived directly from the immutable fund_transactions ledger
 */
async function getAccountBalance(fundAccountId = null, connection = null) {
  const runner = connection || { query };
  let sql = `
    SELECT 
      COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS balance
    FROM fund_transactions
  `;
  const params = [];
  if (fundAccountId) {
    sql += ` WHERE fund_account_id = ?`;
    params.push(fundAccountId);
  }

  const results = await runner.query(sql, params);
  const rows = results[0] ? (Array.isArray(results[0]) ? results[0] : results) : results;
  return Number(rows[0]?.balance || 0);
}

/**
 * Get comprehensive fund summary metrics
 */
async function getFundSummary() {
  // 1. Total Capital Injected
  const [capResults] = await query(`
    SELECT COALESCE(SUM(amount), 0) AS totalCapital
    FROM fund_transactions
    WHERE transaction_type = 'CAPITAL_IN'
  `);
  const totalCapital = Number(capResults[0]?.totalCapital || 0);

  // 2. Available Cash across all fund accounts
  const [cashResults] = await query(`
    SELECT 
      fa.id,
      fa.account_code,
      fa.account_name,
      fa.account_type,
      COALESCE(SUM(CASE WHEN ft.direction = 'IN' THEN ft.amount ELSE -ft.amount END), 0) AS currentBalance
    FROM fund_accounts fa
    LEFT JOIN fund_transactions ft ON fa.id = ft.fund_account_id
    WHERE fa.status = 'ACTIVE'
    GROUP BY fa.id, fa.account_code, fa.account_name, fa.account_type
  `);

  const totalAvailableCash = cashResults.reduce((acc, row) => acc + Number(row.currentBalance), 0);

  // 3. Principal Disbursed vs Principal Recovered
  const [loanMetrics] = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN ft.transaction_type = 'LOAN_DISBURSEMENT' THEN ft.amount ELSE 0 END), 0) AS totalDisbursed,
      COALESCE(SUM(CASE WHEN ft.transaction_type = 'PRINCIPAL_COLLECTION' THEN ft.amount ELSE 0 END), 0) AS totalPrincipalRecovered,
      COALESCE(SUM(CASE WHEN ft.transaction_type = 'LENDING_INCOME' THEN ft.amount ELSE 0 END), 0) AS totalLendingIncome,
      COALESCE(SUM(CASE WHEN ft.transaction_type = 'EXPENSE' THEN ft.amount ELSE 0 END), 0) AS totalExpenses
    FROM fund_transactions ft
  `);

  const metrics = loanMetrics[0] || {};
  const totalDisbursed = Number(metrics.totalDisbursed || 0);
  const totalPrincipalRecovered = Number(metrics.totalPrincipalRecovered || 0);
  const totalLendingIncome = Number(metrics.totalLendingIncome || 0);
  const totalExpenses = Number(metrics.totalExpenses || 0);

  const outstandingPrincipal = Math.max(0, totalDisbursed - totalPrincipalRecovered);
  const netProfit = totalLendingIncome - totalExpenses;

  // Active & Overdue loans count
  const [loanCounts] = await query(`
    SELECT 
      COUNT(CASE WHEN status IN ('ACTIVE', 'PARTIALLY_PAID', 'DISBURSED') THEN 1 END) AS activeLoans,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completedLoans,
      COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdueLoans
    FROM loans
  `);

  return {
    totalCapital,
    availableCash: totalAvailableCash,
    accounts: cashResults,
    moneyCurrentlyLent: totalDisbursed,
    principalRecovered: totalPrincipalRecovered,
    outstandingPrincipal,
    lendingIncome: totalLendingIncome,
    operatingExpenses: totalExpenses,
    netProfit,
    loanStats: loanCounts[0] || { activeLoans: 0, completedLoans: 0, overdueLoans: 0 },
  };
}

/**
 * Add business capital to a fund account
 */
async function injectCapital({ fundAccountId, amount, description, userId }) {
  if (amount <= 0) throw new Error('Capital injection amount must be greater than zero.');

  return await withTransaction(async (conn) => {
    // Generate transaction number
    const txNumber = `TX-CAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await conn.query(
      `INSERT INTO fund_transactions 
       (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, description, created_by)
       VALUES (?, ?, NOW(), 'CAPITAL_IN', 'IN', ?, 'CAPITAL_INJECTION', ?, ?)`,
      [txNumber, fundAccountId, amount, description || 'Owner capital injection', userId]
    );

    // Double-entry accounting entry
    const entryNumber = `JE-CAP-${Date.now()}`;
    const [jeResult] = await conn.query(
      `INSERT INTO journal_entries (entry_number, entry_date, reference_type, description, created_by)
       VALUES (?, NOW(), 'CAPITAL_INJECTION', ?, ?)`,
      [entryNumber, description || 'Owner capital injection', userId]
    );
    const jeId = jeResult.insertId;

    // Accounts: 1000 Cash (Debit) and 3000 Capital (Credit)
    const [cashAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '1000' LIMIT 1`);
    const [capAcc] = await conn.query(`SELECT id FROM accounting_accounts WHERE account_code = '3000' LIMIT 1`);

    if (cashAcc.length && capAcc.length) {
      await conn.query(
        `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description) VALUES
         (?, ?, ?, 0.00, 'Debit Cash on Capital Injection'),
         (?, ?, 0.00, ?, 'Credit Owner Capital')`,
        [jeId, cashAcc[0].id, amount, capAcc[0].id, amount]
      );
    }

    return { txNumber, amount, status: 'SUCCESS' };
  });
}

/**
 * Trace the fund circulation trail:
 * Capital -> Loan Disbursements -> Collections -> Re-lent Loans
 */
async function getCirculationTrail(limit = 50) {
  const transactions = await query(
    `SELECT 
       ft.id,
       ft.transaction_number,
       ft.transaction_date,
       ft.transaction_type,
       ft.direction,
       ft.amount,
       ft.reference_type,
       ft.reference_id,
       ft.description,
       fa.account_name,
       u.name AS created_by_name
     FROM fund_transactions ft
     JOIN fund_accounts fa ON ft.fund_account_id = fa.id
     LEFT JOIN users u ON ft.created_by = u.id
     ORDER BY ft.transaction_date DESC, ft.id DESC
     LIMIT ?`,
    [limit]
  );
  return transactions;
}

module.exports = {
  getAccountBalance,
  getFundSummary,
  injectCapital,
  getCirculationTrail,
};
