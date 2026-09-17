import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = null, children = null }) => {
  const { isAuthenticated, user, userRoles, loading } = useAuth();
  const location = useLocation();

  // Only show full-screen auth loader if we have zero cached user data AND loading is actively in progress
  if (loading && !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <Landmark size={24} color="#ffffff" />
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, margin: 0 }}>
          Authenticating secure session...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const hasRole =
      userRoles.includes('SUPER_ADMIN') || // SuperAdmin can access any route
      allowedRoles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      // Redirect to their default dashboard
      if (userRoles.includes('FIELD_AGENT')) {
        return <Navigate to="/staff/dashboard" replace />;
      } else if (userRoles.includes('BRANCH_ADMIN') || userRoles.includes('ADMIN') || userRoles.includes('ORG_ADMIN')) {
        const orgPath = user?.organization_id ? `/org/${user.organization_id}/dashboard` : '/admin/dashboard';
        return <Navigate to={orgPath} replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
