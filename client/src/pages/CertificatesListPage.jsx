import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import { Eye, X, AlertTriangle, ExternalLink } from 'lucide-react';

export const CertificatesListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [revokingCert, setRevokingCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [submittingRevoke, setSubmittingRevoke] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/certificates');
      setCertificates(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!revokingCert) return;
    try {
      setSubmittingRevoke(true);
      await api.post(`/certificates/${revokingCert.id}/revoke`, {
        reason: revokeReason,
      });
      setRevokingCert(null);
      setRevokeReason('');
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to revoke certificate');
    } finally {
      setSubmittingRevoke(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Verifiable research registration certificates and official clearance records."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <h2 className="text-[16px] font-semibold text-text">Issued certificates</h2>
          <span className="text-[13px] text-text-muted tabular-nums">{certificates.length} records</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            Loading certificate records...
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-text-muted">
            No certificates issued yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Certificate number</th>
                  <th className="py-2.5 px-4 font-medium">Recipient</th>
                  <th className="py-2.5 px-4 font-medium">Certificate type</th>
                  <th className="py-2.5 px-4 font-medium">Issued date</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                    <td className="py-3 px-4 ref-number whitespace-nowrap">
                      {cert.certificate_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-text">
                        {cert.scholar?.user?.full_name || 'Scholar'}
                      </div>
                      <div className="text-[12px] text-text-muted">
                        Reg: {cert.scholar?.register_number || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {cert.template?.name || 'Ph.D. Registration Certificate'}
                    </td>
                    <td className="py-3 px-4 text-text-muted tabular-nums">
                      {new Date(cert.issued_at || cert.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium ${
                          cert.status === 'VALID'
                            ? 'bg-success-bg text-success-text'
                            : 'bg-danger-bg text-danger-text'
                        }`}
                      >
                        {cert.status === 'VALID' ? 'Valid' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewCert(cert)}
                        className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={14} strokeWidth={1.75} />
                        <span>Preview</span>
                      </button>

                      {cert.status === 'VALID' && (
                        <button
                          type="button"
                          onClick={() => setRevokingCert(cert)}
                          className="h-[32px] px-3 border border-border-strong hover:bg-danger-bg hover:text-danger-text text-text-muted rounded-md text-[13px] font-medium transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="ref-number text-[12px] text-text-muted block">
                  Certificate preview
                </span>
                <h3 className="text-[18px] font-semibold text-text">
                  {previewCert.certificate_no}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub transition-colors"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            {/* Embedded Rendered Certificate HTML */}
            <div className="bg-white text-text p-8 rounded-md border border-border leading-relaxed font-sans">
              <div
                dangerouslySetInnerHTML={{ __html: previewCert.html_content }}
                className="prose max-w-none text-[14px]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border text-[13px]">
              <div className="text-text-muted">
                Public verification:{' '}
                <a
                  href={`/api/v1/public/verify-certificate/${previewCert.certificate_no}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-600 hover:text-accent-700 underline inline-flex items-center gap-1 font-medium"
                >
                  Verify online <ExternalLink size={12} />
                </a>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="h-[36px] px-4 border border-border-strong bg-surface hover:bg-surface-sub text-text rounded-md text-[13px] font-medium transition-colors"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-danger-text">
              <AlertTriangle size={18} strokeWidth={1.75} />
              <h3 className="text-[18px] font-semibold">Revoke certificate</h3>
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed">
              Revoking certificate <span className="ref-number">{revokingCert.certificate_no}</span> will invalidate it in official university records and public verification.
            </p>

            <form onSubmit={handleRevoke} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">
                  Reason for revocation *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Admission cancelled as per university order..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRevokingCert(null)}
                  className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevoke}
                  className="h-[36px] px-4 bg-danger-text text-white rounded-md text-[13px] font-medium hover:bg-danger-text/90 transition-colors disabled:opacity-50"
                >
                  {submittingRevoke ? 'Revoking...' : 'Confirm revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesListPage;
