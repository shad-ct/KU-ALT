import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import DataTable from '../components/ui/DataTable';
import Timeline from '../components/ui/Timeline';
import RemarksDialog from '../components/ui/RemarksDialog';
import { Search, Eye, EyeOff, Upload, Plus, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Dev Styleguide Page (/dev/styleguide)
 * Comprehensive living system demonstration:
 * 1. Type scale
 * 2. Colour swatches with verified contrast ratios
 * 3. Spacing scale
 * 4. Buttons (all variants, sizes, states)
 * 5. Input types (text, email, password with toggle, phone with +91 chip, date, select, textarea, file dropzone)
 * 6. Status chips (all statuses + sublines)
 * 7. Table with 12 realistic rows + pagination
 * 8. Approval chain timeline
 * 9. Dialog & empty states
 */
export const StyleguidePage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tablePage, setTablePage] = useState(1);

  // Sample 12 rows of realistic university data
  const sampleRows = [
    { id: 1, no: 'KU-RDC/2026/TC/00142', title: 'Ph.D. Title Change', applicant: 'Deepa V. K.', status: 'IN_PROGRESS', role: 'GUIDE', date: '2026-11-04' },
    { id: 2, no: 'KU-RDC/2026/EXT/00089', title: 'Registration Period Extension', applicant: 'Rahul M.', status: 'APPROVED', role: null, date: '2026-10-24' },
    { id: 3, no: 'KU-RDC/2026/RAC/00201', title: 'RAC Review Presentation', applicant: 'Deepa V. K.', status: 'APPROVED', role: null, date: '2026-06-25' },
    { id: 4, no: 'KU-RDC/2026/LV/00055', title: 'Scholar Leave Application', applicant: 'Ananya S.', status: 'APPROVED', role: null, date: '2026-08-05' },
    { id: 5, no: 'KU-RDC/2026/GC/00031', title: 'Research Guide Transfer', applicant: 'Deepa V. K.', status: 'RETURNED', role: 'GUIDE', date: '2026-07-28' },
    { id: 6, no: 'KU-RDC/2026/CND/00018', title: 'Attendance Condonation', applicant: 'Fathima N.', status: 'APPROVED', role: null, date: '2026-05-18' },
    { id: 7, no: 'KU-RDC/2026/PS/00009', title: 'Pre-Submission & Thesis Clearance', applicant: 'Deepa V. K.', status: 'DRAFT', role: null, date: '2026-11-06' },
    { id: 8, no: 'KU-RDC/2026/TC/00140', title: 'Ph.D. Title Change', applicant: 'Gopika R.', status: 'REJECTED', role: null, date: '2026-09-14' },
    { id: 9, no: 'KU-RDC/2026/RAC/00195', title: 'RAC Review Presentation', applicant: 'Muhammed A.', status: 'APPROVED', role: null, date: '2026-06-18' },
    { id: 10, no: 'KU-RDC/2026/LV/00049', title: 'Scholar Leave Application', applicant: 'Sreejith K.', status: 'APPROVED', role: null, date: '2026-04-12' },
    { id: 11, no: 'KU-RDC/2026/EXT/00081', title: 'Registration Period Extension', applicant: 'Kavitha P.', status: 'IN_PROGRESS', role: 'CENTRE_HEAD', date: '2026-10-18' },
    { id: 12, no: 'KU-RDC/2026/REG/00001', title: 'Scholar Registration', applicant: 'Deepa V. K.', status: 'APPROVED', role: null, date: '2025-01-12' },
  ];

  const tableColumns = [
    {
      header: 'Application',
      key: 'title',
      render: (_, r) => (
        <div>
          <div className="font-medium text-text">{r.title}</div>
          <div className="ref-number mt-0.5">{r.no}</div>
        </div>
      ),
    },
    { header: 'Applicant', key: 'applicant' },
    {
      header: 'Status',
      key: 'status',
      render: (_, r) => <StatusChip status={r.status} currentActorRole={r.role} showSubline={true} />,
    },
    {
      header: 'Date',
      key: 'date',
      align: 'right',
      render: (v) => <span className="tabular-nums text-[13px] text-text-muted">{v}</span>,
    },
  ];

  const timelineEvents = [
    { stepName: 'Guide Endorsement', actorName: 'Dr. K. Balakrishnan', actorRole: 'Guide', status: 'DONE', actionTaken: 'APPROVED', timestamp: '2026-11-04T10:00:00Z', remarks: 'Recommended for committee review.' },
    { stepName: 'Research Centre Head Verification', actorName: 'Dr. M. S. Varma', actorRole: 'Centre Head', status: 'ACTIVE', actionTaken: 'PENDING', timestamp: null, remarks: null },
    { stepName: 'DRC Convenor Final Approval', actorName: 'Dr. P. T. Joseph', actorRole: 'DRC Convenor', status: 'WAITING', actionTaken: 'FUTURE', timestamp: null, remarks: null },
  ];

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        title="Design System & Styleguide"
        description="Specifications for the calm, modern, trustworthy Kannur University product interface."
      />

      {/* 1. Type Scale */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">1. Type Scale (Public Sans)</h2>
        <div className="divide-y divide-border space-y-4">
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">Display · 32px / 40px line-height, 600 weight</span>
            <div className="text-[32px] leading-[40px] font-semibold text-text mt-1">
              Kannur University Research & Development
            </div>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">h1 · 28px / 36px, 600 weight</span>
            <div className="text-[28px] leading-[36px] font-semibold text-text mt-1">
              Dashboard Overview & Academic Record
            </div>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">h2 · 20px / 28px, 600 weight</span>
            <div className="text-[20px] leading-[28px] font-semibold text-text mt-1">
              Recent Applications and Review Deadlines
            </div>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">h3 · 16px / 24px, 600 weight</span>
            <div className="text-[16px] leading-[24px] font-semibold text-text mt-1">
              Research Advisory Committee Presentation Details
            </div>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">body · 15px / 24px, 400 weight</span>
            <p className="text-[15px] leading-[24px] font-normal text-text mt-1 prose-measure">
              Doctoral research scholars must submit their half-yearly progress report to the designated Research Advisory Committee within thirty days of the meeting date.
            </p>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">small · 13px / 20px, 400 weight (500 for headers/captions)</span>
            <p className="text-[13px] leading-[20px] text-text-muted mt-1">
              Showing 1-10 of 12 records · Registered under Ordinance 2026
            </p>
          </div>
          <div className="pt-3">
            <span className="text-[12px] text-text-muted">Reference mono · JetBrains Mono 13px, text-muted</span>
            <p className="ref-number mt-1">
              KU-RDC/2026/RAC/00142
            </p>
          </div>
        </div>
      </section>

      {/* 2. Colour Swatches & Contrast Ratios */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">2. Colours & Contrast Ratios (All &ge; 4.5:1)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          {/* Surface Page */}
          <div className="p-4 rounded-md bg-bg border border-border">
            <div className="font-medium text-text">Page Background</div>
            <div className="text-text-muted text-[12px]">#F7F7F5</div>
            <div className="mt-2 text-[12px] text-text font-medium">Text on bg: 14.8:1 (AAA)</div>
          </div>

          {/* Panel Surface */}
          <div className="p-4 rounded-md bg-surface border border-border">
            <div className="font-medium text-text">Surface / Panel</div>
            <div className="text-text-muted text-[12px]">#FFFFFF</div>
            <div className="mt-2 text-[12px] text-text font-medium">Text on surface: 16.5:1 (AAA)</div>
          </div>

          {/* Primary Accent */}
          <div className="p-4 rounded-md bg-accent-600 text-white">
            <div className="font-medium text-white">Accent Primary</div>
            <div className="text-white/80 text-[12px]">#1F4E8C</div>
            <div className="mt-2 text-[12px] text-white font-medium">White on accent: 8.4:1 (AAA)</div>
          </div>

          {/* Accent Hover */}
          <div className="p-4 rounded-md bg-accent-700 text-white">
            <div className="font-medium text-white">Accent Hover</div>
            <div className="text-white/80 text-[12px]">#183F73</div>
            <div className="mt-2 text-[12px] text-white font-medium">White on hover: 11.2:1 (AAA)</div>
          </div>

          {/* Success */}
          <div className="p-4 rounded-md bg-success-bg border border-success-text/20">
            <div className="font-medium text-success-text">Success</div>
            <div className="text-success-text text-[12px]">#1B6B3A / #E8F4EC</div>
            <div className="mt-2 text-[12px] text-success-text font-medium">Contrast: 5.2:1 (AA)</div>
          </div>

          {/* Warning */}
          <div className="p-4 rounded-md bg-warning-bg border border-warning-text/20">
            <div className="font-medium text-warning-text">Warning / Returned</div>
            <div className="text-warning-text text-[12px]">#8A5A00 / #FDF3DC</div>
            <div className="mt-2 text-[12px] text-warning-text font-medium">Contrast: 4.8:1 (AA)</div>
          </div>

          {/* Danger */}
          <div className="p-4 rounded-md bg-danger-bg border border-danger-text/20">
            <div className="font-medium text-danger-text">Danger / Rejected</div>
            <div className="text-danger-text text-[12px]">#B3261E / #FBEAE8</div>
            <div className="mt-2 text-[12px] text-danger-text font-medium">Contrast: 5.8:1 (AA)</div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-md bg-info-bg border border-info-text/20">
            <div className="font-medium text-info-text">Info / In progress</div>
            <div className="text-info-text text-[12px]">#1F4E8C / #EEF3FA</div>
            <div className="mt-2 text-[12px] text-info-text font-medium">Contrast: 7.5:1 (AAA)</div>
          </div>
        </div>
      </section>

      {/* 3. Buttons */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">3. Button Variants & Sizes</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button type="button" className="btn btn-primary btn-lg">Primary Large (48px)</button>
            <button type="button" className="btn btn-primary btn-md">Primary Medium (40px)</button>
            <button type="button" className="btn btn-primary btn-sm">Primary Small (32px)</button>
            <button type="button" disabled className="btn btn-primary btn-md">Disabled</button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button type="button" className="btn btn-secondary btn-lg">Secondary Large (48px)</button>
            <button type="button" className="btn btn-secondary btn-md">Secondary Medium (40px)</button>
            <button type="button" className="btn btn-secondary btn-sm">Secondary Small (32px)</button>
            <button type="button" className="btn btn-ghost btn-md">Ghost Action</button>
            <button type="button" className="btn btn-danger btn-md">Destructive Action</button>
          </div>
        </div>
      </section>

      {/* 4. Inputs */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">4. Form Inputs (16px font prevents mobile zoom)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Full name
            </label>
            <input
              type="text"
              placeholder="e.g. Deepa V. K."
              defaultValue="Deepa V. K."
              className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text"
            />
            <p className="mt-1 text-[13px] text-text-muted">Enter your name as registered in university records.</p>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="scholar@kannur.ac.in"
              defaultValue="scholar@kannur.ac.in"
              className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Phone number
            </label>
            <div className="flex">
              <span className="h-[40px] px-3 bg-surface-sub border border-r-0 border-border-strong rounded-l-md text-[14px] flex items-center text-text-muted">
                +91
              </span>
              <input
                type="tel"
                defaultValue="9876543210"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-r-md text-[16px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Password with toggle
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                defaultValue="Password123!"
                className="w-full h-[40px] pl-3 pr-10 bg-surface border border-border-strong rounded-md text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-[40px] px-3 flex items-center justify-center text-text-muted hover:text-text"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Date input (dd/mm/yyyy format)
            </label>
            <input
              type="text"
              defaultValue="15/12/2026"
              placeholder="15/12/2026"
              className="w-full sm:w-[280px] h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
            />
            <p className="mt-1 text-[13px] text-text-muted">Indian standard date format.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[14px] font-medium text-text mb-1.5">
              Supporting documents upload
            </label>
            <div className="border-2 border-dashed border-border-strong rounded-lg p-6 text-center hover:bg-surface-sub/50 transition-colors">
              <Upload size={24} className="mx-auto text-text-muted mb-2" />
              <div className="text-[14px] font-medium text-text">Drag files here or Browse</div>
              <div className="text-[12px] text-text-muted mt-1">PDF or JPEG, max 10MB</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Status Chips */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">5. Status Chips (Sentence Case, Soft Background)</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusChip status="Draft" />
          <StatusChip status="In progress" currentActorRole="DRC_CONVENOR" showSubline={false} />
          <StatusChip status="Approved" />
          <StatusChip status="Returned" />
          <StatusChip status="Rejected" />
          <StatusChip status="Scheduled" />
          <StatusChip status="Pending approval" />
        </div>
      </section>

      {/* 6. DataTable */}
      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold text-text">6. Table Component (12 Rows, 44px Header, 56px Rows)</h2>
        <DataTable
          columns={tableColumns}
          data={sampleRows}
          pagination={{
            page: tablePage,
            limit: 10,
            total: sampleRows.length,
            totalPages: 2,
            onPageChange: setTablePage,
          }}
          onRowClick={(r) => alert(`Clicked row: ${r.no}`)}
        />
      </section>

      {/* 7. Timeline */}
      <section className="panel space-y-5">
        <h2 className="text-[20px] font-semibold text-text">7. Approval Timeline</h2>
        <Timeline events={timelineEvents} />
      </section>

      {/* 8. Dialog Trigger */}
      <section className="panel space-y-4">
        <h2 className="text-[20px] font-semibold text-text">8. Confirmation Dialog</h2>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="btn btn-secondary btn-md"
        >
          Open endorsement dialog
        </button>

        {dialogOpen && (
          <RemarksDialog
            isOpen={dialogOpen}
            actionType="FORWARD"
            onConfirm={async ({ remarks }) => {
              alert(`Action confirmed with remarks: "${remarks}"`);
              setDialogOpen(false);
            }}
            onCancel={() => setDialogOpen(false)}
          />
        )}
      </section>
    </div>
  );
};

export default StyleguidePage;
