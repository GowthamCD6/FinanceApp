import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import { StatusBadge } from '../../../components/common/Badge';
import { Pagination } from '../../../components/common/Pagination';
import { TableSkeleton } from '../../../components/common/Skeleton';
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
} from 'lucide-react';
import './SuperAdminUsers.css';

export const SuperAdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
      const superAdmins = userList.filter(
        (u) =>
          u.role_type === 'SUPER_ADMIN' ||
          u.roleType === 'SUPER_ADMIN' ||
          u.role === 'SUPER_ADMIN' ||
          u.system_role === 'SUPER_ADMIN' ||
          (u.roles && u.roles.includes('SUPER_ADMIN'))
      );
      setAdmins(superAdmins.length > 0 ? superAdmins : userList);
    } catch (err) {
      console.error('Failed to load SuperAdmin users from API:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
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
      });

      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role_type: 'SUPER_ADMIN', password: '' });
      setFeedback({ type: 'success', message: `SuperAdmin "${formData.name}" successfully created!` });
      setTimeout(() => setFeedback(null), 4000);
      fetchAdmins(true);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create SuperAdmin user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userObj) => {
    const nextStatus = userObj.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.users.update(userObj.id, { status: nextStatus });
      setFeedback({ type: 'success', message: `Admin "${userObj.name}" status changed to ${nextStatus}` });
      setTimeout(() => setFeedback(null), 3000);
      fetchAdmins(true);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status' });
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
      );
    }
    return true;
  });

  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="sa-users-page">
      {/* 1. Header Row */}
      <div className="sau-header-row">
        <h1 className="sau-title">Platform SuperAdmin Directory</h1>

        <div className="sau-header-actions">
          <button
            type="button"
            className="btn-add-admin-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Create SuperAdmin</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{ background: feedback.type === 'success' ? '#ecfdf5' : '#fff1f2', border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecdd3'}`, color: feedback.type === 'success' ? '#065f46' : '#e11d48', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.85rem' }}>
          {feedback.message}
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="sau-filter-card">
        <div className="sau-search-wrap">
          <Search size={16} />
          <input
            type="text"
            className="sau-search-input"
            placeholder="Search SuperAdmins by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ height: 42, padding: '0 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {/* 3. Table */}
      <div className="sau-table-card">
        <table className="sau-table">
          <thead>
            <tr>
              <th>SUPERADMIN USER</th>
              <th>EMAIL ADDRESS</th>
              <th>PHONE</th>
              <th>GOVERNANCE ROLE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={pageSize} cols={6} />
            ) : paginatedAdmins.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Shield size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No SuperAdmins found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 4 }}>No platform administrators match your filter criteria.</div>
                </td>
              </tr>
            ) : (
              paginatedAdmins.map((adm) => {
                const isActive = adm.status === 'ACTIVE';
                return (
                  <tr key={adm.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '0.5rem', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                          {adm.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 750, color: '#0f172a' }}>{adm.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#334155' }}>{adm.email}</td>
                    <td style={{ color: '#64748b' }}>{adm.phone || 'N/A'}</td>
                    <td>
                      <span className="role-tag-super">SUPER ADMIN</span>
                    </td>
                    <td>
                      <StatusBadge status={adm.status || 'ACTIVE'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(adm)}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '4px', cursor: 'pointer', color: isActive ? '#e11d48' : '#059669', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filteredAdmins.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAdmins.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="administrators"
          />
        )}
      </div>

      {/* 4. Create Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Platform SuperAdmin"
      >
        <form onSubmit={handleAddSubmit}>
          {errors.form && (
            <div style={{ color: '#e11d48', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {errors.form}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Anand R"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', height: 44, padding: '0 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', fontFamily: 'inherit' }}
              required
            />
            {errors.name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>Email Address *</label>
              <input
                type="email"
                placeholder="admin@platform.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', height: 44, padding: '0 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', fontFamily: 'inherit' }}
                required
              />
              {errors.email && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>Phone Number *</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', height: 44, padding: '0 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', fontFamily: 'inherit' }}
                required
              />
              {errors.phone && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.phone}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>Initial Password (Optional)</label>
            <input
              type="password"
              placeholder="Defaults to Admin@123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', height: 44, padding: '0 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.15rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ background: '#2563eb', border: 'none', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {submitting ? 'Creating...' : 'Create SuperAdmin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminUsers;
