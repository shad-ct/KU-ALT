import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import { Download, RefreshCw } from 'lucide-react';

const REPORT_DEFINITIONS = [
  {
    key: 'active-scholars',
    title: 'Active Scholars Registry',
    description: 'Current list of all registered scholars with admission dates, guides, and departmental affiliations.',
  },
  {
    key: 'vacancies',
    title: 'Guide Vacancies & Slot Utilization',
    description: 'Breakdown of research guide quota capacity, filled slots, and remaining admissions capacity.',
  },
  {
    key: 'fellowships',
    title: 'Scholar Fellowships & Financial Aid',
    description: 'Distribution of University, UGC-JRF, CSIR, and state research fellowships across scholars.',
  },
  {
    key: 'turnaround',
    title: 'Application Turnaround Times (SLA)',
    description: 'Average processing duration per approval step across departmental and university staff stages.',
  },
  {
    key: 'at-risk',
    title: 'At-Risk Scholars Diagnostic',
    description: 'Scholars exceeding statutory duration or approaching maximum submission deadline.',
  },
  {
    key: 'guide-scholars',
    title: 'Guide-to-Scholar Supervisory Matrix',
    description: 'Detailed roster of scholars supervised by each approved university research guide.',
  },
  {
    key: 'centre-wise',
    title: 'Centre-Wise Research Census',
    description: 'Comparative distribution of research centres, active guides, and affiliated scholars.',
  },
  {
    key: 'stage-distribution',
    title: 'Academic Stage Distribution',
    description: 'Scholars classified by current milestone: Coursework, RAC Reviews, Synopsis, and Thesis.',
  },
];

export const ReportsPage = () => {
  const [selectedKey, setSelectedKey] = useState('active-scholars');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/reports/${selectedKey}`);
      setData(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedKey]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/reports/${selectedKey}/export?format=csv`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedKey}-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const currentDef = REPORT_DEFINITIONS.find((r) => r.key === selectedKey);
  const sampleItem = data.length > 0 ? data[0] : null;
  const columns = sampleItem ? Object.keys(sampleItem) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Research Reports & Analytics"
        subtitle="Parameterized aggregations, statutory university censuses, vacancy matrices, and audit-logged CSV exports."
        breadcrumbs={[
          { label: 'R&D Cell', href: '/dashboard' },
          { label: 'Reports' },
        ]}
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Report Selector Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
            Select Statutory Report
          </label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full h-10 px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REPORT_DEFINITIONS.map((def) => (
              <option key={def.key} value={def.key}>
                {def.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-end">
          <button
            type="button"
            onClick={fetchReport}
            className="h-10 px-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium transition-colors"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={16} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            disabled={exporting || loading || data.length === 0}
            onClick={handleExportCSV}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} strokeWidth={1.75} />
            <span>{exporting ? 'Generating CSV...' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{currentDef?.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{currentDef?.description}</p>
          </div>
          <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">{data.length} records</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
            Generating report data...
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
            No records found for this report criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700 text-xs h-10">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-4 font-medium whitespace-nowrap uppercase tracking-wider">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-12">
                    {columns.map((col) => {
                      const val = row[col];
                      const display =
                        typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '—');
                      const isNum = typeof val === 'number';
                      return (
                        <td
                          key={col}
                          className={`py-2.5 px-4 text-gray-900 dark:text-gray-100 whitespace-nowrap ${
                            isNum ? 'tabular-nums text-right' : ''
                          }`}
                        >
                          {display}
                        </td>
                      );
                    })}
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

export default ReportsPage;
