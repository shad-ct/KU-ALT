import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      alert('Password has been reset successfully. Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between font-sans text-text antialiased px-4">
      <div className="w-full max-w-[400px] mx-auto pt-[15vh]">
        <div className="text-center mb-6">
          <h1 className="text-[20px] leading-[28px] font-semibold text-text">
            Kannur University
          </h1>
          <p className="text-[13px] leading-[20px] text-text-muted mt-0.5">
            Research and Development Cell
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="text-[20px] leading-[28px] font-semibold text-text mb-2">
            Set new password
          </h2>
          <p className="text-[14px] leading-[20px] text-text-muted mb-5">
            Choose a strong password with at least 10 characters.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-danger-bg border border-danger-text/20 rounded-md text-[13px] text-danger-text">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-[14px] leading-[20px] font-medium text-text mb-1.5"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="At least 10 characters"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[14px] leading-[20px] font-medium text-text mb-1.5"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Re-enter new password"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] rounded-md bg-accent-600 hover:bg-accent-700 text-white font-medium text-[15px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Updating...' : 'Set new password'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center text-[13px]">
            <Link to="/login" className="text-accent-600 hover:text-accent-700 font-medium">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-[13px] leading-[20px] text-text-muted">
        Kannur University, Thavakkara, Civil Station P.O., Kannur, Kerala 670002
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
