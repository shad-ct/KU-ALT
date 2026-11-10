import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import ApplicationDetail from '../components/workflow/ApplicationDetail';
import api from '../api/client';
import { Search } from 'lucide-react';

export const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);
  const [availableActions, setAvailableActions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/approvals', {
        params: { q: searchQuery || undefined },
      });
      setApprovals(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load approvals queue.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationDetail = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      setActiveApplication(res.data?.data?.application);
      setAvailableActions(res.data?.data?.availableActions || []);
      setSelectedAppId(id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [searchQuery]);

  const handleActionComplete = () => {
    setSelectedAppId(null);
    setActiveApplication(null);
    fetchApprovals();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals queue"
        description="Review and decide on applications awaiting your action."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      {selectedAppId && activeApplication ? (
        <ApplicationDetail
          application={activeApplication}
          availableActions={availableActions}
          onActionComplete={handleActionComplete}
          onClose={() => {
            setSelectedAppId(null);
            setActiveApplication(null);
          }}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {/* Header & Search */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[16px] font-semibold text-text">Pending review</h2>
              <span className="text-[12px] tabular-nums text-text-muted bg-surface-sub px-2 py-0.5 rounded-sm">
                {approvals.length} applications
              </span>
            </div>

            <div className="relative w-full sm:w-[260px]">
              <Search
                size={16}
                strokeWidth={1.75}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] pl-9 pr-3 bg-surface border border-border-strong rounded-md text-[16px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              Loading approvals queue...
            </div>
          ) : approvals.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              No applications awaiting your review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Application number</th>
                    <th className="py-2.5 px-4 font-medium">Applicant</th>
                    <th className="py-2.5 px-4 font-medium">Type</th>
                    <th className="py-2.5 px-4 font-medium">Research centre</th>
                    <th className="py-2.5 px-4 font-medium">Current stage</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {approvals.map((app) => {
                    const activeStep = app.instance_steps?.find((s) => s.status === 'ACTIVE');
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-surface-sub/50 transition-colors h-[56px]"
                      >
                        <td className="py-3 px-4 ref-number whitespace-nowrap">
                          {app.application_no}
                        </td>
                        <td className="py-3 px-4 font-medium text-text">
                          {app.subject_user?.full_name || app.subject_user?.name}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {app.application_type?.name}
                        </td>
                        <td className="py-3 px-4 text-text-muted truncate max-w-[200px]">
                          {app.research_centre?.name}
                        </td>
                        <td className="py-3 px-4 text-accent-700 font-medium text-[13px]">
                          {activeStep?.name || app.current_role_code}
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip status={app.status} currentActorRole={app.current_role_code} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => loadApplicationDetail(app.id)}
                            className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
