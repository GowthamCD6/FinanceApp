import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { api } from '../../services/api';
import { Landmark, LogOut, Menu, User, Receipt, Building, Layers } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeOrg, clearActiveOrg } = useOrg();
  const [metrics, setMetrics] = useState(null);

  const isInsideOrg = location.pathname.startsWith('/org/') && !location.pathname.startsWith('/org/create');

  useEffect(() => {
    const fetchStats = async () => {
      const m = await api.getAdminDashboardMetrics();
      setMetrics(m);
    };
    fetchStats();
  }, []);

  const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

  const handleBrandClick = () => {
    clearActiveOrg();
    navigate('/dashboard');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button className="menu-toggle btn btn-secondary btn-icon" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>

        <div className="navbar-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <Landmark size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Finance<span className="brand-accent">Web</span></span>
            <span className="brand-badge">
              {isInsideOrg && activeOrg ? 'Branch Operations Portal' : 'SuperAdmin Governance'}
            </span>
          </div>
        </div>

        {/* Active Organization Context Pill */}
        {isInsideOrg && activeOrg && (
          <div className="org-context-pill hide-mobile">
            <Building size={14} color="#818cf8" />
            <span className="ocp-name">{activeOrg.name}</span>
            <span className="ocp-code">{activeOrg.code}</span>
          </div>
        )}
      </div>

      {/* Field Collection Progress Ticker (When in Org context) */}
      {isInsideOrg && (
        <div className="field-ticker hide-mobile">
          <div className="ticker-item">
            <Receipt size={14} color="var(--emerald)" />
            <span className="ticker-lbl">Daily Recoveries:</span>
            <span className="ticker-val green">{formatCurrency(metrics?.todayDailyCollected || 2925)}</span>
            <span className="ticker-sub">/ {formatCurrency(metrics?.todayDailyTarget || 5850)}</span>
          </div>
        </div>
      )}

      <div className="navbar-right">
        <NavLink to={isInsideOrg && activeOrg ? `/org/${activeOrg.id}/profile` : '/dashboard'} className="profile-badge-btn" title="View Profile">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="user-details hide-mobile">
            <span className="user-name">{user?.name || 'Super Admin'}</span>
            <span className="user-role">
              {isInsideOrg && activeOrg ? `Admin (${activeOrg.code})` : 'Platform SuperAdmin'}
            </span>
          </div>
        </NavLink>

        <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
          <LogOut size={16} />
          <span className="hide-mobile">Exit</span>
        </button>
      </div>

      <style>{`
        .navbar-container {
          height: var(--navbar-height);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .menu-toggle {
          display: none;
        }

        @media (max-width: 900px) {
          .menu-toggle {
            display: inline-flex;
          }
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.2rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .brand-accent {
          color: var(--primary);
        }

        .brand-badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--emerald);
          font-weight: 700;
        }

        .org-context-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
        }
        .ocp-name {
          font-weight: 700;
          color: #312E81;
        }
        .ocp-code {
          background: #4F46E5;
          color: #FFFFFF;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .field-ticker {
          display: flex;
          align-items: center;
          background: #F8FAFC;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
        }

        .ticker-lbl { color: var(--text-muted); }
        .ticker-val.green {
          color: var(--emerald);
          font-weight: 700;
          font-family: var(--font-display);
        }
        .ticker-sub { color: var(--text-secondary); font-size: 0.72rem; }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .profile-badge-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .profile-badge-btn:hover {
          background: #EEF2FF;
          border-color: #C7D2FE;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--emerald-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: white;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.68rem;
          color: var(--emerald);
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
