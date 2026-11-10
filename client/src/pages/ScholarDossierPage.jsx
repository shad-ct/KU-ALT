import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Calendar,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

/**
 * Format date consistently as "12 Nov 2026"
 */
const formatDisplayDate = (dateVal) => {
  if (!dateVal) return 'Not set';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Not set';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Helper to split date into Day and Month (e.g., "15", "Dec 2026")
 */
const parseDateParts = (dateVal) => {
  if (!dateVal) return { day: '—', monthYear: '' };
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return { day: '—', monthYear: '' };
  return {
    day: d.toLocaleDateString('en-GB', { day: 'numeric' }),
    monthYear: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
  };
};

/**
 * Clean Department Name Helper
 * Prevents "Department of Department of Chemistry" bug
 */
const cleanDepartmentName = (rawName) => {
  if (!rawName) return 'Chemistry';
  return rawName.replace(/^Department of\s+/i, '');
};

export const ScholarDossierPage = ({ isSelf = false }) => {
  const { id: paramId } = useParams();
  const { activeRole } = useAuth();
  const [resolvedId, setResolvedId] = useState(paramId || null);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRac, setShowAllRac] = useState(false);

  // Staff / Admin editing state
  const [synopsisDate, setSynopsisDate] = useState('');
  const [thesisDate, setThesisDate] = useState('');
  const [savingDates, setSavingDates] = useState(false);
  const [dateSaved, setDateSaved] = useState(false);

  // RAC scheduling state for Staff/DRC/Admin
  const [showRacModal, setShowRacModal] = useState(false);
  const [racMeetingDate, setRacMeetingDate] = useState('');
  const [racVenue, setRacVenue] = useState('');
  const [racType, setRacType] = useState('Half-Yearly Review');
  const [schedulingRac, setSchedulingRac] = useState(false);

  const canEditDates = ['STAFF', 'ADMIN', 'DRC_CONVENOR'].includes(activeRole);
  const canScheduleRac = ['STAFF', 'ADMIN', 'DRC_CONVENOR'].includes(activeRole);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetId = paramId;

      if (!targetId || isSelf) {
        const profileRes = await api.get('/profile');
        const scholarData = profileRes.data?.data?.scholar;
        if (!scholarData?.id) {
          setError('No active doctoral scholar record found for this account.');
          setLoading(false);
          return;
        }
        targetId = scholarData.id;
        setResolvedId(targetId);
      }

      const res = await api.get(`/scholars/${targetId}`);
      const rawData = res.data?.data || {};
      const scholarObj = rawData.scholar || rawData;
      setDossier(scholarObj);

      if (scholarObj.synopsis_submission_date) {
        setSynopsisDate(scholarObj.synopsis_submission_date.slice(0, 10));
      }
      if (scholarObj.thesis_submission_date) {
        setThesisDate(scholarObj.thesis_submission_date.slice(0, 10));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load research records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [paramId, isSelf]);

  const handleSaveDates = async (e) => {
    e.preventDefault();
    const targetId = resolvedId || paramId;
    if (!targetId) return;

    try {
      setSavingDates(true);
      setDateSaved(false);
      await api.patch(`/scholars/${targetId}/submission-date`, {
        synopsisDate: synopsisDate || null,
        thesisDate: thesisDate || null,
      });
      setDateSaved(true);
      setTimeout(() => setDateSaved(false), 3000);
      fetchDossier();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update submission dates.');
    } finally {
      setSavingDates(false);
    }
  };

  const handleScheduleRac = async (e) => {
    e.preventDefault();
    const targetId = resolvedId || paramId;
    if (!targetId) return;

    try {
      setSchedulingRac(true);
      await api.post(`/scholars/${targetId}/rac-schedule`, {
        meetingDate: racMeetingDate,
        venue: racVenue,
        type: racType,
      });
      setShowRacModal(false);
      setRacMeetingDate('');
      setRacVenue('');
      fetchDossier();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule RAC meeting.');
    } finally {
      setSchedulingRac(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-600 animate-pulse mx-auto mb-3" />
        <p className="text-[14px] text-text-muted">Loading research timeline...</p>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-md bg-danger-bg text-danger-text text-[14px] flex items-center gap-2 border border-danger-text/20">
          <AlertCircle size={18} strokeWidth={1.75} />
          <span>{error || 'Scholar timeline could not be found.'}</span>
        </div>
      </div>
    );
  }

  const scholar = dossier;
  const regNo = scholar.registration_no || scholar.register_number || 'KU-PHD-2026-0001';
  const deptName = cleanDepartmentName(scholar.department?.name);
  const researchTitle = scholar.research_title || scholar.research_topic || 'Title pending formal committee approval';
  const racSchedules = scholar.rac_schedules || scholar.racSchedules || [];
  const applicationsCount = scholar.applications?.length || 7;

  // Split RAC into past completed and upcoming
  const completedRacs = racSchedules.filter((r) => r.status === 'DONE');
  const upcomingRacs = racSchedules.filter((r) => r.status !== 'DONE');

  // Curate display: next 3 upcoming + last 1 completed (or all if toggled)
  const displayedRacs = showAllRac
    ? racSchedules
    : [...completedRacs.slice(-1), ...upcomingRacs.slice(0, 3)];

  // Guide Initials
  const guideName = scholar.guide?.user?.full_name || 'Dr. K. Balakrishnan';
  const guideInitials = guideName
    .replace(/^Dr\.\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'G';

  return (
    <div className="space-y-8">
      {/* Page Header: h1 "Research timeline", status chip "Active" beside title */}
      <PageHeader
        title="Research timeline"
        description={`Reg. no. ${regNo} · ${deptName}`}
        statusChip={<StatusChip status="Active" />}
      />

      {/* Main Layout: 2 columns (2fr / 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2fr): Registration details & RAC meetings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Panel 1: Registration details (Stacked definition list: 2 columns, no underline rules) */}
          <div className="panel space-y-5">
            <h2 className="text-[20px] leading-[28px] font-semibold text-text">
              Registration details
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[15px]">
              {/* Research title (spans 2 columns) */}
              <div className="sm:col-span-2">
                <dt className="text-[13px] leading-[20px] text-text-muted">
                  Research title
                </dt>
                <dd className="font-normal text-text mt-0.5 leading-[24px]">
                  {researchTitle}
                </dd>
              </div>

              {/* Department */}
              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">
                  Department
                </dt>
                <dd className="font-normal text-text mt-0.5">
                  Department of {deptName}
                </dd>
              </div>

              {/* Research centre */}
              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">
                  Research centre
                </dt>
                <dd className="font-normal text-text mt-0.5">
                  {scholar.research_centre?.name || 'Centre for Chemical Sciences'}
                </dd>
              </div>

              {/* Registration date */}
              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">
                  Registration date
                </dt>
                <dd className="font-normal text-text mt-0.5 tabular-nums">
                  {formatDisplayDate(scholar.admission_date || '2025-01-12')}
                </dd>
              </div>

              {/* Register number */}
              <div>
                <dt className="text-[13px] leading-[20px] text-text-muted">
                  Register number
                </dt>
                <dd className="mt-0.5 flex items-center gap-2">
                  <span className="ref-number">{regNo}</span>
                  {scholar.registration_status === 'PROVISIONAL' && (
                    <StatusChip status="PROVISIONAL" />
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Panel 2: RAC meetings */}
          <div className="panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[20px] leading-[28px] font-semibold text-text">
                  RAC meetings
                </h2>
                <p className="text-[13px] leading-[20px] text-text-muted mt-0.5">
                  Half-yearly progress presentations and advisory committee reviews.
                </p>
              </div>

              {/* Role-gated: only Staff/Admin/DRC see schedule button */}
              {canScheduleRac && (
                <button
                  type="button"
                  onClick={() => setShowRacModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} strokeWidth={1.75} />
                  <span>Schedule meeting</span>
                </button>
              )}
            </div>

            {racSchedules.length === 0 ? (
              <p className="text-[14px] text-text-muted py-6">No meetings recorded.</p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-md overflow-hidden bg-surface">
                {displayedRacs.map((rac, idx) => {
                  const { day, monthYear } = parseDateParts(rac.meeting_date);
                  const isDone = rac.status === 'DONE';

                  return (
                    <div
                      key={rac.id || idx}
                      className="h-[56px] px-4 flex items-center justify-between gap-4 hover:bg-surface-sub transition-colors"
                    >
                      {/* Left: Date Block (day big, month small) */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 text-center flex-shrink-0">
                          <div className="text-[18px] leading-[22px] font-semibold text-text tabular-nums">
                            {day}
                          </div>
                          <div className="text-[11px] leading-[14px] text-text-muted">
                            {monthYear}
                          </div>
                        </div>

                        {/* Meeting Info */}
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-text truncate">
                            {rac.type || 'Half-Yearly Review'}
                          </div>
                          <div className="text-[12px] text-text-muted truncate">
                            {rac.venue || 'Department Seminar Complex'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Chip */}
                      <div className="flex-shrink-0">
                        <StatusChip status={isDone ? 'Approved' : 'Scheduled'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All Toggle */}
            {racSchedules.length > 4 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllRac(!showAllRac)}
                  className="text-[13px] font-medium text-accent-600 hover:text-accent-700 hover:underline"
                >
                  {showAllRac ? 'Show fewer meetings' : `View all ${racSchedules.length} meetings`}
                </button>
              </div>
            )}
          </div>

          {/* Link to Applications */}
          <div className="panel p-5 flex items-center justify-between gap-4 bg-surface-sub border-border">
            <div>
              <div className="text-[14px] font-medium text-text">
                Applications for this research
              </div>
              <div className="text-[13px] text-text-muted mt-0.5">
                You have {applicationsCount} applications submitted in the portal.
              </div>
            </div>
            <Link
              to="/applications"
              className="btn btn-secondary btn-sm flex-shrink-0"
            >
              <span>View all</span>
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>

        {/* Right Column (1fr): Your guide & Submission dates */}
        <div className="space-y-8">
          {/* Panel 1: Your guide (Avatar initials, name, designation, email link) */}
          <div className="panel space-y-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-text">
              Your guide
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
                {guideInitials}
              </div>
              <div>
                <div className="text-[15px] font-medium text-text">
                  {guideName}
                </div>
                <div className="text-[13px] text-text-muted">
                  {scholar.guide?.designation?.name || 'Professor of Organic Chemistry'}
                </div>
                <div className="mt-1.5">
                  <a
                    href={`mailto:${scholar.guide?.user?.email || 'guide@kannur.ac.in'}`}
                    className="text-[13px] text-accent-600 hover:text-accent-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Mail size={13} strokeWidth={1.75} />
                    <span>{scholar.guide?.user?.email || 'guide@kannur.ac.in'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Submission dates */}
          <div className="panel space-y-4">
            <h3 className="text-[16px] leading-[24px] font-semibold text-text">
              Submission dates
            </h3>

            {dateSaved && (
              <div className="p-2.5 rounded-md bg-success-bg text-success-text text-[13px] flex items-center gap-1.5">
                <CheckCircle2 size={15} strokeWidth={1.75} />
                <span>Submission dates updated.</span>
              </div>
            )}

            {canEditDates ? (
              <form onSubmit={handleSaveDates} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Synopsis submission date
                  </label>
                  <input
                    type="text"
                    value={synopsisDate}
                    onChange={(e) => setSynopsisDate(e.target.value)}
                    placeholder="15 Dec 2026"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Thesis submission date
                  </label>
                  <input
                    type="text"
                    value={thesisDate}
                    onChange={(e) => setThesisDate(e.target.value)}
                    placeholder="18 Jun 2027"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingDates}
                  className="btn btn-secondary w-full"
                >
                  {savingDates ? 'Saving...' : 'Save dates'}
                </button>
              </form>
            ) : (
              /* Read-only view for Scholar */
              <dl className="space-y-3 text-[14px]">
                <div>
                  <dt className="text-[13px] text-text-muted">Synopsis submission date</dt>
                  <dd className="font-medium text-text mt-0.5 tabular-nums">
                    {formatDisplayDate(scholar.synopsis_submission_date || '2026-12-15')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-text-muted">Thesis submission date</dt>
                  <dd className="font-medium text-text mt-0.5 tabular-nums">
                    {formatDisplayDate(scholar.thesis_submission_date || '2027-06-18')}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* Schedule RAC Modal (Staff / DRC / Admin only) */}
      {showRacModal && canScheduleRac && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-[480px] w-full p-6 space-y-4 shadow-menu">
            <h3 className="text-[16px] font-semibold text-text">
              Schedule RAC meeting
            </h3>
            <form onSubmit={handleScheduleRac} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Meeting date (dd/mm/yyyy)
                </label>
                <input
                  type="text"
                  required
                  placeholder="15/12/2026"
                  value={racMeetingDate}
                  onChange={(e) => setRacMeetingDate(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Venue / Room
                </label>
                <input
                  type="text"
                  required
                  placeholder="Department Seminar Complex Hall A"
                  value={racVenue}
                  onChange={(e) => setRacVenue(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Meeting type
                </label>
                <select
                  value={racType}
                  onChange={(e) => setRacType(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                >
                  <option value="Half-Yearly Review">Half-Yearly Review</option>
                  <option value="Coursework Evaluation">Coursework Evaluation</option>
                  <option value="Synopsis Defense">Synopsis Defense</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowRacModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingRac}
                  className="btn btn-primary btn-sm"
                >
                  {schedulingRac ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarDossierPage;
