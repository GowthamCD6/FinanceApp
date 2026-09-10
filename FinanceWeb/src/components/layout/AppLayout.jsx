import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-root">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .layout-body {
          display: flex;
          flex: 1;
          position: relative;
        }

        .layout-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .layout-main {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};
