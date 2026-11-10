import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import {
  FileText,
  Building,
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  X,
  CheckCircle,
} from 'lucide-react';

const SERVICES = [
  {
    code: 'TITLE_CHANGE',
    title: 'Change of research topic or title',
    category: 'Academic revision',
    icon: FileText,
    description: 'Application to modify the approved doctoral dissertation title or research scope.',
    requirements: [
      'Recommendation of RAC meeting',
      'Detailed rationale and synopsis comparison',
      'Approval from Research Guide and DRC Convenor',
    ],
    fields: [
      { name: 'proposedTitle', label: 'Proposed new title', type: 'text', required: true },
      { name: 'reason', label: 'Justification', type: 'textarea', required: true },
      { name: 'racMeetingDate', label: 'RAC meeting date', type: 'date', required: false },
    ],
  },
  {
    code: 'CENTRE_CHANGE',
    title: 'Change of research centre',
    category: 'Institutional transfer',
    icon: Building,
    description: 'Transfer research admission and laboratory affiliation from one recognized centre to another.',
    requirements: [
      'No Objection Certificate (NOC) from parent centre',
      'Acceptance letter from target research centre',
      'Recommendation from DRC',
    ],
    fields: [
      { name: 'targetCentreId', label: 'Target research centre ID', type: 'number', required: true },
      { name: 'transferReason', label: 'Reason for transfer', type: 'textarea', required: true },
    ],
  },
  {
    code: 'GUIDE_CHANGE',
    title: 'Change or addition of guide',
    category: 'Supervision',
    icon: UserCheck,
    description: 'Formal request for reassignment of research guide, or addition of an approved co-guide.',
    requirements: [
      'Consent of proposed guide and NOC of existing guide',
      'DRC validation of supervisor slot availability',
    ],
    fields: [
      { name: 'newGuideId', label: 'Proposed guide ID', type: 'number', required: true },
      {
        name: 'isCoGuide',
        label: 'Type of change',
        type: 'select',
        options: ['Change guide', 'Add co-guide'],
        required: true,
      },
      { name: 'justification', label: 'Supervisory justification', type: 'textarea', required: true },
    ],
  },
  {
    code: 'LEAVE',
    title: 'Leave of absence',
    category: 'Scholar leave',
    icon: Calendar,
    description: 'Application for sanctioned academic leave, maternity leave, or medical hiatus.',
    requirements: [
      'Supporting medical certificate or official requisition',
      'Recommendation of supervising guide',
    ],
    fields: [
      {
        name: 'leaveType',
        label: 'Leave category',
        type: 'select',
        options: ['Medical', 'Maternity', 'Academic visit', 'Personal hiatus'],
        required: true,
      },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
      { name: 'reason', label: 'Reason for leave', type: 'textarea', required: true },
    ],
  },
  {
    code: 'EXTENSION',
    title: 'Extension of registration tenure',
    category: 'Tenure',
    icon: Clock,
    description: 'Request extension beyond 5 years (Full-Time) or 6 years (Part-Time) up to statutory limit.',
    requirements: [
      'Comprehensive RAC progress report',
      'Publications / chapter submission evidence',
      'Fee payment receipts for extended semesters',
    ],
    fields: [
      {
        name: 'requestedSemesters',
        label: 'Extension duration',
        type: 'select',
        options: ['1 Semester (6 months)', '2 Semesters (1 year)'],
        required: true,
      },
      { name: 'workRemaining', label: 'Status of pending research', type: 'textarea', required: true },
      { name: 'targetSubmissionDate', label: 'Target thesis submission date', type: 'date', required: true },
    ],
  },
  {
    code: 'CONDONATION',
    title: 'Condonation of attendance shortage',
    category: 'Waiver',
    icon: AlertTriangle,
    description: 'Condonation request for documented coursework attendance deficiency.',
    requirements: [
      'Coursework coordinator attendance log',
      'Medical certificate or duty certificate',
    ],
    fields: [
      { name: 'shortagePercent', label: 'Shortage percentage', type: 'number', required: true },
      { name: 'paperCode', label: 'Coursework paper code', type: 'text', required: true },
      { name: 'reason', label: 'Grounds for condonation', type: 'textarea', required: true },
    ],
  },
  {
    code: 'PRE_SUBMISSION',
    title: 'Pre-submission presentation clearance',
    category: 'Thesis clearance',
    icon: Layers,
    description: 'Approval to convene pre-submission seminar and proceed towards final thesis evaluation.',
    requirements: [
      'Successful coursework completion certificates',
      'Two peer-reviewed journal publications',
      'RAC clearance meeting minutes',
    ],
    fields: [
      { name: 'racClearanceDate', label: 'RAC clearance date', type: 'date', required: true },
      { name: 'journalTitle1', label: 'First publication details', type: 'text', required: true },
      { name: 'journalTitle2', label: 'Second publication details', type: 'text', required: true },
    ],
  },
  {
    code: 'COURSEWORK_EXEMPTION',
    title: 'Coursework exemption request',
    category: 'Coursework',
    icon: Award,
    description: 'Exemption from specific coursework papers on basis of qualifying M.Phil. degree.',
    requirements: [
      'M.Phil. degree certificate and marks card',
      'Research methodology syllabus equivalence endorsement',
    ],
    fields: [
      { name: 'mphilUniversity', label: 'University awarded M.Phil.', type: 'text', required: true },
      { name: 'mphilYear', label: 'Year of award', type: 'number', required: true },
      { name: 'exemptPapers', label: 'Papers for which exemption is claimed', type: 'textarea', required: true },
    ],
  },
];

