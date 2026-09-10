import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, UserRole, Customer, Loan, LoanInstallment, Payment, FundAccount,
  FundTransaction, Expense, LoanEligibility, Reconciliation, DashboardMetrics,
  PaymentMethod, CustomerType
} from '../types';
import { 
  initialUsers, initialCustomers, initialLoans, initialFundAccounts, 
  initialFundTransactions, initialExpenses, initialEligibility, initialReconciliations,
  initialPayments
} from '../services/mockData';
import { useFundMetrics } from '../hooks/useFundMetrics';
import { allocatePayment, evaluateEligibility, calculateLoanSchedule } from '../utils/loanCalculators';
import { generateIdempotencyKey } from '../utils/idempotency';

interface RecordPaymentParams {
  loanId: number;
  installmentId?: number;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

interface DisburseLoanParams {
  customerId: number;
  customerType: CustomerType;
  principalAmount: number;
  fundAccountId: number;
  customInstallments?: number;
  customIncomeAmount?: number;
  notes?: string;
}

interface AddExpenseParams {
  categoryName: string;
  fundAccountId: number;
  amount: number;
  description: string;
}

interface AppContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  users: User[];
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  fundAccounts: FundAccount[];
  fundTransactions: FundTransaction[];
  expenses: Expense[];
  eligibilities: LoanEligibility[];
  reconciliations: Reconciliation[];
  metrics: DashboardMetrics;
  
