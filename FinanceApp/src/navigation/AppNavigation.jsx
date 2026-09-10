import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

// Common Navigation Components
import BottomTabBar from '../components/common/BottomTabBar';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import Icon from '../components/common/Icon';

// Operational Modals
import ActionMoreModal from '../components/modals/ActionMoreModal';
import DisburseLoanModal from '../components/modals/DisburseLoanModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import AddCapitalModal from '../components/modals/AddCapitalModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import AddOrganizationModal from '../components/modals/AddOrganizationModal';
import ManageUsersModal from '../components/modals/ManageUsersModal';
import AddUserModal from '../components/modals/AddUserModal';

// Super Admin Screens
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import SuperAdminCustomers from '../pages/superadmin/SuperAdminCustomers';
import SuperAdminCustomerDetail from '../pages/superadmin/SuperAdminCustomerDetail';
import SuperAdminLoans from '../pages/superadmin/SuperAdminLoans';
import SuperAdminLoanDetail from '../pages/superadmin/SuperAdminLoanDetail';
import SuperAdminFund from '../pages/superadmin/SuperAdminFund';
import SuperAdminAudit from '../pages/superadmin/SuperAdminAudit';
import SuperAdminExpenses from '../pages/superadmin/SuperAdminExpenses';
import SuperAdminReports from '../pages/superadmin/SuperAdminReports';

// Admin Screens
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminCustomerDetail from '../pages/admin/AdminCustomerDetail';
import AdminLoans from '../pages/admin/AdminLoans';
import AdminLoanDetail from '../pages/admin/AdminLoanDetail';
import AdminCollections from '../pages/admin/AdminCollections';
import AdminFund from '../pages/admin/AdminFund';
import AdminExpenses from '../pages/admin/AdminExpenses';
import AdminReports from '../pages/admin/AdminReports';
import AdminDayEndSettlement from '../pages/admin/AdminDayEndSettlement';

// User / Customer Screens
import UserDashboard from '../pages/user/UserDashboard';
import UserMyLoans from '../pages/user/UserMyLoans';
import UserRepaymentSchedule from '../pages/user/UserRepaymentSchedule';
import UserPayments from '../pages/user/UserPayments';

// Auth Screen
import LoginScreen from '../pages/auth/LoginScreen';

