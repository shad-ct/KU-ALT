import React from 'react';
import { useAuth } from './AuthContext';

/**
 * <Can permission="application:create">...</Can>
 * Conditionally renders children if user holds the permission or is ADMIN.
 */
export const Can = ({ permission, fallback = null, children }) => {
  const { permissions, activeRole } = useAuth();

  if (activeRole === 'ADMIN') {
    return <>{children}</>;
  }

  if (permissions.includes(permission)) {
    return <>{children}</>;
  }

  return fallback;
};

export default Can;

