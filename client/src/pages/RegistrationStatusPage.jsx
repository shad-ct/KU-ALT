import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import Timeline from '../components/ui/Timeline';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';

export const RegistrationStatusPage = () => {
  const { user, logout } = useAuth();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resubmit modal state
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [resubmitTopic, setResubmitTopic] = useState('');
  const [resubmitRemarks, setResubmitRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/registration/status');
      const data = res.data?.data;
      setStatusData(data);
      if (data?.application?.form_data?.research_topic) {
        setResubmitTopic(data.application.form_data.research_topic);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load registration status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleResubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.patch('/registration/resubmit', {
        research_topic: resubmitTopic,
        applicant_resubmit_remarks: resubmitRemarks,
      });
      setIsResubmitOpen(false);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Resubmission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-[14px] text-text-muted">
        Loading registration status...
      </div>
    );
  }

  const app = statusData?.application;
  const currentStep = statusData?.currentStep;
  const isReturned = statusData?.isReturned;
  const isRejected = statusData?.isRejected;
  const isApproved = statusData?.isApproved;

  // Build timeline events
  const steps = app?.instance_steps || [];
  const history = app?.history || [];

  const timelineEvents = steps.map((step) => {
    const historyItem = history.find((h) => h.step_order === step.step_order);
    return {
      id: `step-${step.id}`,
      stepNumber: step.step_order,
      stepName: step.name,
      actorRole: step.role_code,
      actorName: historyItem?.actor?.full_name || step.actor?.full_name,
      status: step.status,
      actionTaken: historyItem?.action || (step.status === 'DONE' ? 'APPROVED' : step.status === 'ACTIVE' ? 'PENDING' : 'FUTURE'),
      timestamp: historyItem?.at || step.acted_at,
      remarks: historyItem?.remarks,
    };
  });

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6">
      <div className="max-w-[880px] mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h1 className="text-[16px] font-semibold text-text">
              Kannur University
            </h1>
            <span className="text-[13px] text-text-muted">
              Research and Development Cell
            </span>
          </div>

          <div className="flex items-center gap-3 text-[13px]">
            <span className="text-text-muted hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="h-[32px] px-3 rounded-md border border-border-strong text-text hover:bg-surface-sub bg-surface font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
            {error}
          </div>
        )}

        {app ? (
          <>
            <PageHeader
              title="Registration status"
              description={`Reference number: ${app.application_no} · Submitted on ${
                app.submitted_at
                  ? new Date(app.submitted_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
              }`}
              statusChip={
                <StatusChip
                  status={app.status}
                  currentActorRole={app.current_role_code}
                />
              }
            />

            {/* Dynamic Status Banner */}
            {isReturned ? (
              <div className="p-5 rounded-lg border border-warning-text/30 bg-warning-bg text-warning-text space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-text" />
                  <h2 className="text-[16px] font-semibold">
                    Action required: Application returned for changes
                  </h2>
                </div>
                <div className="text-[14px] text-text leading-relaxed pl-4">
                  <span>Remarks from the reviewing committee:</span>
                  <div className="mt-1.5 p-3 bg-surface rounded-md border border-border text-text font-normal">
                    {app.rejection_reason || 'Please review observations and submit updated details.'}
                  </div>
                </div>
                <div className="pl-4 pt-1">
                  <button
                    onClick={() => setIsResubmitOpen(true)}
                    className="h-[36px] px-4 rounded-md bg-accent-600 hover:bg-accent-700 text-white font-medium text-[13px] transition-colors inline-flex items-center gap-2"
                  >
                    <span>Update registration and resubmit</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ) : isRejected ? (
              <div className="p-5 rounded-lg border border-danger-text/30 bg-danger-bg text-danger-text space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger-text" />
                  <h2 className="text-[16px] font-semibold">Application rejected</h2>
                </div>
                <p className="text-[14px] text-text leading-relaxed pl-4">
                  Reason recorded in official decision:{' '}
                  <strong>{app.rejection_reason || 'Criteria not met.'}</strong>
                </p>
              </div>
            ) : isApproved ? (
              <div className="p-5 rounded-lg border border-success-text/30 bg-success-bg text-success-text space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                  <h2 className="text-[16px] font-semibold">
                    Your Ph.D. registration is approved
                  </h2>
                </div>
                <p className="text-[14px] text-text leading-relaxed pl-6">
                  Your university scholar account is active. You can now access your research dashboard.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-lg border border-border bg-surface space-y-2">
                <div className="flex items-center gap-2 text-accent-700 font-semibold text-[15px]">
                  <span className="w-2 h-2 rounded-full bg-accent-600" />
                  <h2>
                    In progress · Waiting on {currentStep?.name || app.current_role_code}
                  </h2>
                </div>
                <p className="text-[14px] text-text-muted leading-relaxed pl-4">
                  Your registration application has been submitted and is currently in the review queue.
                </p>
              </div>
            )}

            {/* Main Content: Timeline & Submitted Particulars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Col: Timeline (2 cols) */}
              <div className="md:col-span-2 bg-surface border border-border rounded-lg p-6">
                <h3 className="text-[16px] font-semibold text-text mb-5">
                  Approval timeline
                </h3>
                <Timeline events={timelineEvents} />
              </div>

              {/* Right Col: Summary Card */}
              <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
                <h3 className="text-[16px] font-semibold text-text">
                  Application details
                </h3>

                <div className="space-y-4 text-[14px]">
                  <div>
                    <span className="text-[13px] text-text-muted block">Department</span>
                    <span className="font-medium text-text mt-0.5 block">
                      {app.department?.name || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[13px] text-text-muted block">Research centre</span>
                    <span className="font-medium text-text mt-0.5 block">
                      {app.research_centre?.name || '—'}
                    </span>
                  </div>

                  {app.guide && (
                    <div>
                      <span className="text-[13px] text-text-muted block">Assigned guide</span>
                      <span className="font-medium text-text mt-0.5 block">
                        {app.guide.user?.full_name}
                      </span>
                    </div>
                  )}

                  {app.scholar?.programme && (
                    <div>
                      <span className="text-[13px] text-text-muted block">Programme</span>
                      <span className="font-medium text-text mt-0.5 block">
                        {app.scholar.programme.name}
                      </span>
                    </div>
                  )}

                  {app.form_data?.research_topic && (
                    <div>
                      <span className="text-[13px] text-text-muted block">Proposed topic</span>
                      <span className="font-medium text-text mt-0.5 block leading-normal">
                        {app.form_data.research_topic}
                      </span>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents */}
                {app.documents && app.documents.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <span className="text-[13px] font-semibold text-text block mb-2">
                      Attached documents
                    </span>
                    <div className="space-y-2 text-[13px]">
                      {app.documents.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-2.5 rounded-md bg-surface-sub border border-border"
                        >
                          <span className="truncate max-w-[150px] font-medium text-text">
                            {d.label}
                          </span>
                          <span className="text-[12px] text-text-muted">
                            Uploaded
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-surface border border-border rounded-lg text-[14px] text-text-muted">
            No registration record found for this account.
          </div>
        )}

        {/* Resubmission Modal */}
        {isResubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35">
            <div className="bg-surface border border-border rounded-lg shadow-dialog w-full max-w-lg p-6">
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-[18px] font-semibold text-text">
                    Update registration and resubmit
                  </h3>
                  <p className="text-[13px] text-text-muted mt-0.5">
                    Address the committee's remarks and update your details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResubmitOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub transition-colors"
                  aria-label="Close"
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>

              <form onSubmit={handleResubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1.5">
                    Updated research topic
                  </label>
                  <input
                    type="text"
                    value={resubmitTopic}
                    onChange={(e) => setResubmitTopic(e.target.value)}
                    required
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text mb-1.5">
                    Response to reviewer remarks
                  </label>
                  <textarea
                    rows={3}
                    value={resubmitRemarks}
                    onChange={(e) => setResubmitRemarks(e.target.value)}
                    placeholder="Explain the changes made in response to reviewer remarks..."
                    className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsResubmitOpen(false)}
                    disabled={isSubmitting}
                    className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[36px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Resubmitting...' : 'Resubmit application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationStatusPage;
