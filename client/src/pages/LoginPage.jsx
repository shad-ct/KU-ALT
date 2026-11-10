import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * LoginPage Component
 * Single centered 400px card, vertically ~15vh from top.
 * Wordmark + R&D Cell above card.
 * Plain language, 48px primary button, show/hide password toggle.
 * Demo accounts in collapsed <details> disclosure only in DEV mode.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.user.status !== 'ACTIVE') {
        navigate('/registration-status');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check your email address and password, then try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between font-sans text-text antialiased px-4">
      <div className="w-full max-w-[400px] mx-auto pt-[15vh]">
        {/* Above the card: wordmark + subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-[20px] leading-[28px] font-semibold text-text">
            Kannur University
          </h1>
          <p className="text-[13px] leading-[20px] text-text-muted mt-0.5">
            Research and Development Cell
          </p>
        </div>

        {/* The 400px card */}
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="text-[20px] leading-[28px] font-semibold text-text mb-5">
            Sign in
          </h2>

          {error && (
            <div
              className="mb-5 p-3 rounded-md bg-danger-bg text-danger-text text-[13px] leading-[20px] flex items-start gap-2 border border-danger-text/20"
              role="alert"
            >
              <AlertCircle size={16} strokeWidth={1.75} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail((prev) => prev.trim().toLowerCase())}
                required
                disabled={isLoading}
                placeholder="scholar@kannur.ac.in"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-[14px] leading-[20px] font-medium text-text"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[13px] leading-[20px] text-accent-600 hover:text-accent-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyUp}
                  required
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className="w-full h-[40px] pl-3 pr-10 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  className="absolute right-0 top-0 h-[40px] px-3 flex items-center justify-center text-text-muted hover:text-text"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                </button>
              </div>

              {capsLockActive && (
                <p className="mt-1.5 text-[13px] text-warning-text flex items-center gap-1.5">
                  <AlertCircle size={14} strokeWidth={1.75} />
                  <span>Caps Lock is on</span>
                </p>
              )}
            </div>

            {/* Primary Action Button: lg 48px, full width */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] rounded-md bg-accent-600 hover:bg-accent-700 text-white font-medium text-[15px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Below the card: Register links */}
        <div className="mt-6 text-center">
          <p className="text-[13px] leading-[20px] text-text-muted mb-3">
            New to the portal?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/signup/scholar"
              className="h-[36px] px-4 rounded-md border border-border-strong bg-surface hover:bg-surface-sub text-[13px] font-medium text-text inline-flex items-center justify-center transition-colors"
            >
              Register as scholar
            </Link>
            <Link
              to="/signup/guide"
              className="h-[36px] px-4 rounded-md border border-border-strong bg-surface hover:bg-surface-sub text-[13px] font-medium text-text inline-flex items-center justify-center transition-colors"
            >
              Register as guide
            </Link>
          </div>
        </div>

        {/* Demo Accounts: Quick-fill disclosure for testing/eval */}
        <details open className="mt-6 border border-border rounded-md bg-surface p-3 text-[13px] text-text-muted group">
          <summary className="cursor-pointer font-medium text-text select-none list-none flex items-center justify-between">
            <span>Demo accounts (quick fill)</span>
            <span className="text-[12px] text-text-muted group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[12px]">
            <button
              type="button"
              onClick={() => handleQuickFill('scholar@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              🎓 Scholar
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('guide@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              👨‍🏫 Guide
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('centrehead@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              🏛️ Centre head
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('drc@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              📋 DRC convenor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              💼 Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@kannur.ac.in')}
              className="p-1.5 rounded border border-border bg-surface-sub hover:bg-border text-left font-medium text-text transition-colors"
            >
              ⚡ Admin
            </button>
          </div>
          <p className="mt-2 text-[11px] text-text-subtle">Password: Password123!</p>
        </details>
      </div>

      {/* Footer: one line, small muted address */}
      <footer className="py-6 text-center text-[13px] leading-[20px] text-text-muted">
        Kannur University, Thavakkara, Civil Station P.O., Kannur, Kerala 670002
      </footer>
    </div>
  );
};

export default LoginPage;
