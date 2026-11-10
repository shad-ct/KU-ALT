import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage Component
 * Calm, plain language 404 page
 */
export const NotFoundPage = () => {
  return (
    <div className="max-w-[560px] bg-surface border border-border rounded-lg p-6 sm:p-8 mt-6">
      <h1 className="text-[24px] leading-[32px] font-semibold text-text mb-2">
        Page not found
      </h1>
      <p className="text-[14px] leading-[22px] text-text-muted mb-6">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="pt-4 border-t border-border flex items-center gap-4">
        <Link
          to="/dashboard"
          className="h-[40px] px-4 inline-flex items-center text-[13px] font-medium rounded-md bg-accent-600 hover:bg-accent-700 text-white transition-colors"
        >
          Back to dashboard
        </Link>
        <Link
          to="/applications"
          className="text-[13px] text-accent-600 hover:text-accent-700 font-medium transition-colors"
        >
          View applications →
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