const AppNavigation = () => {
  const {
    currentRole,
    switchRole,
    isServerConnected,
    isAuthenticated,
    logout,
    currentUser,
    addCustomer,
    addExpense,
    organizations,
    currentOrganization,
    switchOrganization,
  } = useApp();

  // Active tab per role
  const [superAdminTab, setSuperAdminTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [userTab, setUserTab] = useState('dashboard');

  // Sub-view navigation states
  const [selectedCustomerId, setSelectedCustomerId] = useState(101);
  const [selectedLoanId, setSelectedLoanId] = useState(4);
  const [superAdminSubView, setSuperAdminSubView] = useState(null); // 'loan_detail' | 'customer_detail' | 'audit' | null
  const [adminSubView, setAdminSubView] = useState(null); // 'customer_detail' | 'loan_detail' | 'day_end_settlement' | null
  const [auditFilterQuery, setAuditFilterQuery] = useState('');
  const [initialOpenNewLoan, setInitialOpenNewLoan] = useState(false);

  // Single unified modal state to guarantee strict hook consistency across Hot Reloads:
  // 'ROLE' | 'MORE' | 'DISBURSE' | 'CUSTOMER' | 'CAPITAL' | 'EXPENSE' | null
  const [activeModal, setActiveModal] = useState(null);

  // Bottom Tabs per Role (2 on left, center +, 2 on right - exact FUND-APP layout)
  const superAdminTabs = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { id: 'loans', label: 'Loans', iconName: 'loans' },
    { id: 'customers', label: 'Clients', iconName: 'customers' },
    { id: 'fund', label: 'Fund Pool', iconName: 'fund' },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { id: 'loans', label: 'Loans', iconName: 'loans' },
    { id: 'collections', label: 'Collect', iconName: 'collections' },
    { id: 'customers', label: 'Clients', iconName: 'customers' },
  ];

  const userTabs = [
    { id: 'dashboard', label: 'Overview', iconName: 'dashboard' },
    { id: 'loans', label: 'My Loans', iconName: 'loans' },
    { id: 'schedule', label: 'Schedule', iconName: 'calendar' },
    { id: 'payments', label: 'Receipts', iconName: 'receipt' },
  ];

  // Role switch handler
  const handleRoleChange = (role) => {
    switchRole(role);
    setSuperAdminSubView(null);
    setAdminSubView(null);
    setSuperAdminTab('dashboard');
    setAdminTab('dashboard');
    setUserTab('dashboard');
    setActiveModal(null);
  };

  // If not signed in, show LoginScreen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  // Active tabs & current tab for the active role
  const activeTabs = 
    currentRole === 'SUPER_ADMIN' ? superAdminTabs :
    currentRole === 'ADMIN' ? adminTabs : userTabs;

  const currentTab = 
    currentRole === 'SUPER_ADMIN' ? superAdminTab :
    currentRole === 'ADMIN' ? adminTab : userTab;

  const handleTabPress = (tabId) => {
    setSuperAdminSubView(null);
    setAdminSubView(null);
    if (currentRole === 'SUPER_ADMIN') {
      setSuperAdminTab(tabId);
    } else if (currentRole === 'ADMIN') {
      setAdminTab(tabId);
    } else {
      setUserTab(tabId);
    }
  };

  // Handle actions selected from center action more modal
  const handleActionMore = (actionId) => {
    setActiveModal(null);
    if (actionId === 'disburse_loan') {
      setTimeout(() => setActiveModal('DISBURSE'), 200);
    } else if (actionId === 'add_customer') {
      setTimeout(() => setActiveModal('CUSTOMER'), 200);
    } else if (actionId === 'add_organization') {
      setTimeout(() => setActiveModal('ORGANIZATION'), 200);
    } else if (actionId === 'manage_users') {
      setTimeout(() => setActiveModal('MANAGE_USERS'), 200);
    } else if (actionId === 'add_user') {
      setTimeout(() => setActiveModal('ADD_USER'), 200);
    } else if (actionId === 'add_capital') {
      setTimeout(() => setActiveModal('CAPITAL'), 200);
    } else if (actionId === 'add_expense') {
      setTimeout(() => setActiveModal('EXPENSE'), 200);
    } else if (actionId === 'collect_payment') {
      setAdminSubView(null);
      setAdminTab('collections');
    } else if (actionId === 'day_end_settlement') {
      setAdminTab('dashboard');
      setAdminSubView('day_end_settlement');
    } else if (actionId === 'view_audit') {
      setSuperAdminSubView('audit');
    } else if (actionId === 'pay_due') {
      setUserTab('dashboard');
    } else if (actionId === 'view_schedule') {
      setUserTab('schedule');
    } else if (actionId === 'view_receipts') {
      setUserTab('payments');
    }
  };

  // Role pill label & icon
  const getRoleBadge = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', iconName: 'crown', color: '#2563EB' };
      case 'ADMIN':
        return { label: 'Admin (Ops)', iconName: 'shield', color: '#059669' };
      case 'USER':
      default:
        return { label: 'Kumar (Customer)', iconName: 'customers', color: '#D97706' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP COMPACT APP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.brandIconBox}>
            <Icon name="fund" size={17} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.brandTitle}>FUND FLOW</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isServerConnected ? '#059669' : '#2563EB' }]} />
              <Text style={styles.statusText}>{isServerConnected ? 'LIVE DB' : 'OFFLINE SYNC'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Tenant / Organization Switcher pill */}
          <TouchableOpacity
            style={styles.tenantPill}
            onPress={() => {
              if (currentRole === 'SUPER_ADMIN' && organizations?.length > 1) {
                const currentIndex = organizations.findIndex((o) => o.id === currentOrganization?.id);
                const nextIndex = (currentIndex + 1) % organizations.length;
                switchOrganization(organizations[nextIndex].id);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.tenantPillText}>
              {currentOrganization?.code || 'ORG-APEX'}
            </Text>
          </TouchableOpacity>

          {/* Role Perspective Switcher Pill */}
          <TouchableOpacity
            style={[styles.rolePill, { borderColor: roleBadge.color }]}
            onPress={() => setActiveModal('ROLE')}
            activeOpacity={0.8}
          >
            <Icon name={roleBadge.iconName} size={14} color={roleBadge.color} />
            <Text style={[styles.rolePillText, { color: roleBadge.color }]}>
              {roleBadge.label}
            </Text>
            <Text style={styles.rolePillArrow}>▾</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutIconBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Icon name="logout" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SCREEN VIEWPORT CONTAINER */}
      <View style={styles.viewport}>
        {/* ================= SUPER ADMIN SCREENS ================= */}
        {currentRole === 'SUPER_ADMIN' && (
          <>
            {superAdminTab === 'dashboard' && !superAdminSubView && (
              <SuperAdminDashboard 
                onNavigate={(page, params) => {
                  if (page === 'loans') {
                    setSuperAdminTab('loans');
                    if (params?.openNewLoan) setInitialOpenNewLoan(true);
                  } else if (page === 'customers') {
                    setSuperAdminTab('customers');
                  } else if (page === 'fund') {
                    setSuperAdminTab('fund');
                  } else if (page === 'audit') {
                    setSuperAdminSubView('audit');
                  }
                }} 
              />
            )}

            {superAdminTab === 'loans' && !superAdminSubView && (
              <SuperAdminLoans 
                onSelectLoan={(id) => {
                  setSelectedLoanId(id);
                  setSuperAdminSubView('loan_detail');
                }}
                initialOpenNewLoan={initialOpenNewLoan}
              />
            )}

            {superAdminTab === 'customers' && !superAdminSubView && (
              <SuperAdminCustomers 
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setSuperAdminSubView('customer_detail');
                }}
              />
            )}

            {superAdminTab === 'fund' && !superAdminSubView && (
              <SuperAdminFund 
                onViewAuditLedger={(query) => {
                  setAuditFilterQuery(query || '');
                  setSuperAdminSubView('audit');
                }}
              />
            )}

            {/* Super Admin Sub-views */}
            {superAdminSubView === 'loan_detail' && (
              <SuperAdminLoanDetail 
                loanId={selectedLoanId}
                onBack={() => setSuperAdminSubView(null)}
              />
            )}

            {superAdminSubView === 'customer_detail' && (
              <SuperAdminCustomerDetail 
                customerId={selectedCustomerId}
                onBack={() => setSuperAdminSubView(null)}
                onNavigateToLoan={(loanId) => {
                  setSelectedLoanId(loanId);
                  setSuperAdminSubView('loan_detail');
                }}
              />
            )}

            {superAdminSubView === 'audit' && (
              <SuperAdminAudit 
                initialFilter={auditFilterQuery}
                onBack={() => setSuperAdminSubView(null)}
              />
            )}
          </>
        )}

        {/* ================= ADMIN OPERATIONS SCREENS ================= */}
        {currentRole === 'ADMIN' && (
          <>
            {adminTab === 'dashboard' && !adminSubView && (
              <AdminDashboard 
                onNavigate={(page, params) => {
                  if (page === 'collections') {
                    setAdminTab('collections');
                  } else if (page === 'loans') {
                    setAdminTab('loans');
                    if (params?.openNewLoan) setInitialOpenNewLoan(true);
                  } else if (page === 'customers') {
                    setAdminTab('customers');
                  } else if (page === 'day_end_settlement') {
                    setAdminSubView('day_end_settlement');
                  }
                }}
              />
            )}

            {adminTab === 'loans' && !adminSubView && (
              <AdminLoans 
                onSelectLoan={(id) => {
                  setSelectedLoanId(id);
                  setAdminSubView('loan_detail');
                }}
                initialOpenNewLoan={initialOpenNewLoan}
              />
            )}

            {adminTab === 'collections' && !adminSubView && (
              <AdminCollections />
            )}

            {adminTab === 'customers' && !adminSubView && (
              <AdminCustomers 
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setAdminSubView('customer_detail');
                }}
              />
            )}

            {/* Admin Sub-views */}
            {adminSubView === 'loan_detail' && (
              <AdminLoanDetail 
                loanId={selectedLoanId}
                onBack={() => setAdminSubView(null)}
              />
            )}

            {adminSubView === 'customer_detail' && (
              <AdminCustomerDetail 
                customerId={selectedCustomerId}
                onBack={() => setAdminSubView(null)}
                onNavigateToLoan={(loanId) => {
                  setSelectedLoanId(loanId);
                  setAdminSubView('loan_detail');
                }}
              />
            )}

            {adminSubView === 'day_end_settlement' && (
              <AdminDayEndSettlement 
                onBack={() => setAdminSubView(null)}
                onCompleteSettlement={() => setAdminSubView(null)}
              />
            )}
          </>
        )}

        {/* ================= USER / CUSTOMER (KUMAR) SCREENS ================= */}
        {currentRole === 'USER' && (
          <>
            {userTab === 'dashboard' && (
              <UserDashboard onNavigate={(page) => setUserTab(page)} />
            )}
            {userTab === 'loans' && (
              <UserMyLoans onSelectLoan={() => setUserTab('schedule')} />
            )}
            {userTab === 'schedule' && (
              <UserRepaymentSchedule onBack={() => setUserTab('dashboard')} />
            )}
            {userTab === 'payments' && <UserPayments />}
          </>
        )}
      </View>

      {/* CURVED BOTTOM TAB BAR WITH CENTER ELEVATED BUTTON (FUND-APP STYLE) */}
      <BottomTabBar
        tabs={activeTabs}
        activeTab={currentTab}
        onTabPress={handleTabPress}
        onOpenMore={() => setActiveModal('MORE')}
        primaryColor={
          currentRole === 'SUPER_ADMIN' ? '#2563EB' :
          currentRole === 'ADMIN' ? '#059669' : '#D97706'
        }
      />

      {/* ACTION MORE MODAL (BOTTOM SHEET QUICK OPERATIONS) */}
      <ActionMoreModal
        visible={activeModal === 'MORE'}
        currentRole={currentRole}
        onClose={() => setActiveModal(null)}
        onAction={handleActionMore}
      />

      {/* GLOBAL DISBURSE LOAN MODAL */}
      <DisburseLoanModal
        visible={activeModal === 'DISBURSE'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => setActiveModal(null)}
      />

      {/* GLOBAL REGISTER CUSTOMER MODAL */}
      <AddCustomerModal
        visible={activeModal === 'CUSTOMER'}
        onClose={() => setActiveModal(null)}
        onAddCustomer={(data) => {
          addCustomer(data);
          setActiveModal(null);
        }}
      />

      {/* GLOBAL ADD CAPITAL MODAL */}
      <AddCapitalModal
        visible={activeModal === 'CAPITAL'}
        onClose={() => setActiveModal(null)}
      />

      {/* GLOBAL ADD EXPENSE MODAL */}
      <AddExpenseModal
        visible={activeModal === 'EXPENSE'}
        onClose={() => setActiveModal(null)}
        onAddExpense={(data) => {
          addExpense(data);
          setActiveModal(null);
        }}
      />

      {/* GLOBAL ADD ORGANISATION MODAL (Super Admin) */}
      <AddOrganizationModal
        visible={activeModal === 'ORGANIZATION'}
        onClose={() => setActiveModal(null)}
      />

      {/* GLOBAL MANAGE USERS & STATUS MODAL */}
      <ManageUsersModal
        visible={activeModal === 'MANAGE_USERS'}
        onClose={() => setActiveModal(null)}
        onOpenAddUser={() => setActiveModal('ADD_USER')}
      />

      {/* GLOBAL ADD USER / BORROWER MODAL */}
      <AddUserModal
        visible={activeModal === 'ADD_USER'}
        onClose={() => setActiveModal(null)}
      />

      {/* ROLE SWITCHER MODAL */}
      <RoleSwitcherModal
        visible={activeModal === 'ROLE'}
        currentRole={currentRole}
        onSelectRole={handleRoleChange}
        onClose={() => setActiveModal(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tenantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  tenantPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 6,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rolePillArrow: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 2,
  },
  logoutIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  viewport: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 68,
  },
});

export default AppNavigation;
