export function useRoleAccess(role) {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return {
        canDisburseLoans: true,
        canApproveLoans: true,
        canCollectPayments: true,
        canManageFunds: true,
        canLogExpenses: true,
        canReconcileCash: true,
        canViewReports: true,
        canSwitchRoles: true,
        roleTitle: 'Super Administrator',
      };
    case 'LOAN_MANAGER':
      return {
        canDisburseLoans: true,
        canApproveLoans: true,
        canCollectPayments: true,
        canManageFunds: false,
        canLogExpenses: false,
        canReconcileCash: false,
        canViewReports: true,
        canSwitchRoles: true,
        roleTitle: 'Loan Manager',
      };
    case 'COLLECTOR':
      return {
        canDisburseLoans: false,
        canApproveLoans: false,
        canCollectPayments: true,
        canManageFunds: false,
        canLogExpenses: false,
        canReconcileCash: true,
        canViewReports: false,
        canSwitchRoles: true,
        roleTitle: 'Field Collection Agent',
      };
    case 'ACCOUNTANT':
      return {
        canDisburseLoans: false,
        canApproveLoans: false,
        canCollectPayments: false,
        canManageFunds: true,
        canLogExpenses: true,
        canReconcileCash: true,
        canViewReports: true,
        canSwitchRoles: true,
        roleTitle: 'Financial Accountant',
      };
    case 'VIEWER':
    default:
      return {
        canDisburseLoans: false,
        canApproveLoans: false,
        canCollectPayments: false,
        canManageFunds: false,
        canLogExpenses: false,
        canReconcileCash: false,
        canViewReports: true,
        canSwitchRoles: true,
        roleTitle: 'Audit Viewer',
      };
  }
}