  // Actions
  recordPayment: (params: RecordPaymentParams) => { success: boolean; message: string; payment?: Payment };
  disburseLoan: (params: DisburseLoanParams) => { success: boolean; message: string; loan?: Loan };
  addCapital: (amount: number, fundAccountId: number, description: string) => { success: boolean; message: string };
  addExpense: (params: AddExpenseParams) => { success: boolean; message: string };
  reconcileCash: (fundAccountId: number, actualCash: number, notes?: string) => { success: boolean; message: string };
  addNewCustomer: (customer: Omit<Customer, 'id' | 'customer_code' | 'status' | 'registration_date'>) => Customer;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [users] = useState<User[]>(initialUsers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [fundAccounts, setFundAccounts] = useState<FundAccount[]>(initialFundAccounts);
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>(initialFundTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [eligibilities, setEligibilities] = useState<LoanEligibility[]>(initialEligibility);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>(initialReconciliations);

  const metrics = useFundMetrics({
    accounts: fundAccounts,
    transactions: fundTransactions,
    loans,
    expenses,
  });

  const switchRole = (newRole: UserRole) => {
    const targetUser = users.find((u) => u.role === newRole) || {
      id: 99,
      name: `User (${newRole})`,
      phone: '9000000000',
      email: `${newRole.toLowerCase()}@fundlending.com`,
      role: newRole,
      status: 'ACTIVE',
    };
    setCurrentUser(targetUser);
  };

  /**
   * Central Payment Recording & Fund Circulation Recycle Logic
   */
  const recordPayment = ({
    loanId,
    installmentId,
    amount,
    paymentMethod,
    referenceNumber,
  }: RecordPaymentParams) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan not found' };

    // Find the targeted installment or the earliest pending one
    let targetInst: LoanInstallment | undefined;
    if (installmentId) {
      targetInst = loan.installments.find((i) => i.id === installmentId);
    }
    if (!targetInst) {
      targetInst = loan.installments.find((i) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status));
    }

    if (!targetInst) {
      return { success: false, message: 'No pending installment found for this loan.' };
    }

    // Split amount between Principal Recovery and Lending Income
    const { principalAllocated, incomeAllocated } = allocatePayment(amount, targetInst);

    // Identify corresponding Fund Account (Cash, Bank, UPI)
    let targetAccountId = 1; // Default Main Cash
    if (paymentMethod === 'UPI') targetAccountId = 3;
    else if (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CHEQUE') targetAccountId = 2;

    const accountObj = fundAccounts.find((a) => a.id === targetAccountId) || fundAccounts[0];

    // 1. Create Payment Record
    const newPayment: Payment = {
      id: Date.now(),
      payment_number: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: loan.customer_id,
      customer_name: loan.customer_name,
      customer_type: loan.customer_type,
      shop_name: loan.shop_name,
      loan_id: loan.id,
      loan_number: loan.loan_number,
      payment_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      amount,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      collector_id: currentUser.id,
      collector_name: currentUser.name,
      status: 'COMPLETED',
      principal_recovered: principalAllocated,
      income_collected: incomeAllocated,
    };

    // 2. Update Fund Accounts (Cash Pool recycled!)
    setFundAccounts((prev) =>
      prev.map((acc) =>
        acc.id === targetAccountId ? { ...acc, balance: acc.balance + amount } : acc
      )
    );

    // 3. Create Immutable Ledger Entries
    const txRecovered: FundTransaction = {
      id: Date.now() + 1,
      transaction_number: `TX-REC-${Date.now().toString().slice(-6)}`,
      fund_account_id: targetAccountId,
      account_name: accountObj.account_name,
      transaction_date: newPayment.payment_date,
      transaction_type: 'PRINCIPAL_COLLECTION',
      direction: 'IN',
      amount: principalAllocated,
      description: `Principal recovery of ${principalAllocated} recycled to cash pool from ${loan.loan_number}`,
      reference_type: 'PAYMENT',
      reference_id: newPayment.id,
      created_by_name: currentUser.name,
    };

    const txIncome: FundTransaction = {
      id: Date.now() + 2,
      transaction_number: `TX-INC-${Date.now().toString().slice(-6)}`,
      fund_account_id: targetAccountId,
      account_name: accountObj.account_name,
      transaction_date: newPayment.payment_date,
      transaction_type: 'LENDING_INCOME',
      direction: 'IN',
      amount: incomeAllocated,
      description: `Lending contract income of ${incomeAllocated} earned on ${loan.loan_number}`,
      reference_type: 'PAYMENT',
      reference_id: newPayment.id,
      created_by_name: currentUser.name,
    };

    setFundTransactions((prev) => [txIncome, txRecovered, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);

    // 4. Update Loan and Installment status
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;

        const updatedInstallments = l.installments.map((inst) => {
          if (inst.id !== targetInst!.id) return inst;
          const newPaid = inst.paid_amount + amount;
          const newOutstanding = Math.max(0, inst.scheduled_amount - newPaid);
          const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIAL';
          return {
            ...inst,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            status: newStatus as any,
            paid_at: newDateStr(),
          };
        });

        const newTotalPaid = l.total_paid + amount;
        const newPrincipalRecovered = l.total_principal_recovered + principalAllocated;
        const newIncomeCollected = l.total_income_collected + incomeAllocated;
        const newOutstanding = Math.max(0, l.total_repayment_amount - newTotalPaid);
        const isLoanCompleted = newOutstanding === 0;

        return {
          ...l,
          total_paid: newTotalPaid,
          total_principal_recovered: newPrincipalRecovered,
          total_income_collected: newIncomeCollected,
          outstanding_amount: newOutstanding,
          status: isLoanCompleted ? 'COMPLETED' : 'ACTIVE',
          installments: updatedInstallments,
        };
      })
    );

