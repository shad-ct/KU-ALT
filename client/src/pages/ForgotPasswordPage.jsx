import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setMessage(res.data?.message || 'Password reset instructions have been sent to your email.');
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please check your email and try again.');
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
            Reset password
          </h2>
          <p className="text-[14px] leading-[20px] text-text-muted mb-5">
            Enter your registered university email to receive a password reset link.
          </p>

          {message && (
            <div className="mb-5 p-3 bg-success-bg border border-success-text/20 rounded-md text-[13px] text-success-text">
              {message}
              {resetToken && (
                <div className="mt-2 pt-2 border-t border-success-text/20">
                  <span className="font-medium">Dev link: </span>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="underline ref-number"
                  >
                    Click here to reset
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-danger-bg border border-danger-text/20 rounded-md text-[13px] text-danger-text">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email-input"
                className="block text-[14px] leading-[20px] font-medium text-text mb-1.5"
              >
                Email
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="scholar@kannur.ac.in"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] rounded-md bg-accent-600 hover:bg-accent-700 text-white font-medium text-[15px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending instructions...' : 'Send reset link'}
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

export default ForgotPasswordPage;
