import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import { Search } from 'lucide-react';

export const ScholarsListPage = () => {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/scholars');
        setScholars(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch scholars list.');
      } finally {
        setLoading(false);
      }
    };
    fetchScholars();
  }, []);

  const filtered = scholars.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.research_topic?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scholars"
        description="Directory of enrolled doctoral scholars, academic guides, and registration tenures."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Controls */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border">
          <div className="relative w-full sm:w-[280px]">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, reg no, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[40px] pl-9 pr-3 bg-surface border border-border-strong rounded-md text-[16px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <span className="text-[13px] text-text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[14px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SYNOPSIS_SUBMITTED">Synopsis submitted</option>
              <option value="THESIS_SUBMITTED">Thesis submitted</option>
              <option value="AWARDED">Awarded</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            Loading scholar records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            No scholars match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Register number</th>
                  <th className="py-2.5 px-4 font-medium">Scholar name</th>
                  <th className="py-2.5 px-4 font-medium">Department / Centre</th>
                  <th className="py-2.5 px-4 font-medium">Research guide</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Admission date</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                    <td className="py-3 px-4 ref-number whitespace-nowrap">
                      {s.register_number || 'Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-text">{s.user?.full_name}</div>
                      <div className="text-[12px] text-text-muted">{s.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      <div>{s.department?.name || 'Department'}</div>
                      <div className="text-[12px] text-text-muted truncate max-w-[200px]">
                        {s.research_centre?.name || 'Centre'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text">
                      {s.guide?.user?.full_name || 'Assigned guide'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-text-muted tabular-nums">
                      {s.admission_date
                        ? new Date(s.admission_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/scholars/${s.id}`}
                        className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text inline-flex items-center transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarsListPage;
