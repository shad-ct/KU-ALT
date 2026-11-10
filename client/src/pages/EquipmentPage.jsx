import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import {
  Microscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Layers,
  Filter,
} from 'lucide-react';

export const EquipmentPage = () => {
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'REQUESTS'
  const [equipmentList, setEquipmentList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Modal State
  const [requestingEquipment, setRequestingEquipment] = useState(null);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Allocate Modal State
  const [allocatingRequest, setAllocatingRequest] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [submittingAlloc, setSubmittingAlloc] = useState(false);

  // Return Check-In Modal State
  const [returningAlloc, setReturningAlloc] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/equipment');
      setEquipmentList(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load equipment catalog.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/drc/equipment-requests');
      setRequestsList(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load equipment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'CATALOG') {
      fetchEquipment();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestingEquipment) return;

    try {
      setSubmittingRequest(true);
      await api.post('/equipment/requests', {
        equipment_id: requestingEquipment.id,
        purpose: requestPurpose,
        expected_return_date: expectedReturnDate,
        quantity: requestedQuantity,
      });

      setRequestingEquipment(null);
      setRequestPurpose('');
      setExpectedReturnDate('');
      setRequestedQuantity(1);
      setActiveTab('REQUESTS');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Request submission failed');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.patch(`/drc/equipment-requests/${requestId}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Approval failed');
    }
  };

  const handleSubmitAllocation = async (e) => {
    e.preventDefault();
    if (!allocatingRequest) return;

    try {
      setSubmittingAlloc(true);
      await api.post(`/drc/equipment-requests/${allocatingRequest.id}/allocate`, {
        unit_id: allocatingRequest.equipment?.tracking_mode === 'SERIALIZED' ? selectedUnitId : null,
      });

      setAllocatingRequest(null);
      setSelectedUnitId('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Allocation failed');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returningAlloc) return;

    try {
      setSubmittingReturn(true);
      await api.post(`/drc/equipment-allocations/${returningAlloc.id}/return`, {
        condition: returnCondition,
        notes: returnNotes,
      });

      setReturningAlloc(null);
      setReturnCondition('GOOD');
      setReturnNotes('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Return check-in failed');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment booking"
        description="Browse research equipment inventory and submit loan requests."
      />

      {error && (
        <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-md text-[13px]">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-surface-sub p-1 rounded-md border border-border inline-flex items-center gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'CATALOG'}
            onClick={() => setActiveTab('CATALOG')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'CATALOG'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Equipment catalog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'REQUESTS'}
            onClick={() => setActiveTab('REQUESTS')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'REQUESTS'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Loan requests & allocations
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {activeTab === 'CATALOG' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className="text-[16px] font-semibold text-text">
              Laboratory instruments
            </h2>
            <span className="text-[13px] text-text-muted tabular-nums">
              {equipmentList.length} items
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              Loading equipment inventory...
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              No equipment cataloged in the department.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Instrument</th>
                    <th className="py-2.5 px-4 font-medium">Category</th>
                    <th className="py-2.5 px-4 font-medium">Location</th>
                    <th className="py-2.5 px-4 font-medium">Tracking</th>
                    <th className="py-2.5 px-4 font-medium">Availability</th>
                    <th className="py-2.5 px-4 font-medium">Max loan</th>
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {equipmentList.map((eq) => {
                    const isAvail = eq.availabilityStatus === 'AVAILABLE';
                    return (
                      <tr key={eq.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                        <td className="py-3 px-4">
                          <div className="font-medium text-text">{eq.name}</div>
                          <div className="text-[12px] text-text-muted">
                            Model: {eq.model || 'Standard'} · {eq.make || 'University Lab'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {eq.category?.name || 'Scientific Equipment'}
                        </td>
                        <td className="py-3 px-4 text-text-muted">{eq.location || 'Central Lab'}</td>
                        <td className="py-3 px-4 text-text-muted text-[13px]">
                          {eq.tracking_mode === 'SERIALIZED' ? 'Unit tagged' : 'Bulk stock'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium ${
                              isAvail
                                ? 'bg-success-bg text-success-text'
                                : 'bg-warning-bg text-warning-text'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                isAvail ? 'bg-success-text' : 'bg-warning-text'
                              }`}
                            />
                            {isAvail ? 'Available' : 'Reserved'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-muted tabular-nums">
                          {eq.max_loan_days} days
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setRequestingEquipment(eq);
                              setRequestPurpose('');
                              setExpectedReturnDate('');
                              setRequestedQuantity(1);
                            }}
                            disabled={!isAvail}
                            className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Request loan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Requests View */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className="text-[16px] font-semibold text-text">
              Active loan requests
            </h2>
            <button
              type="button"
              onClick={fetchRequests}
              className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              Loading loan requests...
            </div>
          ) : requestsList.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-text-muted">
              No equipment loan requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Request number</th>
                    <th className="py-2.5 px-4 font-medium">Equipment</th>
                    <th className="py-2.5 px-4 font-medium">Applicant</th>
                    <th className="py-2.5 px-4 font-medium">Expected return</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requestsList.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                      <td className="py-3 px-4 ref-number">
                        {req.request_no}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-text">{req.equipment?.name}</div>
                        <div className="text-[12px] text-text-muted truncate max-w-[200px]">
                          {req.purpose}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text">
                        {req.scholar?.user?.full_name || 'Scholar'}
                      </td>
                      <td className="py-3 px-4 text-text-muted tabular-nums">
                        {new Date(req.expected_return_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium ${
                            req.status === 'ALLOCATED'
                              ? 'bg-accent-50 text-accent-700'
                              : req.status === 'APPROVED'
                              ? 'bg-success-bg text-success-text'
                              : 'bg-surface-sub text-text-muted'
                          }`}
                        >
                          {req.status === 'ALLOCATED'
                            ? 'Allocated'
                            : req.status === 'APPROVED'
                            ? 'Approved'
                            : req.status === 'RETURNED'
                            ? 'Returned'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req.id)}
                            className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text"
                          >
                            Approve
                          </button>
                        )}

                        {req.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAllocatingRequest(req);
                              setSelectedUnitId('');
                            }}
                            className="h-[32px] px-3 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium"
                          >
                            Allocate unit
                          </button>
                        )}

                        {req.status === 'ALLOCATED' && req.allocation && (
                          <button
                            type="button"
                            onClick={() => {
                              setReturningAlloc(req.allocation);
                              setReturnCondition('GOOD');
                              setReturnNotes('');
                            }}
                            className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text"
                          >
                            Check-in return
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
      )}

      {/* Request Modal */}
      {requestingEquipment && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-md w-full p-6 space-y-4">
            <h3 className="text-[18px] font-semibold text-text">
              Request loan: {requestingEquipment.name}
            </h3>
            <p className="text-[13px] text-text-muted">
              Maximum loan duration: {requestingEquipment.max_loan_days} days.
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">
                  Research purpose *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your research objective..."
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">
                  Expected return date *
                </label>
                <input
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              {requestingEquipment.tracking_mode === 'BULK' && (
                <div>
                  <label className="text-[14px] font-medium text-text block mb-1.5">
                    Requested quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={requestingEquipment.available_quantity}
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(parseInt(e.target.value, 10))}
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRequestingEquipment(null)}
                  className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="h-[36px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {allocatingRequest && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-md w-full p-6 space-y-4">
            <h3 className="text-[18px] font-semibold text-text">
              Allocate equipment unit
            </h3>
            <p className="text-[13px] text-text-muted">
              Select available physical instrument unit for request{' '}
              <span className="ref-number">{allocatingRequest.request_no}</span>.
            </p>

            <form onSubmit={handleSubmitAllocation} className="space-y-4">
              {allocatingRequest.equipment?.tracking_mode === 'SERIALIZED' ? (
                <div>
                  <label className="text-[14px] font-medium text-text block mb-1.5">
                    Select available unit *
                  </label>
                  <select
                    required
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                  >
                    <option value="">Select unit by asset tag...</option>
                    {(allocatingRequest.equipment?.units || [])
                      .filter((u) => u.status === 'AVAILABLE')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.asset_tag} {u.serial_number ? `(${u.serial_number})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-surface-sub border border-border rounded-md text-[13px] text-text-muted">
                  Bulk tracking mode: Quantity will be automatically deducted from inventory.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAllocatingRequest(null)}
                  className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAlloc}
                  className="h-[36px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {submittingAlloc ? 'Allocating...' : 'Confirm allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returningAlloc && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-md w-full p-6 space-y-4">
            <h3 className="text-[18px] font-semibold text-text">
              Instrument check-in return
            </h3>
            <p className="text-[13px] text-text-muted">
              Verify physical inspection and condition of returning equipment.
            </p>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">
                  Physical condition *
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                >
                  <option value="GOOD">Good (working order)</option>
                  <option value="DAMAGED">Damaged (requires maintenance)</option>
                  <option value="LOST">Lost or missing</option>
                </select>
              </div>

              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">Return notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on condition, cleanliness, and return inspection..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full p-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReturningAlloc(null)}
                  className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="h-[36px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {submittingReturn ? 'Checking in...' : 'Complete check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
