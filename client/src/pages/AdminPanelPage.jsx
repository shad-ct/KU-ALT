import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import StatusChip from '../components/ui/StatusChip';
import api from '../api/client';
import {
  ShieldAlert,
  Users,
  Database,
  UserPlus,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  X,
} from 'lucide-react';

export const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState('MISSING_APPROVERS'); // 'MISSING_APPROVERS' | 'USERS' | 'MAINTENANCE'
  const [missingApprovers, setMissingApprovers] = useState({ centresWithoutHead: [], deptsWithoutConvenor: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState('STAFF');
  const [creatingUser, setCreatingUser] = useState(false);

  // Backup State
  const [backingUp, setBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState(null);

  const fetchMissingApprovers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/reports/missing-approvers');
      setMissingApprovers(res.data?.data || { centresWithoutHead: [], deptsWithoutConvenor: [] });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to check missing approvers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'MISSING_APPROVERS') {
      fetchMissingApprovers();
    } else if (activeTab === 'USERS') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleToggleUserStatus = async (user) => {
    try {
      const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/admin/users/${user.id}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Status update failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreatingUser(true);
      setError(null);
      await api.post('/admin/users', {
        email: newUserEmail,
        full_name: newUserFullName,
        password: newUserPassword,
        roles: [newUserRole],
      });
      setShowCreateModal(false);
      setNewUserEmail('');
      setNewUserFullName('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'User creation failed');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleTriggerBackup = async () => {
    try {
      setBackingUp(true);
      setBackupResult(null);
      const res = await api.post('/admin/database/backup');
      setBackupResult(res.data?.data || { success: true });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Approval bottleneck diagnostics, user roles, staff assignments, and database maintenance."
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
            aria-selected={activeTab === 'MISSING_APPROVERS'}
            onClick={() => setActiveTab('MISSING_APPROVERS')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'MISSING_APPROVERS'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Missing approvers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'USERS'}
            onClick={() => setActiveTab('USERS')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'USERS'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            User management
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'MAINTENANCE'}
            onClick={() => setActiveTab('MAINTENANCE')}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all ${
              activeTab === 'MAINTENANCE'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Database & maintenance
          </button>
        </div>
      </div>

      {/* Tab 1: Missing Approvers Diagnostic */}
      {activeTab === 'MISSING_APPROVERS' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div>
                <h3 className="text-[16px] font-semibold text-text flex items-center gap-2">
                  <ShieldAlert size={16} strokeWidth={1.75} className="text-warning-text" />
                  Research centres without assigned centre head
                </h3>
                <p className="text-[13px] text-text-muted mt-0.5">
                  Applications from scholars at these centres cannot proceed until a Centre Head is assigned.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMissingApprovers}
                className="h-[32px] px-3 bg-surface hover:bg-surface-sub border border-border-strong rounded-md text-[13px] font-medium text-text transition-colors"
              >
                Re-check
              </button>
            </div>

            {missingApprovers.centresWithoutHead?.length === 0 ? (
              <div className="py-8 text-center text-[14px] text-success-text flex items-center justify-center gap-2">
                <CheckCircle2 size={16} strokeWidth={1.75} />
                <span>All research centres have active Centre Heads assigned.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Centre code</th>
                      <th className="py-2.5 px-4 font-medium">Centre name</th>
                      <th className="py-2.5 px-4 font-medium">Institution type</th>
                      <th className="py-2.5 px-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {missingApprovers.centresWithoutHead?.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-sub/50 h-[52px]">
                        <td className="py-3 px-4 ref-number">{c.code}</td>
                        <td className="py-3 px-4 font-medium text-text">{c.name}</td>
                        <td className="py-3 px-4 text-text-muted">{c.institution_type}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium bg-danger-bg text-danger-text">
                            Head missing
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-[16px] font-semibold text-text flex items-center gap-2">
                <ShieldAlert size={16} strokeWidth={1.75} className="text-warning-text" />
                Departments without assigned DRC convenor
              </h3>
              <p className="text-[13px] text-text-muted mt-0.5">
                Departmental Research Committee reviews cannot proceed without an active DRC Convenor.
              </p>
            </div>

            {missingApprovers.deptsWithoutConvenor?.length === 0 ? (
              <div className="py-8 text-center text-[14px] text-success-text flex items-center justify-center gap-2">
                <CheckCircle2 size={16} strokeWidth={1.75} />
                <span>All academic departments have active DRC Convenors assigned.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Department code</th>
                      <th className="py-2.5 px-4 font-medium">Department name</th>
                      <th className="py-2.5 px-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {missingApprovers.deptsWithoutConvenor?.map((d) => (
                      <tr key={d.id} className="hover:bg-surface-sub/50 h-[52px]">
                        <td className="py-3 px-4 ref-number">{d.code}</td>
                        <td className="py-3 px-4 font-medium text-text">{d.name}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium bg-danger-bg text-danger-text">
                            Convenor missing
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: User Governance */}
      {activeTab === 'USERS' && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border">
            <div>
              <h3 className="text-[16px] font-semibold text-text">Portal users</h3>
              <p className="text-[13px] text-text-muted mt-0.5">Manage user access and system role assignments.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="h-[36px] px-3.5 bg-accent-600 hover:bg-accent-700 text-white text-[13px] font-medium rounded-md inline-flex items-center gap-2 transition-colors"
            >
              <UserPlus size={16} strokeWidth={1.75} />
              <span>Add user</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[14px] text-text-muted">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-text-muted">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-surface-sub text-text-muted font-medium border-b border-border text-[13px] h-[44px]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">User</th>
                    <th className="py-2.5 px-4 font-medium">Email</th>
                    <th className="py-2.5 px-4 font-medium">Roles</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isActive = u.status === 'ACTIVE';
                    return (
                      <tr key={u.id} className="hover:bg-surface-sub/50 transition-colors h-[56px]">
                        <td className="py-3 px-4 font-medium text-text">{u.full_name}</td>
                        <td className="py-3 px-4 text-text-muted">{u.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(u.roles || []).map((r) => (
                              <span
                                key={r.code || r}
                                className="text-[12px] px-2 py-0.5 bg-surface-sub rounded-sm text-text-muted"
                              >
                                {r.code || r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[12px] font-medium ${
                              isActive
                                ? 'bg-success-bg text-success-text'
                                : 'bg-danger-bg text-danger-text'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`h-[32px] px-3 rounded-md text-[13px] font-medium border transition-colors ${
                              isActive
                                ? 'border-border-strong hover:bg-danger-bg hover:text-danger-text text-text-muted'
                                : 'border-border-strong hover:bg-success-bg hover:text-success-text text-text'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
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

      {/* Tab 3: Maintenance & Database Backup */}
      {activeTab === 'MAINTENANCE' && (
        <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-[16px] font-semibold text-text flex items-center gap-2">
              <HardDrive size={18} strokeWidth={1.75} className="text-accent-600" />
              Database backup & state snapshot
            </h3>
            <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
              Create an on-demand database backup snapshot on the server.
            </p>
          </div>

          {backupResult && (
            <div className="p-4 bg-success-bg text-success-text border border-success-text/20 rounded-md text-[13px] flex items-center gap-3">
              <CheckCircle2 size={18} strokeWidth={1.75} className="flex-shrink-0" />
              <div>
                <div className="font-medium">Database backup created successfully.</div>
                <div className="ref-number text-[12px] mt-0.5">
                  Backup reference: {backupResult.filename || `backup_${Date.now()}.sql`}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-surface-sub border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-medium text-text">MySQL primary instance</div>
              <div className="text-[12px] text-text-muted mt-0.5">Database: kannur_rd_db</div>
            </div>
            <button
              type="button"
              disabled={backingUp}
              onClick={handleTriggerBackup}
              className="h-[40px] px-4 bg-accent-600 hover:bg-accent-700 text-white text-[13px] font-medium rounded-md transition-colors inline-flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              <Database size={16} strokeWidth={1.75} />
              <span>{backingUp ? 'Creating snapshot...' : 'Create backup snapshot'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-dialog max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-text">Create user</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub transition-colors"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">Full name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Rajesh"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">Email address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@kannur.ac.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">Temporary password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-text block mb-1.5">Primary role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface border border-border-strong rounded-md text-[16px] text-text focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
                >
                  <option value="STAFF">Section staff</option>
                  <option value="DRC_CONVENOR">DRC convenor</option>
                  <option value="CENTRE_HEAD">Centre head</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-[36px] px-4 border border-border-strong text-text hover:bg-surface-sub rounded-md text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="h-[36px] px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
