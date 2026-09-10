import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { AppLayout } from './components/layout/AppLayout';
import { OrgAdminLayout } from './components/layout/OrgAdminLayout';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// SuperAdmin Tier Pages
import { SuperAdminDashboard } from './pages/Superadmin/SuperAdminDashboard';
import { CreateOrganization } from './pages/Superadmin/Organization/CreateOrganization';

// Dedicated Admin Portal Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { Shopkeepers } from './pages/Admin/Shopkeepers';
import { ManageUsers } from './pages/Admin/ManageUsers';
import { AddUser } from './pages/Admin/AddUser';
import { AdminLoans } from './pages/Admin/AdminLoans';
import { AdminReports } from './pages/Admin/AdminReports';
import { AdminProfile } from './pages/Admin/AdminProfile';

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Authenticated App Layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* SuperAdmin Portal: Organizations Governance & Registry */}
              <Route path="/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/org/create" element={<CreateOrganization />} />

              {/* Dedicated Admin Portal (Direct Routes) */}
              <Route path="/admin">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="shopkeepers" element={<Shopkeepers />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="loans" element={<AdminLoans />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Org-Scoped Admin Portal (Branch Specific Workspace) */}
              <Route path="/org/:orgId" element={<OrgAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="shopkeepers" element={<Shopkeepers />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="loans" element={<AdminLoans />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Shortcut Top-Level Aliases */}
              <Route path="/shopkeepers" element={<Navigate to="/admin/shopkeepers" replace />} />
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
