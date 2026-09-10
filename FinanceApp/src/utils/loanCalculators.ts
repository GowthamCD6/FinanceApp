import { CustomerType, RepaymentFrequency, LoanInstallment } from '../types';

export interface LoanScheduleSimulation {
  principalAmount: number;
  contractedIncomeAmount: number;
  totalRepaymentAmount: number;
  totalInstallments: number;
  installmentAmount: number;
  principalPerInstallment: number;
  incomePerInstallment: number;
  frequency: RepaymentFrequency;
  schedule: Array<{
    installmentNumber: number;
    dueDate: string;
    scheduledAmount: number;
    principalComponent: number;
    incomeComponent: number;
  }>;
}

/**
 * Simulate loan amortization schedule for Weekly or Daily models
 */
export function calculateLoanSchedule(
  customerType: CustomerType,
  principalAmount: number,
  customInstallments?: number,
  customIncomeRateOrFee?: number
): LoanScheduleSimulation {
  const isDaily = customerType === 'SHOPKEEPER';
  const frequency: RepaymentFrequency = isDaily ? 'DAILY' : 'WEEKLY';
  const totalInstallments = customInstallments || (isDaily ? 25 : 10);

  let contractedIncomeAmount = 0;

  if (isDaily) {
    // Daily Shopkeeper: Fixed fee or default ₹2,000 per ₹20,000
    if (customIncomeRateOrFee !== undefined) {
      contractedIncomeAmount = customIncomeRateOrFee;
    } else {
      contractedIncomeAmount = Math.round(principalAmount * 0.10); // 10% or standard fee
    }
  } else {
    // Weekly Common Customer: Standard 20% flat interest/income
    const rate = customIncomeRateOrFee !== undefined ? customIncomeRateOrFee : 0.20;
    contractedIncomeAmount = Math.round(principalAmount * rate);
  }

  const totalRepaymentAmount = principalAmount + contractedIncomeAmount;
  const rawInstallmentAmount = totalRepaymentAmount / totalInstallments;
  const installmentAmount = Math.round(rawInstallmentAmount);

  const principalPerInstallment = Math.round((principalAmount / totalInstallments) * 100) / 100;
  const incomePerInstallment = Math.round((contractedIncomeAmount / totalInstallments) * 100) / 100;

  const schedule = [];
  const baseDate = new Date();

  for (let i = 1; i <= totalInstallments; i++) {
    const dueDate = new Date(baseDate);
    if (isDaily) {
      // Add i days (skipping or including weekends based on operational policy)
      dueDate.setDate(baseDate.getDate() + i);
    } else {
      // Add i weeks
      dueDate.setDate(baseDate.getDate() + i * 7);
    }

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().slice(0, 10),
      scheduledAmount: installmentAmount,
      principalComponent: principalPerInstallment,
      incomeComponent: incomePerInstallment,
    });
  }

  return {
    principalAmount,
    contractedIncomeAmount,
    totalRepaymentAmount,
    totalInstallments,
    installmentAmount,
    principalPerInstallment,
    incomePerInstallment,
    frequency,
    schedule,
  };
}

/**
 * Allocate a payment amount between Principal Recovery and Lending Income
 */
export function allocatePayment(
  paymentAmount: number,
  installment: LoanInstallment
): { principalAllocated: number; incomeAllocated: number } {
  const totalRatio = installment.scheduled_amount || 1;
  const principalRatio = installment.principal_component / totalRatio;
  const incomeRatio = installment.income_component / totalRatio;

  const principalAllocated = Math.round(paymentAmount * principalRatio * 100) / 100;
  const incomeAllocated = Math.round((paymentAmount - principalAllocated) * 100) / 100;

  return {
    principalAllocated,
    incomeAllocated,
  };
}

/**
 * Evaluate rule-based repeat loan eligibility for a customer
 */
export function evaluateEligibility(
  customerType: CustomerType,
  previousLoansCount: number,
  onTimeRepaymentRate: number,
  currentOverdueCount: number,
  lastPrincipalAmount: number = 20000
): { status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'UNDER_REVIEW'; maxEligibleAmount: number; reason: string } {
  if (currentOverdueCount > 0) {
    return {
      status: 'NOT_ELIGIBLE',
      maxEligibleAmount: 0,
      reason: `Customer has ${currentOverdueCount} overdue installment(s). Must clear arrears first.`,
    };
  }

  if (onTimeRepaymentRate < 75) {
    return {
      status: 'UNDER_REVIEW',
      maxEligibleAmount: lastPrincipalAmount,
      reason: `Repayment reliability is ${onTimeRepaymentRate}%. Requires Loan Manager manual approval.`,
    };
  }

  // Good standing customer: stepped progression (+30% to +50% limit)
  const multiplier = onTimeRepaymentRate >= 95 ? 1.5 : 1.25;
  const stepAmount = Math.min(100000, Math.round((lastPrincipalAmount * multiplier) / 5000) * 5000);

  return {
    status: 'ELIGIBLE',
    maxEligibleAmount: Math.max(stepAmount, isShopkeeper(customerType) ? 30000 : 25000),
    reason: `Exceptional credit discipline (${onTimeRepaymentRate}% on-time). Qualified for stepped-up repeat capital.`,
  };
}

function isShopkeeper(customerType: CustomerType): boolean {
  return customerType === 'SHOPKEEPER';
}
