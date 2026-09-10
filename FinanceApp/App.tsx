import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/common/Header';
import { TabBar, TabKey } from './src/components/common/TabBar';
import { RoleSwitchModal } from './src/components/modals/RoleSwitchModal';
import { DashboardScreen } from './src/pages/DashboardScreen';
import { DailyRouteScreen } from './src/pages/DailyRouteScreen';
import { LoansScreen } from './src/pages/LoansScreen';
import { CustomersScreen } from './src/pages/CustomersScreen';
import { FundLedgerScreen } from './src/pages/FundLedgerScreen';
import { ReportsScreen } from './src/pages/ReportsScreen';
import { isToday, isPastDate } from './src/utils/helpers';

function MainScreen() {
  const insets = useSafeAreaInsets();
  const { loans, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);

  // Compute live badge indicators
  let dueTodayCount = 0;
  let overdueCount = 0;

  loans.forEach((loan) => {
    loan.installments.forEach((inst) => {
      if (['PENDING', 'PARTIAL', 'OVERDUE'].includes(inst.status)) {
        if (isToday(inst.due_date)) dueTodayCount++;
        if (isPastDate(inst.due_date) || inst.status === 'OVERDUE') overdueCount++;
      }
    });
  });

  const getTabTitle = (tab: TabKey): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Fund Circulation',
          subtitle: 'Available Cash & Double-Entry Pool',
        };
      case 'route':
        return {
          title: 'Field Route Sheet',
          subtitle: 'Daily Merchant & Weekly Client Collections',
        };
      case 'loans':
        return {
          title: 'Loan Contracts',
          subtitle: 'Active Portfolio & Schedule Amortization',
        };
      case 'customers':
        return {
          title: 'Borrowers & Shops',
          subtitle: 'Client Profiles & Repeat Advance Eligibility',
        };
      case 'ledger':
        return {
          title: 'Central Fund Ledger',
          subtitle: 'Immutable Entries, Expenses & Cash Drawer',
        };
      case 'reports':
        return {
          title: 'Financial Statements',
          subtitle: 'Cash Flow, Profit Margins & Delinquency Aging',
        };
      default:
        return { title: 'FundFlow Engine', subtitle: 'Lending Management' };
    }
  };

  const headerInfo = getTabTitle(activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />

      {/* Global Header with Role Switcher */}
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        onOpenRoleSwitch={() => setShowRoleModal(true)}
      />

      {/* Main Screen Content */}
      <View style={styles.body}>
        {activeTab === 'dashboard' && (
          <DashboardScreen onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'route' && <DailyRouteScreen />}
        {activeTab === 'loans' && <LoansScreen />}
        {activeTab === 'customers' && <CustomersScreen />}
        {activeTab === 'ledger' && <FundLedgerScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        dueTodayCount={dueTodayCount}
        overdueCount={overdueCount}
      />

      {/* Role Switcher Modal */}
      <RoleSwitchModal
        visible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
