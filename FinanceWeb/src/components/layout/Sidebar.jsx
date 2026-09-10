import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Receipt,
  User,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/users', icon: Users },
    { label: 'Add User', path: '/users/add', icon: UserPlus },
    { label: 'Reports & Collections', path: '/reports', icon: Receipt },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section-title">ADMIN FIELD OPERATIONS</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="nav-icon">
                  <Icon size={18} />
                </div>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-health-badge">
            <span className="pulse-dot" />
            <span>Field Terminal Online</span>
          </div>
        </div>

        <style>{`
          .sidebar-container {
            width: var(--sidebar-width);
            background: #090D16;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem;
            flex-shrink: 0;
            transition: transform var(--transition-normal);
          }

          .sidebar-section-title {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            padding: 0 0.75rem 0.75rem;
            text-transform: uppercase;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            flex: 1;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0.85rem;
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.865rem;
            text-decoration: none;
            transition: all var(--transition-fast);
            border: 1px solid transparent;
          }

          .nav-item:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.04);
          }

          .nav-item.active {
            color: #ffffff;
            background: rgba(99, 102, 241, 0.16);
            border-color: rgba(99, 102, 241, 0.35);
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
          }

          .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            color: inherit;
          }

          .nav-item.active .nav-icon {
            color: #818cf8;
          }

          .sidebar-footer {
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          }

          .system-health-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.72rem;
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.02);
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-md);
          }

          .pulse-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--emerald);
            box-shadow: 0 0 8px var(--emerald);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }

          @media (max-width: 900px) {
            .sidebar-container {
              position: fixed;
              top: var(--navbar-height);
              bottom: 0;
              left: 0;
              z-index: 99;
              transform: translateX(-100%);
            }
            .sidebar-container.open {
              transform: translateX(0);
            }
            .sidebar-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.6);
              z-index: 98;
              backdrop-filter: blur(2px);
            }
          }
        `}</style>
      </aside>
    </>
  );
};
