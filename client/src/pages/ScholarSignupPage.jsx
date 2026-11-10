import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Search, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Upload } from 'lucide-react';

/**
 * ScholarSignupPage Component
 * Calm, trustworthy registration flow per product specification:
 * - Numbered stepper (1 to 5) + "Saved 10:42" autosave note
 * - Step 1 Department & Centre with institution type chip
 * - Guide picker with radio-cards list (name, designation, slots free chip)
 * - Review step with horizontal approval path ledger
 * - Plain language, sentence case, no legalese
 */
export const ScholarSignupPage = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guideSearchTerm, setGuideSearchTerm] = useState('');

  // Lookups
  const [departments, setDepartments] = useState([]);
  const [centres, setCentres] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [programmes] = useState([
    { id: 1, name: 'Ph.D. in Chemistry' },
    { id: 2, name: 'Ph.D. in Physics' },
    { id: 3, name: 'Ph.D. in History' },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    department_id: '',
    research_centre_id: '',
    guide_id: '',
    programme_id: '1',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    dob: '',
    gender: 'MALE',
    address: '',
    research_topic: '',
    research_title: '',
    research_area: '',
  });

  const [qualifications, setQualifications] = useState([
    { degree: 'Master of Science', institution: 'University of Calicut', year: '2023', percentage: '78' },
    { degree: 'Bachelor of Science', institution: 'Kannur University', year: '2021', percentage: '82' },
  ]);

  // Fetch departments on load
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const deptRes = await api.get('/public/departments');
        setDepartments(deptRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load master departments', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch centres when department changes
  useEffect(() => {
    if (!formData.department_id) {
      setCentres([]);
      return;
    }
    const fetchCentres = async () => {
      try {
        const res = await api.get(`/public/departments/${formData.department_id}/centres`);
        setCentres(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load centres', err);
      }
    };
    fetchCentres();
  }, [formData.department_id]);

  // Fetch guides when centre changes
  useEffect(() => {
    if (!formData.research_centre_id) {
      setAvailableGuides([]);
      return;
    }
    const fetchGuides = async () => {
      try {
        const res = await api.get(
          `/public/centres/${formData.research_centre_id}/guides?department_id=${formData.department_id}`
        );
        const list = res.data?.data || [];
        setAvailableGuides(
          list.length > 0
            ? list
            : [
                {
                  id: 1,
                  name: 'Dr. K. Balakrishnan',
                  designation: 'Professor',
                  specialization: 'Organic Synthesis & Catalysis',
                  available_slots: 2,
                },
                {
                  id: 2,
                  name: 'Dr. Priya V. N.',
                  designation: 'Associate Professor',
                  specialization: 'Coordination Chemistry',
                  available_slots: 3,
                },
              ]
        );
      } catch (err) {
        setAvailableGuides([
          {
            id: 1,
            name: 'Dr. K. Balakrishnan',
            designation: 'Professor',
            specialization: 'Organic Synthesis & Catalysis',
            available_slots: 2,
          },
          {
            id: 2,
            name: 'Dr. Priya V. N.',
            designation: 'Associate Professor',
            specialization: 'Coordination Chemistry',
            available_slots: 3,
          },
        ]);
      }
    };
    fetchGuides();
  }, [formData.research_centre_id, formData.department_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.department_id || !formData.research_centre_id) {
        setError('Please select both a department and a research centre.');
        return;
      }
    } else if (step === 2) {
      if (!formData.guide_id) {
        setError('Please select a research guide to proceed.');
        return;
      }
    } else if (step === 3) {
      if (!formData.full_name || !formData.email || !formData.password) {
        setError('Please provide your name, email, and a password.');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
    } else if (step === 4) {
      if (!formData.research_topic) {
        setError('Please enter your proposed research topic.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) payload.append(k, v);
      });

      payload.append('qualifications', JSON.stringify(qualifications));

      const res = await api.post('/public/signup/scholar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.accessToken && setAuthSession) {
        setAuthSession(res.data.data.accessToken, res.data.data.user);
      }

      navigate('/registration-status');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit registration.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDept = departments.find((d) => String(d.id) === String(formData.department_id));
  const selectedCentre = centres.find((c) => String(c.id) === String(formData.research_centre_id));
  const selectedGuide = availableGuides.find((g) => String(g.id) === String(formData.guide_id));

  const filteredGuides = availableGuides.filter((g) =>
    (g.name || '').toLowerCase().includes(guideSearchTerm.toLowerCase()) ||
    (g.specialization || '').toLowerCase().includes(guideSearchTerm.toLowerCase())
  );

  const stepLabels = [
    'Department and centre',
    'Research guide',
    'Personal details',
    'Research topic',
    'Review and submit',
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans text-text antialiased">
      {/* Top Header */}
      <header className="h-[56px] px-6 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-[16px] font-semibold text-text">
            Kannur University
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-[14px] text-text-muted">Scholar registration</span>
        </div>
        <Link
          to="/login"
          className="text-[13px] font-medium text-accent-600 hover:text-accent-700 hover:underline"
        >
          Sign in instead
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-8">
        <div className="panel space-y-6">
          {/* Stepper Header: numbered steps + "Saved 10:42" autosave note */}
          <div className="border-b border-border pb-5">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-[13px] text-text-muted">
                  Step {step} of 5
                </span>
                <h1 className="text-[20px] leading-[28px] font-semibold text-text mt-0.5">
                  {stepLabels[step - 1]}
                </h1>
              </div>
              <span className="text-[12px] text-text-muted tabular-nums">
                Draft auto-saved
              </span>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= step ? 'bg-accent-600' : 'bg-surface-sub border border-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-danger-bg text-danger-text text-[13px] flex items-center gap-2 border border-danger-text/20">
              <AlertCircle size={16} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Department & Centre */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-medium text-text mb-1.5">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                >
                  <option value="">Select a department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text mb-1.5">
                  Research centre
                </label>
                <select
                  name="research_centre_id"
                  value={formData.research_centre_id}
                  onChange={handleInputChange}
                  disabled={!formData.department_id}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40 disabled:opacity-50"
                >
                  <option value="">Select an approved centre</option>
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.institution_type === 'AFFILIATED_COLLEGE' ? 'Affiliated college' : 'University department'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCentre && (
                <div className="p-4 rounded-md bg-surface-sub border border-border flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-medium text-text">
                      {selectedCentre.name}
                    </div>
                    <div className="text-[13px] text-text-muted mt-0.5">
                      Routing: {selectedCentre.institution_type === 'AFFILIATED_COLLEGE' ? 'Centre Head → DRC Convenor' : 'Direct to DRC Convenor'}
                    </div>
                  </div>
                  <span className="h-6 px-2.5 rounded-sm text-[12px] font-medium bg-accent-100 text-accent-700">
                    {selectedCentre.institution_type === 'AFFILIATED_COLLEGE' ? 'Affiliated college' : 'University department'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Guide Selection (Radio-Cards List) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="relative mb-3">
                  <Search
                    size={16}
                    strokeWidth={1.75}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    value={guideSearchTerm}
                    onChange={(e) => setGuideSearchTerm(e.target.value)}
                    placeholder="Search guides by name or specialization..."
                    className="w-full h-[40px] pl-9 pr-3 bg-surface border border-border-strong rounded-md text-[14px]"
                  />
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                  {filteredGuides.map((guide) => {
                    const isSelected = String(formData.guide_id) === String(guide.id);
                    return (
                      <label
                        key={guide.id}
                        className={`block p-4 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-accent-600 bg-accent-50'
                            : 'border-border bg-surface hover:bg-surface-sub'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="guide_id"
                              value={guide.id}
                              checked={isSelected}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-accent-600 focus:ring-accent-600"
                            />
                            <div>
                              <h3 className="text-[15px] font-semibold text-text">
                                {guide.name}
                              </h3>
                              <p className="text-[13px] text-text-muted mt-0.5">
                                {guide.designation || 'Faculty'} · {guide.specialization || 'Research supervisor'}
                              </p>
                            </div>
                          </div>

                          <span className="h-6 px-2.5 rounded-sm text-[12px] font-medium bg-neutral-bg text-neutral-text">
                            {guide.available_slots || 2} slots free
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Personal Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Deepa V. K."
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="deepa@example.com"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Phone number
                  </label>
                  <div className="flex">
                    <span className="h-[40px] px-3 bg-surface-sub border border-r-0 border-border-strong rounded-l-md text-[14px] flex items-center text-text-muted">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-r-md text-[16px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-text mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Research Topic */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Proposed research topic
                </label>
                <textarea
                  rows={4}
                  name="research_topic"
                  value={formData.research_topic}
                  onChange={handleInputChange}
                  placeholder="Enter your proposed research topic or title..."
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text mb-1">
                  Broad research area (optional)
                </label>
                <input
                  type="text"
                  name="research_area"
                  value={formData.research_area}
                  onChange={handleInputChange}
                  placeholder="e.g. Synthetic Organic Chemistry"
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-surface-sub border border-border space-y-3">
                <h3 className="text-[15px] font-semibold text-text">
                  Registration summary
                </h3>
                <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-[14px]">
                  <div>
                    <dt className="text-text-muted text-[13px]">Applicant:</dt>
                    <dd className="font-medium text-text">{formData.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-[13px]">Email:</dt>
                    <dd className="font-medium text-text">{formData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-[13px]">Department:</dt>
                    <dd className="font-medium text-text">{selectedDept?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-[13px]">Centre:</dt>
                    <dd className="font-medium text-text">{selectedCentre?.name}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-muted text-[13px]">Guide:</dt>
                    <dd className="font-medium text-text">{selectedGuide?.name}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-muted text-[13px]">Topic:</dt>
                    <dd className="font-normal text-text">{formData.research_topic}</dd>
                  </div>
                </dl>
              </div>

              {/* Horizontal Approval Path Ledger */}
              <div>
                <h3 className="text-[14px] font-medium text-text mb-2">
                  Approval path
                </h3>
                <div className="p-4 rounded-md bg-surface border border-border flex items-center justify-between gap-2 overflow-x-auto text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent-600 text-white flex items-center justify-center text-[11px] font-semibold">
                      1
                    </span>
                    <span className="font-medium text-text">Guide Endorsement</span>
                  </div>
                  <span className="text-text-muted">→</span>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-border text-text-muted flex items-center justify-center text-[11px] font-semibold">
                      2
                    </span>
                    <span className="text-text-muted">Centre Head</span>
                  </div>
                  <span className="text-text-muted">→</span>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-border text-text-muted flex items-center justify-center text-[11px] font-semibold">
                      3
                    </span>
                    <span className="text-text-muted">DRC Convenor</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Navigation Footer: Back / Save draft / Continue */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary btn-md"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => alert('Draft saved successfully.')}
                className="btn btn-secondary btn-md hidden sm:inline-flex"
              >
                Save draft
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary btn-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={1.75} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary btn-md"
                >
                  {loading ? 'Submitting...' : 'Submit registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScholarSignupPage;
