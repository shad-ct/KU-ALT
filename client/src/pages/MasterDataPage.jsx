import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';

export const MasterDataPage = () => {
  const [activeTab, setActiveTab] = useState('centres');
  const [departments, setDepartments] = useState([]);
  const [centres, setCentres] = useState([]);
  const [appTypes, setAppTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [deptsRes, centresRes, typesRes] = await Promise.all([
          api.get('/master/departments'),
          api.get('/master/centres'),
          api.get('/master/application-types'),
        ]);

        setDepartments(deptsRes.data?.data || []);
        setCentres(centresRes.data?.data || []);
        setAppTypes(typesRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master records"
        description="Academic departments, recognized research centres, and service application types."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-surface-sub p-1 rounded-md border border-border inline-flex items-center gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'centres'}
            onClick={() => setActiveTab('centres')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'centres'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Research centres ({centres.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'departments'}
            onClick={() => setActiveTab('departments')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'departments'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'types'}
            onClick={() => setActiveTab('types')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'types'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Application types ({appTypes.length})
          </button>
        </div>
      </div>

      {/* Tab: Research Centres */}
      {activeTab === 'centres' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-sub/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-text">
              Recognized research centres
            </span>
            <span className="text-[12px] text-text-muted">
              Affiliated colleges require an assigned Centre Head to accept registrations.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Centre code</th>
                  <th className="py-2.5 px-4 font-medium">Centre name</th>
                  <th className="py-2.5 px-4 font-medium">Department</th>
                  <th className="py-2.5 px-4 font-medium">Institution type</th>
                  <th className="py-2.5 px-4 font-medium">Centre head</th>
                  <th className="py-2.5 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-text-muted text-[14px]">
                      Loading research centres...
                    </td>
                  </tr>
                ) : (
                  centres.map((c) => {
                    const isAffiliated = c.institution_type === 'AFFILIATED_COLLEGE';
                    const hasHead = !!c.centre_head_user_id;

                    return (
                      <tr key={c.id} className="hover:bg-surface-sub/50 transition-colors h-[52px]">
                        <td className="py-3 px-4 ref-number">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-text">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {c.department?.name || `Dept #${c.department_id}`}
                        </td>
                        <td className="py-3 px-4 text-[13px]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-sm font-medium ${
                              isAffiliated
                                ? 'bg-warning-bg text-warning-text'
                                : 'bg-accent-50 text-accent-700'
                            }`}
                          >
                            {isAffiliated ? 'Affiliated college' : 'University department'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {c.centre_head ? (
                            <span className="text-text font-medium">{c.centre_head.full_name}</span>
                          ) : isAffiliated ? (
                            <span className="text-danger-text font-medium text-[12px]">
                              Head unassigned
                            </span>
                          ) : (
                            <span className="text-text-subtle text-[12px]">Direct to DRC</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <StatusChip
                            status={!isAffiliated || hasHead ? 'APPROVED' : 'REJECTED'}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-sub/50 text-[13px] font-semibold text-text">
            Academic departments
          </div>
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Department code</th>
                <th className="py-2.5 px-4 font-medium">Department name</th>
                <th className="py-2.5 px-4 font-medium">DRC convenor</th>
                <th className="py-2.5 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-surface-sub/50 h-[52px]">
                  <td className="py-3 px-4 ref-number">{d.code}</td>
                  <td className="py-3 px-4 font-medium text-text">{d.name}</td>
                  <td className="py-3 px-4 text-text-muted">
                    {d.drc_convenor?.full_name || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusChip status={d.is_active ? 'APPROVED' : 'CANCELLED'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Application Types */}
      {activeTab === 'types' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-sub/50 text-[13px] font-semibold text-text">
            Standard research service application types
          </div>
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Type code</th>
                <th className="py-2.5 px-4 font-medium">Service name</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appTypes.map((t) => (
                <tr key={t.id} className="hover:bg-surface-sub/50 h-[52px]">
                  <td className="py-3 px-4 ref-number">{t.code}</td>
                  <td className="py-3 px-4 font-medium text-text">{t.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[12px] px-2 py-0.5 rounded-sm bg-surface-sub text-text-muted">
                      {t.kind}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusChip status="APPROVED" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MasterDataPage;
