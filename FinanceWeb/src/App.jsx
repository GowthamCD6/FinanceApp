import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// Admin Core Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { AddUser } from './pages/admin/AddUser';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminProfile } from './pages/admin/AdminProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Admin Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Field Operations Portal */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 1. Admin Dashboard */}
            <Route path="/dashboard" element={<AdminDashboard />} />

            {/* 2. Manage Users */}
            <Route path="/users" element={<ManageUsers />} />

            {/* 3. Add User */}
            <Route path="/users/add" element={<AddUser />} />

            {/* 4. Reports (Tab 1: Weekly Dues, Tab 2: Daily Collections) */}
            <Route path="/reports" element={<AdminReports />} />

            {/* 5. Admin Profile (Fund App Style) */}
            <Route path="/profile" element={<AdminProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
