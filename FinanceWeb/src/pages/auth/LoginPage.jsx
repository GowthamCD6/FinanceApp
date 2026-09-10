import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState('admin@fundlending.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  const handleLogin = async (customId, customPass) => {
    setError('');
    const idToUse = customId || identifier;
    const passToUse = customPass || password;
    try {
      await login(idToUse, passToUse);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card card">
        <div className="login-brand">
          <div className="brand-logo-large">
            <Landmark size={32} color="#ffffff" />
          </div>
          <h1 className="login-title">Finance<span style={{ color: 'var(--primary)' }}>Web</span></h1>
          <p className="login-subtitle">Multi-Tenant Organization Governance & Operations Hub</p>
        </div>

        {/* 1-Click Fast Access Buttons */}
        <div className="instant-grid">
          <div
            className="instant-access-box superadmin"
            onClick={() => handleLogin('admin@fundlending.com', 'Admin@123')}
          >
            <div className="instant-icon superadmin">
              <ShieldCheck size={18} color="#4F46E5" />
            </div>
            <div className="instant-text">
              <span className="instant-title">SuperAdmin Access</span>
              <span className="instant-desc">Multi-Org Governance & Registry</span>
            </div>
            <ArrowRight size={15} color="#4F46E5" />
          </div>

          <div
            className="instant-access-box admin"
            onClick={() => handleLogin('ops@fundlending.com', 'Admin@123')}
          >
            <div className="instant-icon admin">
              <UserCheck size={18} color="var(--emerald)" />
            </div>
            <div className="instant-text">
              <span className="instant-title">Branch Admin</span>
              <span className="instant-desc">Field Operations & Collections</span>
            </div>
            <ArrowRight size={15} color="var(--emerald)" />
          </div>
        </div>

        <div className="divider">
          <span>or sign in with credentials</span>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="text"
                className="form-input has-icon"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@fundlending.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Security Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                className="form-input has-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Command Center'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="security-note">
          <CheckCircle2 size={13} color="var(--emerald)" />
          <span>Enterprise End-to-End Encrypted Financial Portal</span>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 50%),
                      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.06), transparent 50%),
                      #F8FAFC;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          padding: 2.25rem 2rem;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        .login-brand {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .brand-logo-large {
          width: 58px;
          height: 58px;
          margin: 0 auto 1rem;
          border-radius: var(--radius-lg);
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
        }

        .login-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .login-subtitle {
          font-size: 0.825rem;
          color: var(--text-secondary);
          margin-top: 0.35rem;
        }

        .instant-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }

        .instant-access-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .instant-access-box.superadmin {
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
        }
        .instant-access-box.superadmin:hover {
          background: #E0E7FF;
          border-color: #A5B4FC;
          transform: translateY(-1px);
        }

        .instant-access-box.admin {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
        }
        .instant-access-box.admin:hover {
          background: #D1FAE5;
          border-color: #6EE7B7;
          transform: translateY(-1px);
        }

        .instant-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .instant-icon.superadmin { background: #FFFFFF; }
        .instant-icon.admin { background: #FFFFFF; }

        .instant-text {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .instant-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .instant-desc {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .divider span {
          padding: 0 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: #FFFFFF;
        }

        .login-error {
          background: #FFF1F2;
          border: 1px solid #FECDD3;
          color: #E11D48;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.5rem;
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
