import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session restoration via silent refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        const data = res.data?.data;
        if (data) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          setActiveRole(data.activeRole);
          setRoles(data.roles || []);
          setPermissions(data.permissions || []);
        }
      } catch (err) {
        // Unauthenticated visitor
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setActiveRole(null);
      setRoles([]);
      setPermissions([]);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data?.data;

    setAccessToken(data.accessToken);
    setUser(data.user);
    setActiveRole(data.activeRole);
    setRoles(data.roles || []);
    setPermissions(data.permissions || []);

    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      setActiveRole(null);
      setRoles([]);
      setPermissions([]);
    }
  };

  const switchRole = (newRole) => {
    if (roles.includes(newRole)) {
      setActiveRole(newRole);
    }
  };

  const value = {
    user,
    activeRole,
    roles,
    permissions,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

