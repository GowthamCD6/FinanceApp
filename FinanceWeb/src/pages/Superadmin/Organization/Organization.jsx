import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { TableSkeleton, CardSkeleton } from '../../../components/common/Skeleton';
import {
  Building,
  Plus,
  Search,
  Phone,
  User,
  Power,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  DollarSign,
  Users,
  Edit2,
  Save,
  X,
  RotateCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import './Organization.css';

const PLANS = [
  { id: 'STARTER', label: 'Starter', desc: 'Single branch, up to 100 borrowers' },
  { id: 'PRO', label: 'Pro', desc: 'Multi-branch operations with rapid collections' },
  { id: 'ENTERPRISE', label: 'Enterprise', desc: 'Unlimited branches, custom limits & priority SLA' },
];

export const Organization = () => {
  const navigate = useNavigate();
  const {
    organizations,
    loading,
    addOrganization,
    updateOrganization,
    updateOrgStatus,
    setActiveOrg,
    refreshOrganizations,
  } = useOrg();

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, planFilter, statusFilter]);

  // Add Org Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    admin_phone: '',
    admin_email: '',
    admin_password: '',
    plan: 'PRO',
    city: 'Chennai',
    state: 'Tamil Nadu',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Edit Org Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    admin_name: '',
    admin_phone: '',
    admin_email: '',
    admin_password: '',
    plan: 'PRO',
    status: 'ACTIVE',
  });
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const handleManualRefresh = async () => {
    if (refreshOrganizations) {
      setIsRefreshing(true);
      try {
        await refreshOrganizations();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const validateAdd = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Organization name is required';
    if (!formData.admin_name.trim()) errs.admin_name = 'Initial Admin Name is required';
    
    if (!formData.admin_phone.trim()) {
      errs.admin_phone = 'Admin phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.admin_phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.admin_phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.admin_email.trim()) {
      errs.admin_email = 'Admin login email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email.trim())) {
      errs.admin_email = 'Please enter a valid email address';
    }

    if (!formData.admin_password.trim()) {
      errs.admin_password = 'Admin login password is required';
    } else if (formData.admin_password.length < 6) {
      errs.admin_password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdd()) return;

    setSubmitting(true);
    try {
      if (addOrganization) {
        await addOrganization({
          name: formData.name.trim(),
          admin_name: formData.admin_name.trim(),
          admin_phone: formData.admin_phone.trim().replace(/\D/g, '').slice(-10),
          admin_email: formData.admin_email.trim().toLowerCase(),
          admin_password: formData.admin_password,
          plan: formData.plan,
          city: formData.city,
          state: formData.state,
        });
      }

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        admin_name: '',
        admin_phone: '',
        admin_email: '',
        admin_password: '',
        plan: 'PRO',
        city: 'Chennai',
        state: 'Tamil Nadu',
      });
      setFeedbackMsg(`Organization "${formData.name}" successfully created!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create organization' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (org) => {
    setEditErrors({});
    setEditFormData({
      id: org.id,
      name: org.name || '',
      admin_name: org.admin_name || '',
      admin_phone: org.admin_phone || '',
      admin_email: org.admin_email || '',
      admin_password: '',
      plan: org.plan || 'PRO',
      status: org.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editFormData.name.trim()) errs.name = 'Organization name is required';
    if (!editFormData.admin_name.trim()) errs.admin_name = 'Admin name is required';
    if (editFormData.admin_password && editFormData.admin_password.length < 6) {
      errs.admin_password = 'Password must be at least 6 characters';
    }
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setSavingEdit(true);
    try {
      if (updateOrganization) {
        await updateOrganization(editFormData.id, {
          name: editFormData.name.trim(),
          admin_name: editFormData.admin_name.trim(),
          admin_phone: editFormData.admin_phone.trim(),
          admin_email: editFormData.admin_email.trim(),
          ...(editFormData.admin_password ? { admin_password: editFormData.admin_password } : {}),
          plan: editFormData.plan,
          status: editFormData.status,
        });
      }

      setIsEditModalOpen(false);
      setFeedbackMsg(`Organization "${editFormData.name}" updated successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      setEditErrors({ form: err.message || 'Failed to update organization' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = (org) => {
    const next = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateOrgStatus(org.id, next);
    setFeedbackMsg(`Organization "${org.name}" status updated to ${next}`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleEnterOrg = (org) => {
    setActiveOrg(org.id);
    navigate(`/org/${org.id}/dashboard`);
  };

  const filtered = organizations.filter((org) => {
    if (planFilter !== 'ALL' && org.plan !== planFilter) return false;
    if (statusFilter !== 'ALL' && org.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        org.name?.toLowerCase().includes(q) ||
        org.code?.toLowerCase().includes(q) ||
        (org.admin_name || '').toLowerCase().includes(q) ||
        (org.admin_phone || '').includes(q)
      );
    }
    return true;
  });

  const totalBranches = organizations.reduce((acc, o) => acc + Number(o.branch_count || 1), 0);
  const totalBorrowers = organizations.reduce((acc, o) => acc + Number(o.customer_count || 0), 0);
  const totalPortfolio = organizations.reduce((acc, o) => acc + Number(o.portfolio_amount || 0), 0);

  const paginatedOrganizations = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="sa-org-container">
      {/* 1. Header Row */}
      <div className="sa-org-header">
        <div className="sa-org-header-left">
          <h1 className="sa-org-title">Organizations & Tenant Hub</h1>
          <span className="sa-org-count-pill">
            {loading ? 'Syncing...' : `${organizations.length} Organizations`}
          </span>
        </div>

        <div className="sa-org-header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${isRefreshing || loading ? 'is-spinning' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            disabled={loading || isRefreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-add-org-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Onboard Organization</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback-banner-success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Platform KPI Cards */}
      <div className="sa-kpi-grid">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Total Organizations</span>
                <div className="kpi-icon-wrap icon-blue">
                  <Building size={20} />
                </div>
              </div>
              <div className="kpi-value">{organizations.length}</div>
              <div className="kpi-footer">
                <span className="dot-green" />
                <span>Active registered tenants</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Operating Branches</span>
                <div className="kpi-icon-wrap icon-purple">
                  <Layers size={20} />
                </div>
              </div>
              <div className="kpi-value">{totalBranches}</div>
              <div className="kpi-footer">
                <span>Multi-branch field network</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Active Borrowers</span>
                <div className="kpi-icon-wrap icon-green">
                  <Users size={20} />
                </div>
              </div>
              <div className="kpi-value">{totalBorrowers.toLocaleString()}</div>
              <div className="kpi-footer">
                <span style={{ color: '#059669', fontWeight: 700 }}>Across all tenant networks</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Total Portfolio</span>
                <div className="kpi-icon-wrap icon-amber">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="kpi-value">{formatCurrency(totalPortfolio)}</div>
              <div className="kpi-footer">
                <span>Active lending capital</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="sa-org-filter-wrap">
        <div className="sa-org-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by organization name, code, admin name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sa-org-filter-group">
          <select
            className="sa-org-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            className="sa-org-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* 4. Organizations Table */}
      <div className="sa-org-table-card">
        <table className="sa-org-table">
          <thead>
            <tr>
              <th>ORGANIZATION & CODE</th>
              <th>PRIMARY ADMIN</th>
              <th>PHONE</th>
              <th>PLAN</th>
              <th>BRANCHES</th>
              <th>BORROWERS</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={pageSize} cols={8} />
            ) : paginatedOrganizations.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Building size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No organizations found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Try adjusting your search criteria or plan filters.</div>
                </td>
              </tr>
            ) : (
              paginatedOrganizations.map((org) => {
                const isActive = org.status === 'ACTIVE';
                return (
                  <tr key={org.id}>
                    <td>
                      <div className="org-name-cell">
                        <div className="org-avatar-sm">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="org-primary-name">{org.name}</div>
                          <div className="org-sub-code">{org.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>{org.admin_name || 'Primary Admin'}</td>
                    <td>{org.admin_phone || 'Unset'}</td>
                    <td>
                      <span className="plan-badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        {org.plan || 'PRO'}
                      </span>
                    </td>
                    <td>{org.branch_count || 1} Branches</td>
                    <td>{org.customer_count || 0} Borrowers</td>
                    <td>
                      <span className={isActive ? 'status-badge-active' : 'status-badge-suspended'}>
                        {org.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-org-manage"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => handleEnterOrg(org)}
                        >
                          <span>Manage</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn-org-icon"
                          title="Edit Organization"
                          onClick={() => openEditModal(org)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-org-icon"
                          title={isActive ? 'Suspend' : 'Activate'}
                          onClick={() => handleToggleStatus(org)}
                          style={{ color: isActive ? '#e11d48' : '#059669' }}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="organizations"
          />
        )}
      </div>

      {/* 5. Add Organization Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Lending Organization"
      >
        <form onSubmit={handleAddSubmit}>
          {errors.form && (
            <div style={{ color: '#e11d48', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {errors.form}
            </div>
          )}

          <div className="sa-modal-full">
            <label className="sa-modal-label">Organization Legal Name *</label>
            <input
              type="text"
              className="sa-modal-input"
              placeholder="e.g. Periyanayagi Amman Finance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {errors.name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.name}</span>}
          </div>

          <div className="sa-modal-grid">
            <div>
              <label className="sa-modal-label">Initial Admin Name *</label>
              <input
                type="text"
                className="sa-modal-input"
                placeholder="e.g. Rajesh Kumar"
                value={formData.admin_name}
                onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                required
              />
              {errors.admin_name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.admin_name}</span>}
            </div>

            <div>
              <label className="sa-modal-label">Admin Phone Number *</label>
              <input
                type="tel"
                className="sa-modal-input"
                placeholder="10-digit mobile number"
                value={formData.admin_phone}
                onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                required
              />
              {errors.admin_phone && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.admin_phone}</span>}
            </div>
          </div>

          <div className="sa-modal-grid">
            <div>
              <label className="sa-modal-label">Admin Login Email *</label>
              <input
                type="email"
                className="sa-modal-input"
                placeholder="admin@organization.com"
                value={formData.admin_email}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                required
              />
              {errors.admin_email && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.admin_email}</span>}
            </div>

            <div>
              <label className="sa-modal-label">Admin Login Password *</label>
              <input
                type="password"
                className="sa-modal-input"
                placeholder="Minimum 6 characters"
                value={formData.admin_password}
                onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                required
              />
              {errors.admin_password && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{errors.admin_password}</span>}
            </div>
          </div>

          <div className="sa-modal-full">
            <label className="sa-modal-label">Subscription Tier</label>
            <select
              className="sa-modal-input"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="STARTER">Starter Tier (Single branch)</option>
              <option value="PRO">Pro Tier (Multi-branch operations)</option>
              <option value="ENTERPRISE">Enterprise Tier (Unlimited scale)</option>
            </select>
          </div>

          <div className="sa-modal-foot">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Onboard Organization'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Edit Organization Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Organization: ${editFormData.name || 'Tenant'}`}
      >
        <form onSubmit={handleSaveEdit}>
          {editErrors.form && (
            <div style={{ color: '#e11d48', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {editErrors.form}
            </div>
          )}

          <div className="sa-modal-full">
            <label className="sa-modal-label">Organization Name *</label>
            <input
              type="text"
              className="sa-modal-input"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            {editErrors.name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{editErrors.name}</span>}
          </div>

          <div className="sa-modal-grid">
            <div>
              <label className="sa-modal-label">Admin Contact Name *</label>
              <input
                type="text"
                className="sa-modal-input"
                value={editFormData.admin_name}
                onChange={(e) => setEditFormData({ ...editFormData, admin_name: e.target.value })}
                required
              />
              {editErrors.admin_name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{editErrors.admin_name}</span>}
            </div>

            <div>
              <label className="sa-modal-label">Admin Phone *</label>
              <input
                type="tel"
                className="sa-modal-input"
                value={editFormData.admin_phone}
                onChange={(e) => setEditFormData({ ...editFormData, admin_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="sa-modal-grid">
            <div>
              <label className="sa-modal-label">Subscription Tier</label>
              <select
                className="sa-modal-input"
                value={editFormData.plan}
                onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
              >
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="sa-modal-label">Tenant Status</label>
              <select
                className="sa-modal-input"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="sa-modal-foot">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={savingEdit}
            >
              {savingEdit ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const CreateOrganization = Organization;
export default Organization;
