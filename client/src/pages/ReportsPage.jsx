import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import { Download, Filter, BarChart3, RefreshCw, FileText } from 'lucide-react';

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
        title="Reports & analytics"
        description="Aggregated university records, research census, vacancy matrices, and data exports."
      />

      {error && (
        <div className="p-3 bg-danger-surface text-danger-text border border-danger-text/20 rounded text-xs">
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      {/* Report Selector Header */}
      <div className="bg-surface-card border border-border-default rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <label className="text-[11px] uppercase tracking-wider text-text-muted font-medium block mb-1">
            Select Statutory Report
      <div className="bg-surface border border-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="text-[13px] text-text-muted font-medium block mb-1.5">
            Select report
          </label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full text-xs p-2 bg-surface-subtle border border-border-default rounded text-text-primary focus:outline-none focus:border-border-focus"
            className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[14px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
          >
            {REPORT_DEFINITIONS.map((def) => (
              <option key={def.key} value={def.key}>
                {def.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end">
        <div className="flex items-center gap-2.5 self-stretch sm:self-end">
          <button
            type="button"
            onClick={fetchReport}
            className="p-2 border border-border-default hover:bg-surface-subtle text-text-secondary rounded text-xs"
            title="Refresh query"
            className="h-[40px] px-3 border border-border-strong hover:bg-surface-sub text-text rounded-md text-[13px] font-medium transition-colors"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <RefreshCw size={16} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            disabled={exporting || loading || data.length === 0}
            onClick={handleExportCSV}
            className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            className="h-[40px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {exporting ? 'Generating CSV...' : 'Export to CSV'}
            <Download size={16} strokeWidth={1.75} />
            <span>{exporting ? 'Generating CSV...' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-surface-card border border-border-default rounded divide-y divide-border-subtle">
        <div className="p-4 flex items-center justify-between">
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{currentDef?.title}</h3>
            <p className="text-xs text-text-secondary">{currentDef?.description}</p>
            <h3 className="text-[16px] font-semibold text-text">{currentDef?.title}</h3>
            <p className="text-[13px] text-text-muted mt-0.5">{currentDef?.description}</p>
          </div>
          <span className="text-xs font-mono text-text-muted">{data.length} records returned</span>
          <span className="text-[13px] tabular-nums text-text-muted">{data.length} records</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-text-secondary">
            Executing parameterized SQL aggregation...
          <div className="py-20 text-center text-[14px] text-text-muted">
            Generating report data...
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-xs text-text-secondary">
            No records returned for this report criteria.
          <div className="py-20 text-center text-[14px] text-text-muted">
            No records found for this report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-secondary font-medium uppercase tracking-wider border-b border-border-subtle">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-4">
                    <th key={col} className="py-2.5 px-4 font-medium whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              <tbody className="divide-y divide-border">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                  <tr key={idx} className="hover:bg-surface-sub/50 transition-colors h-[48px]">
                    {columns.map((col) => {
                      const val = row[col];
                      const display =
                        typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '—');
                      const isNum = typeof val === 'number';
                      return (
                        <td key={col} className="py-2.5 px-4 text-text-primary">
                        <td
                          key={col}
                          className={`py-2.5 px-4 text-text whitespace-nowrap ${
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

