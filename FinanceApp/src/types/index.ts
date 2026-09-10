export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'LOAN_MANAGER' 
  | 'COLLECTOR' 
  | 'ACCOUNTANT' 
  | 'VIEWER';

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
}

export type CustomerType = 'COMMON_CUSTOMER' | 'SHOPKEEPER';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'UNDER_REVIEW';

export interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  phone: string;
  alternate_phone?: string;
  address: string;
  city: string;
  customer_type: CustomerType;
  occupation?: string;
  shop_name?: string;
  status: CustomerStatus;
  registration_date: string;
  total_loans_count?: number;
  active_loans_count?: number;
  overdue_count?: number;
}

export type RepaymentFrequency = 'DAILY' | 'WEEKLY';

export interface LoanProduct {
  id: number;
  product_code: string;
  product_name: string;
  customer_type: CustomerType | 'BOTH';
  repayment_frequency: RepaymentFrequency;
  description: string;
  default_installments: number;
  default_income_value: number; // e.g., 0.20 for 20% or 2000 for fixed fee
  income_type: 'PERCENTAGE' | 'FIXED_FEE';
}

export type LoanStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'PARTIALLY_PAID'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'DEFAULTED'
  | 'CANCELLED';

export interface LoanInstallment {
  id: number;
  loan_id: number;
  loan_number?: string;
  installment_number: number;
  due_date: string;
  scheduled_amount: number;
  principal_component: number;
  income_component: number;
  paid_amount: number;
  outstanding_amount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paid_at?: string;
}

export interface Loan {
  id: number;
  loan_number: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_type: CustomerType;
  shop_name?: string;
  product_id: number;
  product_name: string;
  principal_amount: number;
  contracted_income_amount: number;
  total_repayment_amount: number;
  total_installments: number;
  repayment_frequency: RepaymentFrequency;
  status: LoanStatus;
  application_date: string;
  disbursement_date?: string;
  maturity_date?: string;
  total_paid: number;
  total_principal_recovered: number;
  total_income_collected: number;
  outstanding_amount: number;
  installments: LoanInstallment[];
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface Payment {
  id: number;
  payment_number: string;
  customer_id: number;
  customer_name: string;
  customer_type: CustomerType;
  shop_name?: string;
  loan_id: number;
  loan_number: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  collector_id?: number;
  collector_name?: string;
  status: 'COMPLETED' | 'REVERSED';
  principal_recovered: number;
  income_collected: number;
}

export interface FundAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: 'CASH' | 'BANK' | 'UPI' | 'OTHER';
  balance: number;
}

export type FundTransactionType = 
  | 'CAPITAL_IN'
  | 'LOAN_DISBURSEMENT'
  | 'PRINCIPAL_COLLECTION'
  | 'LENDING_INCOME'
  | 'OTHER_INCOME'
  | 'EXPENSE'
  | 'REFUND'
  | 'REVERSAL'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface FundTransaction {
  id: number;
  transaction_number: string;
  fund_account_id: number;
  account_name: string;
  transaction_date: string;
  transaction_type: FundTransactionType;
  direction: 'IN' | 'OUT';
  amount: number;
  description: string;
  reference_type?: string;
  reference_id?: number;
  created_by_name?: string;
}

export interface Expense {
  id: number;
  expense_number: string;
  category_name: string;
  fund_account_id: number;
  account_name: string;
  amount: number;
  expense_date: string;
  description: string;
  status: 'APPROVED' | 'PAID' | 'PENDING';
}

export interface LoanEligibility {
  id: number;
  customer_id: number;
  customer_name: string;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'UNDER_REVIEW';
  eligible_amount: number;
  reason: string;
  on_time_rate: number; // percentage, e.g. 98%
  completed_loans_count: number;
  overdue_incidents: number;
  evaluated_at: string;
}

export interface CollectionVisit {
  id: number;
  collector_id: number;
  customer_id: number;
  customer_name: string;
  loan_id: number;
  installment_id?: number;
  expected_amount: number;
  collected_amount: number;
  pending_amount: number;
  visit_date: string;
  notes: string;
}

export interface Reconciliation {
  id: number;
  fund_account_id: number;
  account_name: string;
  reconciliation_date: string;
  system_cash: number;
  actual_cash: number;
  discrepancy: number; // actual - system
  status: 'BALANCED' | 'DISCREPANCY_PENDING' | 'ADJUSTED';
  reconciled_by: string;
  notes?: string;
}

export interface DashboardMetrics {
  totalCapital: number;
  availableCash: number;
  moneyCurrentlyLent: number;
  principalRecovered: number;
  outstandingPrincipal: number;
  todayCollection: number;
  todayLendingIncome: number;
  monthlyCollection: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  circulationVelocity: number; // Turnover multiplier e.g. 1.8x
  activeLoansCount: number;
  completedLoansCount: number;
  overdueLoansCount: number;
}
