import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import { Search } from 'lucide-react';

export const GuidesListPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/guides');
        setGuides(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load guides.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const filtered = guides.filter((g) => {
    return (
      searchTerm === '' ||
      g.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.research_centre?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research guides"
        description="Approved research guides, departmental affiliations, and scholar vacancy slots."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Search */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border">
          <div className="relative w-full sm:w-[280px]">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by supervisor, department, centre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[40px] pl-9 pr-3 bg-surface border border-border-strong rounded-md text-[16px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
          </div>
          <span className="text-[13px] text-text-muted tabular-nums self-end sm:self-center">
            {filtered.length} guides
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            Loading research guides...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            No research guides match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Guide name</th>
                  <th className="py-2.5 px-4 font-medium">Designation</th>
                  <th className="py-2.5 px-4 font-medium">Department</th>
                  <th className="py-2.5 px-4 font-medium">Research centre</th>
                  <th className="py-2.5 px-4 font-medium">Scholar slots</th>
                  <th className="py-2.5 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((g) => {
                  const activeCount = g.active_scholars_count ?? (g.scholars ? g.scholars.length : 0);
                  const maxQuota = g.max_scholars || 8;
                  const percentUsed = Math.min(100, Math.round((activeCount / maxQuota) * 100));
                  const isFull = activeCount >= maxQuota;

                  return (
                    <tr key={g.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-text">{g.user?.full_name}</div>
                        <div className="text-[12px] text-text-muted">{g.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {g.designation?.title || 'Assistant Professor'}
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {g.department?.name || 'Department'}
                      </td>
                      <td className="py-3 px-4 text-text-muted truncate max-w-[200px]">
                        {g.research_centre?.name || 'Research Centre'}
                      </td>
                      <td className="py-3 px-4 w-52">
                        <div className="flex items-center justify-between text-[12px] mb-1 tabular-nums">
                          <span className={isFull ? 'text-danger-text font-medium' : 'text-text'}>
                            {activeCount} of {maxQuota} scholars
                          </span>
                          <span className="text-text-muted">
                            {isFull ? 'Full' : `${maxQuota - activeCount} free`}
                          </span>
                        </div>
                        <div className="w-full bg-surface-sub h-1.5 rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full ${
                              isFull ? 'bg-danger-text' : percentUsed > 75 ? 'bg-accent-600' : 'bg-success-text'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusChip status={g.registration_status || 'Approved'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidesListPage;
