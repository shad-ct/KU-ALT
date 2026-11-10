import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
}) => {
  const { user, activeRole, permissions, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-muted text-[14px]">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account Status Gate: Non-ACTIVE users are restricted strictly to /registration-status
  if (user?.status !== 'ACTIVE' && location.pathname !== '/registration-status') {
    return <Navigate to="/registration-status" replace />;
  }

  // Active users trying to visit /registration-status go to dashboard
  if (user?.status === 'ACTIVE' && location.pathname === '/registration-status') {
    return <Navigate to="/dashboard" replace />;
  }

  // Role Gate
  if (requiredRole && activeRole !== requiredRole && activeRole !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-lg max-w-lg mx-auto mt-12">
        <h2 className="text-[20px] font-semibold text-text mb-2">Access denied</h2>
        <p className="text-[14px] text-text-muted">
          Your active role ({activeRole}) does not have permission to access this module.
        </p>
      </div>
    );
  }

  // Permission Gate
  if (requiredPermission && !permissions.includes(requiredPermission) && activeRole !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-lg max-w-lg mx-auto mt-12">
        <h2 className="text-[20px] font-semibold text-text mb-2">Permission required</h2>
        <p className="text-[14px] text-text-muted">
          You lack the required permission ({requiredPermission}) to view this resource.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
