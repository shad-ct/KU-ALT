import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ServicesCatalogPage from './pages/ServicesCatalogPage';
import ApprovalsPage from './pages/ApprovalsPage';
import EquipmentPage from './pages/EquipmentPage';
import ScholarsListPage from './pages/ScholarsListPage';
import ScholarDossierPage from './pages/ScholarDossierPage';
import GuidesListPage from './pages/GuidesListPage';
import CertificatesListPage from './pages/CertificatesListPage';
import ReportsPage from './pages/ReportsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProfilePage from './pages/ProfilePage';
import RegistrationStatusPage from './pages/RegistrationStatusPage';
import MasterDataPage from './pages/MasterDataPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import GuideSignupPage from './pages/GuideSignupPage';
import ScholarSignupPage from './pages/ScholarSignupPage';
import StyleguidePage from './pages/StyleguidePage';
import NotFoundPage from './pages/NotFoundPage';

function AuthenticatedApp() {
  const { user, activeRole, roles, switchRole, logout } = useAuth();

  return (
    <AppShell
      currentRole={activeRole || 'SCHOLAR'}
      availableRoles={roles}
      userName={user?.full_name || 'Portal User'}
      userEmail={user?.email || ''}
      onRoleSwitch={switchRole}
      onSignOut={logout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage role={activeRole} />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/services" element={<ServicesCatalogPage />} />
        <Route path="/timeline" element={<ScholarDossierPage isSelf />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/scholars" element={<ScholarsListPage />} />
        <Route path="/scholars/:id" element={<ScholarDossierPage />} />
        <Route path="/guides" element={<GuidesListPage />} />
        <Route path="/certificates" element={<CertificatesListPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/users" element={<AdminPanelPage />} />
        <Route path="/roles" element={<AdminPanelPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/master" element={<MasterDataPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/dev/styleguide" element={<StyleguidePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/guide" element={<GuideSignupPage />} />
          <Route path="/signup/scholar" element={<ScholarSignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dev/styleguide"
            element={
              <AppShell userName="Dev Preview" userEmail="developer@kannur.ac.in">
                <StyleguidePage />
              </AppShell>
            }
          />

          {/* Pending Registration Gate */}
          <Route
            path="/registration-status"
            element={
              <ProtectedRoute>
                <RegistrationStatusPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Application */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
