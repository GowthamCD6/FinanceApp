import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Landmark, LogOut, Menu, User, Receipt, Calendar } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const m = await api.getAdminDashboardMetrics();
      setMetrics(m);
    };
    fetchStats();
  }, []);

  const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button className="menu-toggle btn btn-secondary btn-icon" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>

        <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <Landmark size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Finance<span className="brand-accent">Web</span></span>
            <span className="brand-badge">Admin Operations Portal</span>
          </div>
        </div>
      </div>

      {/* Field Collection Progress Ticker */}
      <div className="field-ticker hide-mobile">
        <div className="ticker-item">
          <Receipt size={14} color="var(--emerald)" />
          <span className="ticker-lbl">Today's Daily Recoveries:</span>
          <span className="ticker-val green">{formatCurrency(metrics?.todayDailyCollected || 2925)}</span>
          <span className="ticker-sub">/ {formatCurrency(metrics?.todayDailyTarget || 5850)}</span>
        </div>
      </div>

      <div className="navbar-right">
        <NavLink to="/profile" className="profile-badge-btn" title="View Admin Profile">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="user-details hide-mobile">
            <span className="user-name">{user?.name || 'Admin Officer'}</span>
            <span className="user-role">Branch Operations</span>
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
          background: rgba(15, 23, 42, 0.9);
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
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
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
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
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
        }

        .brand-accent {
          color: #818cf8;
        }

        .brand-badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--emerald);
          font-weight: 700;
        }

        .field-ticker {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
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
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .profile-badge-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981 0%, #047857 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: white;
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