    // 5. Update Customer stats & Repeat Eligibility
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== loan.customer_id) return c;
        const remainingOverdue = Math.max(0, (c.overdue_count || 0) - (targetInst!.status === 'OVERDUE' ? 1 : 0));
        return {
          ...c,
          overdue_count: remainingOverdue,
        };
      })
    );

    return {
      success: true,
      message: `Payment of ₹${amount} recorded! Recycled ₹${principalAllocated} principal + ₹${incomeAllocated} income.`,
      payment: newPayment,
    };
  };

  /**
   * Disburse a new loan & deduct from Central Fund Account
   */
  const disburseLoan = ({
    customerId,
    customerType,
    principalAmount,
    fundAccountId,
    customInstallments,
    customIncomeAmount,
    notes,
  }: DisburseLoanParams) => {
    const account = fundAccounts.find((a) => a.id === fundAccountId);
    if (!account) return { success: false, message: 'Invalid Fund Account.' };

    if (account.balance < principalAmount) {
      return {
        success: false,
        message: `Insufficient available cash in ${account.account_name}. Balance: ₹${account.balance}, Requested: ₹${principalAmount}`,
      };
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, message: 'Customer not found.' };

    // Calculate amortization simulation
    const simulation = calculateLoanSchedule(customerType, principalAmount, customInstallments, customIncomeAmount);
    const loanNum = `LN-${new Date().getFullYear()}-${customerType === 'SHOPKEEPER' ? 'SK' : 'CC'}${Math.floor(100 + Math.random() * 900)}`;

    const newLoanId = Date.now();
    const installments: LoanInstallment[] = simulation.schedule.map((item, idx) => ({
      id: newLoanId + idx + 1,
      loan_id: newLoanId,
      loan_number: loanNum,
      installment_number: item.installmentNumber,
      due_date: item.dueDate,
      scheduled_amount: item.scheduledAmount,
      principal_component: item.principalComponent,
      income_component: item.incomeComponent,
      paid_amount: 0,
      outstanding_amount: item.scheduledAmount,
      status: 'PENDING',
    }));

    const newLoan: Loan = {
      id: newLoanId,
      loan_number: loanNum,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      customer_type: customerType,
      shop_name: customer.shop_name,
      product_id: customerType === 'SHOPKEEPER' ? 2 : 1,
      product_name: customerType === 'SHOPKEEPER' ? 'Daily Loan - Shopkeepers' : 'Weekly Loan - Common Customers',
      principal_amount: principalAmount,
      contracted_income_amount: simulation.contractedIncomeAmount,
      total_repayment_amount: simulation.totalRepaymentAmount,
      total_installments: simulation.totalInstallments,
      repayment_frequency: simulation.frequency,
      status: 'ACTIVE',
      application_date: new Date().toISOString().slice(0, 10),
      disbursement_date: new Date().toISOString().slice(0, 10),
      total_paid: 0,
      total_principal_recovered: 0,
      total_income_collected: 0,
      outstanding_amount: simulation.totalRepaymentAmount,
      installments,
    };

    // Deduct principal from fund account
    setFundAccounts((prev) =>
      prev.map((a) => (a.id === fundAccountId ? { ...a, balance: a.balance - principalAmount } : a))
    );

    // Add immutable ledger entry
    const txDisb: FundTransaction = {
      id: Date.now() + 10,
      transaction_number: `TX-DISB-${Date.now().toString().slice(-6)}`,
      fund_account_id: fundAccountId,
      account_name: account.account_name,
      transaction_date: newDateStr(),
      transaction_type: 'LOAN_DISBURSEMENT',
      direction: 'OUT',
      amount: principalAmount,
      description: `Disbursed ${loanNum} to ${customer.full_name} (${principalAmount})`,
      reference_type: 'LOAN',
      reference_id: newLoanId,
      created_by_name: currentUser.name,
    };

    setFundTransactions((prev) => [txDisb, ...prev]);
    setLoans((prev) => [newLoan, ...prev]);

    // Update customer active loans count
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, active_loans_count: (c.active_loans_count || 0) + 1 } : c))
    );

    return {
      success: true,
      message: `Loan ${loanNum} disbursed successfully from ${account.account_name}!`,
      loan: newLoan,
    };
  };

  /**
   * Add Capital Injection
   */
  const addCapital = (amount: number, fundAccountId: number, description: string) => {
    const account = fundAccounts.find((a) => a.id === fundAccountId);
    if (!account) return { success: false, message: 'Account not found.' };

    setFundAccounts((prev) =>
      prev.map((a) => (a.id === fundAccountId ? { ...a, balance: a.balance + amount } : a))
    );

    const tx: FundTransaction = {
      id: Date.now(),
      transaction_number: `TX-CAP-${Date.now().toString().slice(-6)}`,
      fund_account_id: fundAccountId,
      account_name: account.account_name,
      transaction_date: newDateStr(),
      transaction_type: 'CAPITAL_IN',
      direction: 'IN',
      amount,
      description: description || 'Owner Equity / Business Capital Infusion',
      created_by_name: currentUser.name,
    };

    setFundTransactions((prev) => [tx, ...prev]);
    return { success: true, message: `Capital of ₹${amount} injected into ${account.account_name}.` };
  };

  /**
   * Add Operational Expense
   */
  const addExpense = ({ categoryName, fundAccountId, amount, description }: AddExpenseParams) => {
    const account = fundAccounts.find((a) => a.id === fundAccountId);
    if (!account) return { success: false, message: 'Account not found.' };

    if (account.balance < amount) {
      return { success: false, message: `Insufficient funds in ${account.account_name}.` };
    }

    setFundAccounts((prev) =>
      prev.map((a) => (a.id === fundAccountId ? { ...a, balance: a.balance - amount } : a))
    );

    const newExpense: Expense = {
      id: Date.now(),
      expense_number: `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      category_name: categoryName,
      fund_account_id: fundAccountId,
      account_name: account.account_name,
      amount,
      expense_date: new Date().toISOString().slice(0, 10),
      description,
      status: 'PAID',
    };

    const tx: FundTransaction = {
      id: Date.now() + 1,
      transaction_number: `TX-EXP-${Date.now().toString().slice(-6)}`,
      fund_account_id: fundAccountId,
      account_name: account.account_name,
      transaction_date: newDateStr(),
      transaction_type: 'EXPENSE',
      direction: 'OUT',
      amount,
      description: `${categoryName}: ${description}`,
      created_by_name: currentUser.name,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setFundTransactions((prev) => [tx, ...prev]);

    return { success: true, message: `Expense of ₹${amount} logged under ${categoryName}.` };
  };

  /**
   * Cash Drawer Physical vs System Reconciliation
   */
  const reconcileCash = (fundAccountId: number, actualCash: number, notes?: string) => {
    const account = fundAccounts.find((a) => a.id === fundAccountId);
    if (!account) return { success: false, message: 'Account not found.' };

    const systemCash = account.balance;
    const discrepancy = actualCash - systemCash;
    const status = discrepancy === 0 ? 'BALANCED' : 'DISCREPANCY_PENDING';

    const newRec: Reconciliation = {
      id: Date.now(),
      fund_account_id: fundAccountId,
      account_name: account.account_name,
      reconciliation_date: new Date().toISOString().slice(0, 10),
      system_cash: systemCash,
      actual_cash: actualCash,
      discrepancy,
      status,
      reconciled_by: currentUser.name,
      notes,
    };

    setReconciliations((prev) => [newRec, ...prev]);

    return {
      success: true,
      message: discrepancy === 0 
        ? 'Cash drawer perfectly balanced!' 
        : `Reconciliation logged with variance of ₹${discrepancy > 0 ? '+' : ''}${discrepancy}.`,
    };
  };

  /**
   * Add a new customer
   */
  const addNewCustomer = (customerData: Omit<Customer, 'id' | 'customer_code' | 'status' | 'registration_date'>): Customer => {
    const newId = Date.now();
    const code = `CUST-${customerData.customer_type === 'SHOPKEEPER' ? 'SK' : 'CC'}-${Math.floor(100 + Math.random() * 900)}`;
    const newCust: Customer = {
      ...customerData,
      id: newId,
      customer_code: code,
      status: 'ACTIVE',
      registration_date: new Date().toISOString().slice(0, 10),
      total_loans_count: 0,
      active_loans_count: 0,
      overdue_count: 0,
    };

    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const resetDemoData = () => {
    setCustomers(initialCustomers);
    setLoans(initialLoans);
    setFundAccounts(initialFundAccounts);
    setFundTransactions(initialFundTransactions);
    setExpenses(initialExpenses);
    setPayments(initialPayments);
    setEligibilities(initialEligibility);
    setReconciliations(initialReconciliations);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        users,
        customers,
        loans,
        payments,
        fundAccounts,
        fundTransactions,
        expenses,
        eligibilities,
        reconciliations,
        metrics,
        recordPayment,
        disburseLoan,
        addCapital,
        addExpense,
        reconcileCash,
        addNewCustomer,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

function newDateStr(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}
