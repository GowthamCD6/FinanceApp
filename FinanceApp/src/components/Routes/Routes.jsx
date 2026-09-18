import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import Colors from '../../theme/colors';

// Navigation Components
import TabRouter from '../Tab/TabRouter';
import Header from '../HeaderComponent/Header';

// Fronter
import Login from '../../pages/Fronter/Login/Login';

// Super Admin Pages & Modals
import SuperAdminDashboard from '../../pages/superadmin/SuperAdminDashboard';
import SuperAdminLoans from '../../pages/superadmin/SuperAdminLoans';
import SuperAdminCustomers from '../../pages/superadmin/SuperAdminCustomers';
import SuperAdminFund from '../../pages/superadmin/SuperAdminFund';
import SuperAdminReports from '../../pages/superadmin/SuperAdminReports';
import SuperAdminAudit from '../../pages/superadmin/SuperAdminAudit';
import SuperAdminExpenses from '../../pages/superadmin/SuperAdminExpenses';
import SuperAdminLoanDetail from '../../pages/superadmin/SuperAdminLoanDetail';
import SuperAdminCustomerDetail from '../../pages/superadmin/SuperAdminCustomerDetail';
import SuperAdminProfile from '../../pages/superadmin/pages/Profile/Profile';
import SuperAdminMoreModal from '../../pages/superadmin/modal/more';

// Admin Modals & Pages
import MoreModal from '../../pages/Admin/Modals/more';
import AddU from '../../pages/Admin/Modals/page/AddUser/AddU';
import ManageU from '../../pages/Admin/Modals/page/ManageUser/ManageU';
import DisburseLoanModal from '../../pages/Admin/Modals/page/disburseloan/DisburseLoanModal';
import CollectPaymentModal from '../../pages/Admin/Modals/page/collect/CollectPaymentModal';
import RecordExpenseModal from '../../pages/Admin/Modals/page/expense/RecordExpenseModal';
import InjectCapitalModal from '../../pages/Admin/Modals/page/capital/InjectCapitalModal';
import DayEndSettlementModal from '../../pages/Admin/Modals/page/settlement/DayEndSettlementModal';
import LoanLedgerModal from '../../pages/Admin/Modals/page/ledger/LoanLedgerModal';

import AdminDashboard from '../../pages/Admin/pages/Dashboard/Dashboard';
import CustomersScreen from '../../pages/Admin/pages/Customers/CustomersScreen';
import AdminReports from '../../pages/Admin/pages/Reports/Reports';
import AdminProfile from '../../pages/Admin/pages/Profile/Profile';

// User Modals & Pages
import UserMoreModal from '../../pages/User/Modals/More';
import Home from '../../pages/User/pages/Home/Home';
import Portfolio from '../../pages/User/pages/Portfolio/Portfolio';
import Payments from '../../pages/User/pages/Payments/Payments';
import UserProfile from '../../pages/User/pages/Profile/Profile';

