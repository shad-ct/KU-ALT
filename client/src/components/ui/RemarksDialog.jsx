import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * RemarksDialog Component
 * Modern confirmation modal:
 * - radius-lg (12px), 24px padding, max-w 480px, backdrop rgba(0,0,0,0.35)
 * - Textarea min 4 rows with character counter
 * - Primary + secondary action buttons
 */
export const RemarksDialog = ({
  isOpen,
  actionType = 'APPROVE',
  actionLabel = null,
  isSubmitting = false,
  error = null,
  minLength = 5,
  maxLength = 1000,
  onConfirm,
  onCancel,
}) => {
  const [remarks, setRemarks] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRemarks('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requiresRemarks = actionType === 'REJECT' || actionType === 'RETURN';

  const defaultTitle =
    actionType === 'APPROVE'
      ? 'Confirm approval'
      : actionType === 'FORWARD'
      ? 'Endorse and forward'
      : actionType === 'VERIFY'
      ? 'Verify application'
      : actionType === 'RETURN'
      ? 'Return application for changes'
      : 'Reject application';

  const defaultDescription =
    actionType === 'RETURN'
      ? 'Explain what changes or missing documents the applicant needs to provide.'
      : actionType === 'REJECT'
      ? 'Provide a clear statutory reason for rejection.'
      : 'Add optional notes or instructions for the next officer in the approval chain.';

  const defaultActionLabel =
    actionLabel ||
    (actionType === 'APPROVE'
      ? 'Approve'
      : actionType === 'FORWARD'
      ? 'Forward'
      : actionType === 'VERIFY'
      ? 'Verify'
      : actionType === 'RETURN'
      ? 'Return for changes'
      : 'Reject');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiresRemarks && remarks.trim().length < minLength) {
      setValidationError(`Please enter a remark of at least ${minLength} characters.`);
      return;
    }
    setValidationError('');
    await onConfirm({ remarks: remarks.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px]">
      <div className="bg-surface border border-border rounded-lg shadow-menu w-full max-w-[480px] p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-text">
              {defaultTitle}
            </h3>
            <p className="text-[13px] leading-[20px] text-text-muted mt-1">
              {defaultDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-md text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Errors */}
        {(error || validationError) && (
          <div className="p-3 rounded-md bg-danger-bg text-danger-text text-[13px] flex items-center gap-2 border border-danger-text/20">
            <AlertCircle size={15} strokeWidth={1.75} />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="dialog-remarks" className="block text-[14px] font-medium text-text">
                Remarks {requiresRemarks ? '' : '(optional)'}
              </label>
              <span className="text-[12px] text-text-muted tabular-nums">
                {remarks.length}/{maxLength}
              </span>
            </div>
            <textarea
              id="dialog-remarks"
              rows={4}
              maxLength={maxLength}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                requiresRemarks
                  ? 'Enter specific remarks for the applicant...'
                  : 'Enter any remarks for the record...'
              }
              className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] leading-[24px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-md ${
                actionType === 'REJECT'
                  ? 'btn-danger'
                  : 'btn-primary'
              }`}
            >
              {isSubmitting ? 'Processing...' : defaultActionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemarksDialog;