export const ServicesCatalogPage = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setFormData({});
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setFormData({});
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type_code: selectedService.code,
        form_data: formData,
      };

      const res = await api.post('/applications', payload);
      setSuccess({
        message: 'Your application has been submitted successfully.',
        applicationNo: res.data?.data?.application_no || 'Submitted',
      });

      setTimeout(() => {
        handleCloseModal();
        navigate('/applications');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for services"
        description="Choose a service to submit an application or update your research details."
      />

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.code}
              className="bg-surface border border-border hover:border-border-strong rounded-lg p-5 flex flex-col justify-between transition-colors shadow-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-medium text-text-muted bg-surface-sub px-2.5 py-0.5 rounded-sm">
                    {srv.category}
                  </span>
                  <div className="p-1.5 bg-surface-sub rounded text-text-muted">
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                </div>

                <h3 className="text-[16px] leading-[22px] font-semibold text-text mb-2">
                  {srv.title}
                </h3>
                <p className="text-[14px] leading-[20px] text-text-muted mb-4">
                  {srv.description}
                </p>

                <div className="border-t border-border pt-3 mb-5">
                  <div className="text-[13px] font-medium text-text mb-2">
                    Requirements
                  </div>
                  <ul className="space-y-1.5">
                    {srv.requirements.map((req, idx) => (
                      <li key={idx} className="text-[13px] leading-[18px] text-text-muted flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-600 mt-1.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenModal(srv)}
                className="w-full h-[40px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text flex items-center justify-center gap-2 transition-colors"
              >
                <span>Apply for service</span>
                <ArrowRight size={14} strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Apply Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <div className="ref-number text-[12px] text-text-muted mb-1">
                  {selectedService.code}
                </div>
                <h2 className="text-[20px] leading-[26px] font-semibold text-text">
                  {selectedService.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub transition-colors"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-success-bg text-success-text border border-success-text/20 rounded-md text-[13px] flex items-center gap-2.5">
                <CheckCircle size={18} strokeWidth={1.75} className="flex-shrink-0" />
                <div>
                  <div className="font-medium">{success.message}</div>
                  <div className="ref-number text-[12px] mt-0.5">Reference: {success.applicationNo}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedService.fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    {f.label} {f.required && <span className="text-danger-text">*</span>}
                  </label>

                  {f.type === 'textarea' ? (
                    <textarea
                      required={f.required}
                      rows={3}
                      value={formData[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                      className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                      placeholder={`Enter ${f.label.toLowerCase()}...`}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={formData[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                      className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                    >
                      <option value="">Select option...</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={formData[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                      className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                      placeholder={`Enter ${f.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="h-[40px] px-4 border border-border-strong text-[13px] font-medium text-text hover:bg-surface-sub rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[40px] px-5 bg-accent-600 hover:bg-accent-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesCatalogPage;
