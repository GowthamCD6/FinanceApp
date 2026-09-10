import { useMemo } from 'react';
import { FundAccount, FundTransaction, Loan, Expense, DashboardMetrics } from '../types';

interface FundMetricsInput {
  accounts: FundAccount[];
  transactions: FundTransaction[];
  loans: Loan[];
  expenses: Expense[];
}

export function useFundMetrics({ accounts, transactions, loans, expenses }: FundMetricsInput): DashboardMetrics {
  return useMemo(() => {
    // 1. Available Cash: Sum of all fund accounts balances
    const availableCash = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

    // 2. Capital Injected
    const totalCapital = transactions
      .filter((t) => t.transaction_type === 'CAPITAL_IN')
      .reduce((sum, t) => sum + t.amount, 0);

    // 3. Principal Disbursed vs Principal Recovered
    const moneyCurrentlyLent = loans.reduce((sum, l) => sum + l.principal_amount, 0);
    const principalRecovered = loans.reduce((sum, l) => sum + (l.total_principal_recovered || 0), 0);
    const outstandingPrincipal = Math.max(0, moneyCurrentlyLent - principalRecovered);

    // 4. Today's metrics
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter((t) => t.transaction_date.slice(0, 10) === today);

    const todayCollection = todayTransactions
      .filter((t) => t.transaction_type === 'PRINCIPAL_COLLECTION' || t.transaction_type === 'LENDING_INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayLendingIncome = todayTransactions
      .filter((t) => t.transaction_type === 'LENDING_INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    // 5. Total Incomes & Expenses
    const monthlyIncome = transactions
      .filter((t) => t.transaction_type === 'LENDING_INCOME' || t.transaction_type === 'OTHER_INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = expenses
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyCollection = transactions
      .filter((t) => t.transaction_type === 'PRINCIPAL_COLLECTION' || t.transaction_type === 'LENDING_INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    // Net Profit = Lending Income - Operating Expenses
    const netProfit = monthlyIncome - monthlyExpenses;

    // Circulation Velocity = (Principal Disbursed + Recovered) / Initial Capital
    const effectiveCapital = totalCapital > 0 ? totalCapital : 500000;
    const circulationVelocity = Math.round(((moneyCurrentlyLent + principalRecovered) / effectiveCapital) * 10) / 10;

    // Counts
    const activeLoansCount = loans.filter((l) => ['ACTIVE', 'PARTIALLY_PAID'].includes(l.status)).length;
    const completedLoansCount = loans.filter((l) => l.status === 'COMPLETED').length;
    const overdueLoansCount = loans.filter((l) => l.status === 'OVERDUE').length;

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
      circulationVelocity: Math.max(1.0, circulationVelocity),
      activeLoansCount,
      completedLoansCount,
      overdueLoansCount,
    };
  }, [accounts, transactions, loans, expenses]);
}
