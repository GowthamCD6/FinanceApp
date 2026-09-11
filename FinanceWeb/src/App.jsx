import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { Sidebar } from './components/layout/Sidebar';

// Auth Page
import { LoginPage } from './pages/auth/Login/LoginPage';

// SuperAdmin Tier Pages
import { SuperAdminDashboard } from './pages/Superadmin/Dashboard/Dashboard';
import { CreateOrganization } from './pages/Superadmin/Organization/Organization';
import { UserPaymentOverview } from './pages/Superadmin/UserPaymentOverview/UserPaymentOverview';
import { ApiAnalytics } from './pages/Superadmin/ApiAnalytics/ApiAnalytics';
import { SuperAdminUsers } from './pages/Superadmin/SuperAdmin/SuperAdminUsers';
import { DefaultCategories } from './pages/Superadmin/DefaultCategories';
import { MobileAppUpdates } from './pages/Superadmin/MobileUpdates/MobileAppUpdates';
import { PrivacyPolicy } from './pages/Superadmin/PrivacyPolicy/PrivacyPolicy';
import { AuditLogsBroadcast } from './pages/Superadmin/AditLog/AuditLogsBroadcast';

// Dedicated Admin Portal Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { Shopkeepers } from './pages/Admin/Shopkeeper/Shopkeepers';
import { WeeklyCustomers } from './pages/Admin/WeeklyCustomers/WeeklyCustomers';
import { ManageUsers } from './pages/Admin/ManageUser/ManageUsers';
import { AddUser } from './pages/Admin/Adduser/AddUser';
import { AdminLoans } from './pages/Admin/AdminLoans';
import { AdminReports } from './pages/Admin/Reports/Reports';
import { AdminProfile } from './pages/Admin/AdminProfile';

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* 1. Public Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Authenticated App Layout directly hosted by Sidebar */}
            <Route element={<Sidebar />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* SuperAdmin Portal: Governance, Analytics & System Modules */}
              <Route path="/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/org/create" element={<CreateOrganization />} />
              <Route path="/superadmin/payments" element={<UserPaymentOverview />} />
              <Route path="/superadmin/analytics" element={<ApiAnalytics />} />
              <Route path="/superadmin/users" element={<SuperAdminUsers />} />
              <Route path="/superadmin/categories" element={<DefaultCategories />} />
              <Route path="/superadmin/app-updates" element={<MobileAppUpdates />} />
              <Route path="/superadmin/privacy" element={<PrivacyPolicy />} />
              <Route path="/superadmin/audit" element={<AuditLogsBroadcast />} />

              {/* Dedicated Admin Portal (Direct Routes) */}
              <Route path="/admin">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="shopkeepers" element={<Shopkeepers />} />
                <Route path="weekly-customers" element={<WeeklyCustomers />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="loans" element={<AdminLoans />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Org-Scoped Admin Portal (Branch Specific Workspace) */}
              <Route path="/org/:orgId">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="shopkeepers" element={<Shopkeepers />} />
                <Route path="weekly-customers" element={<WeeklyCustomers />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="loans" element={<AdminLoans />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Shortcut Top-Level Aliases */}
              <Route path="/payments-overview" element={<Navigate to="/superadmin/payments" replace />} />
              <Route path="/analytics" element={<Navigate to="/superadmin/analytics" replace />} />
              <Route path="/categories" element={<Navigate to="/superadmin/categories" replace />} />
              <Route path="/app-updates" element={<Navigate to="/superadmin/app-updates" replace />} />
              <Route path="/privacy" element={<Navigate to="/superadmin/privacy" replace />} />
              <Route path="/audit" element={<Navigate to="/superadmin/audit" replace />} />

              <Route path="/shopkeepers" element={<Navigate to="/admin/shopkeepers" replace />} />
              <Route path="/weekly-customers" element={<Navigate to="/admin/weekly-customers" replace />} />
              <Route path="/users" element={<Navigate to="/admin/users" replace />} />
              <Route path="/users/add" element={<Navigate to="/admin/users/add" replace />} />
              <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />
              <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
              <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </OrgProvider>
    </AuthProvider>
  );
}
