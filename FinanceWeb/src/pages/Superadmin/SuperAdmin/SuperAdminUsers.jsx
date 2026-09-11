import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  Power,
  RefreshCw,
} from 'lucide-react';

export const SuperAdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_type: 'SUPER_ADMIN',
    password: '',
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll({ role_type: 'SUPER_ADMIN' });
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load SuperAdmin users from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      await api.users.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || 'Admin@123',
        role_type: 'SUPER_ADMIN',
        status: 'ACTIVE',
      });
      setIsAddModalOpen(false);
      setFeedback(`SuperAdmin user "${formData.name}" successfully created in database!`);
      await fetchAdmins();
      setFormData({ name: '', email: '', phone: '', role_type: 'SUPER_ADMIN', password: '' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to create superadmin:', err);
    }
  };

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.users.updateStatus(id, nextStatus);
      setFeedback(`User ${name} status updated to ${nextStatus}!`);
      await fetchAdmins();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm)
  );

  return (
    <div className="superadmin-users-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">PLATFORM ROOT RBAC & ACCESS</div>
          <h1 className="page-title">SuperAdmin Users & Roles</h1>
          <p className="page-subtitle">
            Manage multi-tenant system administrators, platform auditors, and root credential authorizations.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchAdmins}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={16} />
            Add SuperAdmin
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total SuperAdmins</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>{admins.length}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Active in TiDB Database</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Tenant Isolation</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: 'var(--accent-primary)' }}>Full Cross-Org Access</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global ledger governance</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Standard</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', color: '#fbbf24' }}>BCrypt + JWT</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HS256 signed sessions</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">SuperAdmin Directory</h3>
          <div className="search-box" style={{ maxWidth: 300 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role Designation</th>
                <th>Phone</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading live SuperAdmins from TiDB...</td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No SuperAdmin users found.</td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {admin.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <strong style={{ color: '#fff' }}>{admin.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={12} /> {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{admin.role_type || 'SUPER_ADMIN'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {admin.phone || 'N/A'}
                      </span>
                    </td>
                    <td>{admin.created_at ? new Date(admin.created_at).toISOString().slice(0, 10) : 'Live'}</td>
                    <td>
                      <StatusBadge status={admin.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem' }}
                        title="Toggle Status"
                        onClick={() => handleToggleStatus(admin.id, admin.name, admin.status)}
                      >
                        <Power size={14} color={admin.status === 'ACTIVE' ? 'var(--emerald)' : 'var(--text-muted)'} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SuperAdmin Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New SuperAdmin User"
        >
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Anand R"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin.name@fundlending.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (10-digit)</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Initial Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Admin@123"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create SuperAdmin
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminUsers;
