import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Landmark,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Clock,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, loading, isAuthenticated, user, sessionNotice, clearSessionNotice } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Determine redirect target path
  const redirectTarget = location.state?.from?.pathname;

  // Dynamic role router based on backend returned user roles
  const routeByRoles = (userData) => {
    const roles = userData?.roles || [userData?.role_type || 'ADMIN'];
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    // SuperAdmin must ALWAYS navigate to the central SuperAdmin Hub (/dashboard) first
    if (isSuperAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (redirectTarget && redirectTarget !== '/login' && !redirectTarget.startsWith('/dashboard')) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    if (roles.includes('ADMIN') || roles.includes('ORG_ADMIN')) {
      const orgId = userData?.organization_id;
      const target = orgId ? `/org/${orgId}/dashboard` : '/admin/dashboard';
      navigate(target, { replace: true });
    } else if (roles.includes('FIELD_AGENT')) {
      navigate('/staff/dashboard', { replace: true });
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  // If already authenticated on load, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      routeByRoles(user);
    }
  }, [isAuthenticated, user]);

  // 1. Standard Form Authentication (Backend Verification)
  const handleStandardLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }

    try {
      const res = await login(identifier.trim(), password);
      if (res?.user) {
        routeByRoles(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // 2. Google OAuth Authentication (Official Google Popup & Backend Verification)
  const handleGoogleSignIn = () => {
    setError('');
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '804640829556-vp271lpifurihaljm90e7gd9dnsd8f2l.apps.googleusercontent.com';

    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        setGoogleLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setGoogleLoading(false);
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const googleProfile = await res.json();
              if (googleProfile?.email) {
                const authRes = await googleLogin({
                  email: googleProfile.email,
                  name: googleProfile.name,
                  google_id: googleProfile.sub,
                  avatar_url: googleProfile.picture,
                });
                if (authRes?.user) {
                  routeByRoles(authRes.user);
                }
              } else {
                setError('Could not retrieve email from Google profile.');
              }
            } catch (fetchErr) {
              console.error('Error in Google OAuth authentication:', fetchErr);
              setError(fetchErr.message || 'Google Authentication failed.');
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        tokenClient.requestAccessToken();
      } catch (err) {
        console.warn('OAuth popup init error:', err);
        setError('Failed to initialize Google Sign-In popup.');
        setGoogleLoading(false);
      }
    } else {
      setError('Google Identity Services SDK is loading. Please retry in a moment.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="brand-logo-large">
            <Landmark size={28} color="#ffffff" />
          </div>
          <h1 className="login-title">
            Finance<span className="brand-accent">Flow</span>
          </h1>
          <p className="login-subtitle">
            Enterprise Multi-Tenant Lending & Governance Engine
          </p>
        </div>

        {/* Session Timeout / Expiry Alert */}
        {sessionNotice && (
          <div className="login-session-alert">
            <div className="session-alert-left">
              <Clock size={16} />
              <span>{sessionNotice}</span>
            </div>
            <button
              type="button"
              className="btn-dismiss-alert"
              onClick={clearSessionNotice}
              aria-label="Dismiss alert"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="google-auth-section">
          <button
            type="button"
            className="btn-google-signin"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {/* Official Google SVG Logo */}
            <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="btn-google-text">
              {googleLoading ? 'Connecting to Google OAuth...' : 'Sign in with Google'}
            </span>
          </button>
        </div>

        <div className="login-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Standard Form Login */}
        <form onSubmit={handleStandardLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address or Phone Number</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@organization.com or 9876543210"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-login"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Styles */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.06), transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(2, 132, 199, 0.06), transparent 40%),
                      #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
        }

        .login-brand {
          text-align: center;
          margin-bottom: 24px;
        }

        .brand-logo-large {
          width: 48px;
          height: 48px;
          background: #4f46e5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .login-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .brand-accent {
          color: #4f46e5;
        }

        .login-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* Session Expiry Alert */
        .login-session-alert {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          color: #b45309;
          font-size: 13px;
        }

        .session-alert-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-dismiss-alert {
          background: none;
          border: none;
          color: #b45309;
          cursor: pointer;
          padding: 2px;
          display: flex;
        }

        .btn-dismiss-alert:hover {
          opacity: 1;
          background: rgba(146, 64, 14, 0.1);
        }

        /* Error Alert */
        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          color: #b91c1c;
          font-size: 13px;
        }

        /* Google Sign-In Button */
        .google-auth-section {
          margin-bottom: 8px;
        }

        .btn-google-signin {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #1e293b;
          padding: 11px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .btn-google-signin:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .btn-google-signin:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon-svg {
          flex-shrink: 0;
        }

        .btn-google-text {
          color: #1e293b;
        }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 18px 0;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .login-divider span {
          padding: 0 10px;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color 0.2s;
        }

        .password-toggle-btn:hover {
          color: #475569;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .btn-submit-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-submit-login:hover:not(:disabled) {
          background: #4338ca;
        }

        .btn-submit-login:active:not(:disabled) {
          transform: scale(0.99);
        }

        .btn-submit-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
