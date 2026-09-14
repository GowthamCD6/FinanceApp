import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Page
import { LoginPage } from './pages/auth/Login/LoginPage';

// SuperAdmin Tier Pages
import { SuperAdminDashboard } from './pages/Superadmin/Dashboard/Dashboard';
import { CreateOrganization } from './pages/Superadmin/Organization/Organization';
import { UserPaymentOverview } from './pages/Superadmin/UserPaymentOverview/UserPaymentOverview';
import { ApiAnalytics } from './pages/Superadmin/ApiAnalytics/ApiAnalytics';
import { SuperAdminUsers } from './pages/Superadmin/SuperAdmin/SuperAdminUsers';
import { DefaultCategories } from './pages/Superadmin/DefaultCategories/DefaultCategories';
import { MobileAppUpdates } from './pages/Superadmin/MobileUpdates/MobileAppUpdates';
import { PrivacyPolicy } from './pages/Superadmin/PrivacyPolicy/PrivacyPolicy';
import { AuditLogsBroadcast } from './pages/Superadmin/AditLog/AuditLogsBroadcast';
import { KubernetesCluster } from './pages/Superadmin/Kubernetes/KubernetesCluster';
import { RouteStaffDashboard } from './pages/Staff/RouteStaffDashboard';

// Dedicated Admin Portal Pages
import { AdminDashboard } from './pages/Admin/Dashboard/Dashboard';
import { Shopkeepers } from './pages/Admin/Shopkeeper/Shopkeepers';
import { ShopkeeperCollect } from './pages/Admin/Shopkeeper/ShopkeeperCollect';
import { WeeklyCustomers } from './pages/Admin/WeeklyCustomers/WeeklyCustomers';
import { WeeklyCollect } from './pages/Admin/WeeklyCustomers/WeeklyCollect';
import { MonthlyCustomers } from './pages/Admin/MonthlyCustomers/MonthlyCustomers';
import { MonthlyCollect } from './pages/Admin/MonthlyCustomers/MonthlyCollect';
import { ManageUsers } from './pages/Admin/ManageUser/ManageUsers';
import { ManageStaff } from './pages/Admin/ManageStaff/ManageStaff';
import { AddUser } from './pages/Admin/Adduser/AddUser';
import { AdminLoans } from './pages/Admin/AdminLoans';
import { AdminReports } from './pages/Admin/Reports/Reports';
import { AdminProfile } from './pages/Admin/Profile/Profile';
import { LendingInterestRates } from './pages/Admin/InterestRates/LendingInterestRates';

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* 1. Public Authentication Portal */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Guarded Private App Routes (Session & Token Validated) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Sidebar />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* SuperAdmin Tier: Governance, Multi-Tenant Hub, Analytics & Infra */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                  <Route path="/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/org/create" element={<CreateOrganization />} />
                  <Route path="/superadmin/payments" element={<UserPaymentOverview />} />
                  <Route path="/superadmin/analytics" element={<ApiAnalytics />} />
                  <Route path="/superadmin/kubernetes" element={<KubernetesCluster />} />
                  <Route path="/superadmin/users" element={<SuperAdminUsers />} />
                  <Route path="/superadmin/categories" element={<DefaultCategories />} />
                  <Route path="/superadmin/app-updates" element={<MobileAppUpdates />} />
                  <Route path="/superadmin/privacy" element={<PrivacyPolicy />} />
                  <Route path="/superadmin/audit" element={<AuditLogsBroadcast />} />

                  {/* SuperAdmin Top-Level Shortcut Aliases */}
                  <Route path="/payments-overview" element={<Navigate to="/superadmin/payments" replace />} />
                  <Route path="/analytics" element={<Navigate to="/superadmin/analytics" replace />} />
                  <Route path="/categories" element={<Navigate to="/superadmin/categories" replace />} />
                  <Route path="/app-updates" element={<Navigate to="/superadmin/app-updates" replace />} />
                  <Route path="/privacy" element={<Navigate to="/superadmin/privacy" replace />} />
                  <Route path="/audit" element={<Navigate to="/superadmin/audit" replace />} />
                </Route>

                {/* Route Staff / Field Agent Portal */}
                <Route element={<ProtectedRoute allowedRoles={['FIELD_AGENT', 'ADMIN', 'SUPER_ADMIN']} />}>
                  <Route path="/staff/dashboard" element={<RouteStaffDashboard />} />
                </Route>

                {/* Dedicated Branch & Organization Admin Portal (Direct Routes) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FIELD_AGENT']} />}>
                  <Route path="/admin">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="shopkeepers" element={<Shopkeepers />} />
                    <Route path="shopkeepers/:shopId/collect" element={<ShopkeeperCollect />} />
                    <Route path="shopkeepers/collect/:shopId" element={<ShopkeeperCollect />} />
                    <Route path="shopkeeper-collect/:shopId" element={<ShopkeeperCollect />} />
                    <Route path="weekly-customers" element={<WeeklyCustomers />} />
                    <Route path="weekly-customers/:customerId/collect" element={<WeeklyCollect />} />
                    <Route path="weekly-customers/collect/:customerId" element={<WeeklyCollect />} />
                    <Route path="weekly-collect/:customerId" element={<WeeklyCollect />} />
                    <Route path="monthly-customers" element={<MonthlyCustomers />} />
                    <Route path="monthly-customers/:customerId/collect" element={<MonthlyCollect />} />
                    <Route path="monthly-customers/collect/:customerId" element={<MonthlyCollect />} />
                    <Route path="monthly-collect/:customerId" element={<MonthlyCollect />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="staff" element={<ManageStaff />} />
                    <Route path="users/add" element={<AddUser />} />
                    <Route path="loans" element={<AdminLoans />} />
                    <Route path="interest-rates" element={<LendingInterestRates />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="profile" element={<AdminProfile />} />
                  </Route>

                  {/* Multi-Tenant Org-Scoped Routes (SuperAdmin & Tenant Admins) */}
                  <Route path="/org/:orgId">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="shopkeepers" element={<Shopkeepers />} />
                    <Route path="shopkeepers/:shopId/collect" element={<ShopkeeperCollect />} />
                    <Route path="shopkeepers/collect/:shopId" element={<ShopkeeperCollect />} />
                    <Route path="shopkeeper-collect/:shopId" element={<ShopkeeperCollect />} />
                    <Route path="weekly-customers" element={<WeeklyCustomers />} />
                    <Route path="weekly-customers/:customerId/collect" element={<WeeklyCollect />} />
                    <Route path="weekly-customers/collect/:customerId" element={<WeeklyCollect />} />
                    <Route path="weekly-collect/:customerId" element={<WeeklyCollect />} />
                    <Route path="monthly-customers" element={<MonthlyCustomers />} />
                    <Route path="monthly-customers/:customerId/collect" element={<MonthlyCollect />} />
                    <Route path="monthly-customers/collect/:customerId" element={<MonthlyCollect />} />
                    <Route path="monthly-collect/:customerId" element={<MonthlyCollect />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="staff" element={<ManageStaff />} />
                    <Route path="users/add" element={<AddUser />} />
                    <Route path="loans" element={<AdminLoans />} />
                    <Route path="interest-rates" element={<LendingInterestRates />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="profile" element={<AdminProfile />} />
                  </Route>

                  {/* Top-Level Collect Routes */}
                  <Route path="/shopkeepers/:shopId/collect" element={<ShopkeeperCollect />} />
                  <Route path="/shopkeepers/collect/:shopId" element={<ShopkeeperCollect />} />
                  <Route path="/shopkeeper-collect/:shopId" element={<ShopkeeperCollect />} />
                  <Route path="/weekly-customers/:customerId/collect" element={<WeeklyCollect />} />
                  <Route path="/weekly-customers/collect/:customerId" element={<WeeklyCollect />} />
                  <Route path="/weekly-collect/:customerId" element={<WeeklyCollect />} />
                  <Route path="/monthly-customers/:customerId/collect" element={<MonthlyCollect />} />
                  <Route path="/monthly-customers/collect/:customerId" element={<MonthlyCollect />} />
                  <Route path="/monthly-collect/:customerId" element={<MonthlyCollect />} />

                  {/* Top-Level Aliases */}
                  <Route path="/shopkeepers" element={<Navigate to="/admin/shopkeepers" replace />} />
                  <Route path="/weekly-customers" element={<Navigate to="/admin/weekly-customers" replace />} />
                  <Route path="/monthly-customers" element={<Navigate to="/admin/monthly-customers" replace />} />
                  <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                  <Route path="/staff" element={<Navigate to="/admin/staff" replace />} />
                  <Route path="/users/add" element={<Navigate to="/admin/users/add" replace />} />
                  <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />
                  <Route path="/interest-rates" element={<Navigate to="/admin/interest-rates" replace />} />
                  <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
                  <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </OrgProvider>
    </AuthProvider>
  );
}
