import React, { useState } from 'react';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Key,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  User,
  Power,
  Edit2,
  Clock,
  Shield,
} from 'lucide-react';

export const SuperAdminUsers = () => {
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Super Admin Root',
      email: 'admin@fundlending.com',
      phone: '9999999999',
      role: 'SUPER_ADMIN_ROOT',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      lastLogin: '2026-09-11 15:30:12',
      permissions: ['SYSTEM_ALL', 'ORG_GOVERNANCE', 'GLOBAL_LEDGER', 'MIGRATIONS_RUN'],
      createdAt: '2025-01-01',
    },
    {
      id: 2,
      name: 'Priya Narayanan (Compliance Head)',
      email: 'priya.audit@fundlending.com',
      phone: '9840998877',
      role: 'SUPER_ADMIN_AUDITOR',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      lastLogin: '2026-09-10 18:45:00',
      permissions: ['ORG_GOVERNANCE', 'GLOBAL_LEDGER', 'AUDIT_LOG_EXPORT'],
      createdAt: '2025-03-15',
    },
    {
      id: 3,
      name: 'Karthik Raja (DevOps Lead)',
      email: 'karthik.ops@fundlending.com',
      phone: '9884554433',
      role: 'SUPER_ADMIN_TECH',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      lastLogin: '2026-09-08 09:12:30',
      permissions: ['API_TELEMETRY', 'MIGRATIONS_RUN', 'APP_ROLLOUT'],
      createdAt: '2025-05-10',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'SUPER_ADMIN_AUDITOR',
    twoFactorEnabled: true,
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newAdmin = {
      id: admins.length + 1,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '9XXXXXXXXX',
      role: formData.role,
      status: 'ACTIVE',
      twoFactorEnabled: formData.twoFactorEnabled,
      lastLogin: 'Never',
      permissions: ['ORG_GOVERNANCE', 'GLOBAL_LEDGER'],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setAdmins([newAdmin, ...admins]);
    setIsAddModalOpen(false);
    setFeedback(`SuperAdmin user "${formData.name}" successfully created!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleStatus = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    setFeedback(`${name} marked as ${nextStatus}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm)
  );

  return (
    <div className="super-admin-users-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">ROOT ACCESS CONTROL & GOVERNANCE</div>
          <h1 className="page-title">SuperAdmin User Management</h1>
          <p className="page-subtitle">
            Manage root platform administrators, multi-tenant RBAC privilege sets, and authentication security policies.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={16} />
            Invite SuperAdmin
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Security Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total SuperAdmins</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>{admins.length}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Active Root Privilege</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2-Factor Authentication (2FA)</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: 'var(--emerald)' }}>
            {Math.round((admins.filter((a) => a.twoFactorEnabled).length / admins.length) * 100)}%
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enforced for all financial ops</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Level</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: 'var(--accent-primary)' }}>Tier-1 Vault</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Encrypted session state</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls" style={{ marginBottom: '1.25rem' }}>
        <div className="search-box" style={{ maxWidth: 400 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search SuperAdmin by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SuperAdmins Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SuperAdmin User</th>
                <th>Role & Access Tier</th>
                <th>Contact Info</th>
                <th>2FA Security</th>
                <th>Last Login</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{a.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {a.createdAt}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-purple">{a.role.replace(/_/g, ' ')}</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#fff' }}>{a.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {a.phone}</div>
                  </td>

                  <td>
                    {a.twoFactorEnabled ? (
                      <span className="badge badge-emerald">2FA Enabled</span>
                    ) : (
                      <span className="badge badge-yellow">2FA Pending</span>
                    )}
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.lastLogin}</span>
                  </td>

                  <td>
                    <StatusBadge status={a.status} />
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon"
                        title={a.status === 'ACTIVE' ? 'Deactivate SuperAdmin' : 'Activate SuperAdmin'}
                        onClick={() => handleToggleStatus(a.id, a.name, a.status)}
                      >
                        <Power size={16} color={a.status === 'ACTIVE' ? 'var(--red)' : 'var(--emerald)'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite SuperAdmin Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Invite SuperAdmin User"
        >
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Krishnan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ramesh@fundlending.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Governance Role Tier</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="SUPER_ADMIN_AUDITOR">SuperAdmin Auditor (Financial & Compliance)</option>
                <option value="SUPER_ADMIN_TECH">SuperAdmin Tech (DevOps & Telemetry)</option>
                <option value="SUPER_ADMIN_ROOT">SuperAdmin Root (Full Platform Master)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
              <input
                type="checkbox"
                id="twoFactorCheckbox"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
              />
              <label htmlFor="twoFactorCheckbox" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                Require Two-Factor Authentication (2FA) upon first login
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Send Invitation & Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminUsers;
