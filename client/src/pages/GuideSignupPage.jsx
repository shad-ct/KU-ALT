import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Upload } from 'lucide-react';

export const GuideSignupPage = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Master Data Lookups
  const [departments, setDepartments] = useState([]);
  const [centres, setCentres] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [approvalPath, setApprovalPath] = useState(null);
  const [canAcceptSignups, setCanAcceptSignups] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    department_id: '',
    research_centre_id: '',
    designation_id: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    phone_alt: '',
    bio: '',
  });

  const [qualifications, setQualifications] = useState([
    { degree: 'Ph.D.', institution: '', year: '' },
    { degree: 'Master of Science', institution: '', year: '' },
  ]);

  const [specializations, setSpecializations] = useState(['']);
  const [files, setFiles] = useState({});
  const [declaration, setDeclaration] = useState(false);

  // Fetch departments on load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/public/departments');
        setDepartments(res.data?.data || []);
      } catch (err) {
        setError('Failed to load academic departments.');
      }
    };
    fetchDepartments();
  }, []);

  // Fetch centres when department changes
  useEffect(() => {
    if (!formData.department_id) {
      setCentres([]);
      setApprovalPath(null);
      return;
    }

    const fetchCentres = async () => {
      try {
        const res = await api.get(`/public/departments/${formData.department_id}/centres`);
        setCentres(res.data?.data || []);
      } catch (err) {
        setError('Failed to load research centres.');
      }
    };
    fetchCentres();
  }, [formData.department_id]);

  // Determine approval path when centre changes
  useEffect(() => {
    if (!formData.research_centre_id) {
      setApprovalPath(null);
      setCanAcceptSignups(true);
      return;
    }

    const centre = centres.find((c) => c.id === parseInt(formData.research_centre_id, 10));
    if (!centre) return;

    if (centre.institution_type === 'AFFILIATED_COLLEGE') {
      if (!centre.centre_head_user_id) {
        setCanAcceptSignups(false);
        setApprovalPath(null);
      } else {
        setCanAcceptSignups(true);
        setApprovalPath([
          { order: 1, name: 'Centre Head', role: 'CENTRE_HEAD' },
          { order: 2, name: 'DRC Convenor', role: 'DRC_CONVENOR' },
        ]);
      }
    } else {
      setCanAcceptSignups(true);
      setApprovalPath([{ order: 1, name: 'DRC Convenor', role: 'DRC_CONVENOR' }]);
    }
  }, [formData.research_centre_id, centres]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQualificationChange = (index, field, value) => {
    const updated = [...qualifications];
    updated[index][field] = value;
    setQualifications(updated);
  };

  const addQualification = () => {
    setQualifications([...qualifications, { degree: '', institution: '', year: '' }]);
  };

  const handleSpecChange = (index, value) => {
    const updated = [...specializations];
    updated[index] = value;
    setSpecializations(updated);
  };

  const addSpecialization = () => {
    setSpecializations([...specializations, '']);
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.department_id || !formData.research_centre_id) {
        setError('Please select both a department and a research centre.');
        return;
      }
      if (!canAcceptSignups) {
        setError('Registration cannot proceed through this centre.');
        return;
      }
    } else if (step === 2) {
      if (!formData.full_name || !formData.email || !formData.password) {
        setError('Please complete all required fields.');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declaration) {
      setError('Please accept the declaration before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });
      dataPayload.append('qualifications', JSON.stringify(qualifications));
      dataPayload.append('specializations', JSON.stringify(specializations.filter(Boolean)));

      Object.keys(files).forEach((key) => {
        dataPayload.append(key, files[key]);
      });

      const res = await api.post('/auth/signup/guide', dataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const authData = res.data?.data;
      if (authData && setAuthSession) {
        setAuthSession(authData);
      }
      navigate('/registration-status');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCentre = centres.find((c) => c.id === parseInt(formData.research_centre_id, 10));

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-[720px] w-full mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <h1 className="text-[20px] leading-[28px] font-semibold text-text">
            Kannur University
          </h1>
          <p className="text-[13px] leading-[20px] text-text-muted mt-0.5">
            Research and Development Cell · Guideship application
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          {/* Stepper Progress Indicator */}
          <div className="mb-6 pb-4 border-b border-border flex items-center justify-between">
            <span className="text-[14px] font-medium text-text">
              Step {step} of 4 ·{' '}
              {step === 1
                ? 'Department & centre'
                : step === 2
                ? 'Personal details'
                : step === 3
                ? 'Qualifications'
                : 'Review & documents'}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-colors ${
                    i <= step ? 'bg-accent-600' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 text-[13px] bg-danger-bg border border-danger-text/20 text-danger-text rounded-md">
              {error}
            </div>
          )}

          {/* STEP 1: Institutional Affiliation */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                  Department *
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                >
                  <option value="">Select university department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                  Research centre *
                </label>
                <select
                  name="research_centre_id"
                  value={formData.research_centre_id}
                  onChange={handleInputChange}
                  disabled={!formData.department_id}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40 disabled:opacity-50"
                >
                  <option value="">Select recognized research centre</option>
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.institution_type === 'AFFILIATED_COLLEGE' ? 'Affiliated college' : 'University department'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCentre && (
                <div className="p-4 rounded-lg border border-border bg-surface-sub text-[13px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text">Centre classification:</span>
                    <span className="px-2.5 py-0.5 rounded-sm bg-surface border border-border text-text font-medium text-[12px]">
                      {selectedCentre.institution_type === 'AFFILIATED_COLLEGE'
                        ? 'Affiliated college'
                        : 'University department'}
                    </span>
                  </div>

                  {!canAcceptSignups ? (
                    <div className="text-danger-text font-medium">
                      Notice: This affiliated college does not currently have a registered Centre Head. Registrations cannot proceed until a Centre Head is appointed.
                    </div>
                  ) : (
                    approvalPath && (
                      <div className="pt-2 border-t border-border">
                        <span className="font-medium text-text block mb-1.5">
                          Approval path:
                        </span>
                        <div className="flex items-center gap-2 text-[12px] text-text-muted">
                          <span>Applicant</span>
                          {approvalPath.map((ap) => (
                            <React.Fragment key={ap.order}>
                              <span>→</span>
                              <span className="text-accent-700 font-medium">{ap.name}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Candidate Particulars */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Full name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. K. Raman"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Designation
                  </label>
                  <select
                    name="designation_id"
                    value={formData.designation_id}
                    onChange={handleInputChange}
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  >
                    <option value="">Select designation</option>
                    <option value="1">Assistant Professor</option>
                    <option value="2">Associate Professor</option>
                    <option value="3">Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                  Email address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@kannur.ac.in"
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 8 characters"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Confirm password *
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Mobile number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 94471 00000"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                    Alternate phone
                  </label>
                  <input
                    type="text"
                    name="phone_alt"
                    value={formData.phone_alt}
                    onChange={handleInputChange}
                    placeholder="Optional alternate"
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                  Academic bio & research profile
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief summary of teaching & research experience..."
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Qualifications & Specializations */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-text">
                    Educational qualifications
                  </h3>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="text-[13px] text-accent-600 hover:text-accent-700 font-medium"
                  >
                    + Add degree
                  </button>
                </div>

                <div className="space-y-3">
                  {qualifications.map((q, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-surface-sub"
                    >
                      <input
                        type="text"
                        placeholder="Degree (e.g. Ph.D.)"
                        value={q.degree}
                        onChange={(e) => handleQualificationChange(idx, 'degree', e.target.value)}
                        className="h-[40px] px-3 rounded-md border border-border-strong bg-surface text-[14px] text-text focus:outline-none focus:border-accent-600"
                      />
                      <input
                        type="text"
                        placeholder="University / institution"
                        value={q.institution}
                        onChange={(e) => handleQualificationChange(idx, 'institution', e.target.value)}
                        className="h-[40px] px-3 rounded-md border border-border-strong bg-surface text-[14px] text-text focus:outline-none focus:border-accent-600"
                      />
                      <input
                        type="number"
                        placeholder="Year of award"
                        value={q.year}
                        onChange={(e) => handleQualificationChange(idx, 'year', e.target.value)}
                        className="h-[40px] px-3 rounded-md border border-border-strong bg-surface text-[14px] text-text focus:outline-none focus:border-accent-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-text">
                    Research specializations
                  </h3>
                  <button
                    type="button"
                    onClick={addSpecialization}
                    className="text-[13px] text-accent-600 hover:text-accent-700 font-medium"
                  >
                    + Add area
                  </button>
                </div>

                <div className="space-y-3">
                  {specializations.map((spec, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder="e.g. Organic Synthesis, Phytochemistry"
                      value={spec}
                      onChange={(e) => handleSpecChange(idx, e.target.value)}
                      className="w-full h-[40px] px-3 rounded-md border border-border-strong bg-surface text-[14px] text-text focus:outline-none focus:border-accent-600"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Documents Upload & Final Review */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-[14px] font-semibold text-text mb-3">
                  Required documents (PDF, max 10MB each)
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-border bg-surface-sub text-[13px]">
                    <label className="block font-medium text-text mb-1.5">
                      Ph.D. degree certificate *
                    </label>
                    <input
                      type="file"
                      name="phd_certificate"
                      onChange={handleFileChange}
                      className="text-[13px] text-text-muted"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surface-sub text-[13px]">
                    <label className="block font-medium text-text mb-1.5">
                      Appointment / service certificate *
                    </label>
                    <input
                      type="file"
                      name="service_certificate"
                      onChange={handleFileChange}
                      className="text-[13px] text-text-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Review Box */}
              <div className="p-4 rounded-lg border border-border bg-surface-sub text-[13px] space-y-2">
                <h4 className="font-medium text-text">
                  Application summary
                </h4>
                <div>
                  <span className="text-text-muted">Applicant: </span>
                  <strong className="text-text font-medium">{formData.full_name}</strong> ({formData.email})
                </div>
                <div>
                  <span className="text-text-muted">Affiliated centre: </span>
                  <strong className="text-text font-medium">{selectedCentre?.name}</strong>
                </div>

                {approvalPath && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-text-muted block mb-1">Approval path:</span>
                    <div className="flex items-center gap-2 text-[12px] text-accent-700 font-medium">
                      <span>Applicant</span>
                      {approvalPath.map((ap) => (
                        <span key={ap.order}>→ {ap.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="h-4 w-4 rounded border-border-strong text-accent-600 mt-1"
                />
                <label htmlFor="declaration" className="text-[13px] text-text-muted select-none leading-relaxed">
                  I declare that all academic credentials, research appointments, and uploaded records provided are authentic, true, and comply with Kannur University Ph.D. Regulations.
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="h-[40px] px-4 text-[13px] font-medium rounded-md border border-border-strong text-text hover:bg-surface-sub transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !declaration}
                  className="h-[40px] px-5 text-[14px] font-medium rounded-md bg-accent-600 hover:bg-accent-700 text-white disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Submitting application...' : 'Submit guideship application'}
                </button>
              </div>
            </form>
          )}

          {/* Stepper Navigation Buttons (for steps 1-3) */}
          {step < 4 && (
            <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="h-[40px] px-4 text-[13px] font-medium rounded-md border border-border-strong text-text hover:bg-surface-sub transition-colors"
                >
                  Back
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-[13px] text-text-muted hover:text-text font-medium"
                >
                  Back to sign in
                </Link>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !canAcceptSignups}
                className="h-[40px] px-5 text-[14px] font-medium rounded-md bg-accent-600 hover:bg-accent-700 text-white disabled:opacity-50 transition-colors inline-flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight size={14} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="py-6 text-center text-[13px] leading-[20px] text-text-muted">
        Kannur University, Thavakkara, Civil Station P.O., Kannur, Kerala 670002
      </footer>
    </div>
  );
};

export default GuideSignupPage;
