import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, isTokenExpired, triggerSessionExpired } from '../services/api';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const TOKEN_CHECK_INTERVAL_MS = 30 * 1000; // Check JWT every 30 seconds

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('finance_token') || sessionStorage.getItem('finance_token');
    if (t && isTokenExpired(t)) {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_user');
      return null;
    }
    return t;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finance_user');
    const t = localStorage.getItem('finance_token') || sessionStorage.getItem('finance_token');
    if (!t || isTokenExpired(t)) return null;
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);
  const [sessionNotice, setSessionNotice] = useState(null);
  const lastActivityRef = useRef(Date.now());

  // Logout method
  const logout = useCallback((reason = null) => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    if (reason) {
      setSessionNotice(reason);
    }
  }, []);

  // Sync token and user to localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('finance_user', JSON.stringify(user));
      localStorage.setItem('finance_token', token);
    } else if (!token) {
      localStorage.removeItem('finance_user');
      localStorage.removeItem('finance_token');
    }
  }, [user, token]);

  // 1. Initial Session Validation against Backend /auth/me
  useEffect(() => {
    let isMounted = true;
    const validateInitialSession = async () => {
      const activeToken = localStorage.getItem('finance_token') || sessionStorage.getItem('finance_token');
      if (!activeToken || isTokenExpired(activeToken)) {
        if (isMounted) {
          logout();
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await api.auth.getCurrentUser();
        if (isMounted && profile?.user) {
          setUser(profile.user);
          setToken(activeToken);
        }
      } catch (err) {
        console.warn('Session verification failed on mount:', err.message);
        if (isMounted) {
          logout('Session invalid or expired. Please sign in.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateInitialSession();
    return () => {
      isMounted = false;
    };
  }, [logout]);

  // 2. Periodic Token Expiration Watcher
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout('Your secure session has expired. Please sign in again.');
      }
    }, TOKEN_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token, logout]);

  // 3. User Inactivity / Idle Timeout Listener
  useEffect(() => {
    if (!token || !user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const idleInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        logout('Session timed out due to 30 minutes of inactivity.');
      }
    }, 60 * 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(idleInterval);
    };
  }, [token, user, logout]);

  // 4. Global Auth Expired Event Listener
  useEffect(() => {
    const handleAuthExpired = (e) => {
      const msg = e?.detail?.message || 'Session expired. Please log in.';
      logout(msg);
    };

    window.addEventListener('finance_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('finance_auth_expired', handleAuthExpired);
  }, [logout]);

  // Login handlers
  const login = async (identifier, password) => {
    setLoading(true);
    setSessionNotice(null);
    try {
      const data = await api.auth.login({ identifier, password });
      if (data?.token) {
        setToken(data.token);
        setUser(data.user);
        const roles = data.user?.roles || [data.user?.role_type || 'ADMIN'];
        if (roles.includes('SUPER_ADMIN')) {
          localStorage.removeItem('finance_active_org_id');
          localStorage.removeItem('finance_active_branch_id');
        }
        lastActivityRef.current = Date.now();
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googlePayload) => {
    setLoading(true);
    setSessionNotice(null);
    try {
      const data = await api.auth.googleLogin(googlePayload);
      if (data?.token) {
        setToken(data.token);
        setUser(data.user);
        const roles = data.user?.roles || [data.user?.role_type || 'ADMIN'];
        if (roles.includes('SUPER_ADMIN')) {
          localStorage.removeItem('finance_active_org_id');
          localStorage.removeItem('finance_active_branch_id');
        }
        lastActivityRef.current = Date.now();
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('finance_user', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSessionNotice = () => setSessionNotice(null);

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role_type
    ? [user.role_type]
    : [];

  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isBranchAdmin = userRoles.includes('BRANCH_ADMIN');
  const isOrgAdmin = isSuperAdmin || userRoles.includes('ORG_ADMIN') || (userRoles.includes('ADMIN') && !isBranchAdmin);
  const isAdmin = isSuperAdmin || isOrgAdmin || isBranchAdmin;
  const isFieldAgent = userRoles.includes('FIELD_AGENT');

  const userOrgId = user?.organization_id || null;
  const userBranchId = user?.branch_id || null;
  const userBranchName = user?.branch_name || null;
  const userOrgName = user?.organization_name || null;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        sessionNotice,
        clearSessionNotice,
        login,
        googleLogin,
        logout,
        updateProfile,
        isAuthenticated: !!token && !!user && !isTokenExpired(token),
        userRoles,
        isAdmin,
        isOrgAdmin,
        isBranchAdmin,
        isSuperAdmin,
        isFieldAgent,
        userOrgId,
        userBranchId,
        userBranchName,
        userOrgName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
