import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  Power,
  RotateCw,
  Lock,
  User,
  Shield,
  Key,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';

export const SuperAdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_type: 'SUPER_ADMIN',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await api.users.getAll({ role: 'SUPER_ADMIN' });
      const userList = Array.isArray(res) ? res : res?.users || res?.data || [];
      // If userList has mixed roles or empty, fallback/filter
      const superAdmins = userList.filter(
        (u) => u.role_type === 'SUPER_ADMIN' || u.role === 'SUPER_ADMIN' || u.system_role === 'SUPER_ADMIN'
      );
      setAdmins(superAdmins.length > 0 ? superAdmins : userList);
    } catch (err) {
      console.error('Failed to load SuperAdmin users from API:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.users.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || 'Admin@123',
        role_type: 'SUPER_ADMIN',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      });
      setIsAddModalOpen(false);
      setFeedback(`SuperAdmin user "${formData.name}" onboarded successfully!`);
      setFormData({ name: '', email: '', phone: '', role_type: 'SUPER_ADMIN', password: '' });
      await fetchAdmins(true);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create SuperAdmin user.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.users.updateStatus(admin.id, nextStatus);
      setFeedback(`SuperAdmin "${admin.name}" status updated to ${nextStatus}!`);
      await fetchAdmins(true);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(`Failed to update status: ${err.message}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q);
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = admins.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="superadmin-users-container">
      {/* 1. Header Row */}
      <div className="superadmin-header-row">
        <div className="header-left">
          <div className="title-wrap">
            <h1 className="superadmin-main-title">SuperAdmin Users & Access</h1>
            <span className="count-badge">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : (
                `${admins.length} Root Operators`
              )}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${refreshing || loading ? 'is-spinning' : ''}`}
            onClick={() => fetchAdmins(true)}
            title="Refresh Users Directory"
            disabled={loading || refreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-create-admin"
            onClick={() => {
              setErrors({});
              setIsAddModalOpen(true);
            }}
          >
            <UserPlus size={18} />
            <span>Onboard SuperAdmin</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="feedback-banner-success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="superadmin-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="kpi-card skeleton-card">
                <div className="kpi-top">
                  <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                </div>
                <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '10px 0' }} />
                <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Total Root Operators</span>
                <div className="kpi-icon icon-purple">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="kpi-value">{admins.length}</div>
              <div className="kpi-footer">
                <span className="dot-green" />
                <span>{activeCount} Active in TiDB Database</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Access Scope</span>
                <div className="kpi-icon icon-blue">
                  <Shield size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: '1.25rem', marginTop: '0.65rem' }}>
                Full Multi-Tenant
              </div>
              <div className="kpi-footer">
                <span className="highlight-blue">Cross-Tenant Governance</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Authentication Engine</span>
                <div className="kpi-icon icon-green">
                  <Lock size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: '1.25rem', marginTop: '0.65rem' }}>
                BCrypt + JWT
              </div>
              <div className="kpi-footer">
                <span>HS256 Cryptographic Sessions</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Platform Root Access</span>
                <div className="kpi-icon icon-amber">
                  <Key size={20} />
                </div>
              </div>
              <div className="kpi-value">100%</div>
              <div className="kpi-footer">
                <span>Active Ledger Governance</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="superadmin-toolbar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by admin name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 4. SuperAdmin Directory Table */}
      <div className="superadmin-table-card">
        <div className="table-responsive">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>ADMINISTRATOR</th>
                <th>EMAIL ADDRESS</th>
                <th>CONTACT PHONE</th>
                <th>ROLE DESIGNATION</th>
                <th>STATUS</th>
                <th>REGISTERED DATE</th>
                <th className="th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="admin-row skeleton-row">
                      <td>
                        <div className="admin-name-cell">
                          <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="skeleton-bar" style={{ width: 130, height: 14 }} />
                            <div className="skeleton-bar" style={{ width: 80, height: 10 }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="skeleton-bar" style={{ width: 160, height: 14 }} />
                      </td>
                      <td>
                        <div className="skeleton-bar" style={{ width: 100, height: 14 }} />
                      </td>
                      <td>
                        <div className="skeleton-pill" style={{ width: 95, height: 22 }} />
                      </td>
                      <td>
                        <div className="skeleton-pill" style={{ width: 70, height: 22 }} />
                      </td>
                      <td>
                        <div className="skeleton-bar" style={{ width: 85, height: 14 }} />
                      </td>
                      <td className="td-actions">
                        <div className="skeleton-circle" style={{ width: 32, height: 32, marginLeft: 'auto' }} />
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <div className="empty-state">
                      <ShieldCheck size={40} color="#94a3b8" />
                      <h4>No SuperAdmin users found</h4>
                      <p>Try adjusting your search criteria or add a new SuperAdmin.</p>
                      {searchTerm && (
                        <button
                          type="button"
                          className="btn-reset-search"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="admin-row">
                    <td>
                      <div className="admin-name-cell">
                        <div className="admin-avatar-badge">
                          {admin.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="admin-name-meta">
                          <span className="admin-title-text">{admin.name}</span>
                          <span className="admin-id-sub">ROOT-ID: #{admin.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="email-cell">
                        <Mail size={14} className="email-icon" />
                        <span>{admin.email}</span>
                      </div>
                    </td>

                    <td>
                      <div className="phone-cell">
                        <Phone size={14} className="phone-icon" />
                        <span>{admin.phone || '9876543210'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="role-pill role-superadmin">
                        <Shield size={12} />
                        <span>{admin.role_type || admin.role || 'SUPER_ADMIN'}</span>
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill status-${admin.status?.toLowerCase() || 'active'}`}>
                        <span className="status-indicator-dot" />
                        {admin.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td>
                      <span className="created-date-text">
                        {admin.created_at || admin.date_joined
                          ? new Date(admin.created_at || admin.date_joined).toLocaleDateString('en-GB')
                          : '10/01/2026'}
                      </span>
                    </td>

                    <td className="td-actions">
                      <button
                        type="button"
                        className={`btn-action-power ${admin.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                        title={admin.status === 'ACTIVE' ? 'Suspend SuperAdmin' : 'Activate SuperAdmin'}
                        onClick={() => handleToggleStatus(admin)}
                      >
                        <Power size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Onboard SuperAdmin Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New SuperAdmin Operator"
        >
          <form onSubmit={handleAddSubmit} className="superadmin-modal-form">
            {errors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">
                <User size={14} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Dr. Anandhakumar V"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                required
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Mail size={14} />
                <span>Corporate Email Address *</span>
              </label>
              <input
                type="email"
                className={`modal-form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="e.g. anand.audit@fundlending.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                required
              />
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Phone size={14} />
                <span>Direct Contact Phone (10-Digit) *</span>
              </label>
              <input
                type="tel"
                className={`modal-form-input ${errors.phone ? 'input-error' : ''}`}
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                required
              />
              {errors.phone && <span className="field-error-text">{errors.phone}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Lock size={14} />
                <span>Initial Temporary Password</span>
              </label>
              <input
                type="password"
                className="modal-form-input"
                placeholder="Default: Admin@123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span className="password-hint">User will be prompted to reset upon first login.</span>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-modal-primary"
              >
                {submitting ? 'Onboarding...' : 'Onboard SuperAdmin'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .superadmin-users-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #0f172a;
          font-family: inherit;
        }

        .superadmin-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          flex-direction: column;
        }

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .superadmin-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .count-badge {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          color: #7c3aed;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-refresh-data {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-data:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1976d2;
          border-color: #93c5fd;
        }

        .btn-refresh-data.is-spinning svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-create-admin {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.15rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
          transition: all 0.2s ease;
        }

        .btn-create-admin:hover {
          background: #1565c0;
          box-shadow: 0 4px 10px rgba(25, 118, 210, 0.35);
          transform: translateY(-1px);
        }

        .feedback-banner-success {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* KPI Cards */
        .superadmin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kpi-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-green { background: #ecfdf5; color: #059669; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .kpi-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.45rem 0 0.35rem 0;
          letter-spacing: -0.02em;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
        }

        .highlight-blue {
          color: #1976d2;
          font-weight: 700;
        }

        /* Toolbar */
        .superadmin-toolbar {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-box {
          flex: 1;
          min-width: 280px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-box .search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          pointer-events: none;
        }

        .search-input-box input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.4rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input-box input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .clear-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-group {
          display: flex;
          gap: 0.75rem;
        }

        .status-select {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          cursor: pointer;
        }

        /* Table Card */
        .superadmin-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .superadmin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .superadmin-table thead th {
          background: #f8fafc;
          padding: 0.9rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .superadmin-table thead .th-actions {
          text-align: right;
        }

        .admin-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .admin-row:hover:not(.skeleton-row) {
          background-color: #f8fafc;
        }

        .admin-row td {
          padding: 0.9rem 1rem;
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .admin-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-avatar-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(124, 58, 237, 0.25);
        }

        .admin-name-meta {
          display: flex;
          flex-direction: column;
        }

        .admin-title-text {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .admin-id-sub {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #334155;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .email-icon {
          color: #1976d2;
          flex-shrink: 0;
        }

        .phone-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #475569;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .phone-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.7rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .role-superadmin {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .status-inactive { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .status-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .created-date-text {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .td-actions {
          text-align: right;
        }

        .btn-action-power {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .power-suspend:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        .power-activate:hover {
          border-color: #059669;
          color: #059669;
          background: #ecfdf5;
        }

        .empty-state {
          padding: 3rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.5rem 0 0 0;
        }

        .empty-state p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }

        .btn-reset-search {
          margin-top: 0.5rem;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Modal Styles */
        .superadmin-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .modal-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .modal-form-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
        }

        .modal-form-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .modal-form-input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .input-error {
          border-color: #ef4444 !important;
        }

        .field-error-text {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 600;
        }

        .password-hint {
          font-size: 0.72rem;
          color: #64748b;
        }

        .modal-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.85rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-modal-secondary {
          padding: 0.55rem 1.1rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-modal-secondary:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .btn-modal-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-modal-primary:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-modal-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Skeleton Styles */
        .skeleton-bar {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-circle {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 50%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-pill {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 9999px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .superadmin-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .superadmin-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminUsers;
