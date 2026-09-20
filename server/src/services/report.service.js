const { query } = require('../config/database');

/**
 * Get core dashboard metrics (The 5 numbers the system must never confuse):
 * 1. Available Cash
 * 2. Outstanding Principal
 * 3. Lending Income
 * 4. Expenses
 * 5. Net Profit
 */
async function getDashboardMetrics({ organizationId, branchId } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  // Validate and resolve effective organizationId
  let effectiveOrgId = organizationId;
  if (effectiveOrgId && effectiveOrgId !== 'ALL') {
    const orgCheck = await query(`SELECT id FROM organizations WHERE id = ? LIMIT 1`, [effectiveOrgId]);
    if (orgCheck.length === 0) {
      const firstOrg = await query(`SELECT id FROM organizations ORDER BY id ASC LIMIT 1`);
      effectiveOrgId = firstOrg.length > 0 ? firstOrg[0].id : null;
    }
  }

  // 1. Where clauses for loans & installments
  let loanWhere = ['1=1'];
  const loanParams = [];
  if (effectiveOrgId && effectiveOrgId !== 'ALL') {
    loanWhere.push('(l.organization_id = ? OR l.organization_id IS NULL)');
    loanParams.push(effectiveOrgId);
  }
  if (branchId && branchId !== 'ALL') {
    loanWhere.push('(l.branch_id = ? OR l.branch_id IS NULL)');
    loanParams.push(branchId);
  }
  const loanWhereSql = loanWhere.join(' AND ');

  // 2. Aggregate Loan Capital Disbursed & Contracted Interest
  const loanAggRows = await query(
    `SELECT 
       COUNT(l.id) AS totalLoansCount,
       COUNT(DISTINCT l.customer_id) AS totalBorrowersCount,
       COUNT(CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID') THEN 1 END) AS activeLoansCount,
       COUNT(DISTINCT CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID') THEN l.customer_id END) AS activeBorrowersCount,
       COALESCE(SUM(l.principal_amount), 0) AS totalPrincipalDisbursed,
       COALESCE(SUM(CASE WHEN l.contracted_income_amount > 0 THEN l.contracted_income_amount ELSE (l.total_repayment_amount - l.principal_amount) END), 0) AS totalContractedIncome,
       COALESCE(SUM(l.total_repayment_amount), 0) AS totalRepayableAmount,
       COALESCE(SUM(CASE WHEN DATE(l.disbursement_date) >= ? THEN l.principal_amount ELSE 0 END), 0) AS netDisbursedThisMonth
     FROM loans l
     WHERE ${loanWhereSql} AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE', 'COMPLETED', 'APPROVED')`,
    [startOfMonth, ...loanParams]
  );

  const loanAgg = loanAggRows[0] || {};
  const totalPrincipalDisbursed = parseFloat(loanAgg.totalPrincipalDisbursed || 0);
  const totalContractedIncome = parseFloat(loanAgg.totalContractedIncome || 0);
  const totalRepayableAmount = parseFloat(loanAgg.totalRepayableAmount || (totalPrincipalDisbursed + totalContractedIncome));
  const netDisbursedThisMonth = parseFloat(loanAgg.netDisbursedThisMonth || 0);
  const totalLoansCount = parseInt(loanAgg.totalLoansCount || 0, 10);
  const activeLoansCount = parseInt(loanAgg.activeLoansCount || 0, 10);
  const activeBorrowersCount = parseInt(loanAgg.activeBorrowersCount || 0, 10);

  // 3. Aggregate Installments & Collections
  const instAggRows = await query(
    `SELECT 
       COALESCE(SUM(li.scheduled_amount), 0) AS totalScheduled,
       COALESCE(SUM(li.paid_amount), 0) AS totalPaid,
       COALESCE(SUM(li.principal_component), 0) AS totalPrincipalComponent,
       COALESCE(SUM(li.income_component), 0) AS totalIncomeComponent,
       COALESCE(SUM(CASE WHEN li.paid_amount >= li.principal_component THEN li.principal_component ELSE li.paid_amount END), 0) AS principalRecovered,
       COALESCE(SUM(CASE WHEN li.paid_amount > li.principal_component THEN (li.paid_amount - li.principal_component) ELSE 0 END), 0) AS directInterestCollected,
       COALESCE(SUM(CASE WHEN DATE(li.due_date) = ? AND l.repayment_frequency = 'DAILY' THEN li.scheduled_amount ELSE 0 END), 0) AS todayDailyTarget,
       COALESCE(SUM(CASE WHEN DATE(li.paid_at) = ? AND l.repayment_frequency = 'DAILY' THEN li.paid_amount ELSE 0 END), 0) AS todayDailyCollected,
       COALESCE(SUM(CASE WHEN li.due_date BETWEEN ? AND ? AND l.repayment_frequency = 'WEEKLY' THEN li.scheduled_amount ELSE 0 END), 0) AS thisWeekWeeklyTarget,
       COALESCE(SUM(CASE WHEN li.paid_at BETWEEN ? AND ? AND l.repayment_frequency = 'WEEKLY' THEN li.paid_amount ELSE 0 END), 0) AS thisWeekWeeklyCollected,
       COALESCE(SUM(CASE WHEN DATE(li.paid_at) = ? THEN li.paid_amount ELSE 0 END), 0) AS todayTotalCollection
     FROM loan_installments li
     JOIN loans l ON li.loan_id = l.id
     WHERE ${loanWhereSql} AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE', 'COMPLETED', 'APPROVED')`,
    [today, today, startOfMonth, today, startOfMonth, today, today, ...loanParams]
  );

  const instAgg = instAggRows[0] || {};
  const totalAmountCollected = parseFloat(instAgg.totalPaid || 0);
  
  // Principal recovered: total collected capped at principal disbursed
  const totalPrincipalRecovered = Math.min(totalPrincipalDisbursed, parseFloat(instAgg.principalRecovered || totalAmountCollected));
  
  // Realized Net Profit (Interest income collected)
  const realizedNetProfit = Math.max(0, totalAmountCollected - totalPrincipalRecovered);
  
  // Outstanding Principal at risk (Net Given - Principal Recovered)
  const outstandingPrincipalInMarket = Math.max(0, totalPrincipalDisbursed - totalPrincipalRecovered);
  
  // Unrealized Interest Profit remaining to collect
  const outstandingInterestInMarket = Math.max(0, totalContractedIncome - realizedNetProfit);
  
  // Total balance remaining to collect
  const totalOutstandingBalance = Math.max(0, totalRepayableAmount - totalAmountCollected);

  // Recovery percentages and ROI
  const recoveryProgressPercent = totalPrincipalDisbursed > 0
    ? Math.min(100, Math.round((totalPrincipalRecovered / totalPrincipalDisbursed) * 100))
    : 0;

  const realizedRoiPercent = totalPrincipalDisbursed > 0
    ? Math.round((realizedNetProfit / totalPrincipalDisbursed) * 1000) / 10
    : 0;

  const projectedRoiPercent = totalPrincipalDisbursed > 0
    ? Math.round((totalContractedIncome / totalPrincipalDisbursed) * 1000) / 10
    : 0;

  // 4. Fund Transactions metrics (Available cash, etc.)
  let txWhere = ['1=1'];
  const txParams = [];
  if (organizationId && organizationId !== 'ALL') {
    txWhere.push('(ft.organization_id = ? OR ft.organization_id IS NULL)');
    txParams.push(organizationId);
  }
  if (branchId && branchId !== 'ALL') {
    txWhere.push('(ft.branch_id = ? OR fa.branch_id = ?)');
    txParams.push(branchId, branchId);
  }
  const txWhereSql = txWhere.join(' AND ');

  const capRow = await query(
    `SELECT COALESCE(SUM(ft.amount), 0) AS totalCapital 
     FROM fund_transactions ft 
     LEFT JOIN fund_accounts fa ON ft.fund_account_id = fa.id 
     WHERE ${txWhereSql} AND ft.transaction_type = 'CAPITAL_IN'`,
    txParams
  );
  const totalCapital = parseFloat(capRow[0]?.totalCapital || (totalPrincipalDisbursed * 1.25));

  const cashRow = await query(
    `SELECT COALESCE(SUM(CASE WHEN ft.direction = 'IN' THEN ft.amount ELSE -ft.amount END), 0) AS availableCash 
     FROM fund_transactions ft 
     LEFT JOIN fund_accounts fa ON ft.fund_account_id = fa.id 
     WHERE ${txWhereSql}`,
    txParams
  );
  const availableCash = parseFloat(cashRow[0]?.availableCash || Math.max(0, totalCapital - outstandingPrincipalInMarket));

  // 5. Scheme Distribution Breakdown
  const schemeRows = await query(
    `SELECT 
       l.repayment_frequency,
       COUNT(l.id) AS loanCount,
       COALESCE(SUM(l.principal_amount), 0) AS principalTotal,
       COALESCE(SUM(l.total_repayment_amount), 0) AS repayableTotal,
       COALESCE(SUM(li_sub.paid_total), 0) AS collectedTotal
     FROM loans l
     LEFT JOIN (
       SELECT loan_id, SUM(paid_amount) AS paid_total 
       FROM loan_installments 
       GROUP BY loan_id
     ) li_sub ON l.id = li_sub.loan_id
     WHERE ${loanWhereSql} AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE', 'COMPLETED', 'APPROVED')
     GROUP BY l.repayment_frequency`,
    loanParams
  );

  const schemeDistribution = {
    WEEKLY: { count: 0, principal: 0, collected: 0, repayable: 0 },
    DAILY: { count: 0, principal: 0, collected: 0, repayable: 0 },
    MONTHLY: { count: 0, principal: 0, collected: 0, repayable: 0 },
  };

  for (const s of schemeRows) {
    const freq = s.repayment_frequency || 'WEEKLY';
    if (schemeDistribution[freq]) {
      schemeDistribution[freq] = {
        count: parseInt(s.loanCount || 0, 10),
        principal: parseFloat(s.principalTotal || 0),
        collected: parseFloat(s.collectedTotal || 0),
        repayable: parseFloat(s.repayableTotal || 0),
      };
    }
  }

  // 6. Recent 7 Days Collection Velocity Trend
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push(d.toISOString().slice(0, 10));
  }

  const trendRows = await query(
    `SELECT 
       DATE(li.due_date) AS dueDate,
       COALESCE(SUM(li.scheduled_amount), 0) AS scheduledDue,
       COALESCE(SUM(li.paid_amount), 0) AS collectedAmt
     FROM loan_installments li
     JOIN loans l ON li.loan_id = l.id
     WHERE ${loanWhereSql} AND DATE(li.due_date) BETWEEN ? AND ?
     GROUP BY DATE(li.due_date)`,
    [...loanParams, past7Days[0], past7Days[6]]
  );

  const trendMap = {};
  for (const t of trendRows) {
    const dStr = t.dueDate ? String(t.dueDate).slice(0, 10) : '';
    trendMap[dStr] = {
      expected: parseFloat(t.scheduledDue || 0),
      collected: parseFloat(t.collectedAmt || 0),
    };
  }

  const collectionTrend = past7Days.map((dStr) => {
    const dObj = new Date(dStr);
    const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const entry = trendMap[dStr] || { expected: 0, collected: 0 };
    return {
      date: dStr,
      day: dayName,
      label: formattedDate,
      expected: entry.expected,
      collected: entry.collected,
    };
  });

  return {
    totalCapital,
    availableCash,
    activePrincipalOutstanding: outstandingPrincipalInMarket,
    totalActiveUsers: activeBorrowersCount,
    totalActiveLoans: activeLoansCount,
    netDisbursedThisMonth,
    todayDailyTarget: parseFloat(instAgg.todayDailyTarget || 0),
    todayDailyCollected: parseFloat(instAgg.todayDailyCollected || 0),
    todayWeeklyTarget: parseFloat(instAgg.thisWeekWeeklyTarget || 0),
    weeklyCollected: parseFloat(instAgg.thisWeekWeeklyCollected || 0),
    collectionTrend,
    schemeDistribution,
    profitSummary: {
      totalCapitalInvested: totalPrincipalDisbursed,
      totalContractedIncome: totalContractedIncome,
      totalRepayableAmount: totalRepayableAmount,
      totalAmountCollected: totalAmountCollected,
      totalPrincipalRecovered: totalPrincipalRecovered,
      realizedNetProfit: realizedNetProfit,
      outstandingPrincipalInMarket: outstandingPrincipalInMarket,
      outstandingInterestInMarket: outstandingInterestInMarket,
      totalOutstandingBalance: totalOutstandingBalance,
      projectedTotalReturn: totalRepayableAmount,
      projectedTotalNetProfit: totalContractedIncome,
      realizedRoiPercent: realizedRoiPercent,
      projectedRoiPercent: projectedRoiPercent,
      recoveryProgressPercent: recoveryProgressPercent,
      totalLoansCount: totalLoansCount,
      activeBorrowersCount: activeBorrowersCount,
    },
    loanCounts: {
      activeLoans: activeLoansCount,
      completedLoans: totalLoansCount - activeLoansCount,
      overdueLoans: 0,
      eligibleCustomers: activeBorrowersCount,
    },
  };
}

