import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      alert('Password updated successfully. Please sign in with your new password.');
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[540px] space-y-6">
      <PageHeader
        title="Change password"
        description="Update your portal password. Active sessions will require re-signing in."
      />

      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-3 bg-danger-bg border border-danger-text/20 rounded-md text-[13px] text-danger-text">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
              Current password *
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>

          <div>
            <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
              New password * (at least 10 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>

          <div>
            <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
              Confirm new password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="h-[40px] px-4 border border-border-strong text-[13px] font-medium text-text hover:bg-surface-sub rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-[40px] px-5 bg-accent-600 hover:bg-accent-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
