import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finance_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('finance_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finance_user');
    }
  }, [user]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login({ identifier, password });
      setUser(data.user);
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

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        isAdmin: user?.role_type === 'SUPER_ADMIN' || user?.role_type === 'ADMIN',
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
