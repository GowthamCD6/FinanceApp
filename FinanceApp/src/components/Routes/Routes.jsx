import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import Colors from '../../theme/colors';

// Navigation Components
import TabRouter from '../Tab/TabRouter';
import Header from '../HeaderComponent/Header';

// Fronter
import Welcome from '../../pages/Fronter/Welcome/Welcome';
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
import InterestRatesModal from '../../pages/Admin/Modals/page/InterestRates/InterestRatesModal';
import DisburseLoanModal from '../../pages/superadmin/modal/DisburseLoanModal';

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
    isAuthChecking,
    isAuthenticated,
    currentOrganization,
    organizations,
    switchOrganization,
  } = useApp();

  // Navigation & Modal States
  const [authScreen, setAuthScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerForDisburse, setSelectedCustomerForDisburse] = useState(null);

  // Handle Tab navigation
  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    setSelectedLoanId(null);
    setSelectedCustomerId(null);
  };

  // While checking AsyncStorage session on app start, show sleek splash loader
  if (isAuthChecking) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#2842C4" />
      </SafeAreaView>
    );
  }

  // If not signed in, show Fronter Welcome or Login
  if (!isAuthenticated) {
    if (authScreen === 'welcome') {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <Welcome onGetStarted={() => setAuthScreen('login')} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Login onBack={() => setAuthScreen('welcome')} />
      </SafeAreaView>
    );
  }

  // Compute header title, subtitle, and back button action based on current screen & role
  const getHeaderConfig = () => {
    if (currentRole === 'SUPER_ADMIN') {
      switch (activeTab) {
        case 'dashboard':
          return {
            title: 'Dashboard',
            subtitle: 'Executive Operations Overview',
            showBackButton: false,
          };
        case 'loans':
          return {
            title: 'Loans',
            subtitle: 'Active & Disbursed Portfolio',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'loan_detail':
          return {
            title: 'Loan Details',
            subtitle: 'Installments & Schedule',
            showBackButton: true,
            onBack: () => {
              setSelectedLoanId(null);
              setActiveTab('loans');
            },
          };
        case 'customers':
          return {
            title: 'Borrowers',
            subtitle: 'Borrower Accounts & Verification',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'customer_detail':
          return {
            title: 'Borrower Profile',
            subtitle: 'Credit History & Loans',
            showBackButton: true,
            onBack: () => {
              setSelectedCustomerId(null);
              setActiveTab('customers');
            },
          };
        case 'fund':
          return {
            title: 'Fund Circulation',
            subtitle: 'Disbursals, Collections & Treasury',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'reports':
          return {
            title: 'Financial Reports',
            subtitle: 'Profitability & Recovery Analytics',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'audit':
          return {
            title: 'Audit Logs',
            subtitle: 'Activity Trails & Security Events',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'expenses':
          return {
            title: 'Operating Expenses',
            subtitle: 'Cash Outflows & Daily Bills',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'profile':
          return {
            title: 'Profile',
            subtitle: 'Master Administrator Settings',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        default:
          return {
            title: 'Executive Portal',
            showBackButton: false,
          };
      }
    }

    if (currentRole === 'ADMIN') {
      switch (activeTab) {
        case 'dashboard':
          return {
            title: 'Dashboard',
            subtitle: currentOrganization?.name || 'Branch Operations',
            showBackButton: false,
          };
        case 'customers':
          return {
            title: 'Manage Borrowers',
            subtitle: 'Customer Accounts & Verification',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'reports':
          return {
            title: 'Financial Reports',
            subtitle: 'Daily Collections & Portfolio Breakdown',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        case 'profile':
          return {
            title: 'Profile',
            subtitle: 'Administrator Preferences',
            showBackButton: true,
            onBack: () => setActiveTab('dashboard'),
          };
        default:
          return {
            title: 'Admin Console',
            showBackButton: false,
          };
      }
    }

    // USER / BORROWER
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Home',
          subtitle: 'Welcome to your financial portal',
          showBackButton: false,
        };
      case 'loans':
        return {
          title: 'Portfolio',
          subtitle: 'Active Borrowings & History',
          showBackButton: true,
          onBack: () => setActiveTab('dashboard'),
        };
      case 'payments':
        return {
          title: 'Payments',
          subtitle: 'Repayment Schedule & Dues',
          showBackButton: true,
          onBack: () => setActiveTab('dashboard'),
        };
      case 'profile':
        return {
          title: 'Profile',
          subtitle: 'Personal Details & Support',
          showBackButton: true,
          onBack: () => setActiveTab('dashboard'),
        };
      default:
        return {
          title: 'Borrower Portal',
          showBackButton: false,
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <Header
        title={headerConfig.title}
        subtitle={headerConfig.subtitle}
        showBackButton={headerConfig.showBackButton}
        onBack={headerConfig.onBack}
        rightComponent={
          organizations && organizations.length > 1 ? (
            <TouchableOpacity
              style={styles.tenantPill}
              onPress={() => {
                const nextOrg = organizations.find((o) => o.id !== currentOrganization?.id) || organizations[0];
                switchOrganization(nextOrg.id);
              }}
            >
              <Text style={styles.tenantPillText}>
                {currentOrganization?.code || 'Switch Org'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Main Screen Body based on Role & Active Tab */}
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
                  else if (page === 'audit') setActiveTab('audit');
                  else if (page === 'expenses') setActiveTab('expenses');
                }}
                onOpenLoan={(id) => {
                  setSelectedLoanId(id);
                  setActiveTab('loan_detail');
                }}
              />
            )}

            {activeTab === 'loans' && (
              <SuperAdminLoans
                onOpenLoanDetail={(loan) => {
                  setSelectedLoanId(loan?.id || loan);
                  setActiveTab('loan_detail');
                }}
              />
            )}

            {activeTab === 'loan_detail' && selectedLoanId && (
              <SuperAdminLoanDetail
                loanId={selectedLoanId}
                onBack={() => {
                  setSelectedLoanId(null);
                  setActiveTab('loans');
                }}
              />
            )}

            {activeTab === 'customers' && (
              <SuperAdminCustomers
                onOpenCustomerDetail={(customer) => {
                  setSelectedCustomerId(customer?.id || customer);
                  setActiveTab('customer_detail');
                }}
              />
            )}

            {activeTab === 'customer_detail' && selectedCustomerId && (
              <SuperAdminCustomerDetail
                customerId={selectedCustomerId}
                onBack={() => {
                  setSelectedCustomerId(null);
                  setActiveTab('customers');
                }}
              />
            )}

            {activeTab === 'fund' && <SuperAdminFund />}
            {activeTab === 'reports' && <SuperAdminReports />}
            {activeTab === 'audit' && <SuperAdminAudit />}
            {activeTab === 'expenses' && <SuperAdminExpenses />}
            {activeTab === 'profile' && <SuperAdminProfile />}
          </>
        )}

        {/* ADMIN SCREENS */}
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
                onOpenDisburse={() => {
                  setSelectedCustomerForDisburse(null);
                  setActiveModal('DISBURSE_LOAN');
                }}
                onOpenCollect={() => setActiveTab('reports')}
                onOpenSettlement={() => setActiveTab('reports')}
                onOpenLedger={() => setActiveTab('reports')}
                onOpenManageUsers={() => setActiveModal('MANAGE_USERS')}
                onOpenInterestRates={() => setActiveModal('INTEREST_RATES')}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersScreen
                onOpenAddBorrower={() => setActiveModal('ADD_USER')}
                onOpenAddUser={() => setActiveModal('ADD_USER')}
                onOpenManageUsers={() => setActiveModal('MANAGE_USERS')}
                onDisburse={(customer) => {
                  setSelectedCustomerForDisburse(customer);
                  setActiveModal('DISBURSE_LOAN');
                }}
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
            if (actionId === 'add_user') {
              setTimeout(() => setActiveModal('ADD_USER'), 200);
            } else if (actionId === 'manage_users') {
              setTimeout(() => setActiveModal('MANAGE_USERS'), 200);
            } else if (actionId === 'interest_rates') {
              setTimeout(() => setActiveModal('INTEREST_RATES'), 200);
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

      {/* Active Admin Modals */}
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

      <InterestRatesModal
        visible={activeModal === 'INTEREST_RATES'}
        onClose={() => setActiveModal(null)}
      />

      <DisburseLoanModal
        visible={activeModal === 'DISBURSE_LOAN'}
        initialCustomer={selectedCustomerForDisburse}
        onClose={() => {
          setActiveModal(null);
          setSelectedCustomerForDisburse(null);
        }}
        onSuccess={() => {
          setActiveModal(null);
          setSelectedCustomerForDisburse(null);
        }}
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
