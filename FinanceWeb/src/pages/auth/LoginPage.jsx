import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, ArrowRight, Lock, Mail, CheckCircle2, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState('ops@fundlending.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
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
          <h1 className="login-title">Finance<span style={{ color: '#818cf8' }}>Web</span></h1>
          <p className="login-subtitle">Admin Operations & Field Collection Portal</p>
        </div>

        {/* 1-Click Fast Admin Sign-in */}
        <div className="instant-access-box" onClick={() => handleLogin()}>
          <div className="instant-icon">
            <UserCheck size={20} color="var(--emerald)" />
          </div>
          <div className="instant-text">
            <span className="instant-title">1-Click Admin Access</span>
            <span className="instant-desc">Sign in as Admin Field Manager</span>
          </div>
          <ArrowRight size={16} color="var(--emerald)" />
        </div>

        <div className="divider">
          <span>or sign in with credentials</span>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="text"
                className="form-input has-icon"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ops@fundlending.com"
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
                placeholder="Admin@123"
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
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="security-note">
          <CheckCircle2 size={13} color="var(--emerald)" />
          <span>Branch Level 2 • Verified Route Officer Terminal</span>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%),
                      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent 50%),
                      #090D16;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 2.25rem 2rem;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-xl);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
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
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }

        .login-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .login-subtitle {
          font-size: 0.825rem;
          color: var(--text-secondary);
          margin-top: 0.35rem;
        }

        .instant-access-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-bottom: 1.25rem;
        }

        .instant-access-box:hover {
          background: rgba(16, 185, 129, 0.18);
          border-color: var(--emerald);
          transform: translateY(-1px);
        }

        .instant-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .instant-text {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .instant-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .instant-desc {
          font-size: 0.72rem;
          color: #a7f3d0;
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
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input.has-icon {
          padding-left: 2.3rem;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
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
