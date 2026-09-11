import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Landmark } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useOrg } from '../../context/OrgContext';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { activeOrg } = useOrg();

  return (
    <div className={`layout-root ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Mobile Top Header */}
      <header className="mobile-top-bar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Landmark size={18} color="#ffffff" />
          </div>
          <span className="mobile-brand-title">
            {activeOrg ? activeOrg.name : 'Finance Web'}
          </span>
        </div>
      </header>

      {/* Main Full-Height Fixed Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="layout-content-wrapper">
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          background: #F8FAFC;
        }

        .mobile-top-bar {
          display: none;
        }

        .layout-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width, 260px);
          min-width: 0;
          min-height: 100vh;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-is-collapsed .layout-content-wrapper {
          margin-left: var(--sidebar-collapsed-width, 72px);
        }

        .layout-main {
          flex: 1;
          padding: 2rem 2.25rem;
          max-width: 1540px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .layout-root {
            flex-direction: column;
          }

          .mobile-top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 16px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          }

          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: #1e293b;
            cursor: pointer;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mobile-brand-icon {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: #1976d2;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-brand-title {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
          }

          .layout-content-wrapper {
            margin-left: 0 !important;
          }

          .layout-main {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;