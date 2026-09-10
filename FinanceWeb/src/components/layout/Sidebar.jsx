import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useOrg } from '../../context/OrgContext';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Users,
  UserPlus,
  Receipt,
  User,
  ArrowLeft,
  CreditCard,
  Shield,
  Layers,
  Store,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activeOrg, clearActiveOrg } = useOrg();
  const location = useLocation();
  const navigate = useNavigate();

  const isInsideOrg = location.pathname.startsWith('/org/') && !location.pathname.startsWith('/org/create');
  const isDirectAdmin = location.pathname.startsWith('/admin');

  const superAdminNav = [
    { label: 'All Organizations', path: '/dashboard', icon: Building },
    { label: 'Create Organization', path: '/org/create', icon: PlusCircle },
    { label: 'Branch Operations Hub', path: '/admin/dashboard', icon: LayoutDashboard },
  ];

  const adminNavItems = isInsideOrg && activeOrg
    ? [
        { label: 'Org Dashboard', path: `/org/${activeOrg.id}/dashboard`, icon: LayoutDashboard },
        { label: 'Shopkeeper Ledger', path: `/org/${activeOrg.id}/shopkeepers`, icon: Store },
        { label: 'Manage Borrowers', path: `/org/${activeOrg.id}/users`, icon: Users },
        { label: 'Onboard Borrower', path: `/org/${activeOrg.id}/users/add`, icon: UserPlus },
        { label: 'Loan Portfolio', path: `/org/${activeOrg.id}/loans`, icon: CreditCard },
        { label: 'Reports & Collections', path: `/org/${activeOrg.id}/reports`, icon: Receipt },
        { label: 'Branch Profile', path: `/org/${activeOrg.id}/profile`, icon: User },
      ]
    : [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Shopkeeper Ledger', path: '/admin/shopkeepers', icon: Store },
        { label: 'Manage Users', path: '/admin/users', icon: Users },
        { label: 'Add User', path: '/admin/users/add', icon: UserPlus },
        { label: 'Loan Portfolio', path: '/admin/loans', icon: CreditCard },
        { label: 'Reports & Collections', path: '/admin/reports', icon: Receipt },
        { label: 'My Profile', path: '/admin/profile', icon: User },
      ];

  const handleBackToOrgs = () => {
    clearActiveOrg();
    if (onClose) onClose();
    navigate('/dashboard');
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {isInsideOrg && activeOrg ? (
          <>
            {/* Back to Superadmin button */}
            <button className="back-to-orgs-btn" onClick={handleBackToOrgs}>
              <ArrowLeft size={16} />
              <span>Back to Organizations</span>
            </button>

            {/* Active Org Mini Badge */}
            <div className="active-org-card">
              <div className="aoc-avatar">{activeOrg.name.charAt(0)}</div>
              <div className="aoc-info">
                <span className="aoc-name">{activeOrg.name}</span>
                <span className="aoc-code">{activeOrg.code} • {activeOrg.plan}</span>
              </div>
            </div>

            <div className="sidebar-section-title">BRANCH OPERATIONS</div>
            <nav className="sidebar-nav">
              {adminNavItems.map((item) => {
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
          </>
        ) : isDirectAdmin ? (
          <>
            {/* Back to Superadmin button */}
            <button className="back-to-orgs-btn" onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }}>
              <ArrowLeft size={16} />
              <span>SuperAdmin Portal</span>
            </button>

            <div className="sidebar-section-title">ADMIN FIELD OPERATIONS</div>
            <nav className="sidebar-nav">
              {adminNavItems.map((item) => {
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
          </>
        ) : (
          <>
            <div className="sidebar-section-title">SUPERADMIN GOVERNANCE</div>
            <nav className="sidebar-nav">
              {superAdminNav.map((item) => {
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
          </>
        )}

        <div className="sidebar-footer">
          <div className="system-health-badge">
            <span className="pulse-dot" />
            <span>{isInsideOrg ? 'Branch Node Online' : isDirectAdmin ? 'Field Terminal Online' : 'SuperAdmin Core Online'}</span>
          </div>
        </div>

        <style>{`
          .sidebar-container {
            width: var(--sidebar-width);
            background: #FFFFFF;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 1.25rem 1rem;
            flex-shrink: 0;
            transition: transform var(--transition-normal);
            box-shadow: 1px 0 3px rgba(0, 0, 0, 0.02);
          }

          .back-to-orgs-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 0.85rem;
            border-radius: var(--radius-md);
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            color: var(--primary);
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 0.85rem;
            transition: all var(--transition-fast);
          }
          .back-to-orgs-btn:hover {
            background: #EEF2FF;
            border-color: #C7D2FE;
            color: #4338CA;
          }

          .active-org-card {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.75rem 0.85rem;
            border-radius: var(--radius-md);
            background: linear-gradient(135deg, #EEF2FF 0%, #ECFDF5 100%);
            border: 1px solid #C7D2FE;
            margin-bottom: 1.25rem;
          }
          .aoc-avatar {
            width: 32px;
            height: 32px;
            border-radius: var(--radius-sm);
            background: var(--primary-gradient);
            color: #ffffff;
            font-weight: 800;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
          }
          .aoc-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }
          .aoc-name {
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .aoc-code {
            font-size: 0.68rem;
            color: var(--emerald);
            font-weight: 700;
          }

          .sidebar-section-title {
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #94A3B8;
            padding: 0 0.75rem 0.75rem;
            text-transform: uppercase;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            flex: 1;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.7rem 0.85rem;
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
            background: #F8FAFC;
          }

          .nav-item.active {
            color: var(--primary);
            background: #EEF2FF;
            border-color: #C7D2FE;
            font-weight: 700;
          }

          .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            color: inherit;
          }

          .nav-item.active .nav-icon {
            color: var(--primary);
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
            font-weight: 600;
            color: var(--text-muted);
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-md);
          }

          .pulse-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--emerald);
            box-shadow: 0 0 6px var(--emerald);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(5, 150, 105, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
          }

          @media (max-width: 900px) {
            .sidebar-container {
              position: fixed;
              top: var(--navbar-height);
              bottom: 0;
              left: 0;
              z-index: 99;
              transform: translateX(-100%);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            }
            .sidebar-container.open {
              transform: translateX(0);
            }
            .sidebar-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(15, 23, 42, 0.4);
              z-index: 98;
              backdrop-filter: blur(3px);
            }
          }
        `}</style>
      </aside>
    </>
  );
};
