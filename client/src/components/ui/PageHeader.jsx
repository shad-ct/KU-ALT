import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PageHeader Component
 * Clean, calm page title block:
 * - h1 (28/36 600)
 * - 4px gap
 * - description (13/20 400 text-muted, max 1 line)
 * - 24px margin below before content
 * - NO horizontal rule under the title
 * - Optional status chip next to title
 * - Optional actions (React elements or descriptor array { label, onClick, variant, disabled, icon })
 */
export const PageHeader = ({
  title,
  subtitle,
  description,
  statusChip = null,
  actions = null,
  className = '',
}) => {
  const descText = description || subtitle;

  const renderActions = () => {
    if (!actions) return null;
    if (React.isValidElement(actions)) return actions;
    if (Array.isArray(actions)) {
      return actions.map((action, idx) => {
        if (!action) return null;
        if (React.isValidElement(action)) {
          return React.cloneElement(action, { key: action.key || idx });
        }
        if (typeof action === 'object' && action.label) {
          const isPrimary = action.variant === 'primary';
          return (
            <button
              key={action.key || idx}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`h-[36px] px-3.5 rounded-md text-[13px] font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPrimary
                  ? 'bg-accent-600 hover:bg-accent-700 text-white'
                  : 'border border-border-strong bg-surface hover:bg-surface-sub text-text'
              }`}
            >
              {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          );
        }
        return null;
      });
    }
    return null;
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[28px] leading-[36px] font-semibold text-text">
              {title}
            </h1>
            {statusChip && <div>{statusChip}</div>}
          </div>
          {descText && (
            <p className="mt-1 text-[13px] leading-[20px] text-text-muted prose-measure">
              {descText}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-shrink-0 sm:self-center">
            {renderActions()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
