import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

// Common Navigation Components
import AdminTabBar from '../components/admintab/AdminTabBar';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import Icon from '../components/common/Icon';

// Active Admin Screens & Modals
import MoreModal from '../pages/admin/modal/more';
import AdminDashboard from '../pages/admin/pages/Dashboard/Dashboard';
import AdminReports from '../pages/admin/pages/Reports/Reports';
import AdminProfile from '../pages/admin/pages/Profile/Profile';
import AddUserModal from '../pages/admin/modal/adduser/AddUserModal';
import ManageUsersModal from '../pages/admin/modal/manageuser/ManageUsersModal';

// Fronter Auth Screen
import Login from '../pages/Fronter/login/Login';

const AppNavigation = () => {
  const {
    currentRole,
    switchRole,
    isServerConnected,
    isAuthenticated,
    logout,
    currentOrganization,
    organizations,
    switchOrganization,
  } = useApp();

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'reports' | 'manage_users' | 'profile'

  // Modal states: 'ROLE' | 'ADD_USER' | 'MANAGE_USERS' | null
  const [activeModal, setActiveModal] = useState(null);

  // Tab config lives in src/components/admintab/AdminTabBar.jsx

  // Role switch handler
  const handleRoleChange = (role) => {
    switchRole(role);
    setActiveTab('dashboard');
    setActiveModal(null);
  };

  // If not signed in, show Login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Login />
      </SafeAreaView>
    );
  }

  const handleTabPress = (tabId) => {
    if (tabId === 'manage_users') {
      setActiveModal('MANAGE_USERS');
    } else {
      setActiveTab(tabId);
    }
  };

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
              if (organizations?.length > 1) {
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
            style={[styles.rolePill, { borderColor: '#059669' }]}
            onPress={() => setActiveModal('ROLE')}
            activeOpacity={0.8}
          >
            <Icon name="shield" size={14} color="#059669" />
            <Text style={[styles.rolePillText, { color: '#059669' }]}>
              Admin
            </Text>
            <Text style={styles.rolePillArrow}>▾</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutIconBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Icon name="close" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SCREEN VIEWPORT CONTAINER */}
      <View style={styles.viewport}>
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigate={(page) => {
              if (page === 'reports') {
                setActiveTab('reports');
              } else if (page === 'profile') {
                setActiveTab('profile');
              } else if (page === 'users' || page === 'customers') {
                setActiveModal('MANAGE_USERS');
              }
            }}
            onOpenAddUser={() => setActiveModal('ADD_USER')}
            onOpenManageUsers={() => setActiveModal('MANAGE_USERS')}
          />
        )}

        {activeTab === 'reports' && (
          <AdminReports />
        )}

        {activeTab === 'profile' && (
          <AdminProfile />
        )}
      </View>

      {/* CURVED BOTTOM TAB BAR WITH CENTER ELEVATED + BUTTON */}
      <AdminTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onOpenMore={() => setActiveModal('MORE')}
      />

      {/* ACTION MORE MODAL (BOTTOM SHEET QUICK OPERATIONS) */}
      <MoreModal
        visible={activeModal === 'MORE'}
        onClose={() => setActiveModal(null)}
        onAction={(actionId) => {
          setActiveModal(null);
          if (actionId === 'add_user') {
            setTimeout(() => setActiveModal('ADD_USER'), 200);
          } else if (actionId === 'manage_users') {
            setTimeout(() => setActiveModal('MANAGE_USERS'), 200);
          }
        }}
      />

      {/* MODAL: MANAGE USERS & STATUS GOVERNANCE */}
      <ManageUsersModal
        visible={activeModal === 'MANAGE_USERS'}
        onClose={() => setActiveModal(null)}
        onOpenAddUser={() => setActiveModal('ADD_USER')}
      />

      {/* MODAL: ADD USER / ENROLL BORROWER */}
      <AddUserModal
        visible={activeModal === 'ADD_USER'}
        onClose={() => setActiveModal(null)}
      />

      {/* MODAL: ROLE SWITCHER */}
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
