import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import { CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/profile');
      const data = res.data?.data || {};
      setProfile(data);
      setFullName(data.user?.full_name || '');
      setPhone(data.user?.phone || '');
      setAddress(data.scholar?.address || '');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaved(false);
      await api.patch('/profile', {
        phone,
        address,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[14px] text-text-muted">
        Loading user profile...
      </div>
    );
  }

  const user = profile?.user || {};
  const scholar = profile?.scholar;
  const guide = profile?.guide;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your contact details, institutional affiliation, and academic information."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 bg-success-bg text-success-text border border-success-text/20 rounded-md text-[13px] flex items-center gap-2.5">
          <CheckCircle2 size={18} strokeWidth={1.75} className="flex-shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Editable Contact Information */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-6">
          <h2 className="text-[18px] font-semibold text-text">Contact details</h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                Full name
              </label>
              <input
                type="text"
                disabled
                value={fullName}
                className="w-full h-[40px] px-3 bg-surface-sub border border-border rounded-md text-[16px] text-text-muted cursor-not-allowed"
              />
              <span className="text-[12px] text-text-muted mt-1 block">
                Official name changes must be requested through the R&D Cell.
              </span>
            </div>

            <div>
              <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                Email address
              </label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="w-full h-[40px] px-3 bg-surface-sub border border-border rounded-md text-[16px] text-text-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                Mobile number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94470 00000"
                className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
              />
            </div>

            {scholar && (
              <div>
                <label className="block text-[14px] leading-[20px] font-medium text-text mb-1.5">
                  Postal address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential or communication address..."
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="h-[40px] px-5 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-medium text-[13px] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Academic Affiliation Card */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-[16px] font-semibold text-text">
              Academic details
            </h2>

            {scholar && (
              <div className="space-y-4 text-[14px]">
                <div>
                  <span className="text-text-muted text-[13px] block">Register number</span>
                  <span className="ref-number mt-0.5 block">
                    {scholar.register_number || 'Pending assignment'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted text-[13px] block">Research topic</span>
                  <span className="font-medium text-text mt-0.5 block">
                    {scholar.research_topic || 'Not assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted text-[13px] block">Department</span>
                  <span className="text-text mt-0.5 block">{scholar.department?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[13px] block">Research centre</span>
                  <span className="text-text mt-0.5 block">{scholar.research_centre?.name || '—'}</span>
                </div>
              </div>
            )}

            {guide && (
              <div className="space-y-4 text-[14px]">
                <div>
                  <span className="text-text-muted text-[13px] block">Scholar quota</span>
                  <span className="text-text font-medium mt-0.5 block tabular-nums">
                    Up to {guide.max_scholars || 8} scholars
                  </span>
                </div>
                <div>
                  <span className="text-text-muted text-[13px] block">Designation</span>
                  <span className="text-text mt-0.5 block">{guide.designation?.title || 'Faculty'}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[13px] block">Research centre</span>
                  <span className="text-text mt-0.5 block">{guide.research_centre?.name || '—'}</span>
                </div>
              </div>
            )}

            {!scholar && !guide && (
              <div className="text-[13px] text-text-muted">
                University administration and staff account.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
