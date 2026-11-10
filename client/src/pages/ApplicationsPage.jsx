import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import DataTable, { formatDisplayDate } from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusChip from '../components/ui/StatusChip';
import ApplicationDetail from '../components/workflow/ApplicationDetail';
import api from '../api/client';
import { Plus } from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'RETURNED', label: 'Returned' },
  { key: 'REJECTED', label: 'Rejected' },
];

export const ApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);
  const [availableActions, setAvailableActions] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/applications');
      setApplications(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load applications.');
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
      setError(err.response?.data?.message || 'Unable to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const queryId = searchParams.get('id');
    if (queryId) {
      loadApplicationDetail(queryId);
    }
  }, [searchParams]);

  const handleActionComplete = () => {
    setSelectedAppId(null);
    setActiveApplication(null);
    setSearchParams({});
    fetchApplications();
  };

  const handleCloseDetail = () => {
    setSelectedAppId(null);
    setActiveApplication(null);
    setSearchParams({});
  };

  // Filter by tab and search query
  const filteredApps = applications.filter((app) => {
    if (activeTab !== 'ALL' && app.status !== activeTab) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const no = (app.application_no || '').toLowerCase();
      const type = (app.application_type?.name || '').toLowerCase();
      const subject = (app.subject_user?.full_name || '').toLowerCase();
      return no.includes(q) || type.includes(q) || subject.includes(q);
    }
    return true;
  });

  // Calculate tab counts
  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count:
      tab.key === 'ALL'
        ? applications.length
        : applications.filter((a) => a.status === tab.key).length,
  }));

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
      header: 'Applicant',
      key: 'subject',
      render: (_, row) => (
        <span className="text-text">
          {row.subject_user?.full_name || 'Deepa V. K.'}
        </span>
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
    <div className="space-y-6">
      {/* If an application is selected, show the detail drawer/view */}
      {selectedAppId && activeApplication ? (
        <ApplicationDetail
          application={activeApplication}
          availableActions={availableActions}
          onActionComplete={handleActionComplete}
          onClose={handleCloseDetail}
        />
      ) : (
        <>
          <PageHeader
            title="Applications"
            description="Track submissions and approvals for your research."
          />

          {error && (
            <div className="p-3 rounded-md bg-danger-bg text-danger-text text-[13px] border border-danger-text/20">
              {error}
            </div>
          )}

          <FilterBar
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by application or number..."
          />

          <DataTable
            columns={columns}
            data={filteredApps}
            isLoading={loading}
            emptyTitle="No applications found"
            emptyMessage={
              searchQuery
                ? `No applications matched "${searchQuery}".`
                : 'There are no applications in this category.'
            }
            onRowClick={(row) => {
              setSearchParams({ id: row.id });
              loadApplicationDetail(row.id);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ApplicationsPage;
