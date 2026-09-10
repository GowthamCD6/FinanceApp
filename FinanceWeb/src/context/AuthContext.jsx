import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { MOCK_USERS } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finance_admin_user');
    return saved ? JSON.parse(saved) : MOCK_USERS.admin;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('finance_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finance_admin_user');
    }
  }, [user]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const data = await api.login(identifier, password);
      const adminUser = {
        ...data.user,
        roles: ['ADMIN'],
        permissions: ['CUSTOMER_CREATE', 'CUSTOMER_MANAGE', 'PAYMENT_CREATE', 'REPORT_VIEW'],
      };
      setUser(adminUser);
      return { ...data, user: adminUser };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('finance_admin_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    api.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        isAdmin: true,
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