export const Routes = () => {
  const {
    currentRole,
    isAuthenticated,
    currentOrganization,
    organizations,
    switchOrganization,
  } = useApp();

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [modalTargetItem, setModalTargetItem] = useState(null);

  // Selected item state for detail views
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // If not signed in, show Fronter Login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Login />
      </SafeAreaView>
    );
  }

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const getHeaderTitle = () => {
    if (currentRole === 'SUPER_ADMIN') {
      if (activeTab === 'dashboard') return 'Super Admin • Executive Core';
      if (activeTab === 'loans') return 'Master Loan Book';
      if (activeTab === 'customers') return 'Borrowers Directory';
      if (activeTab === 'fund') return 'Central Fund Vault';
      if (activeTab === 'reports') return 'Executive Reports';
      if (activeTab === 'expenses') return 'Operating Expenses';
      if (activeTab === 'audit') return 'Master Audit Log';
      if (activeTab === 'loan_detail') return 'Loan Overview';
      if (activeTab === 'customer_detail') return 'Borrower Credit Profile';
      if (activeTab === 'profile') return 'Executive Profile';
      return 'Super Admin Portal';
    }

    if (currentRole === 'ADMIN') {
      if (activeTab === 'dashboard') return currentOrganization?.name || 'Apex Microfinance';
      if (activeTab === 'customers') return 'Borrowers Directory';
      if (activeTab === 'reports') return 'Daily Reports';
      if (activeTab === 'profile') return 'Branch Admin Profile';
      return 'Branch Admin Portal';
    }

    // USER
    if (activeTab === 'dashboard') return 'Borrower Portal';
    if (activeTab === 'loans') return 'My Active Loans';
    if (activeTab === 'payments') return 'Payment Receipts';
    if (activeTab === 'profile') return 'My Profile';
    return 'Finance App';
  };

  const handleHeaderBack = () => {
    if (activeTab === 'loan_detail') {
      setActiveTab('loans');
    } else if (activeTab === 'customer_detail') {
      setActiveTab('customers');
    } else if (activeTab === 'audit') {
      setActiveTab('fund');
    } else if (activeTab === 'expenses') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const isDetailOrSubScreen = ['loan_detail', 'customer_detail', 'audit', 'expenses'].includes(activeTab);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Clean Header */}
      {activeTab === 'dashboard' && !isDetailOrSubScreen ? (
        <Header
          title={getHeaderTitle()}
          showBackButton={false}
          showDivider={true}
          rightComponent={
            <TouchableOpacity
              style={styles.tenantPill}
              onPress={() => {
                if (organizations?.length > 1) {
                  const currentIndex = organizations.findIndex((o) => o.id === currentOrganization?.id);
                  const nextIndex = (currentIndex + 1) % organizations.length;
                  switchOrganization(organizations[nextIndex].id);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.tenantPillText}>
                {currentOrganization?.code || (currentRole === 'SUPER_ADMIN' ? 'SUPER-ADMIN' : 'ORG-APEX')}
              </Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <Header
          title={getHeaderTitle()}
          onBack={handleHeaderBack}
          showBackButton={true}
          showDivider={true}
        />
      )}

      {/* Screen Viewport */}
      <View style={styles.viewport}>
        {/* SUPER ADMIN SCREENS */}
        {currentRole === 'SUPER_ADMIN' && (
          <>
            {activeTab === 'dashboard' && (
              <SuperAdminDashboard
                onNavigate={(page) => {
                  if (page === 'loans') setActiveTab('loans');
                  else if (page === 'customers') setActiveTab('customers');
                  else if (page === 'fund') setActiveTab('fund');
                  else if (page === 'reports') setActiveTab('reports');
                  else if (page === 'expenses') setActiveTab('expenses');
                  else if (page === 'audit') setActiveTab('audit');
                  else if (page === 'collections') setActiveTab('reports');
                  else setActiveTab(page);
                }}
              />
            )}

            {activeTab === 'loans' && (
              <SuperAdminLoans
                onSelectLoan={(loan) => {
                  setSelectedLoanId(loan?.id || loan?.loan_number);
                  setActiveTab('loan_detail');
                }}
              />
            )}

            {activeTab === 'customers' && (
              <SuperAdminCustomers
                onSelectCustomer={(cust) => {
                  setSelectedCustomerId(cust?.id);
                  setActiveTab('customer_detail');
                }}
              />
            )}

            {activeTab === 'fund' && (
              <SuperAdminFund
                onOpenAudit={() => setActiveTab('audit')}
              />
            )}

            {activeTab === 'reports' && (
              <SuperAdminReports />
            )}

            {activeTab === 'expenses' && (
              <SuperAdminExpenses />
            )}

            {activeTab === 'audit' && (
              <SuperAdminAudit
                onBack={() => setActiveTab('fund')}
              />
            )}

            {activeTab === 'loan_detail' && (
              <SuperAdminLoanDetail
                loanId={selectedLoanId}
                onBack={() => setActiveTab('loans')}
                onNavigateToCustomer={(cust) => {
                  setSelectedCustomerId(typeof cust === 'object' ? cust.id : cust);
                  setActiveTab('customer_detail');
                }}
                onOpenAudit={() => setActiveTab('audit')}
              />
            )}

            {activeTab === 'customer_detail' && (
              <SuperAdminCustomerDetail
                customerId={selectedCustomerId}
                onBack={() => setActiveTab('customers')}
                onNavigateToLoan={(loan) => {
                  setSelectedLoanId(typeof loan === 'object' ? loan.id : loan);
                  setActiveTab('loan_detail');
                }}
              />
            )}

            {activeTab === 'profile' && (
              <AdminProfile />
            )}
          </>
        )}

        {/* BRANCH ADMIN SCREENS */}
        {currentRole === 'ADMIN' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                onNavigate={(page) => {
                  if (page === 'reports') setActiveTab('reports');
                  else if (page === 'profile') setActiveTab('profile');
                  else if (page === 'users' || page === 'customers') setActiveTab('customers');
                }}
                onOpenAddUser={() => setActiveModal('ADD_USER')}
                onOpenManageUsers={() => setActiveModal('MANAGE_USERS')}
                onOpenDisburse={(cust) => {
                  setModalTargetItem(cust || null);
                  setActiveModal('DISBURSE_LOAN');
                }}
                onOpenCollect={(item) => {
                  setModalTargetItem(item || null);
                  setActiveModal('COLLECT');
                }}
                onOpenExpense={() => setActiveModal('EXPENSE')}
                onOpenCapital={() => setActiveModal('CAPITAL')}
                onOpenSettlement={() => setActiveModal('SETTLEMENT')}
                onOpenLedger={(loan) => {
                  setModalTargetItem(loan);
                  setActiveModal('LEDGER');
                }}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersScreen
                onOpenDisburse={(cust) => {
                  setModalTargetItem(cust || null);
                  setActiveModal('DISBURSE_LOAN');
                }}
                onOpenCollect={(item) => {
                  setModalTargetItem(item || null);
                  setActiveModal('COLLECT');
                }}
                onOpenLedger={(loan) => {
                  setModalTargetItem(loan);
                  setActiveModal('LEDGER');
                }}
                onOpenAddBorrower={() => setActiveModal('ADD_USER')}
              />
            )}

            {activeTab === 'reports' && <AdminReports />}
            {activeTab === 'profile' && <AdminProfile />}
          </>
        )}

        {/* BORROWER / USER SCREENS */}
        {currentRole === 'USER' && (
          <>
            {activeTab === 'dashboard' && (
              <Home onNavigate={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'loans' && (
              <Portfolio />
            )}
            {activeTab === 'payments' && (
              <Payments />
            )}
            {activeTab === 'profile' && (
              <UserProfile />
            )}
          </>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <TabRouter
        currentRole={currentRole}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onOpenMore={() => setActiveModal('MORE')}
      />

      {/* Quick Action Modals */}
      {currentRole === 'SUPER_ADMIN' && (
        <SuperAdminMoreModal
          visible={activeModal === 'MORE'}
          onClose={() => setActiveModal(null)}
          onAction={(actionId) => {
            setActiveModal(null);
            if (actionId === 'add_organization') {
              Alert.alert('Add Organization', 'Multi-tenant organization creator modal available in Executive portal.');
            } else if (actionId === 'manage_admins') {
              setActiveTab('customers');
            } else if (actionId === 'system_settings') {
              setActiveTab('profile');
            }
          }}
        />
      )}

      {currentRole === 'ADMIN' && (
        <MoreModal
          visible={activeModal === 'MORE'}
          onClose={() => setActiveModal(null)}
          onAction={(actionId) => {
            setActiveModal(null);
            if (actionId === 'disburse_loan') {
              setModalTargetItem(null);
              setTimeout(() => setActiveModal('DISBURSE_LOAN'), 200);
            } else if (actionId === 'collect_payment') {
              setModalTargetItem(null);
              setTimeout(() => setActiveModal('COLLECT'), 200);
            } else if (actionId === 'record_expense') {
              setTimeout(() => setActiveModal('EXPENSE'), 200);
            } else if (actionId === 'inject_capital') {
              setTimeout(() => setActiveModal('CAPITAL'), 200);
            } else if (actionId === 'day_settlement') {
              setTimeout(() => setActiveModal('SETTLEMENT'), 200);
            } else if (actionId === 'add_user') {
              setTimeout(() => setActiveModal('ADD_USER'), 200);
            } else if (actionId === 'manage_users') {
              setTimeout(() => setActiveModal('MANAGE_USERS'), 200);
            }
          }}
        />
      )}

      {currentRole === 'USER' && (
        <UserMoreModal
          visible={activeModal === 'MORE'}
          onClose={() => setActiveModal(null)}
          onAction={(actionId) => {
            setActiveModal(null);
            if (actionId === 'apply_loan') setActiveTab('loans');
            else if (actionId === 'make_payment') setActiveTab('payments');
          }}
        />
      )}

      {/* Admin Operations Modals */}
      <DisburseLoanModal
        visible={activeModal === 'DISBURSE_LOAN'}
        onClose={() => {
          setActiveModal(null);
          setModalTargetItem(null);
        }}
        initialCustomer={modalTargetItem}
      />

      <CollectPaymentModal
        visible={activeModal === 'COLLECT'}
        onClose={() => {
          setActiveModal(null);
          setModalTargetItem(null);
        }}
        initialItem={modalTargetItem}
      />

      <RecordExpenseModal
        visible={activeModal === 'EXPENSE'}
        onClose={() => setActiveModal(null)}
      />

      <InjectCapitalModal
        visible={activeModal === 'CAPITAL'}
        onClose={() => setActiveModal(null)}
      />

      <DayEndSettlementModal
        visible={activeModal === 'SETTLEMENT'}
        onClose={() => setActiveModal(null)}
      />

      <AddU
        visible={activeModal === 'ADD_USER'}
        onClose={() => setActiveModal(null)}
      />

      <ManageU
        visible={activeModal === 'MANAGE_USERS'}
        onClose={() => setActiveModal(null)}
        onOpenAddUser={() => {
          setActiveModal(null);
          setTimeout(() => setActiveModal('ADD_USER'), 200);
        }}
      />

      <LoanLedgerModal
        visible={activeModal === 'LEDGER'}
        onClose={() => {
          setActiveModal(null);
          setModalTargetItem(null);
        }}
        loan={modalTargetItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  viewport: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  tenantPill: {
    backgroundColor: Colors.purpleTintLightest,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tenantPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default Routes;
