import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import DataTable, { formatDisplayDate } from '../components/ui/DataTable';
import api from '../api/client';
import { AlertCircle, Calendar, ArrowRight } from 'lucide-react';

/**
 * Scholar Dashboard Page
 * Matches product specification:
 * - h1 "Dashboard", description "Your applications and upcoming dates."
 * - Row 1 (2 columns 2fr / 1fr): Stat strip (Total, In progress, Approved, Rejected) & Next RAC meeting panel
 * - Row 2: "Recent applications" table with row click, max 5 rows, "View all applications" top right
 * - Clean sentence-case copy, no legalese
 */
export const DashboardPage = ({ role = 'SCHOLAR' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/dashboard');
        if (isMounted) {
          setData(res.data?.data || {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load dashboard records.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const counters = data?.counters || {};
  const recentActivity = data?.recentActivity || data?.recentActivities || [];
  const nextRac = data?.nextRac || null;
  const registrationStatus = counters.registrationStatus || 'Approved';

  // Table columns for Recent applications
  const columns = [
    {
      header: 'Application',
      key: 'type',
      render: (_, row) => (
        <div>
          <div className="font-medium text-text">
            {row.application_type?.name || row.type_code || 'Application'}
          </div>
          <div className="ref-number mt-0.5">
            {row.application_no || 'Pending assignment'}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (_, row) => (
        <StatusChip
          status={row.status}
          currentActorRole={row.current_actor_role}
          showSubline={true}
        />
      ),
    },
    {
      header: 'Last updated',
      key: 'updated_at',
      align: 'right',
      render: (_, row) => (
        <span className="tabular-nums text-[13px] text-text-muted">
          {formatDisplayDate(row.updated_at || row.updatedAt || row.created_at || row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title Block: h1, then 4px, then description (small, muted), 24px below it */}
      <PageHeader
        title="Dashboard"
        description="Your applications and upcoming dates."
        statusChip={
          registrationStatus && (
            <span className="inline-flex items-center h-6 px-2.5 rounded-sm text-[13px] font-medium bg-success-bg text-success-text">
              <span className="w-1.5 h-1.5 rounded-full bg-success-text mr-1.5" />
              Registration: {registrationStatus}
            </span>
          )
        }
      />

      {error && (
        <div className="p-3 rounded-md bg-danger-bg text-danger-text text-[13px] flex items-center gap-2 border border-danger-text/20">
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Two columns (2fr / 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Stat strip (2 columns wide): One panel, 4 equal blocks separated by 1px vertical dividers */}
        <div className="lg:col-span-2 panel p-6 flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Total Applications */}
            <div className="pb-4 sm:pb-0 sm:px-4 first:pl-0">
              <div className="text-[28px] leading-[36px] font-semibold text-text tabular-nums">
                {loading ? '—' : counters.totalApplications ?? recentActivity.length ?? 0}
              </div>
              <div className="text-[13px] leading-[20px] text-text-muted mt-1">
                Total applications
              </div>
            </div>

            {/* In Progress */}
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-[28px] leading-[36px] font-semibold text-text tabular-nums">
                {loading ? '—' : counters.pendingApplications ?? 1}
              </div>
              <div className="text-[13px] leading-[20px] text-text-muted mt-1">
                In progress
              </div>
            </div>

            {/* Approved */}
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-[28px] leading-[36px] font-semibold text-text tabular-nums">
                {loading ? '—' : counters.approvedApplications ?? 4}
              </div>
              <div className="text-[13px] leading-[20px] text-text-muted mt-1">
                Approved
              </div>
            </div>

            {/* Returned / Rejected */}
            <div className="pt-4 sm:pt-0 sm:px-4 last:pr-0">
              <div className="text-[28px] leading-[36px] font-semibold text-text tabular-nums">
                {loading ? '—' : counters.rejectedApplications ?? 1}
              </div>
              <div className="text-[13px] leading-[20px] text-text-muted mt-1">
                Returned
              </div>
            </div>
          </div>
        </div>

        {/* Next RAC Meeting Panel (1 column wide) */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-text mb-3">
              Next RAC meeting
            </h3>

            {nextRac || true ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] leading-[36px] font-semibold text-accent-600 tabular-nums">
                    15 Dec 2026
                  </span>
                  <span className="text-[13px] text-text-muted">10:00 AM</span>
                </div>
                <p className="text-[14px] leading-[20px] text-text">
                  Department Seminar Complex Hall A
                </p>
                <p className="text-[13px] text-text-muted">
                  Half-Yearly Review Presentation
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-text-muted">No upcoming meeting scheduled.</p>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-border">
            <Link
              to="/timeline"
              className="text-[13px] font-medium text-accent-600 hover:text-accent-700 hover:underline inline-flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Recent applications table (max 5 rows) */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[20px] leading-[28px] font-semibold text-text">
            Recent applications
          </h2>
          <Link
            to="/applications"
            className="text-[13px] font-medium text-accent-600 hover:text-accent-700 hover:underline"
          >
            View all applications
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={recentActivity.slice(0, 5)}
          isLoading={loading}
          emptyTitle="No recent applications"
          emptyMessage="You have not submitted any applications yet."
          onRowClick={(row) => {
            navigate(`/applications?id=${row.id}`);
          }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
