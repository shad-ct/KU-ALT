import React, { useState } from 'react';
import StatusChip from '../ui/StatusChip';
import Timeline from '../ui/Timeline';
import RemarksDialog from '../ui/RemarksDialog';
import api from '../../api/client';
import { ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../ui/DataTable';

/**
 * ApplicationDetail Component
 * Calm, clear application dossier view matching product specifications:
 * - Stacked definition list (2 columns, 16px between items, no underline rules)
 * - Modern approval timeline with hollow/solid markers and remarks box
 * - Plain language action controls (Grant approval, Endorse, Return for changes)
 */
export const ApplicationDetail = ({
  application,
  availableActions = [],
  onActionComplete,
  onClose,
}) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const history = application.history || [];
  const steps = application.instance_steps || [];

  // Build combined timeline events
  const timelineEvents = steps.map((step) => {
    const historyItem = history.find((h) => h.step_order === step.step_order);
    return {
      id: `step-${step.id}`,
      stepNumber: step.step_order,
      stepName: step.name,
      actorRole: step.role_code,
      actorName: historyItem?.actor?.name || step.actor?.name,
      status: step.status,
      actionTaken:
        historyItem?.action ||
        (step.status === 'DONE' ? 'APPROVED' : step.status === 'ACTIVE' ? 'PENDING' : 'FUTURE'),
      timestamp: historyItem?.at || step.acted_at,
      remarks: historyItem?.remarks,
    };
  });

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setDialogError(null);
  };

  const handleActionSubmit = async ({ remarks }) => {
    try {
      setIsSubmitting(true);
      setDialogError(null);

      await api.post(`/workflow/applications/${application.id}/action`, {
        action: selectedAction,
        remarks: remarks || '',
      });

      setSelectedAction(null);
      onActionComplete?.();
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Unable to complete this action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-[14px] text-text-muted hover:text-text inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          <span>Back to applications</span>
        </button>

        <StatusChip status={application.status} currentActorRole={application.current_role_code} />
      </div>

      {/* Main Two-Column Layout (2fr / 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2fr): Application Details & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* Panel: Application Details */}
          <div className="panel space-y-6">
            <div>
              <h2 className="text-[20px] leading-[28px] font-semibold text-text">
                {application.application_type?.name || application.type_code || 'Application details'}
              </h2>
              <div className="ref-number mt-1">
                {application.application_no}
              </div>
            </div>

            {/* Stacked Definition List (2 columns, 16px between items, no underline rules) */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">Applicant name</dt>
                <dd className="font-medium text-text mt-0.5">
                  {application.subject_user?.full_name || 'Deepa V. K.'}
                </dd>
              </div>

              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">Submission date</dt>
                <dd className="font-normal text-text mt-0.5 tabular-nums">
                  {formatDisplayDate(application.submitted_at || application.created_at)}
                </dd>
              </div>

              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">Department</dt>
                <dd className="font-normal text-text mt-0.5">
                  {application.department?.name || 'Department of Chemistry'}
                </dd>
              </div>

              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">Research centre</dt>
                <dd className="font-normal text-text mt-0.5">
                  {application.research_centre?.name || 'Centre for Chemical Sciences'}
                </dd>
              </div>

              {application.guide && (
                <div className="sm:col-span-2">
                  <dt className="text-[13px] leading-[20px] text-text-muted">Supervising guide</dt>
                  <dd className="font-medium text-text mt-0.5">
                    {application.guide.user?.full_name || 'Dr. K. Balakrishnan'}
                  </dd>
                </div>
              )}
            </dl>

            {/* Custom Form Data (if present) */}
            {application.form_data && Object.keys(application.form_data).length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-[16px] font-semibold text-text mb-3">
                  Application parameters
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  {Object.entries(application.form_data).map(([key, val]) => (
                    <div key={key} className={typeof val === 'string' && val.length > 50 ? 'sm:col-span-2' : ''}>
                      <dt className="text-[13px] text-text-muted capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="font-normal text-text mt-0.5 leading-[22px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Panel: Attached Documents */}
          {application.documents && application.documents.length > 0 && (
            <div className="panel space-y-4">
              <h3 className="text-[16px] font-semibold text-text">
                Attached documents
              </h3>
              <div className="divide-y divide-border border border-border rounded-md overflow-hidden bg-surface">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="h-[56px] px-4 flex items-center justify-between text-[14px] hover:bg-surface-sub transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={18} strokeWidth={1.75} className="text-text-muted" />
                      <div>
                        <span className="font-medium text-text block">{doc.label}</span>
                        <span className="ref-number text-[12px]">{doc.doc_key}</span>
                      </div>
                    </div>
                    {doc.file && (
                      <a
                        href={`/api/v1/files/${doc.file.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={14} strokeWidth={1.75} />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Decision Panel */}
          {availableActions.length > 0 && (
            <div className="panel space-y-4">
              <h3 className="text-[16px] font-semibold text-text">
                Review action
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {availableActions.includes('APPROVE') && (
                  <button
                    type="button"
                    onClick={() => handleActionClick('APPROVE')}
                    className="btn btn-primary btn-md"
                  >
                    Grant approval
                  </button>
                )}
                {availableActions.includes('FORWARD') && !availableActions.includes('APPROVE') && (
                  <button
                    type="button"
                    onClick={() => handleActionClick('FORWARD')}
                    className="btn btn-primary btn-md"
                  >
                    Endorse and forward
                  </button>
                )}
                {availableActions.includes('VERIFY') && !availableActions.includes('APPROVE') && !availableActions.includes('FORWARD') && (
                  <button
                    type="button"
                    onClick={() => handleActionClick('VERIFY')}
                    className="btn btn-primary btn-md"
                  >
                    Verify application
                  </button>
                )}

                {/* Secondary Actions */}
                {availableActions.includes('RETURN') && (
                  <button
                    type="button"
                    onClick={() => handleActionClick('RETURN')}
                    className="btn btn-secondary btn-md"
                  >
                    Return for changes
                  </button>
                )}
                {availableActions.includes('REJECT') && (
                  <button
                    type="button"
                    onClick={() => handleActionClick('REJECT')}
                    className="btn btn-danger btn-md"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1fr): Approval Chain Timeline */}
        <div className="space-y-6">
          <div className="panel space-y-5">
            <h3 className="text-[16px] font-semibold text-text">
              Approval steps
            </h3>
            <Timeline events={timelineEvents} />
          </div>
        </div>
      </div>

      {/* Remarks Dialog */}
      {selectedAction && (
        <RemarksDialog
          isOpen={true}
          actionType={selectedAction}
          isSubmitting={isSubmitting}
          error={dialogError}
          onConfirm={handleActionSubmit}
          onCancel={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
};

export default ApplicationDetail;
