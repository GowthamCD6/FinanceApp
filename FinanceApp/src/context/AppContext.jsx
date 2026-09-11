import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { ENV } from '../config/env';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState('SUPER_ADMIN');
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fundTransactions, setFundTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Live Database Sync on Mount
  const fetchAllLiveData = async () => {
    try {
      setLoading(true);
      const [orgsData, custsData, loansData, fundData, txData, prodsData] = await Promise.all([
        apiService.getOrganizations().catch(() => []),
        apiService.getCustomers().catch(() => []),
        apiService.getLoans().catch(() => []),
        apiService.getFundSummary().catch(() => null),
        apiService.getFundCirculationTrail().catch(() => []),
        apiService.getProducts().catch(() => []),
      ]);

      const orgs = Array.isArray(orgsData) ? orgsData : [];
      setOrganizations(orgs);
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0]);
      }

      setCustomers(Array.isArray(custsData) ? custsData : (custsData?.customers || []));
      setLoans(Array.isArray(loansData) ? loansData : (loansData?.loans || []));
      setFundTransactions(Array.isArray(txData) ? txData : []);
      setLoanProducts(Array.isArray(prodsData) ? prodsData : []);
      setIsServerConnected(true);
    } catch (err) {
      console.error('[Live Sync Error]:', err.message);
      setIsServerConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLiveData();
  }, []);

  // Authenticate using backend REST API
  const loginWithCredentials = async (identifier, password) => {
    try {
      const serverRes = await apiService.login(identifier, password);
      if (serverRes && serverRes.token) {
        setIsAuthenticated(true);
        setLoggedInUser(serverRes.user);
        const roles = serverRes.user.roles || [serverRes.user.role_type];
        if (roles.includes('SUPER_ADMIN')) setCurrentRole('SUPER_ADMIN');
        else if (roles.includes('ADMIN')) setCurrentRole('ADMIN');
        else setCurrentRole('USER');
        await fetchAllLiveData();
        return { success: true, user: serverRes.user };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLoggedInUser(null);
    apiService.setToken(null);
  };

  const currentUser = useMemo(() => {
    return loggedInUser || {
      id: 1,
      name: 'Logged In User',
      email: 'user@fundlending.com',
      role: currentRole,
    };
  }, [loggedInUser, currentRole]);

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
  };

  // Central Fund Engine
  const fundMetrics = useMemo(() => {
    const capitalIn = fundTransactions
      .filter((t) => t.type === 'CAPITAL_IN' || t.transaction_type === 'CAPITAL_IN')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const disbursements = fundTransactions
      .filter((t) => t.type === 'LOAN_DISBURSEMENT' || t.transaction_type === 'LOAN_DISBURSEMENT')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const principalRecovered = fundTransactions
      .filter((t) => t.type === 'COLLECTION' || t.type === 'PRINCIPAL_COLLECTION' || t.transaction_type === 'PRINCIPAL_COLLECTION')
      .reduce((sum, t) => sum + Number(t.principal || t.amount || 0), 0);

    const lendingIncome = fundTransactions
      .filter((t) => t.type === 'LENDING_INCOME' || t.transaction_type === 'LENDING_INCOME')
      .reduce((sum, t) => sum + Number(t.income || t.amount || 0), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const availableCash = (currentOrganization?.available_cash !== undefined)
      ? Number(currentOrganization.available_cash)
      : Math.max(0, capitalIn + principalRecovered + lendingIncome - disbursements - totalExpenses);

    const moneyCurrentlyLent = loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID')
      .reduce((sum, l) => sum + Number(l.principal_amount || l.principal || 0), 0);

    const outstandingPrincipal = loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID')
      .reduce((sum, l) => sum + Number(l.outstanding_amount || l.remainingAmount || (l.total_repayment_amount - (l.total_paid || 0)) || 0), 0);

    const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID').length;
    const completedLoans = loans.filter((l) => l.status === 'COMPLETED').length;
    const overdueLoans = loans.filter((l) => l.status === 'OVERDUE').length;

    return {
      totalCapital: Number(currentOrganization?.initial_capital || capitalIn || 1000000),
      availableCash,
      moneyCurrentlyLent,
      outstandingPrincipal,
      todayCollection: 25000,
      todayExpected: 30000,
      pendingCollection: 5000,
      thisMonthCollection: 620000,
      thisMonthIncome: 85000,
      thisMonthExpenses: totalExpenses,
      netProfit: 85000 - totalExpenses,
      activeLoans,
      completedLoans,
      overdueLoans,
      todayNewLoans: 0,
      principalRecovered,
    };
  }, [fundTransactions, expenses, currentOrganization, loans]);

  const fundAccounts = useMemo(() => [
    { id: 1, account_code: 'CASH_MAIN', account_name: 'Central Cash Vault (Field Cash)', account_type: 'CASH', balance: fundMetrics.availableCash },
    { id: 2, account_code: 'BANK_MAIN', account_name: 'Primary Business Current Account', account_type: 'BANK', balance: 500000 },
    { id: 3, account_code: 'UPI_MAIN', account_name: 'Merchant UPI Float Account', account_type: 'UPI', balance: 150000 },
  ], [fundMetrics.availableCash]);

  // Actions wired to Live Database
  const addCustomer = async (custData) => {
    const created = await apiService.createCustomer(custData);
    await fetchAllLiveData();
    return created;
  };

  const updateCustomer = async (id, custData) => {
    const updated = await apiService.updateCustomerStatus(id, custData.status, custData.reason);
    await fetchAllLiveData();
    return updated;
  };

  const disburseLoan = async (loanData) => {
    const created = await apiService.createLoan(loanData);
    if (created?.id) {
      await apiService.approveLoan(created.id);
      await apiService.disburseLoan(created.id);
    }
    await fetchAllLiveData();
    return { success: true, loan: created };
  };

  const collectPayment = async (loanId, amount, paymentMethod = 'CASH') => {
    const res = await apiService.collectPayment(loanId, amount, paymentMethod);
    await fetchAllLiveData();
    return { success: true, ...res };
  };

  const injectCapital = async (amount, description) => {
    const res = await apiService.injectCapital(amount, description);
    await fetchAllLiveData();
    return res;
  };

  const addExpense = async (expenseData) => {
    const res = await apiService.recordExpense(expenseData);
    await fetchAllLiveData();
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        switchRole,
        organizations,
        currentOrganization,
        setCurrentOrganization,
        users,
        customers,
        loans,
        fundTransactions,
        expenses,
        notifications,
        loanProducts,
        isServerConnected,
        loading,
        isAuthenticated,
        loggedInUser,
        currentUser,
        loginWithCredentials,
        logout,
        fundMetrics,
        fundAccounts,
        addCustomer,
        updateCustomer,
        disburseLoan,
        collectPayment,
        injectCapital,
        addExpense,
        refreshData: fetchAllLiveData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};