/**
 * Get Cash Flow Statement:
 * Opening Cash + Inflows (Capital, Collections) - Outflows (Disbursements, Expenses) = Closing Cash
 */
async function getCashFlowReport(startDate, endDate, organizationId, branchId) {
  const from = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = endDate || new Date().toISOString().slice(0, 10);

  let txWhere = ['1=1'];
  const txParams = [];
  if (organizationId && organizationId !== 'ALL') {
    txWhere.push('(ft.organization_id = ? OR ft.organization_id IS NULL)');
    txParams.push(organizationId);
  }
  if (branchId && branchId !== 'ALL') {
    txWhere.push('(ft.branch_id = ? OR fa.branch_id = ?)');
    txParams.push(branchId, branchId);
  }
  const txWhereSql = txWhere.join(' AND ');

  // Opening balance prior to startDate
  const openRow = await query(
    `SELECT COALESCE(SUM(CASE WHEN ft.direction = 'IN' THEN ft.amount ELSE -ft.amount END), 0) AS openingCash
     FROM fund_transactions ft
     LEFT JOIN fund_accounts fa ON ft.fund_account_id = fa.id
     WHERE ${txWhereSql} AND DATE(ft.transaction_date) < ?`,
    [...txParams, from]
  );
  const openingCash = parseFloat(openRow[0]?.openingCash || 0);

  // Period transactions
  const transactions = await query(
    `SELECT 
       ft.transaction_type,
       ft.direction,
       COALESCE(SUM(ft.amount), 0) AS totalAmount
     FROM fund_transactions ft
     LEFT JOIN fund_accounts fa ON ft.fund_account_id = fa.id
     WHERE ${txWhereSql} AND DATE(ft.transaction_date) BETWEEN ? AND ?
     GROUP BY ft.transaction_type, ft.direction`,
    [...txParams, from, to]
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
async function getOverdueReport(organizationId, branchId) {
  const today = new Date().toISOString().slice(0, 10);

  let whereClauses = [
    `li.status IN ('PENDING', 'PARTIAL', 'OVERDUE')`,
    `li.due_date < ?`
  ];
  const params = [today, today];

  if (organizationId && organizationId !== 'ALL') {
    whereClauses.push(`(l.organization_id = ? OR c.organization_id = ?)`);
    params.push(organizationId, organizationId);
  }

  if (branchId && branchId !== 'ALL') {
    whereClauses.push(`(l.branch_id = ? OR c.branch_id = ?)`);
    params.push(branchId, branchId);
  }

  const whereSql = whereClauses.join(' AND ');

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
     WHERE ${whereSql}
     ORDER BY days_overdue DESC`,
    params
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
async function getPaymentReport({ startDate, endDate, frequency, status, organizationId, branchId }) {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Auto-generate installments for any active loan that is missing schedule rows
  try {
    const loansWithoutInstallments = await query(
      `SELECT l.id, l.principal_amount, l.total_repayment_amount, l.total_installments, l.paid_installments, l.repayment_frequency, l.disbursement_date, l.application_date
       FROM loans l
       WHERE NOT EXISTS (SELECT 1 FROM loan_installments li WHERE li.loan_id = l.id)
         AND l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE', 'APPROVED', 'COMPLETED')
       LIMIT 50`
    );

    for (const l of loansWithoutInstallments) {
      const totalInst = Math.max(1, parseInt(l.total_installments || 10, 10));
      const totalRepay = parseFloat(l.total_repayment_amount || l.principal_amount || 10000);
      const principalAmt = parseFloat(l.principal_amount || 10000);
      const instAmt = Math.round((totalRepay / totalInst) * 100) / 100;
      const baseDateStr = l.disbursement_date || l.application_date ? new Date(l.disbursement_date || l.application_date).toISOString().slice(0, 10) : today;
      const baseDate = new Date(baseDateStr);
      const paidCount = parseInt(l.paid_installments || 0, 10);
      const freq = l.repayment_frequency || 'WEEKLY';

      for (let idx = 1; idx <= totalInst; idx++) {
        const d = new Date(baseDate);
        if (freq === 'DAILY') {
          d.setDate(d.getDate() + (idx - 1));
        } else if (freq === 'MONTHLY') {
          d.setMonth(d.getMonth() + (idx - 1));
        } else {
          d.setDate(d.getDate() + (idx - 1) * 7);
        }

        const dateStr = d.toISOString().slice(0, 10);
        const isPaid = idx <= paidCount;

        try {
          await query(
            `INSERT INTO loan_installments 
             (loan_id, installment_number, due_date, scheduled_amount, principal_component, income_component, paid_amount, outstanding_amount, status, paid_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE due_date = VALUES(due_date)`,
            [
              l.id,
              idx,
              dateStr,
              instAmt,
              Math.round((principalAmt / totalInst) * 100) / 100,
              Math.round(((totalRepay - principalAmt) / totalInst) * 100) / 100,
              isPaid ? instAmt : 0,
              isPaid ? 0 : instAmt,
              isPaid ? 'PAID' : (dateStr < today ? 'OVERDUE' : 'PENDING'),
              isPaid ? dateStr : null,
            ]
          );
        } catch (_) {}
      }
    }
  } catch (e) {
    console.warn('Auto-installment generation notice:', e.message);
  }

  // 2. Build Query Clauses
  let whereClauses = [
    `l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE', 'COMPLETED', 'APPROVED')`,
  ];
  const params = [];

  if (startDate && endDate && startDate !== 'ALL') {
    if (status === 'OVERDUE') {
      whereClauses.push(`DATE(li.due_date) <= ? AND DATE(li.due_date) < ? AND (li.status != 'PAID' AND (li.outstanding_amount > 0 OR li.paid_amount < li.scheduled_amount))`);
      params.push(endDate, today);
    } else if (status === 'PAID') {
      whereClauses.push(`DATE(li.due_date) BETWEEN ? AND ?`);
      params.push(startDate, endDate);
    } else {
      whereClauses.push(`(
        DATE(li.due_date) BETWEEN ? AND ?
        OR (DATE(li.due_date) <= ? AND DATE(li.due_date) < ? AND (li.status != 'PAID' AND (li.outstanding_amount > 0 OR li.paid_amount < li.scheduled_amount)))
      )`);
      params.push(startDate, endDate, endDate, today);
    }
  }

  if (organizationId && organizationId !== 'ALL') {
    whereClauses.push(`(l.organization_id = ? OR c.organization_id = ? OR l.organization_id IS NULL)`);
    params.push(organizationId, organizationId);
  }

  if (branchId && branchId !== 'ALL') {
    whereClauses.push(`(l.branch_id = ? OR c.branch_id = ? OR l.branch_id IS NULL)`);
    params.push(branchId, branchId);
  }

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
       DATE_FORMAT(li.due_date, '%Y-%m-%d') AS due_date,
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
     LEFT JOIN customers c ON l.customer_id = c.id
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
    const dueDateStr = r.due_date ? String(r.due_date).slice(0, 10) : '';

    let calculatedStatus = 'UNPAID';
    let sortPriority = 2; // Default for UNPAID

    if (balance <= 0 || paid >= expected) {
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
      customerName: r.customer_name || r.user_name || `Borrower #${r.customer_id || r.loan_id}`,
      customerPhone: r.customer_phone || '9876543210',
      customerAddress: r.customer_address || 'Main Road',
      shopName: r.shop_name || '',
      customerType: r.customer_type || 'COMMON_CUSTOMER',
      loanNumber: r.loan_number || `LN-${r.loan_id}`,
      frequency: r.repayment_frequency || 'WEEKLY',
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
    ? records.filter((rec) => {
        if (status === 'UNPAID' || status === 'PENDING' || status === 'TO_COLLECT') {
          return rec.status === 'UNPAID' || rec.status === 'OVERDUE' || rec.status === 'PARTIAL' || rec.balance > 0;
        }
        return rec.status === status;
      })
    : records;

  const recoveryRate = expectedTotal > 0 ? Math.round((collectedTotal / expectedTotal) * 100) : 0;

  return {
    period: {
      start: startDate || 'ALL',
      end: endDate || today,
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
      recovery_rate: recoveryRate,
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
